import {DEFAULT_SYNC_KEY} from '../defaults';
import {CursorOptions, CursorSyncOptions} from '../plugins/cursor/cursor';

const defaultSyncState = {key: DEFAULT_SYNC_KEY, tooltip: false};

export const getSyncOptions = (opts: CursorOptions['sync']): CursorSyncOptions => {
    if (!opts) {
        return defaultSyncState;
    }

    return opts === true
        ? {
              key: DEFAULT_SYNC_KEY,
              tooltip: true,
          }
        : {...defaultSyncState, ...opts};
};
