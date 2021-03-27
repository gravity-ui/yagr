import UPlot from 'uplot';
import {theme} from '../defaults';

/**
 * This class implements:
 *  - color parsing from RGBA, HEX or CSS color name
 *  - linear shade/lighten @see https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)#stackoverflow-archive-begin
 */
export default class ColorParser {
    private _toRgba: (color: string) => number[];
    private context: HTMLElement | null;

    constructor() {
        this.context = null;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d');

        if (ctx === null) {
            throw new Error('Cannot get 2d context');
        }

        /* @NOTE Maybe should memoize this, not sure */
        this._toRgba = (color: string) => {
            color = this.parse(color);

            if (color.startsWith('rgb')) {
                const match = color.match(/\((.+)\)/);
                if (match) {
                    const [r, g, b, a = 1] = match[1].split(',').map((x) => Number(x.trim()));
                    return [r, g, b, a];
                }
            }

            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = color;
            const computed = ctx.fillStyle;
            ctx.fillStyle = '#fff';
            ctx.fillStyle = color;
            if (computed !== ctx.fillStyle) {
                throw new Error('Invalid color');
            }
            ctx.fillRect(0, 0, 1, 1);
            return [... ctx.getImageData(0, 0, 1, 1).data];
        };
    }

    parse(color: string) {
        const isVar = color.startsWith('var(--');
        if (isVar || color.startsWith('--')) {
            if (!this.context) {
                throw new Error('colorParse.context is not ready');
            }
            return getComputedStyle(this.context).getPropertyValue(isVar ? color.slice(4, -1) : color);
        }

        return color;
    }

    setContext(context: HTMLElement) {
        this.context = context;
    }

    rgba(color: number[]) {
        return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    }

    toRgba(color: string, fallback: number[]) {
        try {
            return this._toRgba(color);
        } catch (_) {
            return fallback;
        }
    }

    shade(color: number[], value: number) {
        const [r, g, b, a] = color;
        const direction = value < 0;
        const tOffset = direction ? 0 : 255 * value;
        const transition = direction ? 1 + value : 1 - value;
        const _r = Math.round(r * transition + tOffset);
        const _g = Math.round(g * transition + tOffset);
        const _b = Math.round(b * transition + tOffset);
        return 'rgba(' + _r + ',' + _g + ',' + _b + ',' + a + ')';
    }
}

export const colorParser = new ColorParser();

export const getSerieFocusColors = (color: string) => {
    const shift = theme.SHIFT;
    const defaultColor = [0, 0, 0, 0.6];
    const mainColor = colorParser.toRgba(color, defaultColor);
    const modified = colorParser.shade(mainColor, shift);
    return (u: UPlot, idx: number) => {
        const serie = u.series[idx];
        return serie._focus === false ? modified : color;
    };
};
