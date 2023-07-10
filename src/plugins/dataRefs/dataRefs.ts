import {DataSeriesExtended, YagrPlugin} from '../../types';
import uPlot, {Series} from 'uplot';
import {DEFAULT_X_SCALE} from '../../YagrCore/defaults';
import type Yagr from '../../YagrCore/index';

export type DataRefs = {min: number; max: number; sum: number; avg: number; count: number; integral: number};
export type DataRefsPerScale = Record<string, DataRefs>;

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

const DataRef = (opst: DataRefsPluginOptions) => {
    const plugin: YagrPlugin<{
        getRefs: () => DataRefsPerScale;
        calcRefs: (from: number, to: number, id: string) => DataRefs;
    }> = (_: Yagr) => {
        const refs: DataRefsPerScale = {};

        return {
            getRefs: () => refs,
            calcRefs: (fromIdx: number, toIdx: number, seriesId: string) => {
                const seriesIdx = _.state.y2uIdx[seriesId];
                const timestamps = _.uplot.data[0].slice(fromIdx, toIdx + 1) as number[];
                const values = _.uplot.data[seriesIdx].slice(fromIdx, toIdx + 1) as (number | null)[];
                console.log('values', values);
                const integral = integrate(timestamps, values);
                const sum = values.reduce((acc, v) => (acc === null ? 0 : acc + (v || 0)), 0) || 0;
                console.log('sum', sum, values);
                const min = Math.min(...(values.filter((v) => v !== null) as number[]));
                const max = Math.max(...(values.filter((v) => v !== null) as number[]));
                const count = values.filter((v) => v !== null).length;
                const avg = sum / count;

                return {min, max, sum, avg, count, integral};
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
                                      };
                                  });

                                  (u.series as Required<Series>[]).forEach(({scale, min, max, sum, count}, sIdx) => {
                                      if (scale === DEFAULT_X_SCALE) {
                                          return;
                                      }
                                      refs[scale].min = Math.min(refs[scale].min, min);
                                      refs[scale].max = Math.max(refs[scale].max, max);
                                      refs[scale].sum += sum;
                                      refs[scale].count += count;
                                      refs[scale].integral += integrate(
                                          u.data[0] as number[],
                                          u.data[sIdx] as DataSeriesExtended,
                                      );
                                  });

                                  Object.keys(refs).forEach((key) => {
                                      refs[key].avg = refs[key].sum / refs[key].count;
                                  });
                              },
                          },
            },
        };
    };
    return plugin;
};

export default DataRef;

if (typeof window !== 'undefined') {
    Object.assign(window, {YagrDataRefs: DataRef});
}
