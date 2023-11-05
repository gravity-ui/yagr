import type {YagrPlugin} from '../../types';
import type uPlot from 'uplot';
import type Yagr from '../../index';

import {LabelsOptions} from './types';
import {seriesDrawBasedLabels} from './series';
import {plotLinesDrawBasedLabels} from './plotLines';
import {axisDrawBasedLabels} from './axes';

type SeriesMethods = ReturnType<typeof seriesDrawBasedLabels>;
type PlotLinesMethods = ReturnType<typeof plotLinesDrawBasedLabels>;
type AxisMethods = ReturnType<typeof axisDrawBasedLabels>;

export type LabelsPluginMethods = SeriesMethods & PlotLinesMethods & AxisMethods;

export default function YagrLabelsPlugin(options: LabelsOptions): YagrPlugin<LabelsPluginMethods> {
    return (yagr: Yagr) => {
        const hooks: uPlot.Hooks.Arrays = {};

        return {
            ...seriesDrawBasedLabels(yagr, hooks, options),
            ...plotLinesDrawBasedLabels(yagr, hooks, options),
            ...axisDrawBasedLabels(yagr, hooks, options),

            uplot: {
                hooks,
            },
        };
    };
}

if (typeof window !== 'undefined') {
    Object.assign(window, {YagrLabelsPlugin});
}
