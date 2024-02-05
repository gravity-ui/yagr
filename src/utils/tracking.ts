import {TooltipRow} from '../plugins/tooltip/types';

/**
 * Finds index of point in ranges of Y-Axis values.
 * Returns index of starting range when idx < Y <= idx next
 *
 * @param {TooltipRow[]} rows - tooltip section
 * @param {number} value - Y value of cursor
 * @param {boolean} stickToRanges - if true, then always return index of range
 * @returns {number | null}
 */
export const findInRange = (rows: TooltipRow[], value: number, stickToRanges = true): number | null => {
    const positive = value >= 0;
    let max = -Infinity,
        maxIdx = null;
    let min = Infinity,
        minIdx = null;

    const diffs: Array<number | null> = [];
    let result: number | null = null;

    for (let r = rows.length - 1; r >= 0; r--) {
        const row = rows[r];
        const {displayY: y, rowIdx} = row;

        let diff: number | null;

        if (y !== null) {
            if (y > max) {
                max = y;
                maxIdx = row.rowIdx;
            }

            if (y < min) {
                min = y;
                minIdx = row.rowIdx;
            }
        }

        if (y === null || (positive ? y < 0 : y >= 0)) {
            diff = null;
        } else if (positive) {
            diff = value > y ? null : y - value;
        } else {
            diff = value < y ? null : Math.abs(y - value);
        }

        const currentMin = result === null ? Infinity : (diffs[result] as number);
        const nextMin = diff === null ? currentMin : Math.min(currentMin, diff);

        if ((diff !== null && currentMin === diff) || nextMin !== currentMin) {
            result = rowIdx;
        }
    }

    if (result === null && stickToRanges) {
        return value >= max ? maxIdx : value <= min ? minIdx : null;
    }

    return result;
};

/**
 * Finds index of nearest non-null point in range of Y-Axis values
 *
 * @param {TooltipRow[]} rows
 * @param {number} value
 * @returns {number | null}
 */
export const findSticky = (rows: TooltipRow[], value: number): number | null => {
    let nearestIndex;
    let nearestValue;

    let i = 0;
    while (!nearestValue && i < rows.length) {
        const r = rows[i].displayY;
        if (r !== null) {
            nearestIndex = i;
            nearestValue = Math.abs(r - (value || 0));
        }
        i += 1;
    }

    if (!nearestValue || nearestIndex === undefined) {
        return null;
    }

    for (i = nearestIndex + 1; i < rows.length; i++) {
        const v = rows[i].displayY;

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
