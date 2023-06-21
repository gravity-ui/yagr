export * from './YagrCore/types';
export * from './YagrCore/plugins/tooltip/types';

export type {CursorOptions} from './YagrCore/plugins/cursor/cursor';
export type {LegendOptions} from './YagrCore/plugins/legend/legend';
import type Y from './YagrCore/index';
import type YC from './react';
import type {YagrChartProps as YCProps} from './react';

export type Yagr = Y;
export type YagrComponent = typeof YC;
export type YagrChartProps = YCProps;
