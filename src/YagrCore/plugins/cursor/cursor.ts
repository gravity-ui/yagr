import {SnapToValue} from '../../types';
import UPlot, {Plugin, Series} from 'uplot';

import {CURSOR_STYLE, DEFAULT_X_SCALE, MARKER_DIAMETER, SERIE_COLOR} from '../../defaults';
import CP from '../../utils/colors';
import {findDataIdx, html, isNil} from '../../utils/common';
import type Yagr from '../..';

/**
 * Options for cursor plugin.
 */
export interface CursorOptions {
    /** Diameter of point markers */
    markersSize?: number;
    /** Snap cursor to non-null value (default: SnapToValue.Closest) */
    snapToValues?: false | SnapToValue;
    /** X crosshair options */
    x?: {
        visible?: boolean;
        style?: string; // css style
    };
    /** Y crosshair options */
    y?: {
        visible?: boolean;
        style?: string;
    };
    /** Max count of visible markers. If lines > value then markers will be hidden (default: 50) */
    maxMarkers?: number;

    /** Cursror sync key (default if true) */
    sync?: true | string;

    /** Hide cursor markers by predicate */
    hideMarkers?: (value: number | null | string, seriesIdx: number) => boolean;
}

const MAX_CURSORS = 50;

function paintCursorPoint(series: Series, pt: HTMLElement, span?: HTMLElement) {
    span ||= pt.querySelector('span') as HTMLElement;

    if (!span) {
        return;
    }

    pt.style.background = `${series.color}`;
    span.style.background = series.color || SERIE_COLOR;
    const colorRgba = CP.parseRgba(series.color) || [256, 256, 256, 0];
    pt.style.boxShadow = `0px 0px 0px 1px rgba(${colorRgba[0]}, ${colorRgba[1]}, ${colorRgba[2]}, 0.5)`;
}

/*
 * Draws HTML points for cursor to transform
 */
export function cursorPoint(u: UPlot, seriesIndex: number) {
    const serie = u.series[seriesIndex];
    const span = html('span');
    const pt = html(
        'div',
        {
            class: 'yagr-point',
            'data-idx': String(seriesIndex),
        },
        serie.empty ? undefined : span,
    );

    // @TODO possibly not to render at all. Requires PR into uPlot
    if (serie.empty) {
        pt.style.display = 'none';
        return pt;
    }

    paintCursorPoint(serie, pt, span);

    return pt;
}

function getPointsByIdx(over: HTMLDivElement, idx?: number) {
    return idx === undefined
        ? (Array.from(over.querySelectorAll('.yagr-point')) as HTMLDivElement[])
        : [over.querySelector(`.yagr-point[data-idx="${idx}"]`) as HTMLDivElement];
}

/*
 * Cursor plugin responsible for drawing cursor points and crosshairs,
 * and for syncing cursors.
 */
export default function CursorPlugin(
    yagr: Yagr,
    opts: CursorOptions,
): {
    pin: (v: boolean) => void;
    focus: (i: number | null, f: boolean) => void;
    uplot: Plugin;
    updatePoints: () => void;
    showPoints: (idx?: number) => void;
    hidePoints: (idx?: number) => void;
} {
    const config = yagr.config;
    const processing = config.processing || {};
    const pInterpolation = Boolean(processing.interpolation);
    const iValue = processing.interpolation?.value;

    const snapToNulls = opts.snapToValues === false ? false : opts.snapToValues || 'closest';
    const snapToInterpolated = pInterpolation ? processing.interpolation?.snapToValues ?? 'closest' : false;

    let mem: Record<string, HTMLElement> = {};

    /*
     * This function finds non null value index and returns
     * it's value for drawIdx hook for cursor
     */
    const snapOnValues = (self: UPlot, seriesIdx: number, hoveredIdx: number) => {
        const series = self.series[seriesIdx];

        if (series.scale === DEFAULT_X_SCALE) {
            return hoveredIdx;
        }

        const seriesData = series.$c || self.data[seriesIdx];
        const value = seriesData[hoveredIdx];

        if (pInterpolation && value === iValue) {
            return findDataIdx(seriesData, series, hoveredIdx, snapToInterpolated, iValue);
        } else if (value === null) {
            return findDataIdx(seriesData, series, hoveredIdx, snapToNulls, null);
        }

        return hoveredIdx;
    };

    return {
        showPoints: (idx?: number) => {
            const over = yagr.uplot.over;

            if (!over) {
                return;
            }

            const points = getPointsByIdx(over, idx);
            points.forEach((pt) => {
                pt.style.visibility = 'visible';
            });
        },
        hidePoints: (idx?: number) => {
            const over = yagr.uplot.over;

            if (!over) {
                return;
            }

            const points = getPointsByIdx(over, idx);
            points.forEach((pt) => {
                pt.style.visibility = 'hidden';
            });
        },
        pin: (pinState: boolean) => {
            const over = yagr.root.querySelector('.u-over');

            if (!over) {
                return;
            }

            if (pinState) {
                const pointsHolder = document.createElement('div');
                pointsHolder.classList.add('yagr-points-holder');
                over.querySelectorAll('.yagr-point').forEach((elem) => {
                    const newElem = elem.cloneNode(true) as HTMLElement;
                    pointsHolder.appendChild(newElem);
                    const idx = newElem.dataset['idx'];
                    if (idx) {
                        mem[idx] = newElem;
                    }
                });
                over.appendChild(pointsHolder);
            } else {
                mem = {};
                over.querySelector('.yagr-points-holder')?.remove();
            }
        },
        updatePoints: () => {
            (yagr.root.querySelectorAll('.yagr-point') as NodeListOf<HTMLElement>).forEach((pt) => {
                const idx = Number(pt.dataset['idx']);
                if (isNaN(idx)) {
                    return;
                }

                const series = yagr.uplot.series[idx];

                paintCursorPoint(series, pt);
            });
        },
        focus: (serieIdx: number | null, focus: boolean) => {
            Object.entries(mem).forEach(([idx, item]) => {
                if (serieIdx === null) {
                    item.style.display = focus ? 'block' : 'none';
                    return;
                }

                item.style.display = idx === String(serieIdx) && focus ? 'block' : 'none';
            });
        },
        uplot: {
            opts: (_, uplotOptions) => {
                uplotOptions.cursor = uplotOptions.cursor || {};

                const emptyLines = uplotOptions.series.filter((s) => s.empty).length;
                const totalLines = uplotOptions.series.length - 1;
                const maxCursors = opts?.maxMarkers ?? MAX_CURSORS;

                uplotOptions.cursor.points = {
                    show: totalLines - emptyLines <= maxCursors ? cursorPoint : false,
                    size: (u: uPlot, seriesIdx: number) => {
                        const serie = u.series[seriesIdx];
                        return (
                            (serie.cursorOptions ? serie.cursorOptions.markersSize : opts?.markersSize) ||
                            MARKER_DIAMETER
                        );
                    },
                };

                uplotOptions.cursor.dataIdx = snapOnValues;
            },
            hooks: {
                ...(opts.hideMarkers && {
                    setCursor: (u: uPlot) => {
                        const idx = u.cursor.idx;

                        if (isNil(idx)) {
                            return;
                        }

                        for (let i = 1; i < u.series.length; i++) {
                            const seriesValue = u.series[i].$c[idx];

                            if (opts.hideMarkers!(seriesValue, i)) {
                                yagr.plugins.cursor?.hidePoints(i);
                            } else {
                                yagr.plugins.cursor?.showPoints(i);
                            }
                        }
                    },
                }),
                init: (u) => {
                    const cX: HTMLElement | null = u.root.querySelector('.u-cursor-x');
                    if (cX) {
                        if (opts.x && opts.x.visible === false) {
                            cX.style.display = 'none';
                        }
                        cX.style.borderRight = (opts.x && opts.x.style) || CURSOR_STYLE;
                    }

                    const cY: HTMLElement | null = u.root.querySelector('.u-cursor-y');
                    if (cY) {
                        if (opts.y && opts.y.visible !== false) {
                            cY.style.borderBottom = opts.y.style || CURSOR_STYLE;
                        } else {
                            cY.style.display = 'none';
                        }
                    }
                },
            },
        },
    };
}
