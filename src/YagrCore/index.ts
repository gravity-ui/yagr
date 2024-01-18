import UPlot, {Options as UPlotOptions, AlignedData, Series, SyncPubSub} from 'uplot';

import LegendPlugin from './plugins/legend/legend';
import {TooltipPlugin} from './plugins/tooltip/tooltip';
import cursorPlugin from './plugins/cursor/cursor';
import {PlotLinesPlugin} from './plugins/plotLines/plotLines';

import {YagrConfig, MinimalValidConfig, InternalYargHooks} from './types';

import {debounce, genId, px} from './utils/common';
import ColorParser from './utils/colors';

import ThemedDefaults, {DEFAULT_SYNC_KEY, DEFAULT_TITLE_FONT_SIZE} from './defaults';
import i18n from './locale';

import {CreateUplotOptionsMixin} from './mixins/create-options';
import {TransformSeriesMixin} from './mixins/transform-series';
import {DynamicUpdatesMixin} from './mixins/dynamic-updates';

import {applyMixins} from './utils/mixins';
import {BatchMixin} from './mixins/batch-updates';

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
    stage: 'config' | 'processing' | 'uplot' | 'render' | 'listen' | 'dispose';
    inBatch?: boolean;
    y2uIdx: Record<string, number>;
    subscribed: boolean;
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
    plugins: {
        tooltip?: ReturnType<TooltipPlugin>;
        plotLines?: ReturnType<PlotLinesPlugin>;
        cursor?: ReturnType<typeof cursorPlugin>;
        legend?: LegendPlugin;
    } & Partial<
        TConfig['plugins'] extends YagrConfig['plugins']
            ? {[key in keyof TConfig['plugins']]: ReturnType<TConfig['plugins'][key]>}
            : {}
    > = {};
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

    /** Create uPlot options methods */
    protected createUplotOptions!: CreateUplotOptionsMixin<TConfig>['createUplotOptions'];
    protected transformSeries!: TransformSeriesMixin<TConfig>['transformSeries'];
    protected _uHooks: Record<string, (u: uPlot) => void> = {};

    /** Dynamic update methods */
    setTheme!: DynamicUpdatesMixin<TConfig>['setTheme'];
    setLocale!: DynamicUpdatesMixin<TConfig>['setLocale'];
    setAxes!: DynamicUpdatesMixin<TConfig>['setAxes'];
    setSeries!: DynamicUpdatesMixin<TConfig>['setSeries'];
    setVisible!: DynamicUpdatesMixin<TConfig>['setVisible'];
    setFocus!: DynamicUpdatesMixin<TConfig>['setFocus'];
    setScales!: DynamicUpdatesMixin<TConfig>['setScales'];
    setTitle!: DynamicUpdatesMixin<TConfig>['setTitle'];
    setConfig!: DynamicUpdatesMixin<TConfig>['setConfig'];

    /** Batch update methods */
    batch!: BatchMixin<TConfig>['batch'];
    protected fullUpdate!: BatchMixin<TConfig>['fullUpdate'];
    protected _batch!: BatchMixin<TConfig>['_batch'];

    protected _cache!: CachedProps;

    /** Mixin methods */
    private initMixins!: () => void;

    constructor(root: HTMLElement, pConfig: TConfig) {
        this.initMixins();

        this._startTime = performance.now();
        this.state = {
            isEmptyDataSet: false,
            isMouseOver: false,
            stage: 'config',
            y2uIdx: {},
            subscribed: false,
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

            if (!this.root.id) {
                this.root.id = this.id;
            }

            const colorParser = new ColorParser();
            const sync = this.config.cursor.sync;

            const chart = this.config.chart;

            chart.series ||= {type: 'line'};
            chart.size ||= {adaptive: true};
            chart.appearance ||= {locale: 'en'};
            chart.select ||= {};

            this.utils = {
                colors: colorParser,
                i18n: i18n(config.chart.appearance?.locale || 'en'),
                theme: new ThemedDefaults(colorParser),
            };

            colorParser.setContext(root);

            if (sync) {
                this.utils.sync = UPlot.sync(typeof sync === 'string' ? sync : DEFAULT_SYNC_KEY);
            }

            if (!chart.size.adaptive && chart.size.width && chart.size.height) {
                root.style.width = px(chart.size.width);
                root.style.height = px(chart.size.height);
            }

            this.plugins.legend = new LegendPlugin();
            this.setTheme(chart.appearance.theme || 'light');
            this.createUplotOptions();
            this._cache = {
                height: this.options.height,
                width: this.options.width,
            };
            if (config.editUplotOptions) {
                this.options = config.editUplotOptions(this.options);
            }
        })
            .inStage('processing', () => {
                this.transformSeries();
            })
            .inStage('uplot', () => {
                this.uplot = new UPlot(this.options, this.series, this.initRender);
                this.canvas = root.querySelector('canvas') as HTMLCanvasElement;

                this.init();

                const processTime = performance.now() - this._startTime;
                this._meta.processTime = processTime;
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
        this.plugins?.tooltip?.dispose();
        this.plugins?.legend?.destroy();
        this.uplot.destroy();
        this._uHooks = {};
        this.execHooks('dispose', {chart: this});
    }

    toDataUrl() {
        return this.canvas.toDataURL('img/png');
    }

    subscribe() {
        if (this.state.subscribed) {
            return;
        }

        this.utils.sync?.sub(this.uplot);
        this.state.subscribed = true;
    }

    unsubscribe() {
        this.utils.sync?.unsub(this.uplot);
        this.state.subscribed = false;
    }

    protected init = () => {
        if (this.config.chart.size?.adaptive && !this.resizeOb) {
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

    protected execHooks = <T extends keyof InternalYargHooks>(
        hookName: T,
        ...args: Parameters<Required<InternalYargHooks>[T][0]>
    ) => {
        const hooks = this.config.hooks[hookName];
        if (Array.isArray(hooks)) {
            for (const hook of hooks) {
                if (!hook) {
                    continue;
                }

                typeof hook === 'function' && hook(...args);
            }
        }
    };

    protected inStage(stage: YagrState['stage'], fn?: () => void) {
        this.state.stage === stage;
        this.execHooks('stage', {chart: this, stage});
        try {
            fn && fn();
        } catch (error) {
            console.error(error);
            this.onError(error as Error);
        }
        return this;
    }

    protected initRender = (u: uPlot, done: Function) => {
        /**
         * Reimplementing appending u.root to root
         * and ensure that uPlot instance will be placed
         * correctly relative to legend
         */
        const position = this.config.legend?.position;
        if (this.root.firstChild) {
            !position || position === 'bottom'
                ? this.root.insertBefore(u.root, this.root.firstChild)
                : this.root.appendChild(u.root);
        } else {
            !position || position === 'bottom'
                ? this.root.appendChild(u.root)
                : this.root.insertBefore(u.root, this.root.firstChild);
        }

        if (this.config.legend?.show) {
            this.plugins.legend?.init(u);
            this.reflow(false);
        }

        this.initTitle();

        done();
    };

    protected initTitle() {
        /** Setup font size for title if required */
        if (this.config.title && this.config.title.fontSize) {
            const size = this.config.title.fontSize;
            const t = this.root.querySelector('.u-title') as HTMLElement;
            t.setAttribute('style', `font-size:${size}px;line-height:${size}px;`);
            t.innerHTML = this.config.title.text;
        }
    }

    private onError(error: Error) {
        this.execHooks('error', {
            stage: this.state.stage,
            error,
            chart: this,
        });
        return error;
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

    /*
     * Resize handler. Should cache height and width to avoid unneccesary resize handling,
     * when actial width and height of contentRect doesn't changed
     */
    private onResize = (args: ResizeObserverEntry[]) => {
        const [resize] = args;

        if (this._cache.height === resize.contentRect.height && this._cache.width === resize.contentRect.width) {
            return;
        }

        this.plugins.tooltip?.reset();

        this.reflow();
        this.execHooks('resize', {entries: args, chart: this});
    };

    get clientHeight() {
        const MARGIN = 8;
        const offset = this.config.title.text ? (this.config.title.fontSize || DEFAULT_TITLE_FONT_SIZE) + MARGIN : 0;
        return this.root.clientHeight - offset - (this.plugins.legend?.state.totalSpace || 0);
    }

    reflow(redraw = true) {
        const width = this.root.clientWidth;
        const height = this.clientHeight;

        this._cache.width = width;
        this.options.width = width;
        this._cache.height = height;
        this.options.height = height;
        redraw &&
            this.uplot.setSize({
                width: this.options.width,
                height: this.options.height,
            });
        redraw && this.uplot.redraw();
    }
}

applyMixins(Yagr, [CreateUplotOptionsMixin, TransformSeriesMixin, DynamicUpdatesMixin, BatchMixin]);

export default Yagr;
