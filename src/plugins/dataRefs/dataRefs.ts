import {DataSeriesExtended, YagrPlugin} from '../../types';
import uPlot, {Series} from 'uplot';
import {DEFAULT_X_SCALE} from '../../YagrCore/defaults';
import type Yagr from '../../YagrCore/index';

export type DataRefs = {
    min: number;
    max: number;
    sum: number;
    avg: number;
    count: number;
    integral: number;
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
                        min: Object.values(result[scale].series).reduce((acc, {min}) => Math.min(acc, min), Infinity),
                        max: Object.values(result[scale].series).reduce((acc, {max}) => Math.max(acc, max), -Infinity),
                        sum: Object.values(result[scale].series).reduce((acc, {sum}) => acc + sum, 0),
                        avg: 0,
                        count: Object.values(result[scale].series).reduce((acc, {count}) => acc + count, 0),
                        integral: Object.values(result[scale].series).reduce((acc, {integral}) => acc + integral, 0),
                        last: 0,
                    };

                    total.avg = total.sum / total.count;
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
                const sum = values.reduce((acc, v) => (acc === null ? 0 : acc + (v || 0)), 0) || 0;
                const min = Math.min(...(values.filter((v) => v !== null) as number[]));
                const max = Math.max(...(values.filter((v) => v !== null) as number[]));
                const count = values.filter((v) => v !== null).length;
                const avg = sum / count;
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
                                          min: Infinity,
                                          max: -Infinity,
                                          sum: 0,
                                          avg: 0,
                                          integral: 0,
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

                                      refs[scale].min = Math.min(...numericValues, refs[scale].min);
                                      refs[scale].max = Math.max(...numericValues, refs[scale].max);
                                      refs[scale].sum += numericValues.reduce((acc, v) => acc + v, 0);
                                      refs[scale].count += count;
                                      refs[scale].integral += integrate(
                                          u.data[0] as number[],
                                          $c as DataSeriesExtended,
                                      );
                                  });

                                  Object.keys(refs).forEach((key) => {
                                      refs[key].avg = refs[key].sum / refs[key].count;
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
