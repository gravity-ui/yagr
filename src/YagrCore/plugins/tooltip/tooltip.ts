import {Plugin, Series} from 'uplot';

import {CursorOptions, SnapToValue} from '../cursor/cursor';
import placement from './placement';

import Yagr from '../../index';
import {DataSeries} from '../../types';

import {findInRange, findDataIdx, findSticky} from '../../utils/common';
import {
    TrackingOptions,
    TooltipOptions,
    TooltipRows,
    TooltipRow,
} from './types';

const ANCHOR_Y_OFFSET = 24;
const DEFAULT_MAX_LINES = 10;

export interface TooltipState {
    /** Is tooltip pinned */
    pinned: boolean;

    /** X-Coord of click to track selections and differ them from single click */
    clickStartedX: null | number;

    /** Tooltip renderer, allows to deffer rendering to avoid jerky renderings when tooltip pinned */
    renderTooltipCloses: () => void;
}


function renderTooltip(rows: TooltipRows) {
    const body = rows.map(({y, name}) => {
        return `<div>${name} : ${y}</div>`;
    });

    return `<div>${body}</div>`;
}

// eslint-disable-next-line complexity
const findValue = (cursor: CursorOptions, data: DataSeries, serie: Series, idx: number) => {
    const source = Array.isArray(serie.originalData) ? serie.originalData : data;

    const snapTo = cursor.snapToValues === false
        ? false
        : cursor.snapToValues || SnapToValue.Closest;

    let value = source[idx];

    if (value === null) {
        const nonNullIdx = findDataIdx(source, serie, idx, snapTo);
        value = source[nonNullIdx];
    }

    return value;
};

/*
 * Tooltip plugin constructor.
 * Every charts has it's own tooltip plugin instance
 */
function YagrTooltipPlugin(yagr: Yagr, options: Partial<TooltipOptions> = {}): Plugin {
    const defaultTooltipValueFormatter = (n: number | null, precision?: number) => {
        return n === null
            ? '-'
            : n.toFixed(
                // eslint-disable-next-line no-nested-ternary
                typeof precision === 'number'
                    ? precision
                    : (typeof options.precision === 'number' ? options.precision : 2),
            );
    };

    const opts: TooltipOptions = Object.assign({}, {
        tracking: TrackingOptions.Sticky,
        maxLines: DEFAULT_MAX_LINES,
        highlightLines: true,
        total: true,
        renderAll: false,
        render: renderTooltip,
        pinable: true,
        value: defaultTooltipValueFormatter,
        sort: undefined,
        showIndicies: false,
        hideNoData: false,
    }, options);

    let over: HTMLDivElement;
    let bLeft: number;
    let bTop: number;
    let bound: HTMLElement;

    const tOverlay = document.createElement('div');

    tOverlay.id = `${yagr.id}.tooltip`;
    tOverlay.className = 'yagr-tooltip chartkit-theme_common';
    tOverlay.style.display = 'none';
    tOverlay.style.position = 'absolute';

    document.body.appendChild(tOverlay);

    const state: TooltipState = {
        pinned: false,
        clickStartedX: null,
        renderTooltipCloses: () => {},
    };

    const show = () => { tOverlay.style.display = 'block'; };
    const hide = () => { tOverlay.style.display = 'none'; };

    const checkFocus = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        let serieName: string | undefined;

        if (target && tOverlay.contains(target) && target.tagName === 'TD') {
            serieName = target.parentElement?.dataset['seriesName'];
        }

        const serie = serieName ? (yagr.uplot.series).find((s) => {
            return s.name === serieName;
        }) : null;

        yagr.focus(serie ? serie.id : null, true);
    };

    const onMouseDown = (event: MouseEvent) => {
        state.clickStartedX = event.clientX;
    };

    const detectClickOutside = (event: MouseEvent) => {
        const target = event.target;

        if (target instanceof Element) {
            const isClickInsideTooltip = target && tOverlay.contains(target);
            const isClickOnUplotOver = target && over.contains(target);

            if (!isClickInsideTooltip && !isClickOnUplotOver) {
                state.pinned = false;
                tOverlay.classList.remove('yagr-tooltip_pinned');
                hide();
            }
        }
    };

    const onMouseUp = (event: MouseEvent) => {
        if (
            opts.pinable &&
            state.clickStartedX &&
            state.clickStartedX === event.clientX
        ) {
            state.pinned = !state.pinned;
            const list = tOverlay.querySelector('._tooltip-list') as HTMLElement;

            if (state.pinned) {
                tOverlay.classList.add('yagr-tooltip_pinned');
                if (list) {
                    list.style.height = list?.clientHeight + 'px';
                }

                const pointsHolder = document.createElement('div');
                pointsHolder.classList.add('yagr-points-holder');
                over.querySelectorAll('.yagr-point').forEach((elem) => {
                    pointsHolder.appendChild(elem.cloneNode(true));
                });
                over.appendChild(pointsHolder);

                document.addEventListener('mousemove', checkFocus);
                document.addEventListener('mousedown', detectClickOutside);
            } else {
                over.querySelector('.yagr-points-holder')?.remove();
                tOverlay.classList.remove('yagr-tooltip_pinned');
                list.removeEventListener('mousemove', checkFocus);
                document.removeEventListener('mousedown', detectClickOutside);
            }

            show();
            state.renderTooltipCloses();
        }
    };

    const onMouseEnter = () => {
        show();
    };

    const onMouseLeave = () => {
        if (!state.pinned) {
            hide();
        }
    };


    const plugin: Plugin = {
        hooks: {
            init: (u) => {
                over = u.root.querySelector('.u-over') as HTMLDivElement;

                over.addEventListener('mousedown', onMouseDown);
                over.addEventListener('mouseup', onMouseUp);
                over.addEventListener('mouseenter', onMouseEnter);
                over.addEventListener('mouseleave', onMouseLeave);
            },
            setData: (u) => {
                if (!u.data.every(Array.isArray)) {
                    throw new Error('Tooltip plugin applied to unconvient datalines: expected number[][]');
                }
            },
            setSize: () => {
                const bbox = over.getBoundingClientRect();

                bLeft = bbox.left;
                bTop = bbox.top;

                bound = opts.boundClassName
                    ? document.querySelector(opts.boundClassName) || document.body
                    : document.body;
            },
            // eslint-disable-next-line complexity
            setCursor: (u) => {
                const {
                    left,
                    top,
                    idx,
                } = u.cursor as {left: number; top: number; idx: number};

                if ((left < 0 || top < 0) && !state.pinned) {
                    hide();
                }

                const {data} = u;

                if (
                    data === null ||
                    idx === null ||
                    idx === undefined ||
                    top === undefined ||
                    !yagr.isChartInViewPort()
                ) {
                    return;
                }

                const x = data[0][idx];
                const rows: TooltipRows = [];
                const cursorValue = Number(u.posToVal(top, 'y').toFixed(2));
                const availableLines = u.series.filter((s) => s.showInTooltip !== false).length - 1;

                let sum = 0;
                let i = 1;

                const ys = [];
                const rowYs = [];

                while (i < u.series.length) {
                    const serie = u.series[i];

                    if (!serie.show) {
                        i += 1;
                        continue;
                    }

                    const value = findValue(yagr.config.cursor, u.data[i], serie, idx);

                    if (opts.total) {
                        sum += (value || 0);
                    }

                    const yValue = data[i][idx];
                    ys.push(yValue);

                    i += 1;

                    if ((value === null && opts.hideNoData) || serie.showInTooltip === false) {
                        continue;
                    }

                    const displayValue = serie.formatter
                        ? serie.formatter(value, serie)
                        : opts.value(value, serie.precision);

                    const rowData: TooltipRow = {
                        name: serie.name,
                        originalValue: value,
                        value: displayValue,
                        y: yValue,
                        color: serie.color,
                    };

                    if (serie.normalizedData) {
                        rowData.normalized = serie.normalizedData[idx];
                    }

                    rows.push(rowData);
                    rowYs.push(yValue);
                }

                if (rows.length === 0) {
                    onMouseLeave();
                    return;
                } else {
                    onMouseEnter();
                }

                if (opts.highlightLines) {
                    let activeIndex: number | null = i - 1;
                    if (opts.tracking === TrackingOptions.Area) {
                        activeIndex = findInRange(rowYs, cursorValue, false);
                    } else
                    if (opts.tracking === TrackingOptions.Sticky) {
                        activeIndex = findSticky(rowYs, cursorValue);
                    }

                    if (activeIndex !== null) {
                        rows[activeIndex].active = true;
                    }
                }

                if (opts.sort) {
                    rows.sort(opts.sort);
                }

                const bbox = over.getBoundingClientRect();

                bLeft = bbox.left;
                bTop = bbox.top;

                const anchor = {
                    left: left + bLeft,
                    top: bTop + top - ANCHOR_Y_OFFSET,
                };

                if (document.body.clientWidth - anchor.left < tOverlay.clientWidth - ANCHOR_Y_OFFSET) {
                    anchor.left -= ANCHOR_Y_OFFSET;
                } else {
                    anchor.left += ANCHOR_Y_OFFSET;
                }

                state.renderTooltipCloses = () => {
                    tOverlay.innerHTML = opts.render(rows, {
                        options: opts,
                        lines: availableLines,
                        x: x as number,
                        pinned: state.pinned,
                        sum: opts.total ? opts.value(sum) : undefined,
                    });

                    placement(tOverlay, anchor, 'right', 'start', {
                        bound,
                    });

                    if (opts.onRendered) {
                        opts.onRendered(tOverlay);
                    }
                };

                if (state.pinned) {
                    return;
                }

                state.renderTooltipCloses();
            },
            destroy: () => {
                /** Free overlay listeners */
                over.removeEventListener('mousedown', onMouseDown);
                over.removeEventListener('mouseup', onMouseUp);
                over.removeEventListener('mouseenter', onMouseEnter);
                over.removeEventListener('mouseleave', onMouseLeave);

                /** Removing tooltip on destroy */
                tOverlay.remove();
            },
        },
    };

    return plugin;
}

export default YagrTooltipPlugin;
