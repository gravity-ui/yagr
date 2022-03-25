import {SnapToValue} from '../../types';
import UPlot, {Plugin} from 'uplot';

import {CURSOR_STYLE, DEFAULT_X_SCALE, MARKER_DIAMETER, SERIE_COLOR} from '../../defaults';
import CP from '../../utils/colors';
import {findDataIdx} from '../../utils/common';
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
}

const MAX_CURSORS = 50;

/*
 *
 */
export default function CursorPlugin(
    opts: CursorOptions,
    yagr: Yagr,
): {
    pin: (v: boolean) => void;
    focus: (i: number | null, f: boolean) => void;
    uplot: Plugin;
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

    /*
     * Draws HTML points for cursor to transform
     */
    function cursorPoint(u: UPlot, seriesIndex: number) {
        const serie = u.series[seriesIndex];
        const pt = document.createElement('div');

        // @TODO possibly not to render at all. Requires PR into uPlot
        if (serie.empty) {
            pt.style.display = 'none';
            return pt;
        }

        const span = document.createElement('span');
        pt.appendChild(span);
        pt.classList.add('yagr-point');
        pt.setAttribute('data-idx', String(seriesIndex));

        pt.style.background = `solid 1px ${serie.color}`;
        span.style.background = serie.color || SERIE_COLOR;
        const colorRgba = CP.parseRgba(serie.color) || [256, 256, 256, 0];
        pt.style.boxShadow = `0px 0px 0px 1px rgba(${colorRgba[0]}, ${colorRgba[1]}, ${colorRgba[2]}, 0.5)`;

        return pt;
    }

    return {
        pin: (pinState: boolean) => {
            const over = yagr.root.querySelector('.u-over') as HTMLDivElement;

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
                uplotOptions.cursor.points = {
                    show: totalLines - emptyLines <= MAX_CURSORS ? cursorPoint : false,
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
