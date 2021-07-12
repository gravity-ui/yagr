/* eslint-disable complexity, no-nested-ternary */

import {Plugin, Series} from 'uplot';

import {CursorOptions} from '../cursor/cursor';
import placement from './placement';

import Yagr from '../../index';
import {DataSeries, ProcessingInterpolation} from '../../types';

import {TOOLTIP_Y_OFFSET, TOOLTIP_X_OFFSET, TOOLTIP_DEFAULT_MAX_LINES, DEFAULT_Y_SCALE} from '../../defaults';

import {findInRange, findDataIdx, findSticky} from '../../utils/common';
import {TooltipOptions, TooltipRenderOptions, TooltipRow, TrackingOptions, ValueFormatter} from './types';

export interface TooltipState {
    /** Is tooltip pinned */
    pinned: boolean;
    /** X-Coord of click to track selections and differ them from single click */
    clickStartedX: null | number;
    /** Is tooltip visible */
    visible: boolean;
    /** Is tooltip mounted */
    mounted: boolean;
}

export type TooltipAction = 'init' | 'mount' | 'render' | 'show' | 'hide' | 'pin' | 'unpin' | 'destroy';

function renderItems(rows: TooltipRow[]) {
    return rows
        .map(({value, name, color, active, transformed, seriesIdx}) => {
            const val = `${value}${typeof transformed === 'number' ? ' ' + transformed.toFixed(2) : ''}`;
            return `
<div class="yagr-tooltip__item ${active ? '_active' : ''}" data-series="${seriesIdx}">
    <span class="yagr-tooltip__mark" style="background-color: ${color}"></span>${name} : ${val}
</div>`;
        })
        .join('');
}

function renderTooltip(data: TooltipRenderOptions) {
    const [allTitle, sectionTitle] = data.options.title
        ? typeof data.options.title === 'string'
            ? [data.options.title, false]
            : ['', true]
        : ['', false];

    const sections = data.scales.map((x) => {
        const sectionTitleBody = getOptionValue(data.options.title, x.scale);
        const scaleBody =
            data.scales.length > 1
                ? data.options.scales
                    ? `${getOptionValue(data.options.scales, x.scale) || ''}`
                    : `${data.yagr.i18n('scale')}: ${x.scale}`
                : '';
        return `
<div class="__section">
    ${sectionTitle && sectionTitleBody ? `<div class="_section_title">${sectionTitleBody}</div>` : ''}
    ${scaleBody ? `<div class="__section_scale">${scaleBody}</div>` : ''}
    <div class="__section_body">${renderItems(x.rows)}</div>
    ${
        x.sum
            ? `
        <div class="__section_sum">
            ${data.yagr.i18n('sum')}: ${x.sum}
        </div>
    `
            : ''
    }
</div>`;
    });

    return `${allTitle ? `<div class="__title">${allTitle}</div>` : ''}${sections.join('')}`;
}

function getOptionValue<T>(option: T | {[key in string]: T}, scale: string): T {
    return (typeof option === 'object' ? (option as {[key in string]: T})[scale] : option) as T;
}

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
        const snapTo = interpolation.snapToValues || 'closest';
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

/*
 * Tooltip plugin constructor.
 * Every charts has it's own tooltip plugin instance
 */
function YagrTooltipPlugin(yagr: Yagr, options: Partial<TooltipOptions> = {}): Plugin {
    const pSettings = yagr.config.processing || {};

    /* Tooltip renderer, allows to deffer rendering to avoid jerky renderings when tooltip pinned */
    let renderTooltipCloses = () => {};

    const defaultTooltipValueFormatter = (n: string | number | null, precision?: number) => {
        if (n === null) {
            return '-';
        }

        if (typeof n === 'string') {
            if (pSettings.nullValues && pSettings.nullValues.hasOwnProperty(n)) {
                return pSettings.nullValues[n] as string;
            }

            return '-';
        }

        return n.toFixed(
            // eslint-disable-next-line no-nested-ternary
            typeof precision === 'number' ? precision : typeof options.precision === 'number' ? options.precision : 2,
        );
    };

    const opts: TooltipOptions = Object.assign<{}, TooltipOptions, Partial<TooltipOptions>>(
        {},
        {
            tracking: yagr.config.chart.type === 'area' ? 'area' : 'sticky',
            maxLines: TOOLTIP_DEFAULT_MAX_LINES,
            highlight: true,
            sum: true,
            render: renderTooltip,
            pinable: true,
            value: defaultTooltipValueFormatter,
            sort: undefined,
            showIndicies: false,
            hideNoData: false,
            className: 'yagr-tooltip_default',
            xOffset: TOOLTIP_X_OFFSET,
            yOffset: TOOLTIP_Y_OFFSET,
        },
        options,
    );

    let over: HTMLDivElement;
    let bLeft: number;
    let bTop: number;
    let bound: HTMLElement;

    const tOverlay = document.createElement('div');

    tOverlay.id = `${yagr.id}.tooltip`;
    tOverlay.className = `yagr-tooltip ${opts.className || ''}`;
    tOverlay.style.display = 'none';

    const state: TooltipState = {
        mounted: true,
        pinned: false,
        visible: false,
        clickStartedX: null,
    };

    const emit = (action: TooltipAction) => {
        if (opts.onStateChange) {
            opts.onStateChange(tOverlay, {
                state,
                actions: {
                    pin,
                    show,
                    hide,
                },
                action,
                yagr,
            });
        }
    };

    emit('init');
    document.body.appendChild(tOverlay);
    state.mounted = true;
    emit('mount');

    function show() {
        const shouldEmit = !state.visible;
        state.visible = true;
        tOverlay.style.display = 'block';
        shouldEmit && emit('show');
    }

    function hide() {
        const shouldEmit = state.visible;
        state.visible = false;
        tOverlay.style.display = 'none';
        emit('hide');
        shouldEmit && emit('show');
    }

    const checkFocus = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        let serieIdx: string | undefined;

        if (target && tOverlay.contains(target) && target.classList.contains('yagr-tooltip__item')) {
            serieIdx = target.dataset['series'];
        }

        const serie = serieIdx ? yagr.uplot.series[Number(serieIdx)] : null;

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
                pin(false);
                hide();
            }
        }
    };

    function pin(pinState: boolean) {
        const list = tOverlay.querySelector('._tooltip-list') as HTMLElement;
        state.pinned = pinState;

        if (pinState) {
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

            if (opts.render === renderTooltip) {
                document.addEventListener('mousemove', checkFocus);
                document.addEventListener('mousedown', detectClickOutside);
            }
        } else {
            over.querySelector('.yagr-points-holder')?.remove();
            tOverlay.classList.remove('yagr-tooltip_pinned');

            if (opts.render === renderTooltip) {
                document.removeEventListener('mousemove', checkFocus);
                document.removeEventListener('mousedown', detectClickOutside);
            }
        }

        emit(pinState ? 'pin' : 'unpin');
    }

    const onMouseUp = (event: MouseEvent) => {
        if (opts.pinable && state.clickStartedX && state.clickStartedX === event.clientX) {
            pin(!state.pinned);
            show();
            renderTooltipCloses();
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

    const interpolation = pSettings.interpolation;
    const stripValue = interpolation ? interpolation.value : undefined;

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

            setCursor: (u) => {
                const {left, top, idx} = u.cursor as {left: number; top: number; idx: number};

                if ((left < 0 || top < 0) && !state.pinned) {
                    hide();
                }

                const {data} = u;

                if (data === null || idx === null || idx === undefined || top === undefined) {
                    return;
                }

                const x = data[0][idx];

                const sum: Record<string, number> = {};
                const sections: Record<
                    string,
                    {
                        active: number;
                        rows: TooltipRow[];
                        realYs: (number | null)[];
                    }
                > = {};

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

                const visibleEntries = Object.entries(rowsBySections);

                visibleEntries.forEach(([scale, serieIndicies]) => {
                    sections[scale] = sections[scale] || [];
                    const section = sections[scale];
                    const cursorValue = Number(u.posToVal(top, scale).toFixed(2));

                    const valueRender = getOptionValue<ValueFormatter>(opts.value, scale);

                    for (const seriesIdx of serieIndicies) {
                        const seriesData = u.data[seriesIdx] as DataSeries;
                        const serie = u.series[seriesIdx];

                        let value = findValue(yagr.config.cursor, seriesData, serie, idx, interpolation);
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
                        const yValue = serie.$c && serie.$c[idx] === stripValue ? value : realY;

                        if ((value === null && opts.hideNoData) || serie.showInTooltip === false) {
                            continue;
                        }

                        const displayValue = serie.formatter
                            ? serie.formatter(dValue, serie)
                            : valueRender(dValue, serie.precision);

                        const rowData: TooltipRow = {
                            name: serie.name,
                            originalValue: value,
                            value: displayValue,
                            y: yValue,
                            color: serie.color,
                            seriesIdx,
                        };

                        if (serie.normalizedData) {
                            rowData.transformed = serie.normalizedData[idx];
                        }

                        if (serie._transformed) {
                            rowData.transformed = seriesData[idx];
                        }

                        section.rows = section.rows || [];
                        section.rows.push(rowData);
                        section.realYs = section.realYs || [];
                        section.realYs.push(realY);
                    }

                    if (getOptionValue(opts.highlight, scale)) {
                        const tracking = getOptionValue<TrackingOptions>(opts.tracking, scale);
                        let activeIndex: number | null = 0;
                        if (tracking === 'area') {
                            activeIndex = findInRange(section.realYs, cursorValue, opts.stickToRanges);
                        } else if (tracking === 'sticky') {
                            activeIndex = findSticky(section.realYs, cursorValue);
                        } else if (typeof tracking === 'function') {
                            activeIndex = tracking(cursorValue, section.realYs);
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

                if (visibleEntries.length === 0) {
                    onMouseLeave();
                    return;
                } else {
                    onMouseEnter();
                }

                const bbox = over.getBoundingClientRect();

                bLeft = bbox.left;
                bTop = bbox.top;

                const anchor = {
                    left: left + bLeft,
                    top: bTop + top - (opts.yOffset || 0),
                };

                renderTooltipCloses = () => {
                    tOverlay.innerHTML = opts.render({
                        scales: Object.entries(sections).map(([scale, sec]) => {
                            return {
                                scale,
                                rows: sec.rows,
                                sum: sum[scale],
                            };
                        }),
                        options: opts,
                        x,
                        pinned: state.pinned,
                        yagr,
                    });

                    placement(tOverlay, anchor, 'right', {
                        bound,
                        xOffset: opts.xOffset,
                        yOffset: opts.yOffset,
                    });

                    emit('render');
                };

                if (state.pinned) {
                    return;
                }

                renderTooltipCloses();
            },
            destroy: () => {
                /** Free overlay listeners */
                over.removeEventListener('mousedown', onMouseDown);
                over.removeEventListener('mouseup', onMouseUp);
                over.removeEventListener('mouseenter', onMouseEnter);
                over.removeEventListener('mouseleave', onMouseLeave);

                /** Removing tooltip on destroy */
                tOverlay.remove();
                state.mounted = false;
                emit('destroy');
            },
        },
    };

    return plugin;
}

export default YagrTooltipPlugin;
