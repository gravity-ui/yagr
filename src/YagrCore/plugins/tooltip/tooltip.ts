/* eslint-disable complexity, no-nested-ternary */

import uPlot, {Series} from 'uplot';

import {CursorOptions} from '../cursor/cursor';
import placementFn from './placement';

import Yagr from '../../index';
import {DataSeries, ProcessingInterpolation, YagrPlugin} from '../../types';

import {TOOLTIP_Y_OFFSET, TOOLTIP_X_OFFSET, TOOLTIP_DEFAULT_MAX_LINES, DEFAULT_Y_SCALE} from '../../defaults';

import {findInRange, findDataIdx, findSticky, px, isNil} from '../../utils/common';
import {
    TooltipOptions,
    TooltipRow,
    TrackingOptions,
    ValueFormatter,
    TooltipSection,
    TooltipHandler,
    TooltipData,
    TooltipState,
    TooltipAction,
    SelectionRange,
} from './types';

import {renderTooltip} from './render';
import {getOptionValue} from './utils';

// eslint-disable-next-line complexity
const findValue = (
    cursor: CursorOptions,
    data: DataSeries,
    serie: Series,
    idx: number,
    interpolation?: ProcessingInterpolation,
) => {
    const source = Array.isArray(serie.$c) ? serie.$c : data;
    let value = source[idx];

    if (interpolation && value === interpolation.value) {
        const snapTo = interpolation.snapToValues ?? 'closest';
        const nonNullIdx = findDataIdx(source, serie, idx, snapTo, interpolation.value);
        value = source[nonNullIdx];
    } else if (value === null) {
        const cursorSnapToValues = cursor.snapToValues ?? 'closest';
        const snapTo = serie.snapToValues ?? cursorSnapToValues;
        const nonNullIdx = findDataIdx(source, serie, idx, snapTo, null);
        value = source[nonNullIdx];
    }

    return value;
};

const DEFAULT_TOOLTIP_OPTIONS = {
    maxLines: TOOLTIP_DEFAULT_MAX_LINES,
    highlight: true,
    sum: false,
    render: renderTooltip,
    pinable: true,
    strategy: 'pin',
    sort: undefined,
    showIndicies: false,
    hideNoData: false,
    className: 'yagr-tooltip_default',
    xOffset: TOOLTIP_X_OFFSET,
    yOffset: TOOLTIP_Y_OFFSET,
    virtual: false,
    onUpdate: 'reset',
} as const;

export type TooltipPlugin = YagrPlugin<
    {
        state: TooltipState;
        pin(pinState: boolean, position?: {x: number; y: number}): void;
        show(): void;
        hide(): void;
        updateOptions: (o: Partial<TooltipOptions>) => void;
        on: (event: TooltipAction, handler: TooltipHandler) => void;
        off: (event: TooltipAction, handler: TooltipHandler) => void;
        display: (props: {left: number; top: number; idx: number}) => void;
        tooltip: YagrTooltip;
        dispose: () => void;
        reInit: (u: uPlot) => void;
        reset: () => void;
    },
    [Partial<TooltipOptions>]
>;

class YagrTooltip {
    handlers: Record<TooltipAction, TooltipHandler[]> = {
        init: [],
        mount: [],
        show: [],
        pin: [],
        unpin: [],
        hide: [],
        render: [],
        destroy: [],
        reset: [],
    };

    private placement: Function = placementFn;
    private renderTooltipCloses = () => {};

    private tOverlay: HTMLDivElement;
    private bound: HTMLElement;
    private renderNode: HTMLElement;
    /**
     * Flag to skip next mouseup event, used for unpinning
     * tooltip on any mousedown, but continiously pinning on drag
     */
    private skipNextMouseUp = false;

    yagr: Yagr;
    opts: TooltipOptions;
    state: TooltipState;
    over: HTMLDivElement;

    private bLeft: number;
    private bTop: number;
    private bWidth: number;

    constructor(yagr: Yagr, options: Partial<TooltipOptions> = {}) {
        this.yagr = yagr;
        this.over = yagr?.uplot?.over;
        this.opts = {
            ...DEFAULT_TOOLTIP_OPTIONS,
            strategy: options.pinable ? 'pin' : DEFAULT_TOOLTIP_OPTIONS.strategy,
            tracking: yagr.config.chart.series?.type === 'area' ? 'area' : 'sticky',
            value: this.defaultTooltipValueFormatter,
            ...options,
        };

        this.bound = this.opts.boundClassName
            ? document.querySelector(this.opts.boundClassName) || document.body
            : document.body;
        this.renderNode = this.opts.renderClassName
            ? document.querySelector(this.opts.renderClassName) || document.body
            : document.body;
        this.tOverlay = document.createElement('div');

        this.tOverlay.id = `${yagr.id}_tooltip`;
        this.tOverlay.className = `yagr-tooltip ${this.opts.className || ''}`;
        this.tOverlay.style.display = 'none';

        this.state = {
            mounted: false,
            pinned: false,
            visible: false,
            range: null,
            focusedSeries: null,
        };

        this.bLeft = 0;
        this.bTop = 0;
        this.bWidth = 0;

        if (this.opts.virtual) {
            this.placement = () => {};
        } else {
            this.renderNode.appendChild(this.tOverlay);
            this.state.mounted = true;
            this.emit('mount');
        }
    }

    emit = (action: TooltipAction, data?: TooltipData) => {
        this.handlers[action].forEach((handler) => {
            handler(this.tOverlay, {
                state: this.state,
                actions: {
                    pin: this.pin,
                    show: this.show,
                    hide: this.hide,
                    dispose: this.dispose,
                    reset: this.reset,
                },
                data,
                yagr: this.yagr,
                event: action,
            });
        });
    };

    reset = () => {
        if (this.opts.onUpdate === 'none') {
            this.yagr.plugins.cursor?.pin(false);
            return;
        }

        if (this.state.visible) {
            this.hide();
        }

        if (this.state.pinned) {
            this.pin(false);
        }
        this.emit('reset');
    };

    show = () => {
        const shouldEmit = !this.state.visible;
        this.state.visible = true;
        this.tOverlay.style.display = 'block';
        shouldEmit && this.emit('show');
    };

    hide = () => {
        const shouldEmit = this.state.visible;
        this.state.visible = false;
        this.tOverlay.style.display = 'none';
        this.emit('hide');
        shouldEmit && this.emit('show');
    };

    pin = (pinState: boolean, position?: {x: number; y: number}) => {
        this.state.pinned = pinState;
        const range = this.state.range || [];

        this.yagr.plugins.cursor?.pin(pinState && (range[1] === null || range.length < 2));

        if (this.opts.virtual) {
            return this.emit(pinState ? 'pin' : 'unpin');
        }

        if (position) {
            this.placement(
                this.tOverlay,
                {
                    left: position.x + this.bLeft,
                    top: this.bTop + position.y - (this.opts.yOffset || 0),
                },
                'right',
                {
                    bound: this.bound,
                    xOffset: this.opts.xOffset,
                    yOffset: this.opts.yOffset,
                },
            );
        }

        const list = this.tOverlay.querySelector('._tooltip-list') as HTMLElement;

        if (pinState) {
            if (!this.state.visible) {
                this.show();
            }

            this.tOverlay.classList.add('yagr-tooltip_pinned');
            if (list && list?.clientHeight) {
                list.style.height = px(list.clientHeight);
            }

            if (this.opts.render === renderTooltip) {
                document.addEventListener('mousemove', this.checkFocus);
                document.addEventListener('mousedown', this.detectClickOutside);
            }
        } else {
            this.tOverlay.classList.remove('yagr-tooltip_pinned');

            if (this.opts.render === renderTooltip) {
                document.removeEventListener('mousemove', this.checkFocus);
                document.removeEventListener('mousedown', this.detectClickOutside);
            }
        }

        this.emit(pinState ? 'pin' : 'unpin');
    };

    checkFocus = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        let serieIdx: string | undefined;

        if (target && this.tOverlay.contains(target) && target.classList.contains('yagr-tooltip__item')) {
            serieIdx = target.dataset['series'];
        }

        const serie = serieIdx ? this.yagr.uplot.series[Number(serieIdx)] : null;

        if (serieIdx && serie) {
            this.state.focusedSeries = serieIdx;
            this.yagr.setFocus(serie.id, true);
        } else if (this.state.focusedSeries) {
            this.state.focusedSeries = null;
            this.yagr.setFocus(null, true);
        }
    };

    render = (props: {left: number; top: number; idx: number}) => {
        const u = this.yagr.uplot;
        const {left, top, idx} = props;
        const {opts, state} = this;

        if (opts.show && typeof opts.show === 'function' && opts.show(this.yagr) === false) {
            this.hide();
            return;
        }

        if ((left < 0 || top < 0) && !state.pinned && this.isNotInDrag) {
            this.hide();
        }

        const {data} = u;

        if (data === null || isNil(idx) || top === undefined) {
            return;
        }

        const x = data[0][idx];

        const sum: Record<string, number> = {};
        const sections: Record<string, TooltipSection> = {};

        const rowsBySections: Record<string, number[]> = {};

        let i = 1;
        while (i < u.series.length) {
            const serie = u.series[i];

            if (!serie.show) {
                i += 1;
                continue;
            }

            const scale = serie.scale || DEFAULT_Y_SCALE;

            rowsBySections[scale] = rowsBySections[scale] || [];
            rowsBySections[scale].push(i);
            i += 1;
        }

        const rowEntries = Object.entries(rowsBySections);

        rowEntries.forEach(([scale, serieIndicies]) => {
            sections[scale] = sections[scale] || {
                rows: [],
            };
            const section = sections[scale];
            const cursorValue = Number(u.posToVal(top, scale).toFixed(2));

            const valueRender = getOptionValue<ValueFormatter>(opts.value, scale);

            for (const seriesIdx of serieIndicies) {
                const seriesData = u.data[seriesIdx] as DataSeries;
                const serie = u.series[seriesIdx];

                let value = findValue(this.yagr.config.cursor, seriesData, serie, idx, this.interpolation);
                let dValue = value;

                if (typeof value === 'string') {
                    dValue = value;
                    value = null;
                }

                if (getOptionValue(opts.sum, scale)) {
                    sum[scale] = sum[scale] || 0;
                    sum[scale] += value || 0;
                }

                const realY = seriesData[idx];
                const yValue = serie.$c && serie.$c[idx] === this.stripValue ? value : realY;

                if ((value === null && opts.hideNoData) || serie.showInTooltip === false) {
                    continue;
                }

                const seriesPrecision = serie.precision ?? getOptionValue(opts.precision, scale);

                const displayValue = serie.formatter
                    ? serie.formatter(dValue, serie)
                    : valueRender(dValue, seriesPrecision);

                const rowData: TooltipRow = {
                    id: serie.id,
                    name: serie.name,
                    dataValue: serie.$c[idx],
                    originalValue: value,
                    value: displayValue,
                    y: yValue,
                    displayY: realY,
                    color: serie.color,
                    seriesIdx,
                    rowIdx: section.rows.length ? section.rows[section.rows.length - 1].rowIdx + 1 : 0,
                };

                if (serie.normalizedData) {
                    rowData.transformed = serie.normalizedData[idx];
                }

                if (serie._transformed) {
                    rowData.transformed = seriesData[idx];
                }

                if (opts.omitBy && opts.omitBy(rowData)) {
                    continue;
                }

                section.rows.push(rowData);
            }

            if (getOptionValue(opts.highlight, scale) && section.rows.length) {
                const tracking = getOptionValue<TrackingOptions>(opts.tracking, scale);
                let activeIndex: number | null = 0;
                if (tracking === 'area') {
                    activeIndex = findInRange(
                        section,
                        cursorValue,
                        getOptionValue<boolean | undefined>(opts.stickToRanges, scale),
                    );
                } else if (tracking === 'sticky') {
                    activeIndex = findSticky(section, cursorValue);
                } else if (typeof tracking === 'function') {
                    activeIndex = tracking(section, cursorValue);
                }

                if (activeIndex !== null) {
                    section.rows[activeIndex].active = true;
                }
            }

            const sort = getOptionValue(opts.sort, scale);
            if (sort) {
                section.rows.sort(sort);
            }
        });

        const hasOneRow = Object.values(sections).some(({rows}) => rows.length > 0);

        if (hasOneRow) {
            this.onMouseEnter();
        } else {
            this.hide();
            return;
        }

        const bbox = this.over.getBoundingClientRect();

        this.bLeft = bbox.left;
        this.bTop = bbox.top;
        this.bWidth = bbox.width;

        const anchor = {
            left: left + this.bLeft,
            top: this.bTop + top - (opts.yOffset || 0),
        };

        this.renderTooltipCloses = () => {
            const renderData = {
                scales: Object.entries(sections).map(([scale, sec]) => {
                    return {
                        scale,
                        rows: sec.rows,
                        sum: sum[scale],
                    };
                }),
                options: opts,
                x,
            };

            if (!opts.virtual) {
                this.tOverlay.innerHTML = opts.render({
                    ...renderData,
                    state,
                    yagr: this.yagr,
                    defaultRender: DEFAULT_TOOLTIP_OPTIONS.render,
                });

                this.placement(this.tOverlay, anchor, 'right', {
                    bound: this.bound,
                    xOffset: opts.xOffset,
                    yOffset: opts.yOffset,
                });
            }

            this.emit('render', {...renderData, anchor});
        };

        if (state.pinned) {
            return;
        }

        this.renderTooltipCloses();
    };

    initWithUplot = (u: uPlot) => {
        this.over = u.root.querySelector('.u-over') as HTMLDivElement;

        this.over.addEventListener('mousedown', this.onMouseDown);
        this.over.addEventListener('mousemove', this.onMouseMove);
        this.over.addEventListener('mouseenter', this.onMouseEnter);
        this.over.addEventListener('mouseleave', this.onMouseLeave);

        document.addEventListener('mouseup', this.onMouseUp);
    };

    setSize = () => {
        const bbox = this.over.getBoundingClientRect();

        this.bLeft = bbox.left;
        this.bTop = bbox.top;
    };

    dispose = () => {
        /** Free overlay listeners */
        this.over.removeEventListener('mousedown', this.onMouseDown);
        this.over.removeEventListener('mousemove', this.onMouseMove);
        this.over.removeEventListener('mouseenter', this.onMouseEnter);
        this.over.removeEventListener('mouseleave', this.onMouseLeave);

        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('mousemove', this.checkFocus);
        document.removeEventListener('mousedown', this.detectClickOutside);

        /** Removing tooltip on destroy */
        this.tOverlay.remove();
        this.state.mounted = false;
        this.emit('destroy');
    };

    updateOptions = (newOptions: Partial<TooltipOptions>) => {
        Object.assign(this.opts, newOptions);
        this.tOverlay.className = `yagr-tooltip ${this.opts.className || ''}`;
    };

    on = (event: TooltipAction, handler: TooltipHandler) => {
        this.handlers[event].push(handler);
    };

    off = (event: TooltipAction, handler: TooltipHandler) => {
        this.handlers[event] = this.handlers[event].filter((h) => h !== handler);
    };

    private detectClickOutside = (event: MouseEvent) => {
        const target = event.target;

        if (target instanceof Element) {
            const isClickInsideTooltip = target && this.tOverlay.contains(target);
            const isClickOnUplotOver = target && this.over.contains(target);

            if (!isClickInsideTooltip && !isClickOnUplotOver) {
                this.pin(false);
                this.hide();
            }
        }
    };

    private onMouseDown = (evt: MouseEvent) => {
        this.state.range = [this.getCursorPosition(), null];

        if (this.state.pinned) {
            this.pin(false);
            this.hide();
            this.render({
                left: evt.clientX - this.bLeft,
                top: evt.clientY - this.bTop,
                idx: this.yagr.uplot.posToIdx(evt.clientX - this.bLeft),
            });
            this.skipNextMouseUp = true;
        }
    };

    private onMouseMove = () => {
        if (this.state.range?.length) {
            this.state.range[1] = this.getCursorPosition();
        }
    };

    /**
     * Calculates where exactly cursor leaved the chart
     * and sets range[1] to this position
     */
    private setCursorLeaved = (e: MouseEvent) => {
        const rect = this.over.getBoundingClientRect();
        const x = e.clientX;
        const range = this.state.range!;
        const startPoint = range[0]!;
        const xInOver = x - rect.left;
        const end = xInOver > startPoint.clientX;
        const timeline = this.yagr.config.timeline;

        let result;
        if (end) {
            range[1] = {
                clientX: this.bWidth,
                value: this.yagr.uplot.posToVal(this.bWidth, 'x'),
                idx: timeline.length - 1,
            };
            result = range[1];
        } else {
            /** Swap range[1] and range[0] in case if tooltip leaved chart in begining of element */
            range[1] = range[0];
            range[0] = {
                clientX: 0,
                value: this.yagr.uplot.posToVal(0, 'x'),
                idx: 0,
            };

            result = range[0];
        }

        this.yagr.uplot.setCursor({
            left: result.clientX,
            top: e.clientY - rect.top,
        });
    };

    private onMouseUp = (e: MouseEvent) => {
        if (this.state.range === null) {
            return;
        }

        const [from] = this.state.range || [];
        let cursor: SelectionRange[number];

        if (e.target === this.over) {
            cursor = this.getCursorPosition();
        } else {
            cursor = this.state.range[1];
        }

        if (this.opts.strategy === 'none') {
            return;
        }

        const click = from && from.clientX === cursor?.clientX;
        const drag = from && from.clientX !== cursor?.clientX;

        const strategy = this.opts.strategy;

        if (
            (click && !this.skipNextMouseUp && strategy !== 'drag') ||
            (drag && (strategy === 'all' || strategy === 'drag'))
        ) {
            this.pin(!this.state.pinned);
            this.show();
            this.renderTooltipCloses();
        }

        this.state.range = null;
        this.skipNextMouseUp = false;
    };

    private onMouseEnter = () => {
        this.show();
    };

    private onMouseLeave = (e: MouseEvent) => {
        const isPinned = this.state.pinned;

        if (this.state.range?.[0]) {
            this.setCursorLeaved(e);
        }

        if (!isPinned && this.isNotInDrag) {
            this.hide();
        }
    };

    private defaultTooltipValueFormatter = (n: string | number | null, precision?: number) => {
        const pSettings = this.yagr.config.processing || {};

        if (typeof n === 'string') {
            if (pSettings.nullValues && pSettings.nullValues.hasOwnProperty(n)) {
                return pSettings.nullValues[n] as string;
            }

            return '-';
        }

        if (typeof n === 'number') {
            return n.toFixed(
                // eslint-disable-next-line no-nested-ternary
                typeof precision === 'number'
                    ? precision
                    : typeof this.opts.precision === 'number'
                    ? this.opts.precision
                    : 2,
            );
        }

        return '-';
    };

    private getCursorPosition = (): SelectionRange[number] => {
        const x = this.yagr.uplot.cursor.left;

        if (x === undefined) {
            return null;
        }

        return {
            clientX: x,
            value: this.yagr.uplot.posToVal(x, 'x'),
            idx: this.yagr.uplot.posToIdx(x),
        };
    };

    get interpolation() {
        return this.yagr.config.processing?.interpolation;
    }
    get stripValue() {
        return this.interpolation ? this.interpolation.value : undefined;
    }
    get isNotInDrag() {
        if (this.opts.strategy === 'none' || this.opts.strategy === 'pin') {
            return true;
        }

        return !this.state.range?.[1];
    }
}

/*
 * Tooltip plugin constructor.
 * Every charts has it's own tooltip plugin instance
 */
function YagrTooltipPlugin(yagr: Yagr, options: Partial<TooltipOptions> = {}): ReturnType<TooltipPlugin> {
    const tooltip = new YagrTooltip(yagr, options);

    const getUplotPlugin = () => ({
        hooks: {
            init: (u: uPlot) => {
                tooltip.initWithUplot(u);
            },
            setSize: () => {
                tooltip.setSize();
            },

            setCursor: (u: uPlot) => {
                tooltip.render(u.cursor as Parameters<typeof tooltip.render>[0]);
            },
        },
    });

    const uPlotPlugin = getUplotPlugin();

    function reInit(u: uPlot) {
        const uPlugin = getUplotPlugin();

        tooltip.reset();

        u.hooks.init!.push(uPlugin.hooks.init);
        u.hooks.setSize!.push(uPlugin.hooks.setSize);
        u.hooks.setCursor!.push(uPlugin.hooks.setCursor);
    }

    return {
        state: tooltip.state,
        pin: tooltip.pin,
        show: tooltip.show,
        hide: tooltip.hide,
        uplot: uPlotPlugin,
        display: tooltip.render,
        updateOptions: tooltip.updateOptions,
        on: tooltip.on,
        off: tooltip.off,
        tooltip,
        dispose: tooltip.dispose,
        reInit,
        reset: tooltip.reset,
    };
}

export default YagrTooltipPlugin;
