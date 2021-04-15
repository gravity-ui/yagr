import UPlot, {Plugin, Series} from 'uplot';
import {exec} from '../../utils/common';

interface YagrNamesConfig {
    fontSize?: number;
    color?: string | ((s: Series) => string);
    point?: number | ((s: Series) => number);
}

export default function namesPlugin(cgf: YagrNamesConfig): Plugin {
    const opts = {
        fontSize: 11,
        point: 0,
        ...cgf,
    };
    
    return {
        hooks: {
            drawSeries(u: UPlot, seriesKey: string) {
                const {ctx} = u;
                const series = u.series[seriesKey as unknown as number];
                if (series.title) {
                    ctx.font = `normal ${opts.fontSize * devicePixelRatio}px Lucida Grande, Arial, Helvetica, sans-serif`;
                    ctx.fillStyle = (opts.color ? exec(series.color) : series.color) || 'black';
                    const pIdx = exec<number, [Series]>(opts.point, series);

                    ctx.fillText(
                        exec<string, [number]>(series.title, seriesKey as unknown as number),
                        u.valToPos(u.data[0][pIdx], 'x') * devicePixelRatio,
                        u.valToPos(u.data[seriesKey as unknown as number][pIdx] || 1, 'y') * devicePixelRatio,
                    );
                }
            }
        },
    };
}
