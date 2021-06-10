import debounce from 'lodash.debounce';

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
    ChartTypes,
    InterpolationSetting,
    ScaleType,
    RawSerieData,
    AxisOptions,
    YagrTheme,
    RefPoints,
    RedrawOptions,
    PlotLineConfig,
    YagrHooks,
    DataSeries,
} from './types';

import {genId, getSumByIdx, preprocess} from './utils/common';
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
    legend?: LegendPlugin;
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
    sync: SyncPubSub;
    i18n: ReturnType<typeof i18n>;

    private _startTime: number;
    private _drawn: boolean;
    private _meta: Partial<YagrMeta> = {};
    private _cache: CachedProps;

    constructor(root: HTMLElement, pConfig: Partial<YagrConfig>) {
        this._startTime = performance.now();
        this._meta = {};
        this._drawn = false;

        if (!pConfig.timeline) {
            throw new Error('Specify config.timeline: number[]');
        }

        const config: YagrConfig = Object.assign(
            {
                title: {},
                timeline: [],
                data: [],
                axes: [],
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

        config.chart.type = config.chart.type || ChartTypes.Line;

        this.id = root.id || genId();
        this.root = root;
        this.root.classList.add('yagr');

        colorParser.setContext(root);

        this.plugins = {};
        this.config = config;
        this.sync = UPlot.sync('sync');

        const settings = config.settings;

        if (!settings.adaptive && config.chart.width && config.chart.height) {
            root.style.width = config.chart.width + 'px';
            root.style.height = config.chart.height + 'px';
        }

        try {
            theme.setTheme(settings.theme || YagrTheme.Light);
            this.root.classList.remove('yagr_theme_dark');
            this.root.classList.remove('yagr_theme_light');
            this.root.classList.add('yagr_theme_' + theme.theme);
            this.i18n = i18n(settings.locale || 'en');

            const {options, series} = this.process();
            this._cache = {height: options.height, width: options.width};

            this.options = config.process ? config.process(options) : options;
            this.series = series;
            this.plugins.legend = new LegendPlugin(this, config.legend);
        } catch (error) {
            this.execHooks(config.hooks.error, {
                type: 'processing',
                error,
                chart: this,
            });
            throw error;
        }

        try {
            this.uplot = new UPlot(this.options, this.series, this.plugins.legend.init);
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
        if (this.config.settings.stacking) {
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
        this.uplot.setSeries(serieIdx, {focus});
    }

    dispose = () => {
        this.resizeOb && this.resizeOb.unobserve(this.root);
        this.uplot.destroy();
        this.execHooks(this.config.hooks.dispose, this);
    };

    toDataUrl() {
        return this.canvas.toDataURL('img/png');
    }

    subscribe() {
        this.sync.sub(this.uplot);
    }

    unsubscribe() {
        this.sync.unsub(this.uplot);
    }

    isChartInViewPort() {
        // @TODO Implement correct behavior when think about elements with scroll
        return true;
    }

    /*
     * Main data procesing function.
     * Configures options, series, axis, grids and scales
     */
    // eslint-disable-next-line complexity
    private process() {
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
            // @see https://github.com/leeoniya/uPlot/issues/429
            focus: {alpha: settings.stacking ? 1.1 : DEFAULT_FOCUS_ALPHA},
            series: [
                {
                    id: DEFAULT_X_SERIE_NAME,
                    color: '',
                    name: '',
                    $c: config.timeline,
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

        options.cursor.sync = options.cursor.sync || {
            key: this.sync.key,
        };

        if (config.cursor) {
            const cursorPluginInstance = cursorPlugin(config.cursor, config);
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
            const serie: Series = seriesOptions[i] || {};

            serie.points = serie.points || {};

            if (serie.type === ChartTypes.Area) {
                serie.fill = getSerieFocusColors(serie.color);
                serie.stroke = getSerieFocusColors(serie.lineColor || 'rgba(0, 0, 0, 0.2)');
                serie.width = serie.lineWidth;
                serie.points.show = false;
            }

            if (serie.type === ChartTypes.Line) {
                serie.stroke = serie.color;
                serie.points.show = drawMarkersIfRequired;
            }

            if (serie.type === ChartTypes.Bars) {
                serie.stroke = getSerieFocusColors(serie.color);
                serie.fill = getSerieFocusColors(serie.color);
                serie.points.show = false;
            }

            if (serie.type === ChartTypes.Dots) {
                serie.stroke = serie.color;
                serie.fill = serie.color;
                serie.width = 2;
                plugins.push(
                    markersPlugin({
                        size: config.chart.pointsSize || 4,
                    }),
                );
            }

            serie.interpolation = serie.interpolation || settings.interpolation || InterpolationSetting.Linear;

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
        Object.entries(config.scales || {}).forEach(([scaleName, scaleConfig]) => {
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

            const isLogScale = scaleConfig.type === ScaleType.Logarithmic;

            if (isLogScale) {
                scale.distr = Scale.Distr.Logarithmic;
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
        const xAxis = (config.axes.length && config.axes.find(({scale}) => scale === DEFAULT_X_SCALE)) || {
            scale: DEFAULT_X_SCALE,
        };
        options.axes[0] = getAxis(xAxis, config);

        let hasOneYAxis = false;
        for (let aI = 0; aI < config.axes.length; aI++) {
            const axis = config.axes[aI];
            if (axis && axis.scale !== DEFAULT_X_SCALE) {
                hasOneYAxis = true;
                options.axes.push(getAxis(axis, config));
            }
        }

        if (!hasOneYAxis) {
            options.axes.push(getAxis({scale: DEFAULT_Y_SCALE}, config));
        }

        const plotLinesPluginInstance = this.initPlotLinesPlugin(config);
        plugins.push(plotLinesPluginInstance);

        /** Setting up hooks */
        options.hooks = config.hooks || {};
        options.hooks.draw = options.hooks.draw || [];
        options.hooks.draw.push(() => {
            if (this._drawn) {
                return;
            }
            this._drawn = true;
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
        const series = this.transformSeries();

        return {options, series};
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
        const settings = config.settings;
        let processing = config.processing || false;

        let series: DataSeries[] = this.config.series.map(({data}) => data) as DataSeries[];

        if (processing) {
            series = preprocess(series, timeline, processing);
            processing = false;
        }

        if (/** condition for non transforming*/ undefined) {
            return [timeline].concat(series.reverse() as any) as UPlotData;
        }

        let accum: number[] = [];

        if (settings.stacking) {
            accum = new Array(timeline.length).fill(0);
        }

        for (let sIdx = 0; sIdx < series.length; sIdx++) {
            const dataLine: (number | null)[] = [];
            const realSerieIdx = sIdx + 1;
            const serie = series[sIdx];

            const serieConfigIndex = this.options.series.length - realSerieIdx;
            const serieOptions = this.options.series[serieConfigIndex];
            const scaleConfig =
                (serieOptions.scale ? this.config.scales[serieOptions.scale] : this.config.scales.y) || {};

            let shouldCalculateRefPoints = false;

            if (!serieOptions.refPoints) {
                shouldCalculateRefPoints = true;
                serieOptions.refPoints = {};
            }

            let empty = true;

            for (let idx = 0; idx < serie.length; idx++) {
                let value = serie[idx] as number | null;

                if (processing && processing.nullValues[value]) {
                    value = null;
                }

                if (value === null) {
                    if (serieOptions.type === ChartTypes.Line || serieOptions.type === ChartTypes.Dots) {
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
                    const sum = getSumByIdx(series, idx);
                    value = (value / sum) * (scaleConfig.normalizeBase || 100);

                    serieOptions.normalizedData = serieOptions.normalizedData || [];
                    serieOptions.normalizedData[idx] = value;
                }

                if (settings.stacking) {
                    if (!serieOptions.show) {
                        value = 0;
                    }

                    value = accum[idx] += value;
                }

                if (scaleConfig.type === ScaleType.Logarithmic && value === 0) {
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
        config.axes.forEach((axisConfig: AxisOptions) => {
            if (axisConfig.plotLines) {
                axisConfig.plotLines.forEach((plotLine) => {
                    if (!axisConfig.scale) {
                        throw new Error('Specify axis.scale');
                    }

                    plotLines.push({...plotLine, scale: axisConfig.scale});
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
            this.resizeOb = new ResizeObserver(debounce(this.onResize, 100));
            this.resizeOb.observe(this.root);
        }

        this.unsubscribe();
    };

    private execHooks = <T>(hooks: T | undefined, ...args: unknown[]) => {
        if (Array.isArray(hooks)) {
            hooks.forEach((hook) => {
                typeof hook === 'function' && hook(...args);
            });
        }
    };

    private get clientHeight() {
        const DEFAULT_FONT_SIZE = 14;
        const MARGIN = 8;
        const offset = this.config.title.text ? (this.config.title.fontSize || DEFAULT_FONT_SIZE) + MARGIN : 0;
        return this.root.clientHeight - offset;
    }
}

export default Yagr;
