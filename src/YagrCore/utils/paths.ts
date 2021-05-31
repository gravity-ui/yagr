import UPlot from 'uplot';
import * as defaults from '../defaults';

import {ChartTypes, InterpolationSetting} from '../types';

/*
 * Configures and return apropriate path renderer
 * by given serieIndex and two points
 */
export function pathsRenderer(u: UPlot, seriesIdx: number, idx0: number, idx1: number) {
    const serie = u.series[seriesIdx];
    const {type, interpolation} = serie;

    let drawer;

    switch (type) {
        case ChartTypes.Bars: {
            drawer = UPlot.paths.bars && UPlot.paths.bars({size: [defaults.BARS_DRAW_FACTOR, defaults.BARS_DRAW_MAX]});
            break;
        }
        case ChartTypes.Dots: {
            drawer = () => null;
            break;
        }
        case ChartTypes.Line:
        case ChartTypes.Area:
        default: {
            switch (interpolation) {
                case InterpolationSetting.Smooth:
                    drawer = UPlot.paths.spline && UPlot.paths.spline();
                    break;
                case InterpolationSetting.Left:
                    drawer = UPlot.paths.stepped && UPlot.paths.stepped({align: 1});
                    break;
                case InterpolationSetting.Right: {
                    drawer = UPlot.paths.stepped && UPlot.paths.stepped({align: -1});
                    break;
                }
                case InterpolationSetting.Linear:
                default:
                    drawer = UPlot.paths.linear && UPlot.paths.linear();
                    break;
            }
        }
    }

    return drawer ? drawer(u, seriesIdx, idx0, idx1) : null;
}
