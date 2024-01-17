import {genId} from '../utils/id';
import type {PieConfig} from './types';

export class Config {
    _data?: PieConfig['data'];

    private readonly cfg: PieConfig;

    constructor(cfg: PieConfig) {
        this.cfg = cfg;
    }

    get hooks() {
        return this.cfg.hooks ?? {};
    }

    get legend() {
        return {
            show: false,
            ...this.cfg.legend,
        };
    }

    get chart() {
        return {
            ...this.cfg.chart,
            appearance: {
                ...this.cfg.chart?.appearance,
                theme: this.cfg.chart?.appearance?.theme ?? 'light',
            },
            size: this.cfg.chart?.size ?? {
                responsive: true,
                debounce: 100,
            },
        };
    }

    get data() {
        this._data =
            this._data ||
            this.cfg.data.map((s, i) => {
                s.name = s.name || 'Series ' + i;
                s.id = s.id || genId();
                s.type = 'pie';
                s.show = s.show ?? true;
                return s;
            });
        return this._data;
    }
}
