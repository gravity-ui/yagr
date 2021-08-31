import uPlot, {Padding} from 'uplot';
import {YagrTheme} from './types';
import {colorParser} from './utils/colors';

export const DEFAULT_X_SERIE_NAME = 'date';
export const DEFAULT_X_SCALE = 'x';
export const DEFAULT_Y_SCALE = 'y';
export const DEFAULT_FOCUS_ALPHA = 0.3;
export const DEFAULT_CANVAS_PIXEL_RATIO = typeof window === 'undefined' ? 1 : window.devicePixelRatio;
export const DEFAULT_MAX_TICKS = 5;
export const DEFAULT_Y_AXIS_OFFSET = 0.05;
export const DEFAULT_SCALE_MIN_RANGE = 0.01;

export const DEFAULT_SYNC_KEY = 'sync';

export const LIGHT_DEFAULT_LINE_COLOR = '#222222';
export const DARK_DEFAULT_LINE_COLOR = '#eeeeee';

export const DEFAULT_AXIS_FONT_SIZE = 11;
export const AXIS_LABEL_FONT = 'normal 11px Lucida Grande, Arial, Helvetica, sans-serif';
export const AXIS_VALUES_FONT = '11px Lucida Grande, Arial, Helvetica, sans-serif';

export const Y_AXIS_TICK_GAP = 6;
export const DEFAULT_Y_AXIS_SIZE = 12;
export const DEFAULT_Y_AXIS_PADDING = 12;
export const DEFAULT_Y_AXIS_LABEL_PADDING = 2;
export const Y_AXIS_SIZE = (self: uPlot, values: string[], axisIdx: number) => {
    if (!values) {
        return DEFAULT_Y_AXIS_SIZE;
    }

    const longesValue = values.reduce((l, c) => (l.length > c.length ? l : c));
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

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const YEAR = DAY * 365;

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
    SECOND,
    SECOND * 2,
    SECOND * 5,
    SECOND * 10,
    SECOND * 15,
    SECOND * 30,
    // hour divisors
    MINUTE,
    MINUTE * 5,
    MINUTE * 10,
    MINUTE * 30,
    // day divisors
    HOUR,
    HOUR * 2,
    HOUR * 3,
    HOUR * 4,
    HOUR * 6,
    HOUR * 12,
    // month divisors
    DAY,
    DAY * 2,
    DAY * 3,
    DAY * 5,
    DAY * 10,
    DAY * 15,
    DAY * 30,
    DAY * 60,
    DAY * 120,
    DAY * 180,
    // year divisors
    YEAR,
    YEAR * 2,
    YEAR * 5,
    YEAR * 10,
];

export const TYPES_ORDER = ['dots', 'line', 'area', 'column'];

export const BARS_DRAW_FACTOR = 0.5;
export const BARS_DRAW_MAX = 100;

export const PADDING_LEFT: Padding = [14, 14, 0, 4];
export const PADDING_RIGHT: Padding = [14, 4, 0, 14];
export const PADDING_BOTH: Padding = [14, 4, 0, 4];

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

    constructor(theme: YagrTheme = 'light') {
        this.setTheme(theme);
    }

    setTheme(theme: YagrTheme) {
        this.theme = theme;
    }

    get GRID() {
        return {show: true, stroke: colorParser.parse('--yagr-grid'), width: 1};
    }

    get X_AXIS_TICKS() {
        return {size: 8, ...this.GRID};
    }

    get Y_AXIS_TICKS() {
        return {size: 6, ...this.GRID};
    }

    get AXIS_STROKE() {
        return colorParser.parse('--yagr-axis-stroke');
    }

    get BACKGROUND() {
        return colorParser.parse('--yagr-background');
    }

    get SHIFT() {
        return this.theme === 'light' ? LIGHTEN_COLOR_SHIFT : DARKEN_COLOR_SHIFT;
    }

    get DEFAULT_LINE_COLOR() {
        return this.theme === 'light' ? LIGHT_DEFAULT_LINE_COLOR : DARK_DEFAULT_LINE_COLOR;
    }
}

export const theme = new ThemedDefaults();

export const TOOLTIP_Y_OFFSET = 24;
export const TOOLTIP_X_OFFSET = 24;
export const TOOLTIP_DEFAULT_MAX_LINES = 10;
