/* eslint-disable no-nested-ternary */
import UPlot, {Range} from 'uplot';
import {DEFAULT_MAX_TICKS, DEFAULT_Y_AXIS_OFFSET, DEFAULT_SCALE_MIN_RANGE} from '../defaults';
import {ChartTypes, YagrConfig, Scale, ScaleRange, RefPoints} from '../types';

type ScaleType = (min: number, max: number, scfg: Scale, ycfg: YagrConfig) => {min: number; max: number};

export const getScaleRange = (scale: Scale, getRefs: (() => RefPoints | undefined), config: YagrConfig) => {
    if (typeof scale.range === 'function') {
        return scale.range;
    }

    if (scale.range === ScaleRange.Auto) {
        return undefined;
    }

    let rangeFn: ScaleType;

    switch (scale.range) {
        case undefined:
        case ScaleRange.Nice: { rangeFn = niceScale; break; }
        case ScaleRange.Offset: { rangeFn = offsetScale; break; }
        default: throw new Error(`Unknown scale range type ${scale.range}`);
    }

    return (_: UPlot, dataMin: number, dataMax: number): Range.MinMax => {
        const refs = getRefs() || {};
        const dMin = dataMin === null ? refs.min || 0 : dataMin;
        const dMax = dataMax === null ? refs.max || 100 : dataMax;
        let {min, max} = rangeFn(dMin, dMax, scale, config);

        const minRange = scale.minRange || DEFAULT_SCALE_MIN_RANGE;

        if (Math.abs(max - min) < minRange) {
            min -= minRange / 2;
            max += minRange / 2;
        }

        min = typeof scale.min === 'number' ? scale.min : min;
        max = typeof scale.max === 'number' ? scale.max : max;

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


export function offsetScale(
    dataMin: number,
    dataMax: number,
    scaleConfig: Scale,
    config: YagrConfig,
) {
    const startFromZero = dataMin >= 0 && (
        config.chart.type === ChartTypes.Area || config.chart.type === ChartTypes.Bars
    );

    return {
        min: startFromZero
            ? 0
            : Math.round(dataMin - Math.abs(dataMin) * (scaleConfig.offset || DEFAULT_Y_AXIS_OFFSET)),
        max: Math.round(dataMax + Math.abs(dataMax) * (scaleConfig.offset || DEFAULT_Y_AXIS_OFFSET)),
    };
}

/*
 * Implementation nice scale (see https://www.baeldung.com/cs/choosing-linear-scale-y-axis#procedure-for-identifying-scale-and-ticks)
 * with extra options inherited from Solomon stacked area visualization
 * with extra options implementing consistent incr proximity if dataMin ~= dataMax. (16.01.2020)
 * with extra options for small ranges between max and min (27.01.2020)
 */
export function niceScale(
    dataMin: number,
    dataMax: number,
    scaleConfig: Scale,
    config: YagrConfig,
) {
    const startFromZero = dataMin >= 0 && (
        config.chart.type === ChartTypes.Area || config.chart.type === ChartTypes.Bars
    );

    /**
     * This code handles case when scale has user max/min and niceScale's
     * range after usage of given max-min from scale config creates not centered lines
     */
    const dMax = typeof scaleConfig.max === 'number' ? Math.max(scaleConfig.max, dataMax) : dataMax;
    const dMin = startFromZero ? 0 : (
        typeof scaleConfig.min === 'number'
            ? Math.min(scaleConfig.min, dataMin)
            : dataMin
    );

    if (dMin === dMax) {
        return {min: dMin - 1, max: dMin + 1};
    }

    const difference = dMax - dMin;
    const range = niceNum(difference, false);
    const incr = niceNum(range / ((scaleConfig.maxTicks || DEFAULT_MAX_TICKS) - 1), true);
    let min = (startFromZero ? Math.min(0, dMin) : Math.floor(dMin / incr) * incr) || 0;
    let max = (Math.ceil(dMax / incr) * incr) || 100;

    /** Workaround for weird ranges */
    if (min === max) {
        min -= 1; max += 1;
    }

    return {
        min,
        max,
    };
}

function niceNum(delta: number, round: boolean) {
    const exp = Math.floor(Math.log10(delta));
    const frac = delta / 10 ** exp;

    const niceFrac = round ? (
        frac < 1.5 ? 1 :
            frac < 3 ? 2 :
                frac < 7 ? 5 :
                    10
    ) : (
        frac <= 1 ? 1 :
            frac <= 2 ? 2 :
                frac <= 5 ? 5 :
                    10
    );

    return niceFrac * 10 ** exp;
}
