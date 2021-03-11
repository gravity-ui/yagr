import {Series} from 'uplot';
import {SnapToValue} from '../plugins/cursor/cursor';
import {DataSeries} from '../types';


/*
 * Finds index of nearest point in range of Y-Axis values
 * by area matching policy. If stickToRanges = true,
 * returns nearest range index if value out of ranges
 */
export const findInRange = (
    ranges: DataSeries,
    value: number,
    stickToRanges = false,
): number | null => {
    let i = 0;

    if (!stickToRanges && value > (ranges[0] || 0)) {
        return null;
    }

    while (i < ranges.length) {
        const y = ranges[i];

        if (y === null || value > y) {
            return i - 1 >= 0 ? i - 1 : 0;
        }

        i += 1;
    }

    return ranges.length - 1;
};

/* Gets sum of all values of given data index by all series */
export const getSumByIdx = (series: DataSeries[], idx: number) => {
    let sum = 0;
    for (const serie of series) {
        if (serie) {
            sum += serie[idx] || 0;
        }
    }
    return sum;
};

/*
 * Finds index of nearest point in range of Y-Axis values
 * by sticky matching policy
 */
export const findSticky = (
    ranges: DataSeries,
    value: number,
): number | null => {
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
        return 0;
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
    if (value >= 1e18) { return [1e18, 'E']; } else
    if (value >= 1e15) { return [1e15, 'P']; } else
    if (value >= 1e12) { return [1e12, 'T']; } else
    if (value >= 1e9) { return [1e9, 'G']; } else
    if (value >= 1e6) { return [1e6, 'M']; } else
    if (value >= 1e3) { return [1e3, 'K']; }
    return [1, ''];
};

/* Number.toFixed() wihout rounding */
export function toFixed(num: number, fixed: number) {
    if (Number.isInteger(num)) {
        return num + '.' + new Array(fixed).fill('0').join('');
    }

    const [i, fr] = num.toString().split('.');
    return `${i}.${fr.slice(0, fixed)}`;
}

/* Finds non neares null value in data series by given direction */
export function findDataIdx(
    data: DataSeries,
    series: Series,
    idx: number,
    defaultSnapTo: SnapToValue | false = SnapToValue.Closest,
) {
    let nonNullLft = idx, nonNullRgt = idx, i;

    const direction = series.snapToValues === undefined ? defaultSnapTo : series.snapToValues;

    if (direction === false) {
        return idx;
    }

    if (direction === SnapToValue.Left || direction === SnapToValue.Closest) {
        i = idx;
        while (nonNullLft === idx && i-- > 0) {
            if (data[i] !== null) { nonNullLft = i; }
        }
    }

    if (direction === SnapToValue.Right || direction === SnapToValue.Closest) {
        i = idx;
        while (nonNullRgt === idx && i++ < data.length) {
            if (data[i] !== null) { nonNullRgt = i; }
        }
    }

    if (direction === SnapToValue.Left) {
        return nonNullLft;
    }
    if (direction === SnapToValue.Right) {
        return nonNullRgt;
    }
    return nonNullRgt - idx > idx - nonNullLft ? nonNullLft : nonNullRgt;
}
