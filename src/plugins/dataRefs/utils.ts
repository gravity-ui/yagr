import {DataSeriesExtended} from '../../types';

export function integrate(timestamps: number[], values: DataSeriesExtended) {
    if (timestamps.length < 2) {
        return 0;
    }
    let t0 = timestamps[0];
    let x0 = Number(values[0]);
    let t1: number;
    let x1: number;
    let integral = 0;
    for (let i = 1; i < timestamps.length; i++) {
        x1 = Number(values[i]);
        t1 = timestamps[i];

        // we skip over all non-numeric values in a serie
        // so that all holes and single points (surrounded by
        // empty void) do not add anything to the integral
        if (!Number.isNaN(x1) && !Number.isNaN(x0)) {
            const dt = t1 - t0;
            const dx = x1 - x0;
            const area = ((x0 + dx / 2) * dt) / 1000; // convert milliseconds to seconds
            integral += area;
        }

        t0 = t1;
        x0 = x1;
    }

    return integral;
}

export function count(values: DataSeriesExtended, from = 0, to = values.length - 1) {
    let cnt = 0;
    for (let i = from; i <= to; i++) {
        const val = values[i];
        if (typeof val === 'number') {
            cnt++;
        }
    }

    return cnt;
}

export function getLast(values: DataSeriesExtended, from = 0, to = values.length - 1): number | null {
    for (let i = to; i >= from; i--) {
        const val = values[i];
        if (val !== null && typeof val === 'number') {
            return val;
        }
    }

    return null;
}

export const safeMin = (values: DataSeriesExtended, from = 0, to = values.length - 1) => {
    if (values.length === 0) {
        return null;
    }
    let min = null;

    for (let i = from; i <= to; i++) {
        const v = values[i];

        if (v === null || typeof v === 'string') {
            continue;
        }

        if (min === null || v < min) {
            min = v;
        }
    }

    return min;
};

export const safeMax = (values: DataSeriesExtended, from = 0, to = values.length - 1) => {
    if (values.length === 0) {
        return null;
    }
    let max = null;

    for (let i = from; i <= to; i++) {
        const v = values[i];

        if (v === null || typeof v === 'string') {
            continue;
        }

        if (max === null || v > max) {
            max = v;
        }
    }

    return max;
};

export const safeSum = (values: DataSeriesExtended, from = 0, to = values.length - 1) => {
    if (values.length === 0) {
        return null;
    }

    let sum = null;

    for (let i = from; i <= to; i++) {
        const v = values[i];

        if (v === null || typeof v === 'string') {
            continue;
        }

        if (sum === null) {
            sum = v;
        } else {
            sum += v;
        }
    }

    return sum;
};
