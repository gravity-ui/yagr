/* eslint-disable complexity, @typescript-eslint/no-loop-func, no-nested-ternary */

import type uPlot from 'uplot';
import type Yagr from '../../index';

import {isNil} from '../../YagrCore/utils/common';
import {Clear, LabelsOptions} from './types';
import {drawLabelOnPoint, getId} from './utils';

type StoredPointLabel = {idx: number; label: string | null | undefined};

/**
 * Sets up hooks for labels rending on series draw, additionally sets up focus state for series
 * to show/hide labels on series focus
 */
export function seriesDrawBasedLabels(yagr: Yagr, hooks: uPlot.Hooks.Arrays, options: LabelsOptions) {
    const clears: Record<number, Clear[]> = {};
    const cursorClears: Clear[] = [];
    const focusClears: Clear[] = [];
    const labels: Record<number, {idx: number; label: string}[]> = {};

    hooks.drawClear = hooks.drawClear || [];
    hooks.draw = hooks.draw || [];
    hooks.setCursor = hooks.setCursor || [];
    hooks.setSeries = hooks.setSeries || [];

    function drawLabelsOnSeries(u: uPlot, seriesIdxs?: number[]) {
        const sIdxs = [];

        if (seriesIdxs) {
            sIdxs.push(...seriesIdxs);
        } else {
            for (let sIdx = 1; sIdx < u.series.length; sIdx++) {
                const series = u.series[sIdx];

                if (options.scales?.draw) {
                    const scaleKey = series.scale;
                    if (scaleKey && options.scales?.draw[scaleKey]) {
                        sIdxs.push(sIdx);
                    }
                }

                if (options.series?.draw) {
                    if (options.series?.draw[series.id]) {
                        sIdxs.push(sIdx);
                    }
                }
            }
        }

        for (const sIdx of sIdxs) {
            const series = u.series[sIdx] as Required<uPlot.Series>;
            if (!series.show || series._focus === false) {
                continue;
            }
            const {scale = 'y', min, max} = series;
            const tSeries = u.series[0] as Required<uPlot.Series>;
            const labelOptions = options.series?.draw?.[series.id] || options.scales?.draw?.[series.scale];

            const selfAxisFormatter = (u.axes.find((a) => a.scale === scale)?.getFormatter || getId)(max - min);
            const xAxisFormatter = (u.axes.find((a) => a.scale === 'x')?.getFormatter || getId)(
                tSeries.max - tSeries.min,
            );

            let idx = 0;
            while (idx < u.data[0].length) {
                drawLabelOnPoint(
                    yagr,
                    sIdx,
                    idx,
                    scale,
                    labelOptions,
                    xAxisFormatter,
                    selfAxisFormatter,
                    (clear, label) => {
                        clears[sIdx] = clears[sIdx] || [];
                        clears[sIdx].push(clear);
                        labels[sIdx] = labels[sIdx] || [];
                        labels[sIdx].push({idx, label});
                    },
                );
                idx++;
            }
        }
    }

    function drawLabelsOnCursor(u: uPlot, idx: number) {
        const sIdxs = [];

        for (let sIdx = 1; sIdx < u.series.length; sIdx++) {
            const series = u.series[sIdx];

            if (options.scales?.cursor) {
                const scaleKey = series.scale;
                if (scaleKey && options.scales.cursor[scaleKey]) {
                    sIdxs.push(sIdx);
                }
            }

            if (options.series?.cursor) {
                if (options.series.cursor[series.id]) {
                    sIdxs.push(sIdx);
                }
            }
        }

        for (const sIdx of sIdxs) {
            const series = u.series[sIdx] as Required<uPlot.Series>;
            if (!series.show || series._focus === false) {
                continue;
            }
            const {scale = 'y', min, max} = series;
            const tSeries = u.series[0] as Required<uPlot.Series>;
            const labelOptions = options.series?.cursor?.[series.id] || options.scales?.cursor?.[series.scale];

            const selfAxisFormatter = (u.axes.find((a) => a.scale === scale)?.getFormatter || getId)(max - min);
            const xAxisFormatter = (u.axes.find((a) => a.scale === 'x')?.getFormatter || getId)(
                tSeries.max - tSeries.min,
            );

            drawLabelOnPoint(yagr, sIdx, idx, scale, labelOptions, xAxisFormatter, selfAxisFormatter, (clear) => {
                cursorClears.push(clear);
            });
        }
    }

    if (options.series?.focus) {
        hooks.setSeries.push((u, sIdx, opts) => {
            if (sIdx === null) {
                focusClears?.forEach((fn) => fn());
                return;
            }
            const series = u.series[sIdx] as Required<uPlot.Series>;
            const labelOptions = options.series?.focus?.[series.id];

            if (!labelOptions) {
                focusClears?.forEach((fn) => fn());
                return;
            }

            if (series.show && opts.focus === true) {
                const {scale = 'y', min, max} = series;
                const tSeries = u.series[0] as Required<uPlot.Series>;

                const selfAxisFormatter = (u.axes.find((a) => a.scale === scale)?.getFormatter || getId)(max - min);
                const xAxisFormatter = (u.axes.find((a) => a.scale === 'x')?.getFormatter || getId)(
                    tSeries.max - tSeries.min,
                );

                let idx = 0;
                while (idx < u.data[0].length) {
                    drawLabelOnPoint(
                        yagr,
                        sIdx,
                        idx,
                        scale,
                        labelOptions,
                        xAxisFormatter,
                        selfAxisFormatter,
                        (clear) => {
                            focusClears.push(clear);
                        },
                    );
                    idx++;
                }
            } else {
                focusClears?.forEach((fn) => fn());
            }
        });
    }

    if (options.scales?.draw || options.series?.draw) {
        hooks.draw.push((u) => {
            drawLabelsOnSeries(u);
        });
        hooks.drawClear.push(() => {
            Object.values(clears).forEach((fns) => fns.forEach((fn) => fn()));
            Object.keys(clears).forEach((k) => delete clears[Number(k)]);
        });
    }

    if (options.scales?.cursor || options.series?.cursor) {
        hooks.setCursor.push((u) => {
            cursorClears.forEach((fn) => fn());
            const {idx} = u.cursor;
            if (!isNil(idx)) {
                drawLabelsOnCursor(u, idx);
            }
        });
    }

    return {
        getSeriesLabels: () => labels,
        getCurrentSeriesLabels: (): Record<number, StoredPointLabel | undefined> => {
            const cursor = yagr.uplot.cursor;

            if (cursor.idx === null) {
                return {};
            }

            return Object.entries(labels).reduce((acc, [sIdx, labels]) => {
                acc[Number(sIdx)] = labels.find((l) => l.idx === cursor.idx);
                return acc;
            }, {} as Record<number, StoredPointLabel | undefined>);
        },
    };
}
