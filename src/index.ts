export * from './YagrCore/types';
export * from './YagrCore/plugins/tooltip/types';
export * from './plugins/aggregates/aggregates';
export * from './YagrCore/plugins/tooltip';

export {default as aggregatesPlugin} from './plugins/aggregates/aggregates';

export {CursorOptions} from './YagrCore/plugins/cursor/cursor';
export {
    LegendOptions,
    getSeriesInLegend,
    hasOneVisibleLine,
} from './YagrCore/plugins/legend/legend';

export * from './YagrCore/utils';

import * as DEF from './YagrCore/defaults';
export const defaults = DEF;

import Yagr from './YagrCore/index';

if (typeof window !== 'undefined') {
    Object.assign(window, {
        Yagr,
    });
}

export default Yagr;
