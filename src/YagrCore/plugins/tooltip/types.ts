import {YagrConfig} from 'src/YagrCore/types';
import Yagr from '../../index';
import {TooltipState, TooltipAction} from './tooltip';

export enum TrackingOptions {
    /** Tracks serie only if mouse hovered on series' area */
    Area = 'area',
    /** Tracks mouse to closest line */
    Sticky = 'sticky',
}

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
export interface TooltipOptions {
    enabled?: boolean;
    /** Tracking policy:
     *  - 'area'    : track by area
     *  - 'sticky'  : finds closest dataline
     */
    tracking: TrackingOptions;
    /** Limit for lines in tooltip */
    maxLines: number;
    /** Should highlight focused line in tooltip */
    highlightLines: boolean;
    /** Show Total row */
    total: boolean;
    /** Sorter */
    sort: ((s1: TooltipRow, s2: TooltipRow) => number) | undefined;
    /** Custom tooltip renderer */
    render: (rows: TooltipRows, renderOptions: TooltipRenderOpts, cfg: YagrConfig) => string;
    /** Is tooltip pinable */
    pinable: boolean;
    /** Value formatter */
    value: (value: string | number | null, precision?: number) => string;
    /**
     * @TODO Not implemented
     * Show DataLine index
     */
    showIndicies: boolean;
    /** Don't render null data points in tooltip */
    hideNoData?: boolean;
    /** Show percent row in tooltip */
    percent?: boolean;
    /** Element bound for tooltip (default: document.body) */
    boundClassName?: string;
    /** Value precision (default: 2) */
    precision?: number;
    /** Calls when tooltip changes state */
    onStateChange?: (
        elem: HTMLElement,
        api: {
            action: TooltipAction;
            state: TooltipState;
            actions: {
                pin: (state: boolean) => void;
                show: () => void;
                hide: () => void;
            };
            yagr: Yagr;
        },
    ) => void;
    /** Tooltip element className appendix */
    className?: string;

    xOffset?: number;
    yOffset?: number;
    stickToRanges?: boolean;
}

export type TooltipRow = {
    /** Name of DataLine */
    name?: string;
    /** Current Y value of DataLine */
    value: string | number | null;
    /** Color of DataLine */
    color: string;
    /** Is cursor over DataLine */
    active?: boolean;
    /** Custom className */
    className?: string;
    /** Y Axis value */
    y?: number | null;
    /** Index of series in u.series */
    seriesIdx: number;

    /** Original value before all transormations */
    originalValue?: number | null;
    /** Normalized value */
    normalized?: number | null;
};

export type TooltipRows = TooltipRow[];
