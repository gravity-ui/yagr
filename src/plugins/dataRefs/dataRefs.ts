import {DataSeriesExtended, YagrPlugin} from '../../types';
import uPlot, {Series} from 'uplot';
import {DEFAULT_X_SCALE} from '../../YagrCore/defaults';
import type Yagr from '../../YagrCore/index';

export type DataRefs = {
    min: number | null;
    max: number | null;
    sum: number | null;
    avg: number | null;
    count: number;
    integral: number | null;
    last: number | null;
};
export type DataRefsPerScale = Record<string, DataRefs>;
export type DataRefsPerSeries = Record<
    string,
    {
        series: Record<string, DataRefs>;
        total: DataRefs;
    }
>;

export type DataRefsPluginOptions = {
    /** Should calc ref points on ready event (true by default) */
    calcOnReady?: boolean;
};

export function integrate(timestamps: number[], values: DataSeriesExtended) {
    if (timestamps.length < 2) {
        return 0;
    }
    let t0 = timestamps[0];
    let x0 = Number(values[0]);
    let t1: number;
    let x1: number;
    let integral = 0;
    for (let i = 1; i < timestamps.length; i++) {
        x1 = Number(values[i]);
        t1 = timestamps[i];

        // we skip over all non-numeric values in a serie
        // so that all holes and single points (surrounded by
        // empty void) do not add anything to the integral
        if (!Number.isNaN(x1) && !Number.isNaN(x0)) {
            const dt = t1 - t0;
            const dx = x1 - x0;
            const area = ((x0 + dx / 2) * dt) / 1000; // convert milliseconds to seconds
            integral += area;
        }

        t0 = t1;
        x0 = x1;
    }

    return integral;
}

function getLast(values: DataSeriesExtended): number | null {
    for (let i = values.length - 1; i >= 0; i--) {
        const val = values[i];
        if (val !== null && typeof val === 'number') {
            return val;
        }
    }
    return null;
}

const safeMin = (...values: (number | null)[]) => {
    if (values.length === 0) {
        return null;
    }
    let min = null;
    for (const val of values) {
        if (val === null || Number.isNaN(val)) {
            continue;
        }
        if (min === null || val < min) {
            min = val;
        }
    }
    return min;
};

const safeMax = (...values: (number | null)[]) => {
    if (values.length === 0) {
        return null;
    }

    let max = null;
    for (const val of values) {
        if (val === null || Number.isNaN(val)) {
            continue;
        }
        if (max === null || val > max) {
            max = val;
        }
    }
    return max;
};

const safeSum = (...values: (number | null)[]) => {
    if (values.length === 0) {
        return null;
    }

    return values.reduce((acc, v) => {
        if (v === null) {
            return acc;
        }

        if (acc === null) {
            acc = v;
        } else {
            acc += v;
        }

        return acc;
    });
};

const DataRef = (opst: DataRefsPluginOptions) => {
    const plugin: YagrPlugin<{
        getRefs: (from?: number, to?: number) => DataRefsPerScale | DataRefsPerSeries;
        calcRefs: (from: number, to: number, id: string) => DataRefs;
    }> = (_: Yagr) => {
        const refs: DataRefsPerScale = {};

        const pluginMethods = {
            getRefs: (fromIdx?: number, toIdx?: number) => {
                if (fromIdx === undefined && toIdx === undefined) {
                    return refs;
                }

                if (fromIdx === undefined) {
                    fromIdx = 0;
                }

                if (toIdx === undefined) {
                    toIdx = _.uplot.data[0].length - 1;
                }

                const result: DataRefsPerSeries = {};

                _.uplot.series.forEach(({scale, id}) => {
                    if (scale === DEFAULT_X_SCALE || !scale) {
                        return;
                    }
                    result[scale] = result[scale] || {};
                    result[scale].series = result[scale].series || {};
                    result[scale].series[id] = pluginMethods.calcRefs(fromIdx as number, toIdx as number, id);
                });

                Object.keys(result).forEach((scale) => {
                    const total: DataRefs = {
                        min: safeMin(...Object.values(result[scale].series).map(({min}) => min)),
                        max: safeMax(...Object.values(result[scale].series).map(({max}) => max)),
                        sum: safeSum(...Object.values(result[scale].series).map(({sum}) => sum)),
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
            calcRefs: (fromIdx: number, toIdx: number, seriesId: string) => {
                const seriesIdx = _.state.y2uIdx[seriesId];
                const timestamps = _.uplot.data[0].slice(fromIdx, toIdx + 1) as number[];
                const values = _.uplot.series[seriesIdx].$c.slice(fromIdx, toIdx + 1) as (number | null)[];
                const integral = integrate(timestamps, values);
                const sum = safeSum(...values);
                const min = safeMin(...values);
                const max = safeMax(...values);
                const count = values.filter((v) => v !== null).length;
                const avg = sum === null ? null : sum / count;
                const last = getLast(values);

                return {min, max, sum, avg, count, integral, last};
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
                                      refs[key] = {
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

                                      refs[scale].min = safeMin(...numericValues, refs[scale].min);
                                      refs[scale].max = safeMax(...numericValues, refs[scale].max);
                                      const sum = refs[scale].sum;
                                      const rowSum = safeSum(...numericValues);
                                      refs[scale].sum =
                                          sum === null
                                              ? safeSum(...numericValues)
                                              : rowSum === null
                                              ? sum
                                              : sum + rowSum;
                                      refs[scale].count += count;
                                      const integral = refs[scale].integral;
                                      const rowIntegral = integrate(u.data[0] as number[], $c as DataSeriesExtended);
                                      refs[scale].integral = integral === null ? rowIntegral : integral + rowIntegral;
                                  });

                                  Object.keys(refs).forEach((key) => {
                                      const sum = refs[key].sum;
                                      refs[key].avg = sum === null ? null : sum / refs[key].count;
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
    Object.assign(window, {YagrDataRefs: DataRef});
}
