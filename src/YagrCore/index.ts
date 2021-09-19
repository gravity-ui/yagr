/* eslint-disable complexity */

import UPlot, {
    Options as UPlotOptions,
    AlignedData as UPlotData,
    Plugin,
    Series,
    DrawOrderKey,
    SyncPubSub,
    Scale,
} from 'uplot';

import LegendPlugin from './plugins/legend/legend';
import tooltipPlugin from './plugins/tooltip/tooltip';
import markersPlugin, {drawMarkersIfRequired} from './plugins/markers';
import cursorPlugin from './plugins/cursor/cursor';
import plotLinesPlugin from './plugins/plotLines/plotLines';

import {
    YagrConfig,
    RawSerieData,
    RefPoints,
    RedrawOptions,
    PlotLineConfig,
    YagrHooks,
    DataSeries,
    MinimalValidConfig,
} from './types';

import {debounce, genId, getSumByIdx, preprocess} from './utils/common';
import {getScaleRange} from './utils/scales';
import {pathsRenderer} from './utils/paths';
import {getAxis} from './utils/axes';
import {getPaddingByAxes} from './utils/chart';
import {colorParser, getSerieFocusColors} from './utils/colors';
import {getSerie} from './utils/series';

import {
    DEFAULT_X_SCALE,
    DEFAULT_X_SERIE_NAME,
    MIN_SELECTION_WIDTH,
    DEFAULT_FOCUS_ALPHA,
    DEFAULT_CANVAS_PIXEL_RATIO,
    theme,
    DEFAULT_Y_SCALE,
    DEFAULT_SYNC_KEY,
    DEFAULT_TITLE_FONT_SIZE,
} from './defaults';
import i18n from './locale';

export interface YagrEvent {
    chart: Yagr;
    meta: YagrMeta;
}

export type YagrMeta = {
    renderTime: number;
    processTime: number;
    initTime: number;
};

type CachedProps = {
    width: number;
    height: number;
};

interface YagrPlugins {
    plotLines?: ReturnType<typeof plotLinesPlugin>;
    cursor?: ReturnType<typeof cursorPlugin>;
    legend?: LegendPlugin;
}

export interface YagrState {
    isMouseOver: boolean;
    stage: 'config' | 'processing' | 'uplot' | 'render' | 'listen';
}

/*
 * Main core-module of Yagr.
 * Implements data processing and autoconfigurable wrapper
 * for uPlot chart.
 * Entrypoint of every Yagr chart.
 */
class Yagr {
    id: string;
    options: UPlotOptions;
    uplot: UPlot;
    root: HTMLElement;
    series: UPlotData;
    config: YagrConfig;
    resizeOb?: ResizeObserver;
    canvas: HTMLCanvasElement;
    references?: RefPoints;
    plugins: YagrPlugins;
    sync?: SyncPubSub;
    i18n: ReturnType<typeof i18n>;
    state: YagrState;

    private _startTime: number;
    private _meta: Partial<YagrMeta> = {};
    private _cache: CachedProps;

    constructor(root: HTMLElement, pConfig: MinimalValidConfig) {
        this._startTime = performance.now();
        this._meta = {};
        this.state = {
            isMouseOver: false,
            stage: 'config',
        };

        const config: YagrConfig = Object.assign(
            {
                title: {},
                data: [],
                axes: {},
                series: [],
                scales: {},
                hooks: {},
                settings: {},
                chart: {},
                cursor: {},
                legend: {
                    show: false,
                },
                tooltip: {
                    enabled: true,
                },
                grid: null,
                markers: {},
            },
            pConfig,
        );

        const sync = config.cursor.sync;

        config.chart.type = config.chart.type || 'line';

        this.id = root.id || genId();
        this.root = root;
        this.root.classList.add('yagr');

        colorParser.setContext(root);

        this.plugins = {};
        this.config = config;

        if (sync) {
            this.sync = UPlot.sync(typeof sync === 'string' ? sync : DEFAULT_SYNC_KEY);
        }

        const settings = config.settings;

        if (!settings.adaptive && config.chart.width && config.chart.height) {
            root.style.width = config.chart.width + 'px';
            root.style.height = config.chart.height + 'px';
        }

        try {
            theme.setTheme(settings.theme || 'light');
            root.classList.remove('yagr_theme_dark');
            root.classList.remove('yagr_theme_light');
            root.classList.add('yagr_theme_' + theme.theme);
            this.i18n = i18n(settings.locale || 'en');

            const options = this.createUplotOptions();
            this._cache = {height: options.height, width: options.width};
            this.options = config.editUplotOptions ? config.editUplotOptions(options) : options;
        } catch (error) {
            this.execHooks(config.hooks.error, {
                type: 'config',
                error,
                chart: this,
            });
            throw error;
        }

        this.state.stage = 'processing';

        try {
            const series = this.transformSeries();
            this.series = series;
        } catch (error) {
            this.execHooks(config.hooks.error, {
                type: 'processing',
                error,
                chart: this,
            });
            throw error;
        }

        this.plugins.legend = new LegendPlugin(this, config.legend);

        this.state.stage = 'uplot';

        try {
            this.uplot = new UPlot(this.options, this.series, this.initRender);
            this.canvas = root.querySelector('canvas') as HTMLCanvasElement;
        } catch (error) {
            this.execHooks(config.hooks.error, {
                type: 'uplot',
                error,
                chart: this,
            });
            throw error;
        }

        this.init();

        const processTime = performance.now() - this._startTime;
        this._meta.processTime = processTime;

        this.execHooks(config.hooks.processed, {
            chart: this,
            meta: {
                processTime,
            },
        });

        this.state.stage = 'render';
    }

    redraw(options: RedrawOptions) {
        const uPlotRedrawOptions = [options.series || true, options.axes || true];
        this.uplot.redraw(...uPlotRedrawOptions);
    }

    toggleSerieVisibility(idx: number, serie: Series, value?: boolean) {
        this.uplot.setSeries(idx, {
            show: typeof value === 'undefined' ? !serie.show : value,
        });
        this.options.series = this.uplot.series;
        const scaleName = serie.scale || DEFAULT_Y_SCALE;
        const scale = this.config.scales[scaleName];
        if (scale && scale.stacking) {
            this.uplot.setData(this.transformSeries());
            this.uplot.redraw();
        }
    }

    focus(lineId: string | null, focus: boolean) {
        const serieIdx =
            (lineId &&
                this.uplot.series.findIndex((serie) => {
                    return serie.id === lineId;
                })) ||
            null;
        this.plugins.cursor?.focus(serieIdx, focus);
        this.uplot.setSeries(serieIdx, {focus});
    }

    dispose = () => {
        this.resizeOb && this.resizeOb.unobserve(this.root);
        this.unsubscribe();
        this.uplot.destroy();
        this.execHooks(this.config.hooks.dispose, this);
    };

    toDataUrl() {
        return this.canvas.toDataURL('img/png');
    }

    subscribe() {
        this.sync?.sub(this.uplot);
    }

    unsubscribe() {
        this.sync?.unsub(this.uplot);
    }

    /*
     * Main config processing options
     * Configures options, axess, grids, scales etc
     */
    private createUplotOptions() {
        const {config} = this;
        const plugins: Plugin[] = [];

        const settings = config.settings || {};

        /** Setting up TooltipPugin */
        if (config.tooltip && config.tooltip.enabled !== false) {
            const tooltipPluginInstance = tooltipPlugin(this, config.tooltip);
            plugins.push(tooltipPluginInstance);
        }

        const options: UPlotOptions = {
            width: this.root.clientWidth,
            height: this.clientHeight,
            title: config.title?.text,
            plugins: plugins,
            focus: {alpha: DEFAULT_FOCUS_ALPHA},
            series: [
                {
                    id: DEFAULT_X_SERIE_NAME,
                    color: '',
                    name: '',
                    $c: config.timeline,
                    scale: DEFAULT_X_SCALE,
                    _valuesCount: config.timeline.length,
                },
            ],
            ms: settings.timeMultiplier || 1,
            hooks: config.hooks || {},
        };

        const isEmptyDataSet =
            config.timeline.length === 0 ||
            config.series.length === 0 ||
            config.series.every(({data}) => data.length === 0);

        /**
         * Setting up cursor - points on cursor, drag behavior, crosshairs
         */
        options.cursor = options.cursor || {};
        options.cursor.points = options.cursor.points || {};
        options.cursor.drag = options.cursor.drag || {
            dist: config.settings.minSelectionWidth || MIN_SELECTION_WIDTH,
            x: true,
            y: false,
            setScale: settings.zoom === undefined ? true : settings.zoom,
        };

        if (this.sync) {
            options.cursor.sync = options.cursor.sync || {
                key: this.sync.key,
            };
        }

        if (config.cursor) {
            this.plugins.cursor = cursorPlugin(config.cursor, this);
            const cursorPluginInstance = this.plugins.cursor.uPlotPlugin;
            plugins.push(cursorPluginInstance);
        }

        /** first serie is always X */
        const seriesOptions = (config.series || []).map((rawSerie: RawSerieData, idx) =>
            getSerie(rawSerie, config, idx),
        );

        /* First serie is always X serie */
        const resultingSeriesOptions: Series[] = options.series;

        /**
         * Prepare series options
         */
        for (let i = seriesOptions.length - 1; i >= 0; i--) {
            const serie = seriesOptions[i] || {};

            serie.points = serie.points || {};

            const colorFn = getSerieFocusColors(serie.color);

            serie._color = serie.color;
            serie._modifiedColor = colorFn.defocusColor;

            if (serie.type === 'area') {
                serie.fill = colorFn;
                serie.stroke = getSerieFocusColors(serie.lineColor || 'rgba(0, 0, 0, 0.2)');
                serie.width = serie.lineWidth;
                serie.points.show = drawMarkersIfRequired;
            }

            if (serie.type === 'line') {
                serie.stroke = colorFn;
                serie.points.show = drawMarkersIfRequired;
            }

            if (serie.type === 'column') {
                serie.stroke = colorFn;
                serie.fill = colorFn;
                serie.points.show = false;
            }

            if (serie.type === 'dots') {
                serie.stroke = serie.color;
                serie.fill = colorFn;
                serie.width = 2;
                plugins.push(
                    markersPlugin({
                        size: config.chart.pointsSize || 4,
                        ...config.markers,
                    }),
                );
            }

            serie.interpolation = serie.interpolation || settings.interpolation || 'linear';

            serie.paths = pathsRenderer;
            resultingSeriesOptions.push(serie);
        }

        /** Setting up markers plugin after default points renderers to be settled */
        if (config.markers.show) {
            const markersPluginInstance = markersPlugin(config.markers);
            plugins.push(markersPluginInstance);
        }

        options.series = resultingSeriesOptions;

        if (!config.scales || Object.keys(config.scales).length === 0) {
            config.scales = {
                x: {},
                y: {},
            };
        }

        /** Setting up scales */
        options.scales = options.scales || {};
        const scales = options.scales;

        const scalesToMap = config.scales ? {...config.scales} : {};
        if (!Object.keys(config.scales).length) {
            scalesToMap.y = {};
        }

        Object.entries(scalesToMap).forEach(([scaleName, scaleConfig]) => {
            scales[scaleName] = scales[scaleName] || {};
            const scale = scales[scaleName];

            if (scaleName === DEFAULT_X_SCALE) {
                return;
            }

            const forceMin = typeof scaleConfig.min === 'number' ? scaleConfig.min : null;
            const forceMax = typeof scaleConfig.max === 'number' ? scaleConfig.max : null;

            /** At first handle case when scale has setted min and max */
            if (forceMax !== null && forceMin !== null) {
                if (forceMax <= forceMin) {
                    throw new Error('Invalid scale config. .max should be > .min');
                }
                scale.range = [forceMin, forceMax];
            }

            const isLogScale = scaleConfig.type === 'logarithmic';

            if (isLogScale) {
                scale.distr = Scale.Distr.Logarithmic;
                scale.range = getScaleRange(scaleConfig, () => this.references, config);

                return;
            }

            if (isEmptyDataSet) {
                scale.range = [forceMin === null ? (isLogScale ? 1 : 0) : forceMin, forceMax === null ? 100 : forceMax];
                return;
            }

            scale.range = getScaleRange(scaleConfig, () => this.references, config);
        });

        if (!options.scales.x) {
            options.scales.x = {
                time: true,
            };
        }

        /** Setting up minimal axes */
        options.axes = options.axes || [];
        const axes = options.axes;

        Object.entries(config.axes).forEach(([scale, axisConfig]) => {
            axes.push(getAxis({...axisConfig, scale}, config));
        });

        if (!config.axes[DEFAULT_X_SCALE]) {
            axes.push(getAxis({scale: DEFAULT_X_SCALE}, config));
        }

        if (!axes.find(({scale}) => scale !== DEFAULT_X_SCALE)) {
            axes.push(getAxis({scale: DEFAULT_Y_SCALE}, config));
        }

        const plotLinesPluginInstance = this.initPlotLinesPlugin(config);
        plugins.push(plotLinesPluginInstance);

        /** Setting up hooks */
        options.hooks = config.hooks || {};
        options.hooks.draw = options.hooks.draw || [];
        options.hooks.draw.push(() => {
            if (this.state.stage === 'listen') {
                return;
            }
            this.state.stage = 'listen';
            const renderTime = performance.now() - this._startTime;
            this._meta.renderTime = renderTime;
            this.execHooks(config.hooks.load, {
                chart: this,
                meta: this._meta,
            });
        });

        options.hooks.ready = options.hooks.ready || [];
        options.hooks.ready.push(() => {
            const initTime = performance.now() - this._startTime;
            this._meta.initTime = initTime;

            this.execHooks(config.hooks.inited, {
                chart: this,
                meta: {
                    initTime,
                },
            });
        });

        options.hooks.drawClear = options.hooks.drawClear || [];
        options.hooks.drawClear.push((u: UPlot) => {
            const {ctx} = u;
            ctx.save();
            ctx.fillStyle = theme.BACKGROUND;
            ctx.fillRect(
                DEFAULT_CANVAS_PIXEL_RATIO,
                DEFAULT_CANVAS_PIXEL_RATIO,
                u.width * DEFAULT_CANVAS_PIXEL_RATIO - 2 * DEFAULT_CANVAS_PIXEL_RATIO,
                u.height * DEFAULT_CANVAS_PIXEL_RATIO - 2 * DEFAULT_CANVAS_PIXEL_RATIO,
            );
            ctx.restore();
        });

        options.hooks.setSelect = options.hooks.setSelect || [];
        options.hooks.setSelect.push((u: UPlot) => {
            const {left, width} = u.select;
            const [_from, _to] = [u.posToVal(left, DEFAULT_X_SCALE), u.posToVal(left + width, DEFAULT_X_SCALE)];

            this.execHooks(config.hooks.onSelect, {
                from: Math.ceil(_from * 1000),
                to: Math.ceil(_to * 1000),
            });

            u.setSelect({width: 0, height: 0, top: 0, left: 0}, false);
        });

        options.drawOrder = settings.drawOrder
            ? (settings.drawOrder.filter(
                  (key) => key === DrawOrderKey.Series || key === DrawOrderKey.Axes,
              ) as DrawOrderKey[])
            : [DrawOrderKey.Series, DrawOrderKey.Axes];

        /** Disabling uPlot legend. */
        options.legend = {show: false};
        options.padding = config.chart.padding || getPaddingByAxes(options);

        this.options = options;

        return options;
    }

    /*
     * Main data processing function
     * Transforms series values
     */
    // eslint-disable-next-line complexity
    private transformSeries() {
        const result = [];
        const config = this.config;
        const timeline = config.timeline;
        let processing = config.processing || false;

        let series: DataSeries[] = this.config.series.map(({data}) => data) as DataSeries[];

        if (processing && processing.interpolation) {
            series = preprocess(series, timeline, processing);
            processing = false;
        }

        const shouldMapNullValues = Boolean(processing && processing.nullValues);
        const nullValues = (processing && processing.nullValues) || {};

        /**
         * Stacks are represented as:
         * {
         *    [scale]: {
         *        [],  // stacking group idx 0 (default for all on scale),
         *        [],  // stacking group idx 1
         *    ]
         * }
         *
         * All stacked points are accumulating inside of series' scale group
         */
        const stacks: Record<string, number[][]> = {};

        for (let sIdx = 0; sIdx < series.length; sIdx++) {
            const dataLine: (number | null)[] = [];
            const realSerieIdx = sIdx + 1;
            const serie = series[sIdx];

            const serieConfigIndex = this.options.series.length - realSerieIdx;
            const serieOptions = this.options.series[serieConfigIndex];
            const scale = serieOptions.scale || DEFAULT_Y_SCALE;
            const scaleConfig = this.config.scales[scale] || {};
            const isStacking = scaleConfig.stacking;
            const sGroup = serieOptions.stackGroup || 0;

            let shouldCalculateRefPoints = false;

            if (!serieOptions.refPoints) {
                shouldCalculateRefPoints = true;
                serieOptions.refPoints = {};
            }

            let empty = true;

            if (isStacking && !stacks[scale]) {
                // @see https://github.com/leeoniya/uPlot/issues/429
                // @ts-ignore
                this.options.focus.alpha = 1.1;
                stacks[scale] = [];
            }

            if (isStacking && !stacks[scale][sGroup]) {
                stacks[scale][sGroup] = new Array(timeline.length).fill(0);
            }

            for (let idx = 0; idx < serie.length; idx++) {
                let value = serie[idx];

                if (shouldMapNullValues && nullValues[String(value)]) {
                    value = null;
                }

                if (serieOptions.transform) {
                    serieOptions._transformed = true;
                    value = serieOptions.transform(value, series, idx);
                }

                if (scaleConfig.transform) {
                    serieOptions._transformed = true;
                    value = scaleConfig.transform(value, series, idx);
                }

                if (value === null) {
                    if (serieOptions.type === 'line' || serieOptions.type === 'dots') {
                        dataLine.push(null);
                        continue;
                    } else if (serieOptions.show) {
                        dataLine.push(null);
                        continue;
                    } else {
                        value = 0;
                    }
                }

                empty = false;

                if (scaleConfig.normalize) {
                    const sum = getSumByIdx(series, this.options.series, idx, scale);
                    value = (value / sum) * (scaleConfig.normalizeBase || 100);

                    serieOptions.normalizedData = serieOptions.normalizedData || [];
                    serieOptions.normalizedData[idx] = value;
                }

                if (scaleConfig.stacking) {
                    if (!serieOptions.show) {
                        value = 0;
                    }

                    value = stacks[scale][sGroup][idx] += value;
                }

                if (scaleConfig.type === 'logarithmic' && value === 0) {
                    value = 1;
                }

                if (shouldCalculateRefPoints) {
                    const cv = value || 0;
                    serieOptions.refPoints.max =
                        serieOptions.refPoints.max === undefined ? cv : Math.max(serieOptions.refPoints.max, cv);
                    serieOptions.refPoints.min =
                        serieOptions.refPoints.min === undefined ? cv : Math.min(serieOptions.refPoints.min, cv);
                    serieOptions.refPoints.sum = (serieOptions.refPoints.sum || 0) + cv;
                }

                serieOptions._valuesCount += 1;
                dataLine.push(value);
            }

            if (shouldCalculateRefPoints) {
                serieOptions.refPoints.avg = (serieOptions.refPoints.sum || 0) / serie.length;
            }

            serieOptions.empty = empty;
            result.unshift(dataLine);
        }

        this.calculateRefPoints();

        result.unshift(this.config.timeline);
        return result as UPlotData;
    }

    private calculateRefPoints() {
        let max,
            min,
            sum,
            count = 0;

        for (const {refPoints} of this.options.series) {
            if (!refPoints) {
                continue;
            }
            count += refPoints.count || 0;
            max = max === undefined ? refPoints.max : Math.max(refPoints.max || -Infinity, max);
            min = min === undefined ? refPoints.min : Math.min(refPoints.min || Infinity, min);
            sum = sum === undefined ? refPoints.sum : sum + (refPoints.sum || 0);
        }

        const avg = sum && sum / count;

        this.references = {
            max,
            min,
            sum,
            avg,
            count,
        };
    }

    private initPlotLinesPlugin(config: YagrConfig) {
        const plotLines: PlotLineConfig[] = [];

        /** Collecting plot lines from config axes for plotLines plugin */
        Object.entries(config.axes).forEach(([scale, axisConfig]) => {
            if (axisConfig.plotLines) {
                axisConfig.plotLines.forEach((plotLine) => {
                    plotLines.push({...plotLine, scale});
                });
            }
        });

        const plugin = plotLinesPlugin(config, plotLines);
        this.plugins.plotLines = plugin;
        return plugin.uPlotPlugin;
    }

    private setOptionsWithUpdate(updateFn: (d: UPlotOptions, s?: UPlotData) => void) {
        updateFn(this.options, this.series);
        this.uplot.setSize({
            width: this.options.width,
            height: this.options.height,
        });
        this.uplot.redraw();
    }

    /*
     * Resize handler. Should cache height and width to avoid unneccesary resize handling,
     * when actial width and height of contentRect doesn't changed
     */
    private onResize = (args: ResizeObserverEntry[]) => {
        const [resize] = args;
        if (this._cache.height === resize.contentRect.height && this._cache.width === resize.contentRect.width) {
            return;
        }

        this.setOptionsWithUpdate((options) => {
            options.height = this.clientHeight;
            options.width = this.root.clientWidth;
            this._cache.width = this.options.width;
            this._cache.height = this.options.height;
            this.plugins?.legend?.redraw();
        });

        this.execHooks<YagrHooks['resize']>(this.config.hooks.resize, args);
    };

    private init = () => {
        if (this.config.settings.adaptive) {
            this.resizeOb = new ResizeObserver(debounce(this.onResize, this.config.settings.resizeDebounceMs || 100));
            this.resizeOb.observe(this.root);
        }

        if (!this.config.hooks.dispose) {
            this.config.hooks.dispose = [];
        }

        /** Unsubscribe in init required to avoid chars been synced without action from developer */
        this.unsubscribe();
        this.config.hooks.dispose.push(this.trackMouse());
    };

    private execHooks = <T>(hooks: T | undefined, ...args: unknown[]) => {
        if (Array.isArray(hooks)) {
            hooks.forEach((hook) => {
                typeof hook === 'function' && hook(...args);
            });
        }
    };

    private trackMouse() {
        const mouseOver = () => {
            this.state.isMouseOver = true;
        };
        const mouseLeave = () => {
            this.state.isMouseOver = false;
        };
        this.root.addEventListener('mouseover', mouseOver);
        this.root.addEventListener('mouseleave', mouseLeave);

        return () => {
            this.root.removeEventListener('mouseover', mouseOver);
            this.root.removeEventListener('mouseleave', mouseLeave);
        };
    }

    private initRender = (u: uPlot, done: Function) => {
        /** Init legend if required */
        this.plugins.legend?.init(u);

        /** Setup font size for title if required */
        if (this.config.title && this.config.title.fontSize) {
            const size = this.config.title.fontSize;
            const t = this.root.querySelector('.u-title') as HTMLElement;
            t.setAttribute('style', `font-size:${size}px;line-height:${size}px;`);
        }

        done();
    };

    private get clientHeight() {
        const MARGIN = 8;
        const offset = this.config.title.text ? (this.config.title.fontSize || DEFAULT_TITLE_FONT_SIZE) + MARGIN : 0;
        return this.root.clientHeight - offset;
    }
}

export default Yagr;
