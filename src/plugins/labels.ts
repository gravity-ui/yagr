/* eslint-disable complexity, @typescript-eslint/no-loop-func, no-nested-ternary */

import type {YagrPlugin, AxisOptions} from '../types';
import type uPlot from 'uplot';
import type Yagr from '../index';

import {html, px} from '../YagrCore/utils/common';

import './styles.scss';

interface LabelOptions {
    label?: string | ((x: number, y: number | null | undefined) => string | undefined | null);
    position?: (x: number, y: number | null | undefined) => [x: number, y: number];
}

interface LabelsOptions {
    axes?: Record<string, LabelOptions>;
    cursor?: LabelsOptions['axes'];
}

function renderLabel(yagr: Yagr, label: string, x: number, y: number, place: 'top' | 'bottom') {
    const over = yagr.root.querySelector('.u-over') as HTMLElement;

    const div = html(
        'div',
        {
            class: `yagr-label _${place}`,
            style: {
                top: px(y),
                left: px(x),
            },
        },
        label,
    );

    over.append(div);
    div.style.left = Number(div.style.left.replace('px', '')) - div.clientWidth / 2 + 'px';

    return () => {
        div.remove();
    };
}

const defaultPositionTop = (u: uPlot, x: number, y: number, scale: string) => {
    return [u.valToPos(x, 'x'), u.valToPos(y, scale) - 15];
};

const getId = () => (x: number) => String(x);

export default function YagrLabel(options: LabelsOptions): YagrPlugin {
    let clears: Function[] = [];

    function drawOnPoint(
        yagr: Yagr,
        serieIdx: number,
        xIdx: number,
        scaleKey: string | undefined,
        renderOpts: LabelOptions | undefined,
        xAxisFormatter: ReturnType<Required<AxisOptions>['getFormatter']>,
        selfAxisFormatter: ReturnType<Required<AxisOptions>['getFormatter']>,
    ) {
        const x = yagr.uplot.data[0][xIdx];
        const y = yagr.uplot.data[serieIdx][xIdx];

        if (y === null || y === undefined || !scaleKey || !renderOpts) {
            return;
        }

        const valX = xAxisFormatter(x);
        const valY = selfAxisFormatter(y);

        const label =
            typeof renderOpts.label === 'function' ? renderOpts.label(x, y) : renderOpts.label || `(${valX}, ${valY})`;

        if (!label || y === null || y === undefined) {
            return;
        }

        const [xP, yP] = renderOpts.position
            ? renderOpts.position(x, y)
            : defaultPositionTop(yagr.uplot, x, y, scaleKey);

        const prev = yagr.uplot.data[serieIdx][xIdx - 1];
        const next = yagr.uplot.data[serieIdx][xIdx + 1];
        const place =
            prev !== null && prev !== undefined && next !== null && next !== undefined
                ? y < prev && y < next
                    ? 'bottom'
                    : 'top'
                : 'top';

        clears.push(renderLabel(yagr, label, xP, yP, place));
    }

    return (yagr: Yagr) => {
        function onSetCursor(u: uPlot) {
            if (!options.cursor) {
                return;
            }

            const {left, top, idx} = u.cursor;
            const {data} = u;

            clears.forEach((fn) => fn());
            clears = [];

            if (data === null || idx === null || idx === undefined || top === undefined || left === undefined) {
                return;
            }

            if (left < 0 || top < 0) {
                return;
            }

            for (let sIdx = 1; sIdx < u.series.length; sIdx++) {
                const {scale, min, max} = u.series[sIdx] as Required<uPlot.Series>;
                const renderOpts = options.cursor[scale as string];
                const tSeries = u.series[0] as Required<uPlot.Series>;

                const selfAxisFormatter = (u.axes.find((a) => a.scale === scale)?.getFormatter || getId)(max - min);
                const xAxisFormatter = (u.axes.find((a) => a.scale === 'x')?.getFormatter || getId)(
                    tSeries.max - tSeries.min,
                );

                drawOnPoint(yagr, sIdx, idx, scale, renderOpts, xAxisFormatter, selfAxisFormatter);
            }
        }

        function onDraw(u: uPlot) {
            if (!options.axes) {
                return;
            }

            clears.forEach((fn) => fn());
            clears = [];

            for (let sIdx = 1; sIdx < u.series.length; sIdx++) {
                const {scale = 'y', min, max} = u.series[sIdx] as Required<uPlot.Series>;
                const tSeries = u.series[0] as Required<uPlot.Series>;
                const renderOpts = options.axes[scale];

                const selfAxisFormatter = (u.axes.find((a) => a.scale === scale)?.getFormatter || getId)(max - min);
                const xAxisFormatter = (u.axes.find((a) => a.scale === 'x')?.getFormatter || getId)(
                    tSeries.max - tSeries.min,
                );

                let idx = 0;
                while (idx < u.data[0].length) {
                    drawOnPoint(yagr, sIdx, idx, scale, renderOpts, xAxisFormatter, selfAxisFormatter);
                    idx++;
                }
            }
        }

        const hooks: uPlot.Plugin['hooks'] = {};

        if (options.cursor) {
            hooks.setCursor = onSetCursor;
        }

        if (options.axes) {
            hooks.draw = onDraw;
        }

        return {
            uplot: {
                hooks,
            },
        };
    };
}
