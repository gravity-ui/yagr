import UPlot from 'uplot';
import {theme} from '../defaults';

const DEFAULT_SHADE_COLOR = [0, 0, 0, 0.6];

/**
 * This class implements:
 *  - color parsing from RGBA, HEX or CSS color name
 *  - linear shade/lighten @see https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)#stackoverflow-archive-begin
 */
export default class ColorParser {
    static parseRgba(rgbaColor: string) {
        const m = rgbaColor.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,?\s*(\d+\.?\d*)?\s*\)/);
        return m ? [m[1], m[2], m[3], m[4] || 1].map(Number) : null;
    }

    private context?: HTMLElement;

    parse(color: string) {
        color = color || '000';
        const isVar = color.startsWith('var(--');
        let res = color,
            pure = true,
            prop;
        const ctx = this.context as HTMLElement;

        if (isVar || color.startsWith('--')) {
            pure = false;
            prop = isVar ? color.slice(4, -1) : color;
        } else if (!color.startsWith('#') && !color.startsWith('rgb')) {
            ctx.style.color = color;
            prop = 'color';
            pure = false;
        }

        res = pure ? res : getComputedStyle(ctx).getPropertyValue(prop as string);

        return res;
    }

    setContext(context: HTMLElement) {
        this.context = context;
    }

    rgba(color: number[]) {
        return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    }

    toRgba(color: string, fallback: number[]) {
        return ColorParser.parseRgba(this.parse(color)) || fallback;
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
    const mainColor = ColorParser.parseRgba(color) || DEFAULT_SHADE_COLOR;
    const modified = colorParser.shade(mainColor, shift);

    const colorFn = (u: UPlot, idx: number) => {
        return u.series[idx]._focus === false ? modified : color;
    };

    colorFn.defocusColor = modified;

    return colorFn;
};
