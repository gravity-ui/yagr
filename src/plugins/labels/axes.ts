import type uPlot from 'uplot';
import type Yagr from '../../index';

import {AxisLabel, Clear, LabelsOptions} from './types';
import {renderAxisLabel} from './utils';
import {isNil} from '../../YagrCore/utils/common';

export function axisDrawBasedLabels(yagr: Yagr, hooks: uPlot.Hooks.Arrays, options: LabelsOptions) {
    let pointsClears: Clear[] = [];

    function onDrawAxes(u: uPlot) {
        pointsClears.forEach((fn) => fn());
        pointsClears = [];

        Object.entries(options.axes || {}).forEach(([scaleKey, opts]) => {
            const axis = u.axes.find((a) => a.scale === scaleKey);

            if (!axis) {
                return;
            }

            opts.forEach((opt) => {
                let x, y;
                if (scaleKey === 'x') {
                    x = u.valToPos(opt.value, 'x');
                    y = u.valToPos(0, 'y');
                } else {
                    x = u.valToPos(0, 'x');
                    y = u.valToPos(opt.value, 'y');
                }

                pointsClears.push(
                    renderAxisLabel({
                        yagr,
                        x,
                        y,
                        render: opt.render,
                        label: opt,
                        className: opt.className,
                        onRender: opt.onRender,
                        onDestroy: opt.onDestroy,
                    }),
                );
            });
        });
    }

    hooks.drawAxes = hooks.drawAxes || [];

    if (options.axes) {
        hooks.drawAxes.push(onDrawAxes);
    }

    return {
        getAxisLabels() {
            return options.axes || {};
        },
        getCurrentAxisLabels(proximity: number) {
            const cursor = yagr.uplot.cursor;

            if (!cursor) {
                return {};
            }

            const {left, top} = cursor;
            if (isNil(left) || isNil(top) || left < 0 || top < 0) {
                return {};
            }

            const labels: Record<string, AxisLabel[]> = {};

            Object.entries(options.axes || {}).forEach(([scaleKey, opts]) => {
                const axis = yagr.uplot.axes.find((a) => a.scale === scaleKey);

                if (!axis) {
                    return;
                }

                opts.forEach((opt) => {
                    let x, y;
                    if (scaleKey === 'x') {
                        x = yagr.uplot.posToVal(left, 'x');

                        if (Math.abs(x - opt.value) < proximity) {
                            labels[scaleKey] = labels[scaleKey] || [];
                            labels[scaleKey].push(opt);
                        }
                    } else {
                        y = yagr.uplot.posToVal(top, 'y');

                        if (Math.abs(y - opt.value) < proximity) {
                            labels[scaleKey] = labels[scaleKey] || [];
                            labels[scaleKey].push(opt);
                        }
                    }
                });
            });

            return labels;
        },
    };
}
