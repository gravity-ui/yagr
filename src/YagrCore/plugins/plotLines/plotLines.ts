import type Yagr from '../../';
import UPlot from 'uplot';
import {DEFAULT_X_SCALE, DEFAULT_CANVAS_PIXEL_RATIO} from '../../defaults';
import {PLineConfig, PlotLineConfig, YagrPlugin} from '../../types';
import {DrawOrderKey} from '../../utils/types';
import {asPlain, deepIsEqual} from '../../utils/common';

const MAX_X_SCALE_LINE_OFFSET = 0;
const DRAW_MAP = {
    [DrawOrderKey.Series]: 0,
    [DrawOrderKey.Axes]: 1,
    plotLines: 2,
};

function hasPlotLine(list: PlotLineConfig[], p: PlotLineConfig) {
    return list.some((pl) => {
        return deepIsEqual(pl, p);
    });
}

const HOOKS_MAP: Record<string, 'draw' | 'drawClear' | 'drawAxes' | 'drawSeries'> = {
    '012': 'draw',
    '102': 'draw',
    '201': 'drawClear',
    '210': 'drawClear',
    '120': 'drawAxes',
    '021': 'drawSeries',
};

export type PlotLinesPlugin = YagrPlugin<
    {
        update: (additionalPlotLines?: PlotLineConfig[], scale?: string) => void;
        add: (additionalPlotLines: PlotLineConfig[], scale?: string) => void;
        clear: (scale?: string) => void;
        get: () => PlotLineConfig[];
        remove: (plotLinesToRemove: PlotLineConfig[], scale?: string) => void;
    },
    [PlotLineConfig[]]
>;

/*
 * Plugin renders custom lines and bands on chart based on axis config.
 * Axis should be bound to scale.
 */
export default function plotLinesPlugin(yagr: Yagr, plotLinesCfg: PlotLineConfig[] = []): ReturnType<PlotLinesPlugin> {
    let plotLines = [...plotLinesCfg];

    const drawOrder = yagr.config.chart.appearance?.drawOrder;

    const drawIndicies = (drawOrder ? drawOrder.map((key) => DRAW_MAP[key]) : [0, 1, 2]).join('');

    const hook = HOOKS_MAP[drawIndicies] || 'drawClear';

    function renderPlotLines(u: UPlot) {
        const {ctx} = u;
        const {height, top, width, left} = u.bbox;

        for (const plotLineConfig of plotLines) {
            if (!plotLineConfig.scale) {
                continue;
            }

            ctx.save();
            ctx.fillStyle = yagr.utils.colors.parse(plotLineConfig.color);

            const {scale, value} = plotLineConfig;

            if (Array.isArray(value)) {
                /** This weird code should handles unexpected Inifinities in values */
                const [fromValue, toValue] = value.map((val) => {
                    if (Math.abs(val) !== Infinity) {
                        return val;
                    }

                    const pos =
                        val > 0 ? (scale === DEFAULT_X_SCALE ? u.width : 0) : scale === DEFAULT_X_SCALE ? 0 : u.height;

                    return u.posToVal(pos, scale);
                });

                const from = u.valToPos(fromValue, scale, true);
                const to = u.valToPos(toValue, scale, true);

                if (scale === DEFAULT_X_SCALE) {
                    ctx.fillRect(from, top, to - from, height);
                } else {
                    ctx.fillRect(left, from, width, to - from);
                }
            } else {
                const from = u.valToPos(value, scale, true);
                const pConf = plotLineConfig as PLineConfig;

                ctx.beginPath();
                const axisSize = asPlain(u.axes.find((a) => a.scale === scale)?.size);

                if (scale === DEFAULT_X_SCALE) {
                    /** Workaround to ensure that plot line will not be drawn over axes */
                    const last = u.data[0][u.data[0].length - 1] as number;
                    const lastValue = u.valToPos(last, scale, true);
                    if (from - lastValue > MAX_X_SCALE_LINE_OFFSET) {
                        continue;
                    }

                    ctx.moveTo(from, top);

                    ctx.lineTo(from, height + (axisSize ?? 0));
                } else {
                    ctx.moveTo(left, from);
                    ctx.lineTo(width, from);
                }

                ctx.lineWidth = pConf.width || DEFAULT_CANVAS_PIXEL_RATIO;
                ctx.strokeStyle = pConf.color || '#000';
                pConf.dash && ctx.setLineDash(pConf.dash);
                ctx.closePath();
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    const handler =
        hook === 'drawSeries'
            ? (u: UPlot, sIdx: number) => {
                  if (sIdx === u.series.length - 1) {
                      renderPlotLines(u);
                  }
              }
            : renderPlotLines;

    const plugin = {
        get: () => plotLines,
        clear: (scale?: string) => {
            plotLines = scale
                ? plotLines.filter((p) => {
                      return p.scale !== scale;
                  })
                : [];
        },
        remove: (plotLinesToRemove: PlotLineConfig[], scale?: string) => {
            plotLines = plotLines.filter((p) => {
                return !plotLinesToRemove.some((pl) => {
                    return pl.id === p.id && (scale ? p.scale === scale : true);
                });
            });
        },
        add: (additionalPlotLines: PlotLineConfig[], scale?: string) => {
            for (const p of additionalPlotLines) {
                plotLines.push(scale ? {scale, ...p} : p);
            }
        },
        update: (newPlotLines?: PlotLineConfig[], scale?: string) => {
            if (!newPlotLines || newPlotLines.length === 0) {
                plugin.clear(scale);
                return;
            }

            const additions = newPlotLines!.filter((p) => {
                return !hasPlotLine(plotLines, p);
            });

            const removes = plotLines.filter((p) => {
                return !hasPlotLine(newPlotLines!, p);
            });

            additions.length && plugin.add(additions, scale);
            removes.length && plugin.remove(removes, scale);
        },
        uplot: {
            hooks: {
                // @TODO Add feature to draw plot lines over series
                [hook]: handler,
            },
        },
    };

    return plugin;
}
