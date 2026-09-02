import type {Band, Series} from 'uplot';

import type {Scale} from '../types';
import {DEFAULT_Y_SCALE} from '../defaults';

/**
 * Builds non-overlapping fills for stacked lines. uPlot series are stored in
 * reverse config order, so every next visible series is the lower edge of the
 * previous one in the same stack.
 */
export function getStackedLineBands(
    series: Series[],
    scales: Record<string, Scale>,
    configuredBands: Band[] = [],
): Band[] {
    const bands = [...configuredBands];
    const configuredEdges = new Set(configuredBands.map(({series: [from]}) => from));
    const stacks = new Map<string, number[]>();

    series.forEach((serie, seriesIdx) => {
        if (
            seriesIdx === 0 ||
            serie.type !== 'line' ||
            serie.show === false ||
            serie.showInGraph === false
        ) {
            return;
        }

        const scale = serie.scale || DEFAULT_Y_SCALE;
        if (!scales[scale]?.stacking) {
            return;
        }

        const key = `${scale}:${serie.stackGroup || 0}`;
        const stack = stacks.get(key) || [];
        stack.push(seriesIdx);
        stacks.set(key, stack);
    });

    stacks.forEach((stack) => {
        for (let idx = 0; idx < stack.length - 1; idx++) {
            const upperSeriesIdx = stack[idx];
            const upperSeries = series[upperSeriesIdx];

            if (upperSeries.fill && !configuredEdges.has(upperSeriesIdx)) {
                bands.push({series: [upperSeriesIdx, stack[idx + 1]]});
            }
        }
    });

    return bands;
}
