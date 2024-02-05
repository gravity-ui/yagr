import type {LegendOptions} from '../plugins/legend/legend-old';
import {genId} from '../utils/id';
import type {PieConfig, PieHooks} from './types';
import type {PieTooltipOptions} from './plugins/tooltip';

export function wrapPieConfig(cfg: PieConfig) {
    return {
        ...cfg,
        chart: {
            ...cfg.chart,
            appearance: {
                ...cfg.chart?.appearance,
                theme: cfg.chart?.appearance?.theme ?? 'light',
            },
            size: cfg.chart?.size ?? {
                responsive: true,
                debounce: 100,
            },
        },
        legend: {
            show: false,
            ...cfg.legend,
        } as LegendOptions,
        tooltip: {
            show: true,
            ...cfg.tooltip,
        } as PieTooltipOptions,
        hooks: (cfg.hooks ?? {}) as PieHooks,
        data: cfg.data.map((s, i) => {
            s.name = s.name || 'Item ' + i;
            s.id = s.id || genId();
            s.type = 'pie';
            s.show = s.show ?? true;
            s.index = i;
            return s;
        }),
    };
}
