export * from './YagrCore/types';
export * from './YagrCore/plugins/tooltip/types';

export {CursorOptions} from './YagrCore/plugins/cursor/cursor';
export {LegendPosition, LegendOptions} from './YagrCore/plugins/legend/legend';
import type Y from './YagrCore/index';
import type YC from './react';
import type {YagrChartProps as YCProps}  from './react';

export type Yagr = Y;
export type YagrComponent = YC;
export type YagrChartProps = YCProps;


