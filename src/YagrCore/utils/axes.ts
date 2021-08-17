import uPlot, {Axis} from 'uplot';
import * as defaults from '../defaults';

import {YagrConfig, AxisOptions} from '../types';

import {getUnitSuffix, toFixed} from './common';

const YAGR_AXIS_TO_UPLOT_AXIS = {
    right: Axis.Side.Right,
    top: Axis.Side.Top,
    bottom: Axis.Side.Bottom,
    left: Axis.Side.Left,
};

const AXIS_SIDE_TO_ALIGN = {
    left: Axis.Align.Right,
    right: Axis.Align.Left,
    top: undefined,
    bottom: undefined,
};

export const getAxisPositioning = (side: AxisOptions['side'], align: Axis['align']) => {
    return {
        side: side ? YAGR_AXIS_TO_UPLOT_AXIS[side] : Axis.Side.Left,
        align: align || (side ? AXIS_SIDE_TO_ALIGN[side] : undefined),
    };
};

export const getDefaultNumberFormatter = (precision: 'auto' | number, nullValue = '') => {
    return (n: number | null) => {
        if (n === null) {
            return nullValue;
        }

        if (n === 0) {
            return '0';
        }

        const abs = Math.abs(n);
        const precisionNum = precision === 'auto' ? 2 : precision;

        const [pow, suffix] = getUnitSuffix(abs);
        const transformedValue = n / pow;

        return (
            (precision === 'auto'
                ? String(transformedValue).replace(/\.(\d{5,})/, (match) => {
                      return match.slice(0, 6);
                  })
                : toFixed(transformedValue, precisionNum)) + suffix
        );
    };
};

/*
 * Generates ticks labels values
 */
const getNumericValueFormatter = (axisConfig: AxisOptions) => {
    const p = axisConfig.precision;
    const numFormatter = getDefaultNumberFormatter(typeof p === 'number' ? p : p || 'auto', '');
    return function defaultNumericValueFormatter(_: unknown, ticks: number[]) {
        return ticks.map(numFormatter);
    };
};

const dayTimeFormatter = uPlot.fmtDate('{DD}.{MM}.{YYYY}');
const dateTimeFormatter = uPlot.fmtDate('{HH}:{mm}:{ss}');
const minuteFormatter = uPlot.fmtDate('{mm}:{ss}');
const secondFormatter = uPlot.fmtDate('{mm}:{ss}.{fff}');

export const getTimeFormatter = (config: YagrConfig) => {
    const msm = config.settings.timeMultiplier || 1;
    return (_: unknown, ticks: number[]) => {
        const range = ticks[ticks.length - 1] - ticks[0];
        const rangeMs = range / msm;

        let formatter = dayTimeFormatter;
        if (rangeMs <= defaults.SECOND) {
            formatter = secondFormatter;
        } else if (rangeMs <= defaults.MINUTE) {
            formatter = minuteFormatter;
        } else if (rangeMs <= defaults.DAY) {
            formatter = dateTimeFormatter;
        }

        return ticks.map((rawValue) => {
            return formatter(new Date(rawValue / msm));
        });
    };
};

// eslint-disable-next-line complexity
export function getAxis(axisConfig: AxisOptions, config: YagrConfig): Axis {
    const axis: Axis = {
        show: typeof axisConfig.show === 'undefined' ? true : axisConfig.show,
        label: axisConfig.label || undefined,
        labelSize: axisConfig.labelSize || defaults.Y_AXIS_LABEL_SIZE,
        labelFont: axisConfig.labelFont || defaults.AXIS_LABEL_FONT,
        font: axisConfig.font || defaults.AXIS_VALUES_FONT,
        stroke: axisConfig.stroke || defaults.theme.AXIS_STROKE,
        ticks: axisConfig.ticks || defaults.theme.Y_AXIS_TICKS,
        grid: config.grid || axisConfig.grid || defaults.theme.GRID,
    };

    if (axisConfig.scale === defaults.DEFAULT_X_SCALE) {
        return Object.assign(axis, {
            gap: axisConfig.gap ?? defaults.X_AXIS_TICK_GAP,
            size: axisConfig.size || defaults.X_AXIS_SIZE,
            values: axisConfig.values || getTimeFormatter(config),
            ticks: axisConfig.ticks || defaults.theme.X_AXIS_TICKS,
            scale: defaults.DEFAULT_X_SCALE,
            space: axisConfig.space || defaults.X_AXIS_SPACE,
            incrs: axisConfig.incrs || defaults.X_AXIS_INCRS.map((i) => i * (config.settings.timeMultiplier || 1)),
            side: 2,
            stroke: axisConfig.stroke || defaults.theme.AXIS_STROKE,
        });
    }

    Object.assign(axis, {
        gap: axisConfig.gap ?? defaults.Y_AXIS_TICK_GAP,
        size: axisConfig.size || defaults.Y_AXIS_SIZE,
        values: axisConfig.values || getNumericValueFormatter(axisConfig),
        scale: axisConfig.scale || defaults.DEFAULT_Y_SCALE,
        ...getAxisPositioning(axisConfig.side || 'left', axisConfig.align),
    });

    if (axisConfig.space) {
        axis.space = axisConfig.space;
    }

    return axis;
}
