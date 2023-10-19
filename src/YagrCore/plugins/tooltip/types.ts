import {AlignedData} from 'uplot';
import Yagr from '../../index';
import {ProcessingInterpolation} from 'src/types';

type CustomTrackingFunctionOptions = {
    x: number;
    y: number;
    idx: number;
    scale: string;
    series: AlignedData;
    interpolation?: ProcessingInterpolation;
};

export type TrackingOptions =
    /** Tracks serie only if mouse hovered on series' area */
    | 'area'
    /** Tracks mouse to closest line */
    | 'sticky'
    /** Custom tracking function */
    | ((s: TooltipSection, y: number, options: CustomTrackingFunctionOptions) => number | null);
export interface TooltipRenderOpts {
    /** Tooltip option */
    options: TooltipOptions;
    /** Current X-Axis value */
    x: number;
    /** Sum aff all rows */
    sum?: string;
    /** Lines count */
    lines: number;
    /** Is tooltip pinned */
    pinned: boolean;
}

export interface TooltipScale {
    scale: string;
    rows: TooltipRow[];
    sum?: number;
}
export interface TooltipRenderOptions {
    scales: TooltipScale[];
    options: TooltipOptions;
    x: number;
    state: TooltipState;
    yagr: Yagr;
    defaultRender: TooltipOptions['render'];
}

export type TitleRenderer = string | ((data: TooltipRenderOptions) => string);
export type ValueFormatter = (value: string | number | null, precision?: number) => string;
export type PerScale<T> = T | {[scale: string]: T};
export type SortFn = ((s1: TooltipRow, s2: TooltipRow) => number) | undefined;

export interface TooltipData extends Omit<TooltipRenderOptions, 'state' | 'yagr' | 'defaultRender'> {
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
    /** X-Coord of selected range to track selections, differ them from single click and provide info to subsribers */
    range: null | SelectionRange;
    /** Is tooltip visible */
    visible: boolean;
    /** Is tooltip mounted */
    mounted: boolean;
    /** Current focused series */
    focusedSeries: null | string;
}

export type TooltipAction = 'init' | 'mount' | 'render' | 'show' | 'hide' | 'pin' | 'unpin' | 'destroy' | 'reset';

export interface TooltipHandlerData {
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

export type TooltipHandler = (elem: HTMLElement, data: TooltipHandlerData) => void;

export interface TooltipOptions {
    /** Predicate to show/hide tooltip on setCursor */
    show?: boolean | ((y: Yagr) => boolean);
    /** Tracking policy:
     *  - 'area'    : track by area
     *  - 'sticky'  : finds closest dataline
     */
    tracking: PerScale<TrackingOptions>;
    /** Limit for lines in tooltip */
    maxLines: PerScale<number>;
    /** Should highlight focused line in tooltip */
    highlight: PerScale<boolean>;
    /** Show sum row */
    sum: PerScale<boolean>;
    /** Sorter */
    sort?: PerScale<SortFn>;
    /** Custom tooltip renderer */
    render: (data: TooltipRenderOptions) => string;
    /** Hide line in tooltip by predicate */
    omitBy?: (row: TooltipRow) => boolean;
    /** @deprecated Is tooltip pinable */
    pinable: boolean;
    /**
     * Tooltip pin strategy:
     *  - none : tooltip is not pinable
     *  - pin  : tooltip is pinable only on click
     *  - drag : tooltip is pinable on drag
     *  - all  : tooltip is pinable on drag and click
     */
    strategy: 'none' | 'pin' | 'drag' | 'all';
    /** Value formatter */
    value: PerScale<ValueFormatter>;
    /** Show DataSeries index */
    showIndicies: PerScale<boolean>;
    /** Don't render null data points in tooltip */
    hideNoData?: PerScale<boolean>;
    /** Show percent row in tooltip */
    percent?: PerScale<boolean>;
    /** Element bound for tooltip (default: document.body) */
    boundClassName?: string;
    /** Element for render tooltip (default: document.body) */
    renderClassName?: string;
    /** Value precision (default: 2) */
    precision?: PerScale<number>;
    /** Tooltip element className appendix */
    className?: string;

    /** Tooltip x-offset */
    xOffset?: number;
    /** Tooltip y-offset */
    yOffset?: number;
    /** Should stick to series if out of ranges in tracking */
    stickToRanges?: PerScale<boolean>;
    /** Title of tooltip and scale sections */
    title?: PerScale<TitleRenderer>;
    /** Titles of scales of scale sections */
    scales?: PerScale<string>;
    /** Is tooltip virtual. Used for custom tooltips, which want to reuse common tooltip */
    virtual?: boolean;
    /** What to do with tooltip on data change
     * - reset : reset tooltip
     * - none  : do nothing
     */
    onUpdate?: 'reset' | 'none';
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
    /** Original value before all transormations */
    dataValue?: number | null | string;
}

export interface TooltipSection {
    rows: TooltipRow[];
}
