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
type RenderResult = [clear: Clear | undefined | null, label: string] | (Clear | undefined | null);

export interface CommonLabel {
    show?: boolean;
    className?: string;
    position?: (xVal: number, y: number | null | undefined) => [x: number, y: number];
    onRender?: (e: HTMLElement) => void;
    onDestroy?: (e: HTMLElement) => void;
}

export interface PointLabel extends CommonLabel {
    label: (x: number, y: number | null | undefined) => string | undefined | null;
    render?: (yagr: Yagr, seriesIdx: number, xIdx: number, scale: string, label: PointLabel) => RenderResult;
}
export interface PlotLabel extends CommonLabel {
    label: (band: PlotLineConfig) => string | undefined | null;
    render?: (yagr: Yagr, plotLine: PlotLineConfig, x: number, y: number, label: PlotLabel) => RenderResult;
}
export interface AxisLabel extends CommonLabel {
    value: number;
    label: (a: AxisLabel) => string | undefined | null;
    render?: (yagr: Yagr, x: number, y: number, label: AxisLabel) => RenderResult;
}

export interface LabelsOptions {
    series?: {
        cursor?: PerScale<PointLabel>;
        focus?: PerScale<PointLabel>;
        constant?: PerScale<PointLabel>;
    };
    scales?: {
        cursor?: PerScale<PointLabel>;
        constant?: PerScale<PointLabel>;
    };
    axes?: Record<string, AxisLabel[]>;
    plotLines?: {
        cursor?: PerScale<PlotLabel>;
        constant?: PerScale<PlotLabel>;
    };
}

export type Clear = () => void;
