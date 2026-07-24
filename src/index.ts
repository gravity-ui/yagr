export * from './YagrCore/types';
export * from './YagrCore/plugins/tooltip/types';
export * from './YagrCore/plugins/tooltip/placement';
export * from './plugins/aggregates/aggregates';

export {CursorOptions} from './YagrCore/plugins/cursor/cursor';
export {LegendOptions} from './YagrCore/plugins/legend/legend';
export * from './YagrCore/plugins/tooltip';

export {getOptionValue} from './YagrCore/plugins/tooltip/utils.js';
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
