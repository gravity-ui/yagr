import {DEFAULT_X_SCALE} from '../../../defaults';
import UPlot from 'uplot';

export function getPosition(val: number, scale: string, width: number, height: number): number {
    if (val > 0 && scale === DEFAULT_X_SCALE) {
        return width;
    }
    if (val > 0 && scale !== DEFAULT_X_SCALE) {
        return 0;
    }
    if (val <= 0 && scale === DEFAULT_X_SCALE) {
        return 0;
    }

    return height;
}

export function calculateFromTo(
    value: number[] | number,
    scale: string,
    timeline: number[] | UPlot.TypedArray,
    u: UPlot,
): number[] {
    const isBand = Array.isArray(value);
    return isBand
        ? value
              .map((val) => {
                  if (Math.abs(val) !== Infinity) {
                      if (scale === DEFAULT_X_SCALE) {
                          return Math.min(Math.max(val, timeline[0]), timeline[timeline.length - 1]);
                      } else {
                          const scaleCfg = u.scales[scale];
                          return Math.min(Math.max(val, scaleCfg.min ?? val), scaleCfg.max ?? val);
                      }
                  }

                  const pos = getPosition(val, scale, u.width, u.height);

                  return u.posToVal(pos, scale);
              })
              .map((val) => u.valToPos(val, scale, true))
        : [u.valToPos(value, scale, true), 0];
}
