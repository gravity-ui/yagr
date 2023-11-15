/* eslint-disable complexity, @typescript-eslint/no-loop-func, no-nested-ternary */

import type {AxisOptions} from '../../types';
import type uPlot from 'uplot';
import type Yagr from '../../index';

import {html, isNil, px} from '../../YagrCore/utils/common';
import {AxisLabel, Clear, PointLabel} from './types';

export const defaultPositionTop = (u: uPlot, x: number, y: number, scale: string) => {
    return [u.valToPos(x, 'x'), u.valToPos(y, scale) - 15];
};

export const getId = () => (x: number) => String(x);

export function renderAxisLabel({
    yagr,
    scaleKey,
    x,
    y,
    className = '',
    render,
    onRender,
    onDestroy,
    label,
}: {
    yagr: Yagr;
    scaleKey: string;
    x: number;
    y: number;
    label: AxisLabel;
    className?: string;
    render?: AxisLabel['render'];
    onRender?: (e: HTMLElement) => void;
    onDestroy?: (e: HTMLElement) => void;
}) {
    const over = yagr.root.querySelector('.u-over') as HTMLElement;

    if (render) {
        return render(yagr, x, y, label);
    }

    const labelValue = label.label ? (typeof label.label === 'function' ? label.label(label) : label.label) : '';

    const div = html(
        'div',
        {
            class: `yagr-label ${className}`,
            style: {
                visibility: 'hidden',
            },
        },
        labelValue ?? label.value.toString(),
    );

    over.append(div);

    if (scaleKey === 'x') {
        div.style.top = px(y - div.clientHeight / 2);
        div.style.left = px(x - div.clientWidth / 2);
    } else {
        if (yagr.config.axes[scaleKey]?.side === 'right') {
            div.style.left = px(x - div.clientWidth / 2);
        } else {
            div.style.left = px(x);
        }
        div.style.top = px(y - div.clientHeight / 2);
    }

    div.style.visibility = 'visible';

    onRender && onRender(div);

    return () => {
        onDestroy && onDestroy(div);
        div.remove();
    };
}

export function renderPointLabel({
    yagr,
    label,
    x,
    y,
    className = '',
    shifts = {},
    onRender,
    onDestroy,
}: {
    yagr: Yagr;
    label: string;
    x: number;
    y: number;
    onRender?: (e: HTMLElement) => void;
    onDestroy?: (e: HTMLElement) => void;
    className?: string;
    shifts?: {top?: number; left?: number};
}) {
    const over = yagr.root.querySelector('.u-over') as HTMLElement;
    const div = html(
        'div',
        {
            class: `yagr-label ${className}`,
            style: {
                top: px(y + (shifts.top || 0)),
                left: px(x + (shifts.left || 0)),
            },
        },
        label,
    );

    over.append(div);

    onRender && onRender(div);

    div.style.left = px(Number(div.style.left.replace('px', '')) - div.clientWidth / 2);

    return () => {
        div.remove();
        onDestroy && onDestroy(div);
    };
}

export function drawLabelOnPoint(
    yagr: Yagr,
    serieIdx: number,
    xIdx: number,
    scaleKey: string | undefined,
    labelOptions: PointLabel | undefined,
    xAxisFormatter: ReturnType<Required<AxisOptions>['getFormatter']>,
    selfAxisFormatter: ReturnType<Required<AxisOptions>['getFormatter']>,
    onDraw?: (clear: Clear, label: string, serieIdx: number) => void,
) {
    const x = yagr.uplot.data[0][xIdx];
    const y = yagr.uplot.data[serieIdx][xIdx];

    if (isNil(y) || !scaleKey || !labelOptions) {
        return;
    }

    const valX = xAxisFormatter(x);
    const valY = selfAxisFormatter(y);
    const label =
        typeof labelOptions.label === 'function'
            ? labelOptions.label(x, y)
            : labelOptions.label || `(${valX}, ${valY})`;

    if (labelOptions.render) {
        const clear = labelOptions.render(yagr, serieIdx, xIdx, scaleKey, labelOptions);

        clear && onDraw && onDraw(clear, label ?? '', serieIdx);
        return;
    }

    if (!label || isNil(y)) {
        return;
    }

    const [xP, yP] = labelOptions.position
        ? labelOptions.position(x, y)
        : defaultPositionTop(yagr.uplot, x, y, scaleKey);

    const prev = yagr.uplot.data[serieIdx][xIdx - 1];
    const next = yagr.uplot.data[serieIdx][xIdx + 1];
    const className =
        prev !== null && prev !== undefined && next !== null && next !== undefined
            ? y < prev && y < next
                ? '_bottom'
                : '_top'
            : '_top';

    let clear = () => {};
    if (labelOptions.show !== false) {
        clear = renderPointLabel({
            yagr,
            label,
            x: xP,
            y: yP,
            className,
            onRender: labelOptions.onRender,
            onDestroy: labelOptions.onDestroy,
        });
    }
    onDraw && onDraw(clear, label, serieIdx);
}
