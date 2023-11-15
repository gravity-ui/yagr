/* eslint-disable complexity, @typescript-eslint/no-loop-func, no-nested-ternary */

import type {PlotLineConfig} from '../../types';
import type Yagr from '../../index';

declare module '../../types' {
    interface PBandConfig {
        label?: string;
    }

    interface PLineConfig {
        label?: string;
    }
}

type PerScale<T> = {[scale: string]: T};
type PerSeries<T> = {[series: string]: T};
type PerAxis<T> = {[axis: string]: T};

export interface CommonLabel {
    show?: boolean;
    className?: string;
    position?: (xVal: number, y: number | null | undefined) => [x: number, y: number];
    onRender?: (e: HTMLElement) => void;
    onDestroy?: (e: HTMLElement) => void;
}

export interface PointLabel extends CommonLabel {
    label?: string | ((x: number, y: number | null | undefined) => string | undefined | null);
    render?: (yagr: Yagr, seriesIdx: number, xIdx: number, scale: string, label: PointLabel) => Clear;
}
export interface PlotLabel extends CommonLabel {
    label?: string | ((band: PlotLineConfig) => string | undefined | null);
    render?: (yagr: Yagr, plotLine: PlotLineConfig, x: number, y: number, label: PlotLabel) => Clear;
}
export interface AxisLabel extends CommonLabel {
    value: number;
    label?: string | ((a: AxisLabel) => string | undefined | null);
    render?: (yagr: Yagr, x: number, y: number, label: AxisLabel) => Clear;
}

export interface LabelsOptions {
    series?: {
        cursor?: PerSeries<PointLabel>;
        focus?: PerSeries<PointLabel>;
        draw?: PerSeries<PointLabel>;
    };
    scales?: {
        cursor?: PerScale<PointLabel>;
        draw?: PerScale<PointLabel>;
    };
    axes?: PerAxis<AxisLabel[]>;
    plotLines?: {
        cursor?: PerScale<PlotLabel>;
        draw?: PerScale<PlotLabel>;
    };
}

export type Clear = () => void;
