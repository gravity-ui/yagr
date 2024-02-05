import type {LegendOptions} from '../plugins/legend/legend';
import type {CommonApi, CommonAppearance, CommonHooks, CommonSeries, Title} from '../types/common';

import type {PieTooltipOptions} from './plugins/tooltip';
import {wrapPieConfig} from './config';

export type PieHooks = Required<CommonHooks<YagrPie>> & {
    render: [(yagr: YagrPie) => void];
};

export interface YagrPie extends CommonApi {
    id: string;
    chart: HTMLElement;
    config: ReturnType<typeof wrapPieConfig>;

    run<T extends keyof PieHooks>(
        s: T,
        a1?: Parameters<PieHooks[T][number]>[1],
        a2?: Parameters<PieHooks[T][number]>[2],
    ): void;
}

export interface PieItem extends CommonSeries {
    readonly value: number;

    index?: number;
    _segment?: {
        start: number;
        end: number;
    };
    _focus?: boolean;
}

interface CommonYagrOptions {
    id?: string;
    legend?: LegendOptions;
}

export interface StaticSizeOptions {
    width: number;
    height: number;
}

export interface ResponsiveSizeOptions {
    responsive: boolean;
    debounce?: number;
}

export type SizeOptions = StaticSizeOptions | ResponsiveSizeOptions;

interface PieAppearance {
    /* Radius of pie in fraction of chart size [0, 1] */
    radius?: number;
    /* Radius of pie hole in fraction of chart size [0, 1] */
    cutout?: number;
    /* Accent radius in pixels */
    accent?: number;
    /* Show labels on pie segments */
    labels?: boolean;
}

export interface PieConfig extends CommonYagrOptions {
    chart?: {
        title?: Title;
        size?: SizeOptions;
        appearance?: CommonAppearance & PieAppearance;
    };
    data: PieItem[];
    hooks?: CommonHooks<YagrPie>;
    tooltip?: PieTooltipOptions;
}
