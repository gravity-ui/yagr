import {Series} from 'uplot';
import {DataSeriesExtended, DataSeries, SnapToValue, ProcessingSettings} from '../types';

/**
 * Finds index of point in ranges of Y-Axis values.
 * Returns index of starting range when idx < Y <= idx next
 *
 * @param {DataSeries} ranges - list or values in ranges, represent Y values
 * @param {number} value - Y value of cursor
 * @param {boolean} stickToRanges - if true, then always return index of range
 * @returns {number | null}
 */
export const findInRange = (ranges: DataSeries, value: number, stickToRanges = true): number | null => {
    let i = 0;
    let prev = 0;
    let isFirst = true;
    let allNulls = true;

    while (i < ranges.length) {
        const y = ranges[i];

        if (y === null) {
            i += 1;
            continue;
        }

        allNulls = false;

        if (value > y) {
            return isFirst ? (stickToRanges ? i : null) : prev;
        }

        prev = i;
        isFirst = false;

        i += 1;
    }

    return allNulls ? null : prev;
};

/* Gets sum of all values of given data index by all series */
export const getSumByIdx = (series: DataSeriesExtended[], idx: number) => {
    let sum = 0;
    for (const serie of series) {
        const value = serie[idx];
        sum += typeof value === 'number' ? value : 0;
    }
    return sum;
};

/**
 * Finds index of nearest non-null point in range of Y-Axis values
 *
 * @param {DataSeries} ranges
 * @param {number} value
 * @returns {number | null}
 */
export const findSticky = (ranges: DataSeries, value: number): number | null => {
    let nearestIndex;
    let nearestValue;

    let i = 0;
    while (!nearestValue && i < ranges.length) {
        const r = ranges[i];
        if (r !== null) {
            nearestIndex = i;
            nearestValue = Math.abs(r - (value || 0));
        }
        i += 1;
    }

    if (!nearestValue || nearestIndex === undefined) {
        return null;
    }

    for (i = nearestIndex + 1; i < ranges.length; i++) {
        const v = ranges[i];

        if (v === null) {
            continue;
        }

        const diff = Math.abs(v - value);

        if (nearestValue > diff) {
            nearestValue = diff;
            nearestIndex = i;
        }
    }

    return nearestIndex;
};

export const getUnitSuffix = (value: number): [number, string] => {
    if (value >= 1e18) {
        return [1e18, 'E'];
    } else if (value >= 1e15) {
        return [1e15, 'P'];
    } else if (value >= 1e12) {
        return [1e12, 'T'];
    } else if (value >= 1e9) {
        return [1e9, 'G'];
    } else if (value >= 1e6) {
        return [1e6, 'M'];
    } else if (value >= 1e3) {
        return [1e3, 'K'];
    }
    return [1, ''];
};

/* Number.toFixed() wihout rounding */
export function toFixed(num: number, fixed: number) {
    if (fixed === 0) {
        return parseInt(num as unknown as string);
    }

    if (Number.isInteger(num)) {
        return num + '.' + '0'.repeat(fixed);
    }

    const [int, frac] = num.toString().split('.');
    return frac.length >= fixed ? `${int}.${frac.slice(0, fixed)}` : `${int}.${frac}${'0'.repeat(fixed - frac.length)}`;
}

/* Finds non neares null value in data series by given direction */
export function findDataIdx(
    data: DataSeriesExtended,
    series: Series,
    idx: number,
    defaultSnapTo: SnapToValue | false = SnapToValue.Closest,
    trimValue: unknown = null,
) {
    let corL = idx,
        corR = idx;

    const direction = series.snapToValues === undefined ? defaultSnapTo : series.snapToValues;

    if (direction === false) {
        return idx;
    }

    if (direction === SnapToValue.Left || direction === SnapToValue.Closest) {
        for (let i = idx - 1; i >= 0; i--) {
            if (data[i] !== trimValue) {
                corL = i;
                break;
            }
        }
    }

    if (direction === SnapToValue.Right || direction === SnapToValue.Closest) {
        for (let i = idx + 1; i < data.length; i++) {
            if (data[i] !== trimValue) {
                corR = i;
                break;
            }
        }
    }

    if (direction === SnapToValue.Left) {
        return corL;
    }
    if (direction === SnapToValue.Right) {
        return corR;
    }

    return corR - idx > idx - corL ? corL : corR;
}

/*
 * Interpolation function
 */
export const interpolateImpl = (
    timeline: number[],
    y1: number | null,
    y2: number | null,
    x1: number,
    x2: number,
    xIdx: number,
    type: 'left' | 'right' | 'linear' = 'linear',
) => {
    let result = null;
    const x = timeline[xIdx];

    switch (type) {
        case 'linear': {
            if (y1 === null || y2 === null) {
                return null;
            }

            result = y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);

            if (isNaN(result) || Math.abs(result) === Infinity) {
                result = null;
            }
            break;
        }
        case 'left': {
            result = y1;
            break;
        }
        case 'right': {
            result = y2;
            break;
        }
    }
    return result;
};

export const genId = () => Math.random().toString(34).slice(2);

/**
 * Processing data series to:
 *  1. Find missing data and interpolate these points
 *  2. Find string special values to convert them to nulls
 *
 * @param {DataSeriesExtended[]} series
 * @param {number[]} timeline
 * @param {ProcessingSettings} settings
 * @returns {DataSeries[]}
 */
export const preprocess = (
    series: DataSeriesExtended[],
    timeline: number[],
    settings: ProcessingSettings,
): DataSeries[] => {
    const result = [];
    const nullValues = settings.nullValues || {};
    const interpolation = settings.interpolation;
    for (let sIdx = 0; sIdx < series.length; sIdx++) {
        const line = series[sIdx];
        const resultLine = [];

        let iGroup = [];
        let y1 = null,
            y2 = null,
            x1,
            x2;

        for (let idx = 0; idx < line.length; idx++) {
            let val = line[idx];

            if (interpolation && val === interpolation.value) {
                iGroup.push(idx);
                continue;
            }

            if (nullValues[val as string]) {
                val = null;
            }

            if (iGroup.length) {
                y2 = val;
                x2 = timeline[idx];
                for (const iIdx of iGroup) {
                    resultLine[iIdx] = interpolateImpl(
                        timeline,
                        y1 as number | null,
                        y2 as number | null,
                        x1 || timeline[0],
                        x2 || timeline[timeline.length - 1],
                        iIdx,
                        interpolation && interpolation.type,
                    );
                }
                iGroup = [];
            }

            y1 = val;
            x1 = timeline[idx];
            resultLine.push(val);
        }

        y2 = null;

        if (iGroup.length) {
            for (const iIdx of iGroup) {
                resultLine.push(
                    interpolateImpl(
                        timeline,
                        y1 as number | null,
                        y2 as number | null,
                        x1 || timeline[0],
                        x2 || timeline[timeline.length - 1],
                        iIdx,
                        interpolation && interpolation.type,
                    ),
                );
            }
        }
        result.push(resultLine);
    }

    return result as DataSeries[];
};

export const exec = <T, ArgsT extends unknown[]>(s: T | ((...a: ArgsT) => T), ...args: ArgsT) => {
    return typeof s === 'function' ? (s as (...a: ArgsT) => T)(...args) : s;
};
