import uPlot, {Axis as UAxis, Hooks, DrawOrderKey, Series, Options} from 'uplot';

import Yagr, {YagrMeta, YagrState} from './index';
import {TooltipOptions} from './plugins/tooltip/types';
import {LegendOptions} from './plugins/legend/legend';
import {CursorOptions} from './plugins/cursor/cursor';

interface ProcessedSeriesData extends Omit<RawSerieData, 'data'> {
    /** Will appear after processing series */
    $c: DataSeriesExtended;

    /** Will appear after processing series if serie values normalized */
    normalizedData?: DataSeries;

    /** Does line have only null values */
    empty?: boolean;
}

declare module 'uplot' {
    interface Series extends ProcessedSeriesData {
        id: string;
        color: string;
        name: string;
        /** Real values count */
        count: number;
        /** Values sum */
        sum: number;
        /** Average value */
        avg: number;

        /** Current focus state */
        _focus?: boolean | null;
        /** Is series data transformd */
        _transformed?: boolean;
        _color?: string;
        _modifiedColor?: string;
    }
}

/**
 * Main Yagr chart config
 */
export interface YagrConfig {
    /** Main chart visualization config */
    chart: YagrChartOptions;

    /** Graph title style. To customize other properties use CSS */
    title: {
        text: string;
        fontSize?: number;
    };

    /** Chart inline legend configuration */
    legend: LegendOptions;

    /** Config for axes. Determines style and labeling */
    axes: Record<string, AxisOptions>;

    /** Options for cursor plugin. Determines style, visibility and points render */
    cursor: CursorOptions;

    /** Timestamps */
    timeline: number[];

    /** Tooltip config. Detemines tooltip's behavior */
    tooltip: Partial<TooltipOptions>;

    /** Chart settings */
    settings: YagrChartSettings;

    /** Grid options (applies to all axes, can be overrided by axis.grid). */
    grid: UAxis.Grid;

    /** Marker visualisation options */
    markers: MarkersOptions;

    /** Scales options */
    scales: Record<string, Scale>;

    /** Raw series data and options */
    series: RawSerieData[];

    /** uPlot hooks + Yagr hooks */
    hooks: YagrHooks;

    /** Yagr data processing options */
    processing?: ProcessingSettings;

    /** uPlot options transform method */
    editUplotOptions?: (opts: Options) => Options;
}

export type MinimalValidConfig = Partial<YagrConfig> & {
    timeline: Number[];
    series: RawSerieData[];
};

type Handler<A, B = unknown, C = unknown, D = unknown> = Array<(a: A, b: B, c: C, d: D) => void>;

export interface YagrHooks extends Hooks.Arrays {
    load?: Handler<{chart: Yagr; meta: YagrMeta}>;
    onSelect?: Handler<{from: number; to: number; chart: Yagr}>;
    error?: Handler<{type: YagrState['stage']; error: Error; yagr: Yagr}>;
    processed?: Handler<{chart: Yagr; meta: Pick<YagrMeta, 'processTime'>}>;
    inited?: Handler<{chart: Yagr; meta: Pick<YagrMeta, 'initTime'>}>;
    dispose?: Handler<Yagr>;
    resize?: Handler<ResizeObserverEntry[]>;
}

export interface ProcessingInterpolation {
    /** Interpolation type */
    /**
     * - previous: takes previous existing value
     * - left: takes previous existing value except for last point
     * - next: takes next existing value
     * - right: takes next existing value except for first point
     * - linear: calcs value by linear interpolation
     * - closes: takes closes existing value
     */
    type: 'previous' | 'left' | 'next' | 'right' | 'linear' | 'closest';

    /** Cursor and tooltip snapToValue option */
    snapToValues?: SnapToValue | false;

    /** Values to interpolate */
    value?: unknown;
}

export interface ProcessingSettings {
    /** Should interpolate missing data (default: undefined) */
    interpolation?: ProcessingInterpolation;
    /** Values to map as nulls as key-value object */
    nullValues?: Record<string, string | null>;
}

/**
 * Main chart visualization config
 */
export interface YagrChartOptions {
    /** Chart visualization type */
    type: ChartType;

    /** width (by default: 100% of root) */
    width?: number;

    /** height (by default: 100% of root) */
    height?: number;

    /** padding in css px [top, right, bottom, left] (by default: utils.chart.getPaddingByAxes) */
    padding?: [number, number, number, number];

    /** point size (default: 4px) */
    pointsSize?: number;
}

/** Options how to redraw chart */
export interface RedrawOptions {
    /** Should redraw series paths */
    series?: boolean;

    /** Should redraw axes */
    axes?: boolean;

    /** Should redraw plotLines */
    plotLines?: boolean;
}

export type ChartType = 'area' | 'line' | 'column' | 'dots';

/** Data values of lines */
export type DataSeriesExtended = (number | string | null)[];
export type DataSeries = (number | null)[];

/**
 * Expected serie config and data format from Chart API
 */
export interface RawSerieData {
    /** Name of serie. Renders in tooltip */
    name?: string;

    /** Color of serie */
    color?: string;

    /** Unique ID */
    id?: string;

    /** Width of line (line type charts) */
    width?: number;

    /** Color of line (area type charts) */
    lineColor?: string;

    /** Color of line over area (area type charts) */
    lineWidth?: number;

    /** Should join paths over null-points */
    spanGaps?: boolean;

    /** Scale of series */
    scale?: string;

    /** Visualisation type */
    type?: ChartType;

    /** Interpolation type */
    interpolation?: InterpolationSetting;

    /** Cursor options for single serie */
    cursorOptions?: CursorOptions;

    /** Visibility of line */
    visible?: boolean;

    /** Formatter for serie value */
    formatter?: (value: string | number | null, serie: Series) => string;

    /** Raw data */
    data: DataSeriesExtended;

    /** Should show series in tooltip, added to implement more flexible patterns of lines hiding */
    showInTooltip?: boolean;

    /** Line precision */
    precision?: number;

    /** Snap dataIdx value (default: closest) */
    snapToValues?: SnapToValue | false;

    /** Title of serie */
    title?: string | ((sIdx: number) => string);

    /** Series data transformation */
    transform?: (val: number | null | string, series: DataSeries[], idx: number) => number | null;

    /** Stacking groups */
    stackGroup?: number;
}

export type AxisSide = 'top' | 'bottom' | 'left' | 'right';

export interface AxisOptions extends Omit<UAxis, 'side'> {
    /** Config for plotlines */
    plotLines?: PlotLineConfig[];

    /** Axis side */
    side?: AxisSide;

    /** Values decimal precision (default: auto) */
    precision?: number | 'auto';
}

export interface PlotLineConfig {
    /** Scale of plotLineConfig */
    scale?: string;

    /** Value of plotLine or [from, to] on given scale */
    value: number | [number, number];

    /** Color of line */
    color: string;

    /** Line width in px/devicePixelRatio */
    width?: number;
}

/** Setting for line interpolation type */
export type InterpolationSetting = 'linear' | 'left' | 'right' | 'smooth';

/** Setting for scale range type */
export type ScaleRange = 'nice' | 'offset' | 'auto';

/**
 * Settings of scale
 */
export interface Scale {
    /** Scale range visualisation (default: linear) */
    type?: ScaleType;

    /** Should stack Y values (default: false) */
    stacking?: boolean;

    transform?: (v: number | null, series: DataSeries[], idx: number) => number;

    /** Should normalize (default: false)  */
    normalize?: boolean;

    /** Base of normalization (default: 100)  */
    normalizeBase?: number;

    /** min and max values of scale */
    min?: number | null;
    max?: number | null;

    /** min scale range (default: 0.01) */
    minRange?: number;

    /** view type (default: nice) */
    range?: ScaleRange | ((u: uPlot, min: number, max: number, cfg: YagrConfig) => [min: number, max: number]);
    offset?: number;
    /** default: 5 */
    maxTicks?: number;
}

export type ScaleType = 'linear' | 'logarithmic';
export type YagrTheme = 'light' | 'dark';
export type SupportedLocales = 'en' | 'ru';
export type DrawKey = 'plotLines' | DrawOrderKey.Axes | DrawOrderKey.Series;

export interface YagrChartSettings {
    /** Should chart redraw on container resize (default: true) */
    adaptive?: boolean;

    /** Interpolation options (default: linear) */
    interpolation?: InterpolationSetting;

    /** Minial width to catch selection */
    minSelectionWidth?: number; // 15px

    /** Order of drawing. Impacts on zIndex of entity. (axes, series) by default */
    drawOrder?: DrawKey[];

    /** Theme (default: 'light') */
    theme?: YagrTheme;

    /** 1 for milliseconds, 1e-3 for seconds (default: 1) */
    timeMultiplier?: 1 | 1e-3;

    /** Enable native uPlot zoom (default: true) */
    zoom?: boolean;

    /** Locale */
    locale?: SupportedLocales | Record<string, string>;

    /** Debounce timer for ResizeObserver to trigger: (default 100 ms) */
    resizeDebounceMs?: number;
}

/**
 * Options for chart grid
 */
export interface GridOptions {
    /** Show/hide grid */
    show?: boolean;

    /** Stroke color of grid */
    color?: string;

    /** Stroke width of grid */
    width?: number;

    /** Dash style array for CanvasRenderingContext2D['setLineDash']  */
    dash?: number[];
}

export interface MarkersOptions {
    /** Show markers or not */
    show?: boolean;

    /** Size of circle point (default: 2px) */
    size?: number;

    /** Width of stroke of circle point (default: 1px) */
    strokeWidth?: number;

    /** Stroke color of marker (default: #ffffff) */
    strokeColor?: string;
}

export type SnapToValue = 'left' | 'right' | 'closest';
