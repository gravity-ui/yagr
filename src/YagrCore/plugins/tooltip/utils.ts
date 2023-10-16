import {AlignedData} from 'uplot';

export function getOptionValue<T>(option: T | {[key in string]: T}, scale: string): T {
    return (typeof option === 'object' ? (option as {[key in string]: T})[scale] : option) as T;
}

export function escapeHTML(html: string) {
    const elem = document.createElement('span');

    elem.innerText = html;
    return elem.innerHTML;
}

type FindClosestAreaOptions = {
    /** cursor X */
    x: number;
    /** cursor Y */
    y: number;
    series: AlignedData;
};

export const findClosestLines = ({x, y, series}: FindClosestAreaOptions) => {
    const [timeline, ...areas] = series as number[][];

    let i1 = 0,
        i2 = 0;

    // finding current timeline
    timeline.forEach((t, i) => {
        if (i1 || i2) {
            return;
        }
        if (t === x) {
            i1 = i2 = i;
            return;
        }
        if (t > x) {
            i1 = i - 1;
            i2 = i;
        }
    });

    let minLower = Number.MAX_VALUE,
        minHigher = Number.MAX_VALUE;
    let iLower: number | null = null,
        iHigher: number | null = null;

    const x1 = timeline[i1];
    const x2 = timeline[i2];

    areas
        .map((a) => [a[i1], a[i2]])
        .forEach(([y1, y2], i) => {
            // finding intersection between line and vertical X = x
            const k = (y2 - y1) / (x2 - x1);
            const b = y1 - k * x1;
            const yInter = k * x + b;

            const distance = Math.abs(y - yInter);

            if (yInter < y && distance <= minLower) {
                minLower = distance;
                iLower = i;
            } else if (yInter >= y && distance <= minHigher) {
                minHigher = distance;
                iHigher = i;
            }
        });

    return {
        lower: {index: iLower, distance: minLower},
        higher: {index: iHigher, distance: minHigher},
    };
};
