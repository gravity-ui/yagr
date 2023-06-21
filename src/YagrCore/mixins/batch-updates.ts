import type {MinimalValidConfig} from '../types';
import type Yagr from '..';
import UPlot from 'uplot';

export interface Batch {
    active: boolean;
    fns: ((s: Batch) => void)[];
    reopt?: boolean;
    recalc?: boolean;
    redraw?: false | [series: boolean, axes: boolean];
    reinit?: boolean;
}

export class BatchMixin<T extends MinimalValidConfig> {
    protected _batch!: Batch;

    initMixin() {
        this._batch = {
            active: false,
            fns: [],
        };
    }

    /**
     * @public
     * @param fn batch funcion.
     * @experimental
     * @descriptoin Batch wrapper. Batch function accepts batch state, it can be modified to change batch execution behaviour.
     * @example
     * ```typescript
     * yagr.batch((s) => {
     *    s.reopt = true; // reinit uPlot options
     *    s.recalc = true; // recalculate series
     *    s.redraw = [true, true]; // redraw chart
     *    s.reinit = true; // reinit uPlot chart
     * });
     * ```
     */
    batch(this: Yagr<T>, fn: (s: Batch) => void) {
        if (this._batch.active) {
            return fn(this._batch);
        }

        this._batch.active = true;
        fn(this._batch);

        if (this._batch.reinit) {
            return this.fullUpdate();
        }

        if (this._batch.reopt) {
            this.createUplotOptions(true);
            this.plugins.legend?.redraw();
        }

        if (this._batch.recalc) {
            this.inStage('processing', () => {
                this.transformSeries();
            }).inStage('listen');
        }

        this._batch.fns.length && this.uplot.batch(() => this._batch.fns.forEach((fn) => fn(this._batch)));

        if (this._batch.redraw && this.uplot) {
            this.redraw(...this._batch.redraw);
        }

        this._batch = {active: false, fns: []};
    }

    /**
     *
     * @internal
     * @description Full update of chart. Used when config is changed totally.
     */
    protected fullUpdate(this: Yagr<T>) {
        this.dispose();

        this.inStage('config', () => {
            this._batch = {active: false, fns: []};
            this.createUplotOptions();
            this.options = this.config.editUplotOptions ? this.config.editUplotOptions(this.options) : this.options;
        })
            .inStage('processing', () => {
                this.transformSeries();
            })
            .inStage('uplot', () => {
                this.uplot = new UPlot(this.options, this.series, this.initRender);
                this.init();
            })
            .inStage('listen');
    }
}
