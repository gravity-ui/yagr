import UPlot, {Options as UPlotOptions, AlignedData, Series, SyncPubSub} from 'uplot';

import LegendPlugin from './plugins/legend/legend';
import {TooltipPlugin} from './plugins/tooltip/tooltip';
import cursorPlugin from './plugins/cursor/cursor';
import plotLinesPlugin, {PlotLinesPlugin} from './plugins/plotLines/plotLines';

import {YagrConfig, PlotLineConfig, YagrHooks, MinimalValidConfig, HookParams} from './types';

import {debounce, genId} from './utils/common';
import ColorParser from './utils/colors';

import ThemedDefaults, {DEFAULT_SYNC_KEY, DEFAULT_TITLE_FONT_SIZE} from './defaults';
import i18n from './locale';

import {CreateUplotOptionsMixin} from './uplot-wrappers/create-options';
import {TransformSeriesMixin} from './uplot-wrappers/transform-series';
import {DynamicUpdatesMixin} from './uplot-wrappers/dynamic-updates';
import {applyMixins} from './utils/mixins';

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

export interface YagrState {
    isEmptyDataSet: boolean;
    isMouseOver: boolean;
    stage: 'config' | 'processing' | 'uplot' | 'render' | 'listen';
    inBatch?: boolean;
    y2uIdx: Record<string, number>;
}

/*
 * Main core-module of Yagr.
 * Implements data processing and autoconfigurable wrapper
 * for uPlot chart.
 * Entrypoint of every Yagr chart.
 */
class Yagr<TConfig extends MinimalValidConfig = MinimalValidConfig> {
    id!: string;
    options!: UPlotOptions;
    uplot!: UPlot;
    root!: HTMLElement;
    series!: AlignedData;
    config!: YagrConfig;
    resizeOb?: ResizeObserver;
    canvas!: HTMLCanvasElement;
    plugins!: {
        tooltip?: ReturnType<TooltipPlugin>;
        plotLines?: ReturnType<PlotLinesPlugin>;
        cursor?: ReturnType<typeof cursorPlugin>;
        legend?: LegendPlugin;
    } & (TConfig['plugins'] extends YagrConfig['plugins']
        ? {[key in keyof TConfig['plugins']]: ReturnType<TConfig['plugins'][key]>}
        : {});
    state!: YagrState;
    utils!: {
        colors: ColorParser;
        sync?: SyncPubSub;
        theme: ThemedDefaults;
        i18n: ReturnType<typeof i18n>;
    };

    get isEmpty() {
        return this.state.isEmptyDataSet;
    }

    protected _startTime!: number;
    protected _meta: Partial<YagrMeta> = {};

    /** Mixin methods */
    private initMixins!: () => void;
    /** Create uPlot options methods */
    protected createUplotOptions!: CreateUplotOptionsMixin<TConfig>['createUplotOptions'];
    protected transformSeries!: TransformSeriesMixin<TConfig>['transformSeries'];

    /** Dynamic update methods */
    public setTheme!: DynamicUpdatesMixin<TConfig>['setTheme'];
    public setLocale!: DynamicUpdatesMixin<TConfig>['setLocale'];
    public setAxes!: DynamicUpdatesMixin<TConfig>['setAxes'];
    public setSeries!: DynamicUpdatesMixin<TConfig>['setSeries'];
    public setVisible!: DynamicUpdatesMixin<TConfig>['setVisible'];
    public setFocus!: DynamicUpdatesMixin<TConfig>['setFocus'];
    protected wrapBatch!: DynamicUpdatesMixin<TConfig>['wrapBatch'];
    protected _setSeries!: DynamicUpdatesMixin<TConfig>['_setSeries'];
    protected _batch!: DynamicUpdatesMixin<TConfig>['_batch'];

    protected _cache!: CachedProps;

    constructor(root: HTMLElement, pConfig: TConfig) {
        this.initMixins();

        this._startTime = performance.now();
        this.state = {
            isEmptyDataSet: false,
            isMouseOver: false,
            stage: 'config',
            y2uIdx: {},
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
                plugins: {},
                legend: {
                    show: false,
                },
                tooltip: {
                    show: true,
                },
                grid: null,
                markers: {},
            },
            pConfig,
        );

        this.config = config;

        this.inStage('config', () => {
            this.id = root.id || genId();
            this.root = root;
            this.root.classList.add('yagr');

            const colorParser = new ColorParser();
            const sync = this.config.cursor.sync;

            const chart = this.config.chart;

            chart.series ||= {type: 'line'};
            chart.size ||= {adaptive: true};
            chart.appereance ||= {locale: 'en'};
            chart.select ||= {};

            this.utils = {
                colors: colorParser,
                i18n: i18n(config.chart.appereance?.locale || 'en'),
                theme: new ThemedDefaults(colorParser),
            };

            colorParser.setContext(root);

            if (sync) {
                this.utils.sync = UPlot.sync(typeof sync === 'string' ? sync : DEFAULT_SYNC_KEY);
            }

            if (!chart.size.adaptive && chart.size.width && chart.size.height) {
                root.style.width = chart.size.width + 'px';
                root.style.height = chart.size.height + 'px';
            }

            this.setTheme(chart.appereance.theme || 'light');

            const options = this.createUplotOptions();
            this._cache = {height: options.height, width: options.width};
            this.options = config.editUplotOptions ? config.editUplotOptions(options) : options;
            this.plugins.legend = new LegendPlugin(this, config.legend);
        })
            .inStage('processing', () => {
                const series = this.transformSeries();
                this.series = series;
            })
            .inStage('uplot', () => {
                this.uplot = new UPlot(this.options, this.series, this.initRender);
                this.canvas = root.querySelector('canvas') as HTMLCanvasElement;

                this.init();

                const processTime = performance.now() - this._startTime;
                this._meta.processTime = processTime;

                this.execHooks(config.hooks.processed, {
                    chart: this,
                    meta: {
                        processTime,
                    },
                });
            })
            .inStage('render');
    }

    /**
     * Redraws Yagr instance by given options.
     */
    redraw(series = true, axes = true) {
        this.uplot.redraw(series, axes);
    }

    /**
     *  Get uPlot's Series from series id
     */
    getSeriesById(id: string): Series {
        return this.uplot.series[this.state.y2uIdx[id]];
    }

    dispose() {
        this.resizeOb && this.resizeOb.unobserve(this.root);
        this.unsubscribe();
        this.uplot.destroy();
        this.execHooks(this.config.hooks.dispose, {chart: this});
    }

    toDataUrl() {
        return this.canvas.toDataURL('img/png');
    }

    subscribe() {
        this.utils.sync?.sub(this.uplot);
    }

    unsubscribe() {
        this.utils.sync?.unsub(this.uplot);
    }

    batch(fn: () => void) {
        this.state.inBatch = true;
        fn();
        this.uplot.batch(() => {
            this._batch.fns.forEach((f) => f());
            if (this._batch.recalc) {
                this.series = this.transformSeries();
                this.uplot.setData(this.series, true);
            }
        });
        this._batch = {fns: [], recalc: false};
        this.state.inBatch = false;
    }

    private onError(error: Error) {
        this.execHooks(this.config.hooks.error, {
            stage: this.state.stage,
            error,
            chart: this,
        });
        return error;
    }

    protected initPlotLinesPlugin(config: YagrConfig): any {
        const plotLines: PlotLineConfig[] = [];

        /** Collecting plot lines from config axes for plotLines plugin */
        Object.entries(config.axes).forEach(([scale, axisConfig]) => {
            if (axisConfig.plotLines) {
                axisConfig.plotLines.forEach((plotLine) => {
                    plotLines.push({...plotLine, scale});
                });
            }
        });

        return plotLinesPlugin(this, plotLines);
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

        if (this.plugins.tooltip) {
            const t = this.plugins.tooltip;

            if (t.state.pinned && t.state.visible) {
                t.hide();
                t.pin(false);
            }
        }

        this._cache.width = this.options.width = this.root.clientWidth;
        this._cache.height = this.options.height = this.clientHeight;
        this.plugins?.legend?.redraw();
        this.uplot.setSize({
            width: this.options.width,
            height: this.options.height,
        });
        this.uplot.redraw();
        this.execHooks(this.config.hooks.resize, {entries: args, chart: this});
    };

    protected init = () => {
        if (this.config.chart.size?.adaptive) {
            this.resizeOb = new ResizeObserver(debounce(this.onResize, this.config.chart.size.resizeDebounceMs || 100));
            this.resizeOb.observe(this.root);
        }

        if (!this.config.hooks.dispose) {
            this.config.hooks.dispose = [];
        }

        /** Unsubscribe in init required to avoid chars been synced without action from developer */
        this.unsubscribe();
        this.config.hooks.dispose.push(this.trackMouse());
    };

    protected execHooks = <T extends YagrHooks[keyof YagrHooks]>(hooks: T, ...args: HookParams<T>) => {
        if (Array.isArray(hooks)) {
            hooks.forEach((hook) => {
                if (!hook) {
                    return;
                }

                // @ts-ignore
                typeof hook === 'function' && hook(...args);
            });
        }
    };

    protected inStage(stage: YagrState['stage'], fn?: () => void) {
        this.state.stage === stage;
        this.execHooks(this.config.hooks.stage, {chart: this, stage});
        try {
            fn && fn();
        } catch (error) {
            this.onError(error as Error);
        }
        return this;
    }

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

    protected initRender = (u: uPlot, done: Function) => {
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

    get clientHeight() {
        const MARGIN = 8;
        const offset = this.config.title.text ? (this.config.title.fontSize || DEFAULT_TITLE_FONT_SIZE) + MARGIN : 0;
        return this.root.clientHeight - offset;
    }
}

applyMixins(Yagr, [CreateUplotOptionsMixin, TransformSeriesMixin, DynamicUpdatesMixin]);

export default Yagr;
