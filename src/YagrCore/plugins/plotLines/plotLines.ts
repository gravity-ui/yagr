import type Yagr from '../../';
import UPlot, {Plugin} from 'uplot';
import {DEFAULT_X_SCALE, DEFAULT_CANVAS_PIXEL_RATIO} from '../../defaults';
import {PLineConfig, PlotLineConfig, YagrPlugin} from '../../types';
import {DrawOrderKey} from '../../utils/types';
import {PBandConfig} from 'src/types';
import {deepIsEqual} from '../../utils/common';
import {calculateFromTo} from './utils';

const MAX_X_SCALE_LINE_OFFSET = 0;
const DRAW_MAP = {
    [DrawOrderKey.Series]: 0,
    [DrawOrderKey.Axes]: 1,
    plotLines: 2,
};

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
    let plotLines = new Map<string, PlotLineConfig>();

    return function (yagr: Yagr) {
        const drawOrder = yagr.config.chart.appearance?.drawOrder;

        const drawIndicies = (drawOrder ? drawOrder.map((key) => DRAW_MAP[key]) : [0, 1, 2]).join('');

        const hook = HOOKS_MAP[drawIndicies] || 'drawClear';
        let lineCounter = 0;

        function getLineId(line: PlotLineConfig): string {
            if (line.id) {
                return line.id;
            }
            const lineWithoutId = Array.from(plotLines.entries()).find(([_, l]) => deepIsEqual(l, line))?.[0];
            return lineWithoutId || `plot-line-${++lineCounter}`;
        }

        function renderPlotLines(u: UPlot) {
            const {ctx} = u;
            const {height, top, width, left} = u.bbox;
            const timeline = u.data[0];

            for (const plotLineConfig of plotLines.values()) {
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

                const isBand = Array.isArray(value);
                const [from, to] = isBand
                    ? calculateFromTo(value, scale, timeline, u)
                    : [u.valToPos(value, scale, true), 0];

                if (isBand) {
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
                    if (pConf.dash) {
                        ctx.setLineDash(pConf.dash);
                    }
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

        function addPlotLines(additionalPlotLines: PlotLineConfig[]) {
            for (const line of additionalPlotLines) {
                const lineId = getLineId(line);
                plotLines.set(lineId, line);
            }
        }

        function removePlotLines(plotLinesToRemove: PlotLineConfig[]) {
            for (const lineToRemove of plotLinesToRemove) {
                const lineId = getLineId(lineToRemove);
                plotLines.delete(lineId);
            }
        }
        function getPlotLines(): PlotLineConfig[] {
            return Array.from(plotLines.values());
        }

        function updatePlotLines(newPlotLines?: PlotLineConfig[], scale?: string) {
            if (!newPlotLines || newPlotLines.length === 0) {
                clearPlotLines(scale);
                return;
            }

            const existingKeys = new Set<string>();

            for (const newLine of newPlotLines) {
                const lineId = getLineId(newLine);
                plotLines.set(lineId, newLine);
                existingKeys.add(lineId);
            }

            // Delete not actual lines from map
            for (const [key, line] of plotLines.entries()) {
                if ((!scale || line.scale === scale) && !existingKeys.has(key)) {
                    plotLines.delete(key);
                }
            }
        }

        function clearPlotLines(scale?: string) {
            if (scale) {
                plotLines.forEach((line, key) => {
                    if (line.scale === scale) {
                        plotLines.delete(key);
                    }
                });
            } else {
                plotLines.clear();
            }
        }

        const plugin = {
            get: getPlotLines,
            clear: clearPlotLines,
            remove: removePlotLines,
            add: addPlotLines,
            update: updatePlotLines,
            uplot: {
                opts: () => {
                    const config = yagr.config;
                    plotLines = new Map();
                    let counter = 0;
                    for (const scale in config.axes) {
                        if (config.axes.hasOwnProperty(scale)) {
                            const axisConfig = config.axes[scale];
                            if (axisConfig.plotLines) {
                                for (const plotLine of axisConfig.plotLines) {
                                    plotLines.set(plotLine.id || `plot-line-${++counter}`, {...plotLine, scale});
                                }
                            }
                        }
                    }
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
