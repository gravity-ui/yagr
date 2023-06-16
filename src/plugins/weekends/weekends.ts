import type {YagrPlugin} from '../../types';
import type Yagr from '../../index';

export interface WeekendsPluginOptions {
    color?: string;
    predicate?: (timestamp: number) => boolean;
}

const DEFAULT_WEEKEND_COLOR = 'rgb(250, 255, 0, 0.38)';

/**
 * This plugin highlights weekend ranges using native PlotLines plugin
 */
export default function WeekendsPlugin({
    color = DEFAULT_WEEKEND_COLOR,
    predicate,
}: WeekendsPluginOptions = {}): YagrPlugin {
    return (yagr: Yagr) => {
        const weekends: [start: number, end: number][] = [];

        let inWeekend = false;
        for (const ts of yagr.config.timeline) {
            let isWeekend = false;

            if (predicate) {
                isWeekend = predicate(ts);
            } else {
                const date = new Date(ts / (yagr.config.chart?.timeMultiplier || 1));
                const dayOfWeek = date.getDay();
                isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
            }

            if (isWeekend && !inWeekend) {
                weekends.push([ts, ts]);
                inWeekend = true;
            }

            if (!isWeekend && inWeekend) {
                weekends[weekends.length - 1][1] = ts;
                inWeekend = false;
            }
        }

        yagr.plugins.plotLines?.add(
            weekends.map((val) => ({
                scale: 'x',
                value: val,
                color,
                label: 'Weekend',
            })),
        );

        return {
            uplot: {
                hooks: {},
            },
        };
    };
}

if (typeof window !== 'undefined') {
    Object.assign(window, {WeekendsPlugin});
}
