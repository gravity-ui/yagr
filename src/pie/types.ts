import type {LegendOptions} from '../plugins/legend/legend';
import type {CommonApi, CommonAppearance, CommonHooks, CommonSeries} from '../types/common';

import type ColorParser from '../utils/colors';
import type ThemedDefaults from '../utils/defaults';
import type I18n from '../utils/i18n';
import {Config} from './config';

export interface YagrPie extends CommonApi {
    chart: HTMLElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    config: Config;
    utils: {
        colorParser: ColorParser;
        theme: ThemedDefaults;
        i18n: ReturnType<typeof I18n>;
    };
}

export interface PieSeries extends CommonSeries {
    readonly value: number;

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
}

export interface PieConfig extends CommonYagrOptions {
    chart?: {
        size?: SizeOptions;
        appearance?: CommonAppearance & PieAppearance;
    };
    data: PieSeries[];
    hooks?: CommonHooks<YagrPie>;
}
