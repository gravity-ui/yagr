import {YagrPlugin} from '../../types';
import uPlot, {Series} from 'uplot';
import {DEFAULT_X_SCALE} from '../../defaults';
import type Yagr from '../../index';

export type DataRefs = {min: number; max: number; sum: number; avg: number; count: number};
export type DataRefsPerScale = Record<string, DataRefs>;

const getRefsPlugin: YagrPlugin<{
    getRefs(): DataRefsPerScale;
}> = (_: Yagr) => {
    const refs: DataRefsPerScale = {};

    return {
        getRefs: () => refs,
        uplot: {
            hooks: {
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
                            count: 0,
                        };
                    });

                    (u.series as Required<Series>[]).forEach(({scale, min, max, sum, count}) => {
                        if (scale === DEFAULT_X_SCALE) {
                            return;
                        }
                        refs[scale].min = Math.min(refs[scale].min, min);
                        refs[scale].max = Math.max(refs[scale].max, max);
                        refs[scale].sum += sum;
                        refs[scale].count += count;
                    });
                    Object.keys(refs).forEach((key) => {
                        refs[key].avg = refs[key].sum / refs[key].count;
                    });
                },
            },
        },
    };
};

export default getRefsPlugin;
