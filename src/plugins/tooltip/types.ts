/**
 * Render types
 */
export interface Section {
    name: string;
    title: string;
    sum?: number;
    rows: TooltipRow[];
    max: number;
    index: boolean;
}

export interface RenderOptions {
    empty?: boolean;
    title?: string | Record<string, string>;
    sections: Section[];
}

export type TrackingOptions =
    /** Tracks series only if mouse hovered on series' area */
    | 'area'
    /** Tracks mouse to closest line */
    | 'sticky'
    /** Custom tracking function */
    | ((s: TooltipSection, y: number, options: CustomTrackingFunctionOptions) => number | null);

export type CustomTrackingFunctionOptions = {
    x: number;
    y: number;
    idx: number;
    scale: string;
    series:
        | number[]
        | Int8Array
        | Uint8Array
        | Int16Array
        | Uint16Array
        | Int32Array
        | Uint32Array
        | Uint8ClampedArray
        | Float32Array
        | Float64Array;
    seriesIndices: number[];
};

export type TitleRenderer = string | ((data: RenderOptions) => string);
export type ValueFormatter = (value: string | number | null, precision?: number) => string;
export type PerScale<T> = T | {[scale: string]: T};
export type SortFn = ((s1: TooltipRow, s2: TooltipRow) => number) | undefined;

export interface TooltipData extends RenderOptions {
    anchor: {
        left: number;
        top: number;
    };
}

export type SelectionRange = [
    from: {clientX: number; value: number | null; idx: number} | null,
    to: {clientX: number; value: number | null; idx: number} | null,
];

export interface TooltipState {
    /** Is tooltip pinned */
    pinned: boolean;
    /** X-Coord of selected range to track selections, differ them from single click and provide info to subscribers */
    range: null | SelectionRange;
    /** Is tooltip visible */
    visible: boolean;
    /** Is tooltip mounted */
    mounted: boolean;
    /** Current focused series */
    focusedSeries: null | string;
}

export type TooltipAction = 'init' | 'mount' | 'render' | 'show' | 'hide' | 'pin' | 'unpin' | 'destroy' | 'reset';

export interface TooltipHandlerData<Yagr> {
    state: TooltipState;
    actions: {
        pin: (state: boolean) => void;
        show: () => void;
        hide: () => void;
        dispose: () => void;
        reset: () => void;
    };
    data?: TooltipData;
    yagr: Yagr;
    event: TooltipAction;
}

export type TooltipHandler = (elem: HTMLElement, data: RenderOptions) => void;

export interface TooltipOptions<Yagr> {
    /** Predicate to show/hide tooltip mouseenter */
    show?: boolean | ((y: Yagr, series: number) => boolean);
    /** Tracking policy:
     *  - 'area'    : track by area
     *  - 'sticky'  : finds closest data line
     */
    tracking: PerScale<TrackingOptions>;
    /** Limit for lines in tooltip */
    maxLines: PerScale<number>;
    /** Should calculate focused series in tooltip */
    focus: PerScale<boolean>;
    /** Show sum row */
    sum: PerScale<boolean>;
    /** Sorter */
    sort?: PerScale<SortFn>;
    /** Custom tooltip renderer */
    render: (data: RenderOptions & {yagr: Yagr}) => string;
    /** Hide line in tooltip by predicate */
    omitBy?: (row: TooltipRow) => boolean;

    /**
     * Tooltip pin strategy:
     *  - none  : tooltip can't be pinned
     *  - click : tooltip pins only on click
     *  - drag  : tooltip pins only on drag end
     *  - all   : tooltip pins both on drag and click
     */
    strategy: 'none' | 'click' | 'drag' | 'all';
    /** Value formatter */
    value: PerScale<ValueFormatter>;
    /** Don't render null data points in tooltip */
    hideNulls?: PerScale<boolean>;
    /** Element bound for tooltip (default: document.body) */
    boundClassName?: string;
    /** Element for render tooltip (default: document.body) */
    renderClassName?: string;
    /** Tooltip element className appendix */
    className?: string;

    /** Tooltip x-offset */
    xOffset?: number;
    /** Tooltip y-offset */
    yOffset?: number;

    /** Should stick to series if out of ranges in tracking */
    stickToRanges?: PerScale<boolean>;
    /** Title in tooltip */
    title?: PerScale<TitleRenderer>;
    /** Titles of sections */
    sections?: PerScale<string>;
    /** Is tooltip virtual. Used for custom tooltips, which want to reuse common tooltip */
    virtual?: boolean;
    /** What to do with tooltip on data change
     * - reset : reset tooltip
     * - none  : do nothing
     */
    onUpdate?: 'reset' | 'none' | (() => void);
}

export interface TooltipRow {
    /** id of line */
    id: string;
    /** Name of DataSeries */
    name?: string;
    /** Current Y value of DataSeries */
    value: string | number | null;
    /** Color of DataSeries */
    color: string;
    /** Is cursor over DataSeries */
    active?: boolean;
    /** Custom className */
    className?: string;
    /** Y Axis value */
    y?: number | null;
    /** real Y value on graph */
    displayY: number | null;
    /** Index of series in u.series */
    seriesIdx: number;
    /** Index of row in section */
    rowIdx: number;
    /** Original value in Y scales */
    originalValue?: number | null;
    /** Transformed value */
    transformed?: number | null | string;
    /** Original value before all transformations */
    dataValue?: number | null | string;
}

export interface TooltipSection {
    rows: TooltipRow[];
}
