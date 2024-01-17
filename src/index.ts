export * from './YagrCore/types';
export * from './YagrCore/plugins/tooltip/types';

export {CursorOptions} from './YagrCore/plugins/cursor/cursor';
export {LegendOptions} from './YagrCore/plugins/legend/legend';

import * as DEF from './YagrCore/defaults';
export const defaults = DEF;

import Yagr from './YagrCore/index';

if (typeof window !== 'undefined') {
    Object.assign(window, {
        Yagr,
    });
}

export default Yagr;
export {Pie} from './pie';
