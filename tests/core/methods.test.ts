import {MinimalValidConfig} from '../../src';
import Yagr from '../../src/YagrCore';

const exec = (fn: any, ...args: any[]) => {
    return (fn as any)(...args);
};

describe('yagr methods', () => {
    describe('setFocus', () => {
        const DEFAULT_CONFIG: MinimalValidConfig = {
            timeline: [1, 2],
            series: [
                {data: [1, 2], id: '1'},
                {data: [3, 4], id: '2'},
            ],
        };

        it('should set focus on a serie', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            y.setFocus('1', true);
            expect(y.getById('1')._focus).toBe(true);
            expect(y.getById('2')._focus).toBe(false);
        });

        it('should set focus on all series', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            y.setFocus(null, true);
            expect(y.getById('1')._focus).toBe(null);
            expect(y.getById('2')._focus).toBe(null);
        });
    });

    describe('setVisibility', () => {
        const DEFAULT_CONFIG: MinimalValidConfig = {
            timeline: [1, 2],
            series: [
                {data: [1, 2], id: '1', show: false},
                {data: [3, 4], id: '2'},
            ],
        };

        it('should draw correct with initial state', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            expect(y.getById('1').show).toBe(false);
            expect(y.getById('2').show).toBe(true);
        });

        it('should set visible on a serie', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            y.setVisible('1', true);
            expect(y.getById('1').show).toBe(true);
            expect(y.getById('2').show).toBe(true);
        });

        it('should set focus on all series', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            y.setVisible(null, false);
            expect(y.getById('1').show).toBe(false);
            expect(y.getById('2').show).toBe(false);

            y.setVisible(null, true);
            expect(y.getById('1').show).toBe(true);
            expect(y.getById('2').show).toBe(true);
        });
    });

    // -   `setSeries(series: RawSerieData[]): void`
    // -   `setSeries(timeline: number[], series: RawSerieData[], options: UpdateOptions): void`

    describe('setSeries', () => {
        const DEFAULT_CONFIG: MinimalValidConfig = {
            timeline: [1, 2],
            series: [{data: [1, 2], id: '1'}],
        };

        describe('signature: (seriesId: string, series: RawSerieData) => void', () => {
            it('should set data', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);

                y.setSeries('1', {data: [3, 4]});
                expect(y.uplot.data[1]).toEqual([3, 4]);
            });

            it('should set color', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);

                y.setSeries('1', {color: 'red'});
                expect(y.uplot.series[1].color).toEqual('red');
                expect(exec(y.uplot.series[1].stroke, y.uplot, 1)).toEqual('red');
            });

            it('should set color', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);

                y.setSeries('1', {focus: true});
                expect(y.uplot.series[1]._focus).toEqual(true);
            });
        });

        describe('signature: setSeries(seriesIdx: number, series: RawSerieData): void', () => {
            it('should set data', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);

                y.setSeries(0, {data: [3, 4]});
                expect(y.uplot.data[1]).toEqual([3, 4]);
            });

            it('should set color', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);

                y.setSeries(0, {color: 'red'});
                expect(y.uplot.series[1].color).toEqual('red');
                expect(exec(y.uplot.series[1].stroke, y.uplot, 1)).toEqual('red');
            });

            it('should set color', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);

                y.setSeries(0, {focus: true});
                expect(y.uplot.series[1]._focus).toEqual(true);
            });
        });
    });
});
