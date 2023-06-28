/* eslint-disable complexity */

import uPlot, {Series, Plugin, Options as UPlotOptions, DrawOrderKey as uDrawOrderKey} from 'uplot';

import type {MinimalValidConfig} from '../types';
import Yagr, {YagrMeta} from '..';

import tooltipPlugin from '../plugins/tooltip/tooltip';
import CursorPlugin from '../plugins/cursor/cursor';
import {
    DEFAULT_CANVAS_PIXEL_RATIO,
    DEFAULT_FOCUS_ALPHA,
    DEFAULT_X_SCALE,
    DEFAULT_X_SERIE_NAME,
    MIN_SELECTION_WIDTH,
} from '../defaults';
import {configureSeries} from '../utils/series';
import markersPlugin from '../plugins/markers';
import {configureScales} from '../utils/scales';
import {configureAxes} from '../utils/axes';
import {getPaddingByAxes} from '../utils/chart';
import {DrawOrderKey} from '../utils/types';

export class CreateUplotOptionsMixin<T extends MinimalValidConfig> {
    /**
     * @internal
     * @param reOpt If in reOpt cycle (e.g. batch update), then won't reinit hooks.
     * @description Creates uPlot options from Yagr config, sets up plugins. Non idempotent.
     * @returns uPlot options
     */
    protected createUplotOptions(this: Yagr<T>, reOpt = false) {
        const {config} = this;
        const plugins: Plugin[] = [];

        let tooltipInstance = this.plugins?.tooltip;

        /** Setting up TooltipPugin */
        if (config.tooltip && config.tooltip.show !== false) {
            if (tooltipInstance) {
                tooltipInstance.updateOptions(config.tooltip);
            } else {
                tooltipInstance = tooltipPlugin(this, config.tooltip);
            }
            plugins.push(tooltipInstance.uplot);
            this.plugins.tooltip = tooltipInstance;
        }

        if (!reOpt) {
            const plotLinesPluginInstance = this.initPlotLinesPlugin(config);
            this.plugins.plotLines = plotLinesPluginInstance;
            plugins.push(plotLinesPluginInstance.uplot);
        }

        Object.entries(config.plugins).forEach(([name, plugin]) => {
            const pluginInstance = plugin(this);
            plugins.push(pluginInstance.uplot);
            Object.assign(this.plugins, {[name]: pluginInstance});
        });

        const chart = config.chart;

        const options: UPlotOptions = {
            width: this.root.clientWidth,
            height: this.clientHeight,
            title: config.title?.text,
            plugins: plugins,
            focus: {alpha: DEFAULT_FOCUS_ALPHA},
            series: [
                {
                    id: DEFAULT_X_SERIE_NAME,
                    $c: config.timeline,
                    scale: DEFAULT_X_SCALE,
                    count: config.timeline.length,
                } as Series,
            ],
            ms: chart.timeMultiplier || 1,
            hooks: config.hooks || {},
        };

        this.state.isEmptyDataSet =
            config.timeline.length === 0 ||
            config.series.length === 0 ||
            config.series.every(({data}) => data.length === 0);

        /**
         * Setting up cursor - points on cursor, drag behavior, crosshairs
         */
        options.cursor = options.cursor || {};
        options.cursor.points = options.cursor.points || {};
        options.cursor.drag = options.cursor.drag || {
            dist: chart.select?.minWidth || MIN_SELECTION_WIDTH,
            x: true,
            y: false,
            setScale: chart.select?.zoom ?? true,
        };

        if (this.utils.sync) {
            options.cursor.sync = options.cursor.sync || {
                key: this.utils.sync.key,
            };
        }

        if (config.cursor) {
            const cPlugin = CursorPlugin(this, config.cursor);
            this.plugins.cursor = cPlugin;
            plugins.push(cPlugin.uplot);
        }

        const seriesOptions = config.series || [];
        const resultingSeriesOptions: Series[] = options.series;

        /**
         * Prepare series options
         */
        for (let i = seriesOptions.length - 1; i >= 0; i--) {
            const serie = configureSeries(this, seriesOptions[i] || {}, i);
            const uIdx = resultingSeriesOptions.push(serie);
            this.state.y2uIdx[serie.id || i] = uIdx - 1;
        }

        /** Setting up markers plugin after default points renderers to be settled */
        const markersPluginInstance = markersPlugin(this, config);
        plugins.push(markersPluginInstance);

        options.series = resultingSeriesOptions;

        if (!config.scales || Object.keys(config.scales).length === 0) {
            config.scales = {
                x: {},
                y: {},
            };
        }

        /** Setting up scales */
        options.scales = options.scales || {};
        options.scales = configureScales(this, options.scales, config);

        /** Setting up minimal axes */
        options.axes = options.axes || [];
        const axes = options.axes;

        axes.push(...configureAxes(this, config));

        /** Setting up hooks */
        options.hooks = config.hooks || {};
        options.hooks.draw = options.hooks.draw || [];
        options.hooks.ready = options.hooks.ready || [];
        options.hooks.drawClear = options.hooks.drawClear || [];
        options.hooks.setSelect = options.hooks.setSelect || [];

        if (!reOpt) {
            options.hooks.draw.push(() => {
                if (this.state.stage === 'listen') {
                    return;
                }
                this.state.stage = 'listen';
                this.execHooks('stage', {chart: this, stage: this.state.stage});
                const renderTime = performance.now() - this._startTime;
                this._meta.renderTime = renderTime;
                this.execHooks('load', {
                    chart: this,
                    meta: this._meta as YagrMeta,
                });
            });
            options.hooks.ready.push(() => {
                const initTime = performance.now() - this._startTime;
                this._meta.initTime = initTime;
                this.execHooks('inited', {
                    chart: this,
                    meta: {
                        initTime,
                    },
                });
            });
            options.hooks.drawClear.push((u: uPlot) => {
                const {ctx} = u;
                ctx.save();
                ctx.fillStyle = this.utils.theme.BACKGROUND;
                ctx.fillRect(
                    DEFAULT_CANVAS_PIXEL_RATIO,
                    DEFAULT_CANVAS_PIXEL_RATIO,
                    u.width * DEFAULT_CANVAS_PIXEL_RATIO - 2 * DEFAULT_CANVAS_PIXEL_RATIO,
                    u.height * DEFAULT_CANVAS_PIXEL_RATIO - 2 * DEFAULT_CANVAS_PIXEL_RATIO,
                );
                ctx.restore();
            });
            options.hooks.setSelect.push((u: uPlot) => {
                const {left, width} = u.select;
                const [_from, _to] = [u.posToVal(left, DEFAULT_X_SCALE), u.posToVal(left + width, DEFAULT_X_SCALE)];
                const {timeMultiplier = 1} = chart;

                this.execHooks('onSelect', {
                    from: Math.ceil(_from / timeMultiplier),
                    to: Math.ceil(_to / timeMultiplier),
                    chart: this,
                });
                u.setSelect({width: 0, height: 0, top: 0, left: 0}, false);
            });
        }

        options.drawOrder = chart.appearance?.drawOrder
            ? (chart.appearance?.drawOrder.filter(
                  (key) => key === DrawOrderKey.Series || key === DrawOrderKey.Axes,
              ) as uDrawOrderKey[])
            : [DrawOrderKey.Series, DrawOrderKey.Axes];

        /** Disabling uPlot legend. */
        options.legend = {show: false};
        options.padding = config.chart.size?.padding || getPaddingByAxes(options);

        /**
         * Pre-initialization  of legend allows to calculate
         * legend's height before actual uPlot instance
         * will be rendered, to avoid blinking height changes
         */
        this.plugins.legend?.preInit(this, this.config.legend, options);
        options.height = this.clientHeight;

        this.options = options;

        return options;
    }
}
