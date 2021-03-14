
import uPlot, {Padding} from 'uplot';
import {YagrTheme} from './types';

export const DEFAULT_X_SERIE_NAME = 'date';
export const DEFAULT_X_SCALE = 'x';
export const DEFAULT_Y_SCALE = 'y';
export const DEFAULT_FOCUS_ALPHA = 0.3;
export const DEFAULT_CANVAS_PIXEL_RATIO = window.devicePixelRatio || 1;
export const DEFAULT_MAX_TICKS = 5;
export const DEFAULT_Y_AXIS_OFFSET = 0.05;

export const GRID_LIGHT = {show: true, stroke: 'rgba(0, 0, 0, 0.105)', width: 1};
export const GRID_DARK = {show: true, stroke: 'rgba(255, 255, 255, 0.23)', width: 1};

export const DEFAULT_AXIS_FONT_SIZE = 11;
export const AXIS_LABEL_FONT = 'normal 11px Lucida Grande, Arial, Helvetica, sans-serif';
export const AXIS_VALUES_FONT = '11px Lucida Grande, Arial, Helvetica, sans-serif';

export const AXIS_STROKE_LIGHT = 'rgba(0, 0, 0, 0.5)';
export const AXIS_STROKE_DARK = 'rgba(255, 255, 255, 0.5)';

export const BACKGROUND_COLOR_LIGHT = '#ffffff';
export const BACKGROUND_COLOR_DARK = '#2d2c33';

export const X_AXIS_TICKS_LIGHT = {size: 8, ...GRID_LIGHT};
export const X_AXIS_TICKS_DARK = {size: 8, ...GRID_DARK};
export const Y_AXIS_TICKS_LIGHT = {size: 6, ...GRID_LIGHT};
export const Y_AXIS_TICKS_DARK = {size: 6, ...GRID_DARK};

export const Y_AXIS_TICK_GAP = 6;
export const DEFAULT_Y_AXIS_SIZE = 12;
export const DEFAULT_Y_AXIS_PADDING = 12;
export const DEFAULT_Y_AXIS_LABEL_PADDING = 2;
export const Y_AXIS_SIZE = (self: uPlot, values: string[], axisIdx: number) => {
    if (!values) {
        return DEFAULT_Y_AXIS_SIZE;
    }

    const longesValue = values.reduce((l, c) => l.length > c.length ? l : c);
    const {ctx} = self;
    ctx.save();
    const axis = self.axes[axisIdx];

    ctx.font = axis.font ? axis.font[0] : AXIS_VALUES_FONT;
    const {width: textSize} = ctx.measureText(longesValue);
    ctx.restore();

    let labelSize = 0;
    if (axis.label) {
        labelSize = axis.labelSize || DEFAULT_AXIS_FONT_SIZE;

        ctx.font = axis.labelFont ? axis.labelFont[0] : AXIS_LABEL_FONT;
        const {fontBoundingBoxAscent: size} = ctx.measureText(axis.label);
        labelSize = size;
        ctx.restore();
    }

    return labelSize
        ? textSize / DEFAULT_CANVAS_PIXEL_RATIO + labelSize / DEFAULT_CANVAS_PIXEL_RATIO + DEFAULT_Y_AXIS_LABEL_PADDING
        : textSize / DEFAULT_CANVAS_PIXEL_RATIO + DEFAULT_Y_AXIS_PADDING;
};
export const Y_AXIS_LABEL_SIZE = 11;

export const X_AXIS_TICK_GAP = 6;
export const X_AXIS_SIZE = 32;
export const X_AXIS_SPACE = 80;  
export const X_AXIS_INCRS = [
    // seconds divisors (# os ms)
    1,
    10,
    50,
    100,
    200,
    500,
    // minute divisors
    1000,
    5000,
    10000,
    15000,
    30000,
    // hour divisors
    60000,
    60000 * 5,
    60000 * 10,
    60000 * 30,
    // day divisors
    3600000,
    3600000 * 2,
    3600000 * 6,
    3600000 * 12,
    // month divisors
    86400000,
    86400000 * 2,
    86400000 * 3,
    86400000 * 5,
    86400000 * 10,
    86400000 * 15,
    86400000 * 30,
    86400000 * 60,
    86400000 * 120,
    86400000 * 180,
    // year divisors
    31536000000,
    31536000000 * 2,
    31536000000 * 5,
    31536000000 * 10,
];

export const BARS_DRAW_FACTOR = 0.5;
export const BARS_DRAW_MAX = 100;

export const PADDING_LEFT: Padding = [14, 14, 0, 4];
export const PADDING_RIGHT: Padding = [14, 0, 0, 14];
export const PADDING_BOTH: Padding = [14, 14, 0, 14];

export const SERIE_COLOR = 'rgba(0, 0, 0, 1)';
export const SERIE_LINE_WIDTH = 2;
export const SERIE_AREA_BORDER_COLOR = 'rgba(0, 0, 0, 0.2)';
export const SERIE_AREA_BORDER_WIDTH = 1;

export const MARKER_DIAMETER = 8;
export const CURSOR_STYLE = '1px solid #ffa0a0';

export const MIN_SELECTION_WIDTH = 15;

const LIGHTEN_COLOR_SHIFT = 0.68;
const DARKEN_COLOR_SHIFT = -0.6;
class ThemedDefaults {
    theme?: YagrTheme;

    AXIS_STROKE = AXIS_STROKE_LIGHT;
    GRID = GRID_LIGHT;

    X_AXIS_TICKS = X_AXIS_TICKS_LIGHT;
    Y_AXIS_TICKS = Y_AXIS_TICKS_LIGHT;

    BACKGROUND_COLOR = BACKGROUND_COLOR_LIGHT;

    constructor(theme: YagrTheme = YagrTheme.Light) {
        this.setTheme(theme);
    }

    setTheme(theme: YagrTheme) {
        this.theme = theme;
        this.init();
    }

    init() {
        switch (this.theme) {
            case undefined:
            case YagrTheme.Light: {
                this.AXIS_STROKE = AXIS_STROKE_LIGHT;
                this.GRID = GRID_LIGHT;
                this.X_AXIS_TICKS = X_AXIS_TICKS_LIGHT;
                this.Y_AXIS_TICKS = Y_AXIS_TICKS_LIGHT;
                this.BACKGROUND_COLOR = BACKGROUND_COLOR_LIGHT;
                break;
            }
            case YagrTheme.Dark: {
                this.AXIS_STROKE = AXIS_STROKE_DARK;
                this.GRID = GRID_DARK;
                this.X_AXIS_TICKS = X_AXIS_TICKS_DARK;
                this.Y_AXIS_TICKS = Y_AXIS_TICKS_DARK;
                this.BACKGROUND_COLOR = BACKGROUND_COLOR_DARK;
                break;
            }
            default: {
                throw new Error(`Yagr: Unsupported theme: ${this.theme}`);
            }
        }
    }

    getFocusColorShift() {
        return this.theme === YagrTheme.Light ? LIGHTEN_COLOR_SHIFT : DARKEN_COLOR_SHIFT;
    }
}

export const THEMED = new ThemedDefaults();
