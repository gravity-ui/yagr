import type {MinimalValidConfig} from '../types';
import type Yagr from '..';
import UPlot from 'uplot';
import LegendPlugin from '../plugins/legend/legend';

export interface Batch {
    active: boolean;
    fns: ((s: Batch) => void)[];
    /** If true then uPlot options will be re-configured  */
    reopt?: boolean;
    /** If true then data will be recalculated (use for stacks/normalization/other calculations) */
    recalc?: boolean;
    /** False or redraw uPlot redraw arguments */
    redraw?: false | [series: boolean, axes: boolean];
    /** If batch will end with full re-instantiation of uPlot */
    reinit?: boolean;
    /** If true, legend will be fully redrawn instead of re-initialization  */
    redrawLegend?: boolean;
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

        if (this._batch.redrawLegend) {
            this.plugins.legend?.redraw();
        }

        if (this._batch.reopt) {
            this.createUplotOptions(true);
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
        let left: number | undefined;
        let top: number | undefined;

        this.inStage('dispose', () => {
            if (this.uplot) {
                const cursor = this.uplot.cursor;
                left = cursor.left;
                top = cursor.top;
                // uplot may be undefined if chart is not rendered yet, but got update
                this.uplot.destroy();
            }
            this.plugins.legend?.destroy();
        })
            .inStage('config', () => {
                this.plugins.legend = new LegendPlugin();
                this._batch = {active: false, fns: []};
                this.createUplotOptions(true);
                this.options = this.config.editUplotOptions ? this.config.editUplotOptions(this.options) : this.options;
            })
            .inStage('processing', () => {
                this.transformSeries();
            })
            .inStage('uplot', () => {
                this.uplot = new UPlot(this.options, this.series, this.initRender);
                if (left && top && left > 0 && top > 0) {
                    this.uplot.setCursor({left, top});
                }

                // by default uPlot subsribes self to cursor, if we don't need it, we should unsubscribe manually
                if (!this.state.subscribed) {
                    this.unsubscribe();
                }
            })
            .inStage('listen');
    }
}
