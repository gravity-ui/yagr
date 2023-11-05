import type {PlotLineConfig, PerScale} from '../../types';
import type uPlot from 'uplot';
import type Yagr from '../../index';

import {isNil} from '../../YagrCore/utils/common';
import {Clear, LabelsOptions, PlotLabel} from './types';
import {defaultPositionTop, renderPointLabel} from './utils';

type StoredPlotLabel = {band: PlotLineConfig; label: string | null | undefined};

/**
 * Sets up hooks for labels rending on plotLines draw
 */
export function plotLinesDrawBasedLabels(yagr: Yagr, hooks: uPlot.Hooks.Arrays, options: LabelsOptions) {
    let drawClears: Clear[] = [];
    let cursorClears: Clear[] = [];

    hooks.draw = hooks.draw || [];
    hooks.drawClear = hooks.drawClear || [];
    hooks.setCursor = hooks.setCursor || [];

    function renderLabelsOnPlotLines(
        psOptions: PerScale<PlotLabel>,
        clears: Clear[],
        predicate?: (pl: PlotLineConfig) => boolean,
    ) {
        const bands = [];

        for (const [scaleName, labelOptions] of Object.entries(psOptions || {})) {
            const foundBands = (yagr.plugins.plotLines?.get() || []).filter((p) => {
                return p.scale === scaleName;
            });

            foundBands.length && bands.push({bands: foundBands, labelOptions});
        }

        if (!bands.length) {
            return;
        }

        bands.forEach(({bands: plotLines, labelOptions}) => {
            plotLines.forEach((band) => {
                if (predicate?.(band) === false) {
                    return;
                }

                const [x, y] =
                    band.scale === 'x'
                        ? [Array.isArray(band.value) ? band.value[0] : band.value, yagr.uplot.posToVal(0, 'y')]
                        : [yagr.uplot.posToVal(0, 'x'), Array.isArray(band.value) ? band.value[0] : band.value];

                const [xP, yP] = labelOptions.position
                    ? labelOptions.position(x, y)
                    : defaultPositionTop(yagr.uplot, x, y, band.scale || 'y');

                const label =
                    typeof labelOptions.label === 'function'
                        ? labelOptions.label(band)
                        : labelOptions.label || band.label;

                if (labelOptions.render) {
                    const [clear] = labelOptions.render(yagr, band, xP, yP, labelOptions);
                    clear && drawClears.push(clear);
                    return;
                }

                if (label && labelOptions.show !== false) {
                    clears.push(
                        renderPointLabel({
                            yagr,
                            label,
                            x: xP,
                            y: yP,
                        }),
                    );
                }
            });
        });
    }

    if (options.plotLines?.cursor) {
        hooks.setCursor.push((u) => {
            cursorClears.forEach((fn) => fn());
            cursorClears = [];

            const {left, top} = u.cursor;

            if (!isNil(left) && !isNil(top) && left >= 0 && top >= 0) {
                renderLabelsOnPlotLines(options.plotLines?.cursor!, cursorClears, (band: PlotLineConfig) => {
                    const x = yagr.uplot.posToVal(left, 'x');
                    const [x1, x2] = Array.isArray(band.value) ? band.value : [band.value, band.value];
                    const [y1, y2] = Array.isArray(band.value)
                        ? [band.value[0], band.value[1]]
                        : [band.value, band.value];

                    if (band.scale === 'x') {
                        if (x >= x1 && x <= x2) {
                            return true;
                        }
                    } else {
                        const y = yagr.uplot.posToVal(top, band.scale!);

                        if (y >= y1 && y <= y2) {
                            return true;
                        }
                    }

                    return false;
                });
            }
        });
    }

    if (options.plotLines?.constant) {
        hooks.draw.push(() => {
            renderLabelsOnPlotLines(options.plotLines?.constant!, drawClears);
        });

        hooks.drawClear.push(() => {
            drawClears.forEach((fn) => fn());
            drawClears = [];
        });
    }

    return {
        getPlotLinesLabels: () => {
            const bands = yagr.plugins.plotLines?.get() || [];

            return bands
                .filter((band) => {
                    return options.plotLines?.constant?.[band.scale || 'y'];
                })
                .map((band) => {
                    return {band, label: options.plotLines?.constant?.[band.scale || 'y']?.label || band.label};
                });
        },
        getCurrentPlotLinesLabels: () => {
            const cursor = yagr.uplot.cursor;

            if (!cursor.left || !cursor.top || cursor.left < 0 || cursor.top < 0) {
                return [];
            }

            const labels: StoredPlotLabel[] = [];

            const {left, top} = cursor;
            const x = yagr.uplot.posToVal(left, 'x');

            yagr.plugins.plotLines?.get().forEach((band) => {
                const [x1, x2] = Array.isArray(band.value) ? band.value : [band.value, band.value];
                const [y1, y2] = Array.isArray(band.value) ? [band.value[0], band.value[1]] : [band.value, band.value];

                if (band.scale === 'x') {
                    if (x >= x1 && x <= x2) {
                        labels.push({band, label: band.label});
                    }
                } else {
                    const y = yagr.uplot.posToVal(top, band.scale!);

                    if (y >= y1 && y <= y2) {
                        labels.push({band, label: band.label});
                    }
                }
            });

            return labels;
        },
    };
}
