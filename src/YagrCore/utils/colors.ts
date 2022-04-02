import UPlot, {Series} from 'uplot';
import type Yagr from '../index';

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

        const pColor = ctx.style.color;

        if (isVar || color.startsWith('--')) {
            pure = false;
            prop = isVar ? color.slice(4, -1) : color;
        } else if (!color.startsWith('#') && !color.startsWith('rgb')) {
            ctx.style.color = color;
            prop = 'color';
            pure = false;
        }

        res = pure ? res : getComputedStyle(ctx).getPropertyValue(prop as string);
        ctx.style.color = pColor;
        return res;
    }

    setContext(context: HTMLElement) {
        this.context = context;
    }

    rgba(color: number[]) {
        return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    }

    toRgba(color: string, fallbackRgba: number[]) {
        return ColorParser.parseRgba(this.parse(color)) || fallbackRgba;
    }

    shade([r, g, b, a]: number[], value: number) {
        const direction = value < 0;
        const tOffset = direction ? 0 : 255 * value;
        const transition = direction ? 1 + value : 1 - value;
        const _r = Math.round(r * transition + tOffset);
        const _g = Math.round(g * transition + tOffset);
        const _b = Math.round(b * transition + tOffset);
        return 'rgba(' + _r + ',' + _g + ',' + _b + ',' + a + ')';
    }
}

export const getFocusedColor = (y: Yagr, seriesIdx: number) => {
    const shift = y.utils.theme.SHIFT;
    const s = y.uplot.series[seriesIdx];
    const mainColor = ColorParser.parseRgba(s.color) || DEFAULT_SHADE_COLOR;
    return y.utils.colors.shade(mainColor, shift);
};

export const getSerieFocusColors = (y: Yagr, field: keyof Series) => {
    return (u: UPlot, idx: number) => {
        const s = u.series[idx];
        return s._focus === false ? s.getFocusedColor(y, idx) : (s[field] as string);
    };
};
