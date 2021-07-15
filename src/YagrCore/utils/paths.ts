import UPlot from 'uplot';
import * as defaults from '../defaults';

/*
 * Configures and return apropriate path renderer
 * by given serieIndex and two points
 */
export function pathsRenderer(u: UPlot, seriesIdx: number, idx0: number, idx1: number) {
    const serie = u.series[seriesIdx];
    const {type, interpolation} = serie;

    let drawer;

    switch (type) {
        case 'column': {
            drawer = UPlot.paths.bars && UPlot.paths.bars({size: [defaults.BARS_DRAW_FACTOR, defaults.BARS_DRAW_MAX]});
            break;
        }
        case 'dots': {
            drawer = () => null;
            break;
        }
        case 'line':
        case 'area':
        default: {
            switch (interpolation) {
                case 'smooth':
                    drawer = UPlot.paths.spline && UPlot.paths.spline();
                    break;
                case 'left':
                    drawer = UPlot.paths.stepped && UPlot.paths.stepped({align: 1});
                    break;
                case 'right': {
                    drawer = UPlot.paths.stepped && UPlot.paths.stepped({align: -1});
                    break;
                }
                case 'linear':
                default:
                    drawer = UPlot.paths.linear && UPlot.paths.linear();
                    break;
            }
        }
    }

    return drawer ? drawer(u, seriesIdx, idx0, idx1) : null;
}
