
import uPlot, {Axis} from 'uplot';
import * as defaults from '../defaults';

import {
    YagrConfig,
    AxisOptions,
    AxisSide,
    UAxisSide,
    UAxisAlign,
} from '../types';

import {getUnitSuffix, toFixed} from './common';

const YAGR_AXIS_TO_UPLOT_AXIS = {
    [AxisSide.Right]: UAxisSide.Right,
    [AxisSide.Top]: UAxisSide.Top,
    [AxisSide.Bottom]: UAxisSide.Bottom,
    [AxisSide.Left]: UAxisSide.Left,
};

const AXIS_SIDE_TO_ALIGN = {
    [AxisSide.Left]: UAxisAlign.Right,
    [AxisSide.Right]: UAxisAlign.Left,
    [AxisSide.Top]: undefined,
    [AxisSide.Bottom]: undefined,
};

/*
 * @TODO Remove after Uplot will change axis side to named enum
 */
export const getAxisPositioning = (side: AxisOptions['side'], align: Axis['align']) => {
    return {
        side: side ? YAGR_AXIS_TO_UPLOT_AXIS[side] : UAxisSide.Left,
        align: align || (side ? AXIS_SIDE_TO_ALIGN[side] : undefined),
    };
};


export const getDefaultNumberFormatter = (precision: 'auto' | number = 'auto', nullValue = '') => {
    return (n: number | null) => {
        if (n === null) {
            return nullValue;
        }

        if (n === 0) { return '0'; }

        const abs = Math.abs(n);
        const precisionNum = precision === 'auto' ? 2 : precision;

        const [pow, suffix] = getUnitSuffix(abs);
        const transformedValue = n / pow;

        return (precision === 'auto'
            ? String(transformedValue).replace(/\.(\d{5,})/, (match) => {
                return match.slice(0, 6);
            })
            : toFixed(transformedValue, precisionNum || 2)) + suffix;

    };
};

/*
 * Generates ticks labels values
 */
const getNumericValueFormatter = (axisConfig: AxisOptions) => {
    const numFormatter = getDefaultNumberFormatter(axisConfig.precision, '');
    return function defaultNumericValueFormatter(_: unknown, ticks: number[]) {
        return ticks.map(numFormatter);
    };
};



const defaultDateFormatter = uPlot.fmtDate('{DD}.{MM}.{YYYY}');

const defaultTimeFormatter = (_: unknown, ticks: number[]) => {
    return ticks.map((rawValue) => {
        return defaultDateFormatter(new Date(rawValue));
    });
};

// eslint-disable-next-line complexity
export function getAxis(axisConfig: AxisOptions, config: YagrConfig): Axis {
    const axis: Axis = {
        show: typeof axisConfig.show === 'undefined' ? true : axisConfig.show,
        label: axisConfig.label || undefined,
        labelSize: axisConfig.labelSize || defaults.Y_AXIS_LABEL_SIZE,
        labelFont: axisConfig.labelFont || defaults.AXIS_LABEL_FONT,
        font: axisConfig.font || defaults.AXIS_VALUES_FONT,
        stroke: axisConfig.stroke || defaults.THEMED.AXIS_STROKE,
        ticks: axisConfig.ticks || defaults.THEMED.Y_AXIS_TICKS,
        grid: config.grid || axisConfig.grid || defaults.THEMED.GRID,
    };

    if (axisConfig.scale === defaults.DEFAULT_X_SCALE) {
        return Object.assign(axis, {
            gap: axisConfig.gap || defaults.X_AXIS_TICK_GAP,
            size: axisConfig.size || defaults.X_AXIS_SIZE,
            values: axisConfig.values || defaultTimeFormatter,
            ticks: axisConfig.ticks || defaults.THEMED.X_AXIS_TICKS,
            scale: defaults.DEFAULT_X_SCALE,
            space: axisConfig.space || defaults.X_AXIS_SPACE,
            incrs: axisConfig.incrs || defaults.X_AXIS_INCRS.map((i) => i * (config.settings.timeMultiplier || 1)),
            side: 2,
            stroke: axisConfig.stroke || defaults.THEMED.AXIS_STROKE,
        });
    }

    Object.assign(axis, {
        gap: axisConfig.gap || defaults.Y_AXIS_TICK_GAP,
        size: axisConfig.size || defaults.Y_AXIS_SIZE,
        values: axisConfig.values || getNumericValueFormatter(axisConfig),
        scale: axisConfig.scale || defaults.DEFAULT_Y_SCALE,
        ...getAxisPositioning(axisConfig.side || AxisSide.Left, axisConfig.align),
    });

    if (axisConfig.space) {
        axis.space = axisConfig.space;
    }

    return axis;
}
