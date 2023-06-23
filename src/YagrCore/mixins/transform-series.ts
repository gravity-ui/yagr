/* eslint-disable complexity */

import type {AlignedData} from 'uplot';
import type {DataSeries, MinimalValidConfig} from '../types';
import type Yagr from '..';

import {DEFAULT_Y_SCALE} from '../defaults';
import {getSumByIdx, preprocess} from '../utils/common';

export class TransformSeriesMixin<T extends MinimalValidConfig> {
    /**
     * @internal
     * @param this Yagr instance
     * @description Transforms series data according to config
     * @returns uPlot series data
     */
    protected transformSeries(this: Yagr<T>) {
        const processingStartTime = performance.now();

        const result = [];
        const config = this.config;
        const timeline = config.timeline;
        let processing = config.processing || false;

        let series: DataSeries[] = this.config.series.map(({data}) => data) as DataSeries[];

        if (processing && processing.interpolation) {
            series = preprocess(series, timeline, processing);
            processing = false;
        }

        const shouldMapNullValues = Boolean(processing && processing.nullValues);
        const nullValues = (processing && processing.nullValues) || {};

        /**
         * Stacks are represented as:
         * {
         *    [scale]: {
         *        [],  // stacking group idx 0 (default for all on scale),
         *        [],  // stacking group idx 1
         *    ]
         * }
         *
         * All stacked points are accumulating inside of series' scale group
         */
        const stacks: Record<string, number[][]> = {};

        for (let sIdx = 0; sIdx < series.length; sIdx++) {
            let dataLine: (number | null)[] = [];
            const realSerieIdx = sIdx + 1;
            const serie = series[sIdx];

            const serieConfigIndex = this.options.series.length - realSerieIdx;
            const serieOptions = this.options.series[serieConfigIndex];
            const scale = serieOptions.scale || DEFAULT_Y_SCALE;
            const scaleConfig = this.config.scales[scale] || {};
            const isStacking = scaleConfig.stacking;
            const sGroup = serieOptions.stackGroup || 0;

            let empty = true;

            if (isStacking && !stacks[scale]) {
                this.options.focus = this.options.focus || {alpha: 1.1};
                this.options.focus.alpha = 1.1;
                stacks[scale] = [];
            }

            if (isStacking && !stacks[scale][sGroup]) {
                stacks[scale][sGroup] = new Array(timeline.length).fill(0);
            }

            serieOptions.count = 0;

            for (let idx = 0; idx < serie.length; idx++) {
                let value = serie[idx];

                if (shouldMapNullValues && nullValues[String(value)]) {
                    value = null;
                }

                if (serieOptions.transform) {
                    serieOptions._transformed = true;
                    value = serieOptions.transform(value, series, idx);
                }

                if (scaleConfig.transform) {
                    serieOptions._transformed = true;
                    value = scaleConfig.transform(value, series, idx);
                }

                if (value === null) {
                    if (serieOptions.type === 'line' || serieOptions.type === 'dots') {
                        dataLine.push(null);
                        continue;
                    } else {
                        value = 0;
                    }
                }

                empty = false;

                if (scaleConfig.normalize) {
                    const sum = getSumByIdx(series, this.options.series, idx, scale);
                    value = sum && (value / sum) * (scaleConfig.normalizeBase || 100);

                    serieOptions.normalizedData = serieOptions.normalizedData || [];
                    serieOptions.normalizedData[idx] = value;
                }

                if (scaleConfig.stacking) {
                    if (serieOptions.show === false) {
                        value = 0;
                    }

                    value = stacks[scale][sGroup][idx] += value;
                }

                if (scaleConfig.type === 'logarithmic' && value === 0) {
                    value = 1;
                }

                serieOptions.sum = (serieOptions.sum || 0) + (value || 0);

                serieOptions.count += 1;
                dataLine.push(value);
            }

            serieOptions.avg = (serieOptions.sum || 0) / serieOptions.count;

            serieOptions.empty = empty;

            if (serieOptions.postProcess) {
                dataLine = serieOptions.postProcess(dataLine, sIdx, this);
            }
            result.unshift(dataLine);
        }

        result.unshift(this.config.timeline);

        this.series = result as AlignedData;

        this.execHooks(config.hooks.processed, {
            chart: this,
            meta: {
                processTime: performance.now() - processingStartTime,
            },
        });

        return this.series;
    }
}
