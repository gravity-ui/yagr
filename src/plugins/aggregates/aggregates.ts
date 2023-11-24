import {DataSeriesExtended, YagrPlugin} from '../../types';
import uPlot, {Series} from 'uplot';
import {DEFAULT_X_SCALE} from '../../YagrCore/defaults';
import type Yagr from '../../YagrCore/index';
import {countNumbers, getLast, integrate, safeMax, safeMin, safeSum} from './utils';

export type Aggregates = {
    min: number | null;
    max: number | null;
    sum: number | null;
    avg: number | null;
    count: number;
    integral: number | null;
    last: number | null;
};
export type AggregatesPerScale = Record<string, Aggregates>;
export type AggregatesPerSeries = Record<
    string,
    {
        series: Record<string, Aggregates>;
        total: Aggregates;
    }
>;

export type AggregatesPluginOptions = {
    /** Should calc aggregates on ready event (true by default) */
    calcOnReady?: boolean;
};

const DataRef = (opst: AggregatesPluginOptions) => {
    const plugin: YagrPlugin<{
        get: (from?: number, to?: number) => AggregatesPerScale | AggregatesPerSeries;
        calc: (from: number, to: number, id: string) => Aggregates;
    }> = (yagr: Yagr) => {
        const aggrs: AggregatesPerScale = {};

        const pluginMethods = {
            get: (fromIdx?: number, toIdx?: number) => {
                if (fromIdx === undefined && toIdx === undefined) {
                    return aggrs;
                }

                if (fromIdx === undefined) {
                    fromIdx = 0;
                }

                if (toIdx === undefined) {
                    toIdx = yagr.uplot.data[0].length - 1;
                }

                const result: AggregatesPerSeries = {};

                yagr.uplot.series.forEach(({scale, id}) => {
                    if (scale === DEFAULT_X_SCALE || !scale) {
                        return;
                    }
                    result[scale] = result[scale] || {};
                    result[scale].series = result[scale].series || {};
                    result[scale].series[id] = pluginMethods.calc(fromIdx as number, toIdx as number, id);
                });

                Object.keys(result).forEach((scale) => {
                    const total: Aggregates = {
                        min: safeMin(Object.values(result[scale].series).map(({min}) => min)),
                        max: safeMax(Object.values(result[scale].series).map(({max}) => max)),
                        sum: safeSum(Object.values(result[scale].series).map(({sum}) => sum)),
                        avg: 0,
                        count: Object.values(result[scale].series).reduce((acc, {count}) => acc + count, 0),
                        integral: Object.values(result[scale].series).reduce(
                            (acc, {integral}) => acc + (integral ?? 0),
                            0,
                        ),
                        last: 0,
                    };

                    total.avg = total.sum === null ? null : total.sum / total.count;
                    total.last = null;

                    result[scale].total = total;
                });

                return result;
            },
            calc: (fromIdx: number, toIdx: number, seriesId: string) => {
                const seriesIdx = yagr.state.y2uIdx[seriesId];
                const timestamps = yagr.uplot.data[0].slice(fromIdx, toIdx + 1) as number[];
                const values = yagr.uplot.series[seriesIdx].$c;
                const integral = integrate(timestamps, values, yagr.config.chart?.timeMultiplier);
                const sum = safeSum(values, fromIdx, toIdx);
                const min = safeMin(values, fromIdx, toIdx);
                const max = safeMax(values, fromIdx, toIdx);
                const cnt = countNumbers(values, fromIdx, toIdx);
                const avg = sum === null ? null : sum / cnt;
                const last = getLast(values, fromIdx, toIdx);

                return {min, max, sum, avg, count: cnt, integral, last};
            },

            uplot: {
                hooks:
                    opst.calcOnReady === false
                        ? {}
                        : {
                              ready: (u: uPlot) => {
                                  Object.keys(u.scales).forEach((key) => {
                                      if (key === DEFAULT_X_SCALE) {
                                          return;
                                      }
                                      aggrs[key] = {
                                          min: null,
                                          max: null,
                                          sum: null,
                                          avg: null,
                                          integral: null,
                                          count: 0,
                                          last: null,
                                      };
                                  });

                                  (u.series as Required<Series>[]).forEach(({scale, $c, count}) => {
                                      if (scale === DEFAULT_X_SCALE) {
                                          return;
                                      }
                                      const numericValues = $c.filter(
                                          (v) => typeof v === 'number' && v !== null,
                                      ) as number[];

                                      aggrs[scale].min = safeMin([...numericValues, aggrs[scale].min]);
                                      aggrs[scale].max = safeMax([...numericValues, aggrs[scale].max]);
                                      const sum = aggrs[scale].sum;
                                      const rowSum = safeSum(numericValues);
                                      aggrs[scale].sum =
                                          sum === null ? safeSum(numericValues) : rowSum === null ? sum : sum + rowSum;
                                      aggrs[scale].count += count;
                                      const integral = aggrs[scale].integral;
                                      const rowIntegral = integrate(
                                          u.data[0] as number[],
                                          $c as DataSeriesExtended,
                                          yagr.config.chart?.timeMultiplier,
                                      );
                                      aggrs[scale].integral = integral === null ? rowIntegral : integral + rowIntegral;
                                  });

                                  Object.keys(aggrs).forEach((key) => {
                                      const sum = aggrs[key].sum;
                                      aggrs[key].avg = sum === null ? null : sum / aggrs[key].count;
                                  });
                              },
                          },
            },
        };

        return pluginMethods;
    };
    return plugin;
};

export default DataRef;

if (typeof window !== 'undefined') {
    Object.assign(window, {YagrAggregates: DataRef});
}
