import {Axis as UAxis, Hooks, DrawOrderKey, Series, Options} from 'uplot';

import Yagr, {YagrMeta} from './index';
import {TooltipOptions} from './plugins/tooltip/types';
import {LegendOptions} from './plugins/legend/legend';
import {CursorOptions} from './plugins/cursor/cursor';

interface ProcessedSeriesData extends Omit<RawSerieData, 'data'> {
    /** Will appear after processing series */
    originalData: DataSeries;

    /** Will appear after processing series if serie values normalized */
    normalizedData?: DataSeries;

    /** Does line have only null values */
    empty?: boolean;

    /** Reference points of series */
    refPoints?: RefPoints;
}
declare module 'uplot' {
    interface Series extends ProcessedSeriesData {
        id: string;
        /** Current focus state */
        _focus?: boolean | null;
        _valuesCount: number;
    }
}


/**
 * Main Yagr chart config
 */
export interface YagrConfig {
    /** Main chart visualization config */
    chart: YagrChartOptions;

    /** Graph title style */
    title: {
        text: string;
        color?: string; // @TODO
        font?: string; // @TODO
        fontSize?: number; // @TODO
    };

    /** Graph subtitle style. @TODO Implement this, currently stuck into uPlot */
    subtitle: {
        text: string;
        color?: string;
        font?: string;
        fontSize?: number;
    };

    /** Chart inline legend configuration */
    legend: LegendOptions;

    /** Config for axes. Determines style and labeling */
    axes: AxisOptions[];

    /** Options for cursor plugin. Determines style, visibility and points render */
    cursor: CursorOptions;

    /** Timestamps */
    timeline: number[];

    /** Tooltip config. Detemines tooltip's behavior */
    tooltip: TooltipOptions;

    /** Chart settings */
    settings: YagrChartSettings;

    /** Grid options (applies to all axes, can be overrided by axis.grid). */
    grid: UAxis.Grid;

    /** Marker visualisation options */
    markers: MarkersOptions;

    /** Scales options */
    scales: Record<string, Scale>;

    /** Raw series data and options */
    data: RawSerieData[];

    /** uPlot hooks */
    hooks: Hooks.Arrays & {
        load?: ((d: {chart: Yagr; meta: YagrMeta}) => void)[];
        onSelect?: ((d: {from: number; to: number}) => void)[];
        error?: ((d: {type: 'processing'; error: Error; yagr: Yagr}) => void)[];
        processed?: ((d: {chart: Yagr; meta: Pick<YagrMeta, 'processTime'>}) => void)[];
        inited?: ((d: {chart: Yagr; meta: Pick<YagrMeta, 'initTime'>}) => void)[];
        dispose?: ((d: Yagr) => void)[];
        resize?: ((d: ResizeObserverEntry[]) => void)[];
    };

    /** uPlot */
    process?: (opts: Options) => Options;
}

/**
 * Main chart visualization config
 */
export interface YagrChartOptions {
    /** Chart visualization type */
    type: ChartTypes;

    /** width (by default: 100% of root) */
    width?: number;

    /** height (by default: 100% of root) */
    height?: number;

    /** padding in css px [top, right, bottom, left] (by default: utils.chart.getPaddingByAxes) */
    padding?: [number, number, number, number];
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

export enum ChartTypes {
    Area = 'area',
    Line = 'line',
    Bars = 'column',
    Dots = 'dots',
}

/** Data values of lines */
export type DataSeries = (number | null)[];

export type RefPoints = {
    max?: number;
    min?: number;
    avg?: number;
    sum?: number;
    count?: number;
};

/**
 * Expected serie config and data format from Chart API
 */
export interface RawSerieData {
    /** Name of serie. Renders in tooltip */
    name: string;

    /** Color of serie */
    color: string;

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
    type?: ChartTypes;

    /** Interpolation type */
    interpolation?: InterpolationSetting;

    /** Cursor options for single serie */
    cursorOptions?: CursorOptions;

    /** Visibility of line */
    visible?: boolean;

    /** Formatter for serie value */
    formatter?: (value: number | null, serie: Series) => string;

    /** Raw data */
    data: DataSeries;

    /** Calculated references points for Yagr plot. If not provided, Yagr calculates them by itself. */
    refPoints?: RefPoints;

    /** Should show series in tooltip, added to implement more flexible patterns of lines hiding */
    showInTooltip?: boolean;

    /** Line precision */
    precision?: number;

    /** Snap dataIdx value (default: closest) */
    snapToValues?: SnapToValue | false;
}

export enum AxisSide {
    Top = 'top',
    Bottom = 'bottom',
    Left = 'left',
    Right = 'right',
}

export interface AxisOptions extends Omit<UAxis, 'side'> {
    /** Config for plotlines */
    plotLines?: PlotLineConfig[];

    /** Axis side */
    side?: AxisSide;

    /** Values decimal precision (default: auto)*/
    precision?: number | 'auto';
}

export interface PlotLineConfig {
    /** Scale of plotLineConfig */
    scale?: string;

    /** Value of plotLine or [from, to] */
    value: number | [number, number];

    /** Color of line */
    color: string;

    /** Line width in px*/
    width?: number;
}

/**
 * Setting for line interpolation
 */
export enum InterpolationSetting {
    Linear = 'linear',
    Left = 'left',
    Right = 'right',
    Smooth = 'smooth',
}


export enum ScaleRange {
    Nice = 'nice',
    Offset = 'offset',
    Auto = 'auto',
}
/**
 * Settings of scale
 */
export interface Scale {
    /** Name of scale */
    name: string;

    /** Scale range visualisation */
    type: ScaleType;

    /** Should normalize (default: false)  */
    normalize?: boolean;

    /** Base of normalization (default: 100)  */
    normalizeBase?: number;

    /** min and max values of scale */
    min?: number | null;
    max?: number | null;

    /** view type (default: nice)*/
    range?: ScaleRange;
    offset?: number;
    /** default: 5 */
    maxTicks?: number;
}

export enum ScaleType {
    Linear = 'linear',
    Logarithmic = 'logarithmic',
}

export enum YagrTheme {
    Light = 'light',
    Dark = 'dark',
}

export type SupportedLocales = 'en' | 'ru';

export interface YagrChartSettings {
    /** Should stack Y values (default: false) */
    stacking?: boolean;

    /** Should chart redraw on container resize (default: true) */
    adaptive?: boolean;

    /** Interpolation options (default: linear) */
    interpolation?: InterpolationSetting;

    /** Values to interpolate */
    interpolationValue?: unknown;

    /** Minial width to catch selection */
    minSelectionWidth?: number; // 15px

    /** Order of drawing. Impacts on zIndex of entity. (axes, series) by default */
    drawOrder?: DrawOrderKey[];

    /** Theme (default: 'light') */
    theme?: YagrTheme;

    /** 1 for milliseconds, 1e-3 for seconds (default: 1) */
    timeMultiplier?: 1 | 1e-3;

    /** Enable native uPlot zoom (default: true) */
    zoom?: boolean;

    /** Locale */
    locale?: SupportedLocales | Record<string, string>;
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

    /** Size of circle point */
    size?: number;

    /** Width of stroke of circle point */
    lineWidth?: number;
}

// Remove after migrating to TS4
export enum UAxisSide {
    Top = 0,
    Right = 1,
    Bottom = 2,
    Left = 3,
}

export enum UAxisAlign {
    Left = 1,
    Right = 2,
}

export enum SnapToValue {
    Left = 'left',
    Right = 'right',
    Closest = 'closest',
}
