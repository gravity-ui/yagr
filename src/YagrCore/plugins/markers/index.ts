import UPlot, {Plugin} from 'uplot';

import {DEFAULT_X_SCALE, DEFAULT_Y_SCALE} from '../../defaults';
import {MarkersOptions} from '../../types';

const renderCircle = (
    u: UPlot,
    x: number,
    y: number,
    r: number,
    s: number,
    color: string,
    yScale?: string,
) => {
    const {ctx} = u;
    const cx = Math.round(u.valToPos(x, DEFAULT_X_SCALE, true));
    const cy = Math.round(u.valToPos(y, yScale || DEFAULT_Y_SCALE, true));

    ctx.beginPath();
    ctx.arc(cx, cy, r * 2, 0, 2 * Math.PI);

    ctx.fillStyle = color;

    if (s) {
        ctx.lineWidth = s;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    }

    ctx.fill();
};

export function drawMarkersIfRequired(u: UPlot, i: number, i0: number, i1: number) {
    const {color, scale, spanGaps, _valuesCount} = u.series[i];

    if (spanGaps && _valuesCount > 1) {
        return false;
    }

    let j = i0;
    let prev;

    while (j <= i1) {
        const val = u.data[i][j];

        if (val === null) {
            prev = val;
            j++; continue;
        }

        const next = u.data[i][j + 1];

        if (prev === null && next === null) {
            renderCircle(u, u.data[0][j] as number, val, 2, 1, color, scale || DEFAULT_Y_SCALE);
        }
        prev = val;
        j++;
    }

    return undefined;
}

/*
 * This plugin configures points markers
 */
export default function MarkersPlugin(opts: MarkersOptions): Plugin {
    const {size = 4, lineWidth = 2} = opts;

    function drawCircles(u: UPlot, i: number, i0: number, i1: number) {
        const {color, scale} = u.series[i];

        let j = i0;

        while (j <= i1) {
            const val = u.data[i][j];

            if (val !== null) {
                renderCircle(u, u.data[0][j] as number, val, size, lineWidth, color, scale || DEFAULT_Y_SCALE);
            }
            j++;
        }

        return undefined;
    }

    return {
        opts: (_, opts) => {
            opts.series.forEach((s, i) => {
                if (i > 0) {
                    s.points = s.points || {};
                    s.points.show = drawCircles;
                }
            });
        },
        hooks: {},
    };
}
