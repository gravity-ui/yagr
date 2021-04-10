import UPlot, {Plugin} from 'uplot';
// interface YagrNamesConfig {
//     font: string;
//     point: number | ((s: Series) => number);
// }

export default function namesPlugin(/*cgf: YagrNamesConfig*/): Plugin {
    
    return {
        hooks: {
            drawSeries(u: UPlot, seriesKey: string) {
                const {ctx} = u;
                const series = u.series[seriesKey as unknown as number];
                if (series.title) {
                    ctx.font = 'normal 22px Lucida Grande, Arial, Helvetica, sans-serif';
                    ctx.fillStyle = series.color || 'black';
                    ctx.fillText(
                        series.title,
                        u.valToPos(u.data[0][0], 'x'),
                        u.height - u.valToPos(u.data[seriesKey as unknown as number][0] || 1, 'y'),
                    );
                }
            }
        },
    };
}
