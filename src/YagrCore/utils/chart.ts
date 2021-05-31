import {Options, Padding} from 'uplot';
import * as defaults from '../defaults';

export function getPaddingByAxes(options: Options): Padding {
    let hasLeftAxis = false;
    let hasRightAxis = false;

    options.axes?.forEach((axis) => {
        if (axis.scale === defaults.DEFAULT_X_SCALE) {
            return;
        }

        if (axis.side === undefined || axis.side === 3) {
            hasLeftAxis = true;
        }
        if (axis.side === 1) {
            hasRightAxis = true;
        }
    });

    if (hasLeftAxis && !hasRightAxis) {
        return defaults.PADDING_LEFT;
    } else if (hasRightAxis && !hasLeftAxis) {
        return defaults.PADDING_RIGHT;
    } else {
        return defaults.PADDING_BOTH;
    }
}
