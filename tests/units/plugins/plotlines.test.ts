import {PlotLineConfig} from '../../../src';
import Yagr from '../../../src/YagrCore';

const DEFAULT_CONFIG = {
    timeline: [1, 2, 3],
    series: [{data: [1, 2, 3]}],
    axes: {
        x: {
            plotLines: [{value: 1, color: 'red'}],
        },
    },
};

describe('plotlines', () => {
    describe('drawLayer', () => {
        it('should render on bottom of axes and series', () => {
            const y = new Yagr(window.document.body, {
                ...DEFAULT_CONFIG,
                chart: {appearance: {drawOrder: ['plotLines', 'axes', 'series']}},
            });

            expect(y.plugins.plotLines?.uplot.hooks.drawClear).toBeTruthy();
        });

        it('should render on top of axes and series', () => {
            const y = new Yagr(window.document.body, {
                ...DEFAULT_CONFIG,
                chart: {appearance: {drawOrder: ['series', 'axes', 'plotLines']}},
            });

            expect(y.plugins.plotLines?.uplot.hooks.draw).toBeTruthy();
        });

        it('should render between of axes and series', () => {
            const y = new Yagr(window.document.body, {
                ...DEFAULT_CONFIG,
                chart: {appearance: {drawOrder: ['axes', 'plotLines', 'series']}},
            });

            expect(y.plugins.plotLines?.uplot.hooks.drawAxes).toBeTruthy();
        });
    });

    describe('options', () => {
        const y = new Yagr(window.document.body, DEFAULT_CONFIG);

        it('should get plotLines', () => {
            expect(y.plugins.plotLines?.get()).toEqual([{value: 1, color: 'red', scale: 'x'}]);
        });

        it('should add plotLines', () => {
            y.plugins.plotLines?.add([{value: [1, 2], color: 'green', scale: 'y'}]);
            expect(y.plugins.plotLines?.get()).toEqual([
                {value: 1, color: 'red', scale: 'x'},
                {value: [1, 2], color: 'green', scale: 'y'},
            ]);
        });

        it('should clear plotLines by scale', () => {
            y.plugins.plotLines?.clear('x');
            expect(y.plugins.plotLines?.get()).toEqual([{value: [1, 2], color: 'green', scale: 'y'}]);
        });

        it('should clear plotLines all', () => {
            y.plugins.plotLines?.clear();
            expect(y.plugins.plotLines?.get()).toEqual([]);
        });

        it('should add and remove plotLines', () => {
            const pl: PlotLineConfig[] = [{value: [1, 2], color: 'green', scale: 'y', id: '1'}];
            y.plugins.plotLines?.add(pl);
            expect(y.plugins.plotLines?.get()).toEqual(pl);
            y.plugins.plotLines?.remove(pl);
            expect(y.plugins.plotLines?.get()).toEqual([]);
        });

        it('should update plotLines', () => {
            const pl: PlotLineConfig[] = [{value: [1, 2], color: 'green', scale: 'y', id: '1'}];
            y.plugins.plotLines?.add(pl);
            expect(y.plugins.plotLines?.get()).toEqual(pl);

            const pl2: PlotLineConfig[] = [{value: [1, 2], color: 'green', scale: 'y', id: '2'}];
            y.plugins.plotLines?.update(pl2);
            expect(y.plugins.plotLines?.get()).toEqual(pl2);
        });
    });
});
