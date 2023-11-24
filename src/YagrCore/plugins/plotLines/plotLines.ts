import type Yagr from '../../';
import UPlot, {Plugin} from 'uplot';
import {DEFAULT_X_SCALE, DEFAULT_CANVAS_PIXEL_RATIO} from '../../defaults';
import {PLineConfig, PlotLineConfig, YagrPlugin} from '../../types';
import {DrawOrderKey} from '../../utils/types';
import {deepIsEqual} from '../../utils/common';
import {PBandConfig} from 'src/types';

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

export type PlotLinesPlugin = YagrPlugin<{
    update: (additionalPlotLines?: PlotLineConfig[], scale?: string) => void;
    add: (additionalPlotLines: PlotLineConfig[], scale?: string) => void;
    clear: (scale?: string) => void;
    get: () => PlotLineConfig[];
    remove: (plotLinesToRemove: PlotLineConfig[], scale?: string) => void;
}>;

export interface PlotLineOptions {
    render: (uPlot: uPlot, p: PlotLineConfig) => void;
}

/*
 * Plugin renders custom lines and bands on chart based on axis config.
 * Axis should be bound to scale.
 */
export default function plotLinesPlugin(options: PlotLineOptions): PlotLinesPlugin {
    let plotLines: PlotLineConfig[] = [];

    return function (yagr: Yagr) {
        const drawOrder = yagr.config.chart.appearance?.drawOrder;

        const drawIndicies = (drawOrder ? drawOrder.map((key) => DRAW_MAP[key]) : [0, 1, 2]).join('');

        const hook = HOOKS_MAP[drawIndicies] || 'drawClear';

        function renderPlotLines(u: UPlot) {
            const {ctx} = u;
            const {height, top, width, left} = u.bbox;
            const timeline = u.data[0];

            for (const plotLineConfig of plotLines) {
                if (!plotLineConfig.scale) {
                    continue;
                }

                if (options.render) {
                    options.render(u, plotLineConfig);
                    continue;
                }

                ctx.save();
                ctx.fillStyle = yagr.utils.colors.parse(plotLineConfig.color);

                const {scale, value} = plotLineConfig;

                if (Array.isArray(value)) {
                    /** This weird code should handles unexpected Inifinities in values */
                    const [fromValue, toValue] = value.map((val) => {
                        if (Math.abs(val) !== Infinity) {
                            if (scale === DEFAULT_X_SCALE) {
                                if (val < timeline[0]) {
                                    return timeline[0];
                                }

                                if (val > timeline[timeline.length - 1]) {
                                    return timeline[timeline.length - 1];
                                }
                            } else {
                                const scaleCfg = u.scales[scale];
                                if (scaleCfg.min !== undefined && val < scaleCfg.min) {
                                    return scaleCfg.min;
                                }

                                if (scaleCfg.max !== undefined && val > scaleCfg.max) {
                                    return scaleCfg.max;
                                }
                            }

                            return val;
                        }

                        const pos =
                            val > 0
                                ? scale === DEFAULT_X_SCALE
                                    ? u.width
                                    : 0
                                : scale === DEFAULT_X_SCALE
                                ? 0
                                : u.height;

                        return u.posToVal(pos, scale);
                    });

                    const from = u.valToPos(fromValue, scale, true);
                    const to = u.valToPos(toValue, scale, true);
                    const accent = (plotLineConfig as PBandConfig).accent;

                    if (scale === DEFAULT_X_SCALE) {
                        ctx.fillRect(from, top, to - from, height);
                        if (accent) {
                            ctx.fillStyle = accent.color;
                            ctx.fillRect(from, top - accent.space, to - from, accent.space);
                        }
                    } else {
                        ctx.fillRect(left, from, width, to - from);
                        if (accent) {
                            ctx.fillStyle = accent.color;
                            ctx.fillRect(width + left, from, accent.space, to - from);
                        }
                    }
                } else {
                    const from = u.valToPos(value, scale, true);
                    const pConf = plotLineConfig as PLineConfig;

                    ctx.beginPath();

                    if (scale === DEFAULT_X_SCALE) {
                        /** Workaround to ensure that plot line will not be drawn over axes */
                        const last = u.data[0][u.data[0].length - 1] as number;
                        const lastValue = u.valToPos(last, scale, true);
                        if (from - lastValue > MAX_X_SCALE_LINE_OFFSET) {
                            continue;
                        }

                        ctx.moveTo(from, top);

                        ctx.lineTo(from, height + top);
                    } else {
                        ctx.moveTo(left, from);
                        ctx.lineTo(width + left, from);
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
            remove: (plotLinesToRemove: PlotLineConfig[]) => {
                plotLines = plotLines.filter((p) => {
                    return !hasPlotLine(plotLinesToRemove, p);
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
                removes.length && plugin.remove(removes);
            },
            uplot: {
                opts: () => {
                    const config = yagr.config;

                    /** Collecting plot lines from config axes for plotLines plugin */
                    Object.entries(config.axes).forEach(([scale, axisConfig]) => {
                        if (axisConfig.plotLines) {
                            axisConfig.plotLines.forEach((plotLine) => {
                                plotLines.push({...plotLine, scale});
                            });
                        }
                    });
                },
                hooks: {
                    // @TODO Add feature to draw plot lines over series
                    [hook]: handler,
                },
            } as Plugin,
        };

        return plugin;
    };
}
