/* eslint-disable no-nested-ternary */
import UPlot, {Range} from 'uplot';
import {YagrConfig, Scale} from '../types';
import {
    DEFAULT_MAX_TICKS,
    DEFAULT_Y_AXIS_OFFSET,
    DEFAULT_SCALE_MIN_RANGE,
    DEFAULT_LOGARITHMIC_MIN_SCALE_VALUE,
} from '../defaults';

type ScaleRangeType = (min: number, max: number, scfg: Scale, ycfg: YagrConfig) => {min: number; max: number};

export const getScaleRange = (scale: Scale, config: YagrConfig) => {
    const range = scale.range;
    if (typeof range === 'function') {
        return (u: UPlot, dataMin: number, dataMax: number) => {
            return range(u, dataMin, dataMax, config);
        };
    }

    if (scale.normalize) {
        return [0, scale.normalizeBase || 100] as Range.MinMax;
    }

    if (scale.range === 'auto') {
        return undefined;
    }

    let rangeFn: ScaleRangeType;

    switch (scale.range) {
        case undefined:
        case 'nice': {
            rangeFn = niceScale;
            break;
        }
        case 'offset': {
            rangeFn = offsetScale;
            break;
        }
        default:
            throw new Error(`Unknown scale range type ${scale.range}`);
    }

    return (_: UPlot, dMin: number, dMax: number): Range.MinMax => {
        let {min, max} = rangeFn(dMin, dMax, scale, config);

        const minRange = scale.minRange || DEFAULT_SCALE_MIN_RANGE;

        if (Math.abs(max - min) < minRange) {
            if (min >= 0) {
                max += minRange;
            } else {
                max += minRange / 2;
                min -= minRange / 2;
            }
        }

        min = typeof scale.min === 'number' ? scale.min : min;
        max = typeof scale.max === 'number' ? scale.max : max;

        /** Protect logarithmic scale from impossible min values */
        if (scale.type === 'logarithmic') {
            const isScaleMinDefined = typeof scale.min === 'number';

            if (min <= 0) {
                min = DEFAULT_LOGARITHMIC_MIN_SCALE_VALUE;
            } else if (!isScaleMinDefined) {
                min = Math.min(min, DEFAULT_LOGARITHMIC_MIN_SCALE_VALUE);
            }
        }

        if (min >= max || max <= min) {
            if (typeof scale.max === 'number') {
                min = max - (niceNum(max - max * 0.1, false) || 1);
            } else {
                max = min + (niceNum(min + min * 0.1, false) || 1);
            }
        }

        return [min, max];
    };
};

export function offsetScale(dataMin: number, dataMax: number, scaleConfig: Scale) {
    const startFromZero = dataMin >= 0 && scaleConfig.stacking;
    const endWithZero = dataMax <= 0 && scaleConfig.stacking;

    return {
        min: startFromZero
            ? 0
            : Math.round(dataMin - Math.abs(dataMin) * (scaleConfig.offset || DEFAULT_Y_AXIS_OFFSET)),
        max: endWithZero ? 0 : Math.round(dataMax + Math.abs(dataMax) * (scaleConfig.offset || DEFAULT_Y_AXIS_OFFSET)),
    };
}

/*
 * Implementation nice scale (see https://www.baeldung.com/cs/choosing-linear-scale-y-axis#procedure-for-identifying-scale-and-ticks)
 * with extra options inherited from Solomon stacked area visualization
 * with extra options implementing consistent incr proximity if dataMin ~= dataMax. (16.01.2020)
 * with extra options for small ranges between max and min (27.01.2020)
 */
export function niceScale(dataMin: number, dataMax: number, scaleConfig: Scale) {
    const startFromZero = dataMin >= 0 && scaleConfig.stacking;
    const endWithZero = dataMax <= 0 && scaleConfig.stacking;

    /**
     * This code handles case when scale has user max/min and niceScale's
     * range after usage of given max-min from scale config creates not centered lines
     */
    const dMax = endWithZero ? 0 : typeof scaleConfig.max === 'number' ? scaleConfig.max : dataMax;
    const dMin = startFromZero ? 0 : typeof scaleConfig.min === 'number' ? scaleConfig.min : dataMin;

    if (dMin === dMax) {
        return dMin >= 0 ? {min: dMin, max: dMin + 2} : {min: dMin - 1, max: dMin + 1};
    }

    const difference = dMax - dMin;
    const range = niceNum(difference, false);
    const incr = niceNum(range / ((scaleConfig.maxTicks || DEFAULT_MAX_TICKS) - 1), true);
    let max = Math.ceil(dMax / incr) * incr;
    max = isNaN(max) ? 100 : max;
    let min = (startFromZero ? Math.min(0, dMin) : Math.floor(dMin / incr) * incr) || 0;

    /** Workaround for weird ranges */
    if (min === max) {
        min -= 1;
        max += 1;
    }

    return {
        min,
        max,
    };
}

function niceNum(delta: number, round: boolean) {
    const exp = Math.floor(Math.log10(delta));
    const frac = delta / 10 ** exp;

    const niceFrac = round
        ? frac < 1.5
            ? 1
            : frac < 3
            ? 2
            : frac < 7
            ? 5
            : 10
        : frac <= 1
        ? 1
        : frac <= 2
        ? 2
        : frac <= 5
        ? 5
        : 10;

    return niceFrac * 10 ** exp;
}
