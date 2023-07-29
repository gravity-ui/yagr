import {Axis} from 'uplot';
import {MinimalValidConfig} from '../../../src';
import Yagr from '../../../src/YagrCore';

const exec = (fn: any, ...args: any[]) => {
    return typeof fn === 'function' ? (fn as any)(...args) : fn;
};

const axis = (y: Yagr, name: string): Axis => y.uplot.axes.find(({scale}) => scale === name) as Axis;

describe('yagr methods', () => {
    describe('setFocus', () => {
        afterAll(() => {
            window.document.body.innerHTML = '';
        });

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
            expect(y.getSeriesById('1')._focus).toBe(true);
            expect(y.getSeriesById('2')._focus).toBe(false);
        });

        it('should set focus on all series', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            y.setFocus(null, true);
            expect(y.getSeriesById('1')._focus).toBe(null);
            expect(y.getSeriesById('2')._focus).toBe(null);
        });
    });

    describe('setAxes', () => {
        afterAll(() => {
            window.document.body.innerHTML = '';
        });

        const DEFAULT_CONFIG: MinimalValidConfig = {
            timeline: [1, 2],
            series: [{data: [1, 2]}],
        };

        it('should set label on a axis', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            expect(axis(y, 'y').label).toBe(undefined);
            y.setAxes({y: {label: 'test'}});
            expect(axis(y, 'y').label).toBe('test');
        });

        it('should set grid item on a axis', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            expect(exec(axis(y, 'y').grid?.stroke)).toBe(y.utils.theme.GRID.stroke());
            y.setAxes({y: {grid: {stroke: 'red'}}});
            expect(exec(axis(y, 'y').grid?.stroke)).toBe('red');
        });

        it('should set splitsCount', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            y.setAxes({y: {splitsCount: 2}});
            expect(exec(axis(y, 'y').splits, y.uplot, 1, 1, 2).length).toBe(2);
            y.setAxes({y: {splitsCount: 5}});
            expect(exec(axis(y, 'y').splits, y.uplot, 1, 1, 2).length).toBe(5);
        });

        it('should clear plot lines', () => {
            const y = new Yagr(window.document.body, {
                axes: {
                    x: {plotLines: [{value: 1, color: 'red'}]},
                },
                ...DEFAULT_CONFIG,
            });
            y.setAxes({x: {plotLines: []}});
            expect(y.plugins.plotLines?.get().length).toBe(0);
            y.setAxes({x: {plotLines: [{value: 1, color: 'red'}]}});
            expect(y.plugins.plotLines?.get().length).toBe(1);
        });
    });

    describe('setVisible', () => {
        afterAll(() => {
            window.document.body.innerHTML = '';
        });

        const DEFAULT_CONFIG: MinimalValidConfig = {
            timeline: [1, 2],
            series: [
                {data: [1, 2], id: '1', show: false},
                {data: [3, 4], id: '2'},
            ],
        };

        it('should draw correct with initial state', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            expect(y.getSeriesById('1').show).toBe(false);
            expect(y.getSeriesById('2').show).toBe(true);
        });

        it('should set visible on a serie', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            y.setVisible('1', true);
            expect(y.getSeriesById('1').show).toBe(true);
            expect(y.getSeriesById('2').show).toBe(true);
        });

        it('should set focus on all series', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            y.setVisible(null, false);
            expect(y.getSeriesById('1').show).toBe(false);
            expect(y.getSeriesById('2').show).toBe(false);

            y.setVisible(null, true);
            expect(y.getSeriesById('1').show).toBe(true);
            expect(y.getSeriesById('2').show).toBe(true);
        });
    });

    describe('setSeries', () => {
        const DEFAULT_CONFIG: MinimalValidConfig = {
            timeline: [1, 2],
            series: [{data: [1, 2], id: '1'}],
        };

        describe('signature: (seriesId: string, series: RawSerieData) => void', () => {
            afterAll(() => {
                window.document.body.innerHTML = '';
            });

            it('should set data', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);

                y.setSeries('1', {data: [3, 4]});
                expect(y.uplot.data[1]).toEqual([3, 4]);
                expect(y.uplot.series[1].$c).toEqual([3, 4]);
            });

            it('should set color', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);

                y.setSeries('1', {color: 'red'});
                expect(y.uplot.series[1].color).toEqual('red');
                expect(exec(y.uplot.series[1].stroke, y.uplot, 1)).toEqual('red');
            });

            it('should set focus', () => {
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
                expect(y.uplot.series[1].$c).toEqual([3, 4]);
            });

            it('should set color', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);

                y.setSeries(0, {color: 'red'});
                expect(y.uplot.series[1].color).toEqual('red');
                expect(exec(y.uplot.series[1].stroke, y.uplot, 1)).toEqual('red');
            });

            it('should set focus', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);

                y.setSeries(0, {focus: true});
                expect(y.uplot.series[1]._focus).toEqual(true);
            });
        });

        describe('signature: setSeries(series: RawSerieData[])', () => {
            it('should set data', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);

                y.setSeries([{id: '10', data: [1, 2]}]);
                expect(y.uplot.data[1]).toEqual([1, 2]);
                expect(y.uplot.series[1].id).toEqual('10');
            });
        });

        describe('signature: setSeries(timeline: number[], series: RawSerieData[], options: UpdateOptions): void', () => {
            describe('incremental', () => {
                describe('splice = false', () => {
                    it('should set data', () => {
                        const y = new Yagr(window.document.body, {
                            timeline: [1, 2],
                            series: [
                                {data: [1, 2], id: '1'},
                                {data: [1, 2], id: '2'},
                            ],
                        });

                        y.setSeries(
                            [3, 4],
                            [
                                {id: '1', data: [10, 20]},
                                {id: '2', data: [30, 40]},
                            ],
                            {
                                incremental: true,
                            },
                        );
                        expect(y.uplot.data[0]).toEqual([1, 2, 3, 4]);
                        expect(y.uplot.data[1]).toEqual([1, 2, 30, 40]);
                        expect(y.uplot.data[2]).toEqual([1, 2, 10, 20]);
                    });
                });
                describe('splice = true', () => {
                    it('should set data', () => {
                        const y = new Yagr(window.document.body, {
                            timeline: [1, 2, 3],
                            series: [
                                {data: [1, 2, 3], id: '1'},
                                {data: [1, 2, 3], id: '2'},
                            ],
                        });

                        y.setSeries(
                            [4, 5],
                            [
                                {id: '1', data: [10, 20]},
                                {id: '2', data: [30, 40]},
                            ],
                            {
                                incremental: true,
                                splice: true,
                            },
                        );
                        expect(y.uplot.data[0]).toEqual([3, 4, 5]);
                        expect(y.uplot.data[1]).toEqual([3, 30, 40]);
                        expect(y.uplot.data[2]).toEqual([3, 10, 20]);
                    });
                });
            });

            describe('non incremental', () => {
                it('should set data', () => {
                    const y = new Yagr(window.document.body, {
                        timeline: [1, 2],
                        series: [
                            {data: [1, 2], id: '1'},
                            {data: [1, 2], id: '2'},
                        ],
                    });

                    y.setSeries(
                        [3, 4],
                        [
                            {id: '1', data: [10, 20]},
                            {id: '2', data: [30, 40]},
                        ],
                        {
                            incremental: false,
                        },
                    );
                    expect(y.uplot.data[0]).toEqual([3, 4]);
                    expect(y.uplot.data[1]).toEqual([30, 40]);
                    expect(y.uplot.data[2]).toEqual([10, 20]);
                });
            });
        });
    });
});
