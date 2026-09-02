import Yagr from '../../src/YagrCore';
import type {Band} from 'uplot';

const getBands = (yagr: Yagr) => (yagr.uplot as unknown as {bands: Band[]}).bands;

describe('scales: stacking', () => {
    describe('without processing', () => {
        it('should stack with simple dataset', () => {
            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3],
                scales: {
                    y: {stacking: true},
                },
                series: [{data: [1, 3, 3]}, {data: [3, 1, 3]}],
            });

            expect(y.uplot.data[2]).toEqual([1, 3, 3]);
            expect(y.uplot.data[1]).toEqual([4, 4, 6]);
            expect(y.uplot.series[1].unstackedData).toEqual([3, 1, 3]);
            expect(y.uplot.series[2].unstackedData).toEqual([1, 3, 3]);
        });

        it('should preserve null positions in unstacked line data', () => {
            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3],
                scales: {y: {stacking: true}},
                series: [
                    {type: 'line', data: [1, null, 3]},
                    {type: 'line', data: [3, 1, null]},
                ],
            });

            expect(y.uplot.series[1].unstackedData).toEqual([3, 1, null]);
            expect(y.uplot.series[2].unstackedData).toEqual([1, null, 3]);
        });

        it('should create and update non-overlapping bands for filled lines', () => {
            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3],
                scales: {y: {stacking: true}},
                series: [
                    {id: 'bottom', type: 'line', fill: 'red', data: [1, 1, 1]},
                    {id: 'middle', type: 'line', fill: 'blue', data: [1, 1, 1]},
                    {id: 'top', type: 'line', fill: 'green', data: [1, 1, 1]},
                ],
            });

            expect(getBands(y).map(({series}) => series)).toEqual([
                [1, 2],
                [2, 3],
            ]);

            y.setVisible('middle', false);

            expect(getBands(y).map(({series}) => series)).toEqual([[1, 3]]);
        });

        it('should bring nulls to 0 for areas', () => {
            const y = new Yagr(window.document.body, {
                chart: {series: {type: 'area'}},
                timeline: [1, 2, 3],
                scales: {
                    y: {stacking: true},
                },
                series: [{data: [1, null, 3]}, {data: [3, 1, 3]}, {data: [1, 1, null]}],
            });

            expect(y.uplot.data[3]).toEqual([1, 0, 3]);
            expect(y.uplot.data[2]).toEqual([4, 1, 6]);
            expect(y.uplot.data[1]).toEqual([5, 2, 6]);
        });

        it('should bring nulls to 0 for columns', () => {
            const y = new Yagr(window.document.body, {
                chart: {series: {type: 'column'}},
                timeline: [1, 2, 3],
                scales: {
                    y: {stacking: true},
                },
                series: [{data: [1, null, 3]}, {data: [3, 1, 3]}, {data: [1, 1, null]}],
            });

            expect(y.uplot.data[3]).toEqual([1, 0, 3]);
            expect(y.uplot.data[2]).toEqual([4, 1, 6]);
            expect(y.uplot.data[1]).toEqual([5, 2, 6]);
        });

        it('should exclude showInGraph: false from stack (area)', () => {
            const y = new Yagr(window.document.body, {
                chart: {series: {type: 'area'}},
                timeline: [1, 2, 3],
                scales: {
                    y: {stacking: true},
                },
                series: [
                    {data: [1, 1, 1]},
                    {data: [10, 10, 10], showInGraph: false},
                    {data: [1, 1, 1]},
                ],
            });

            expect(y.uplot.data[3]).toEqual([1, 1, 1]);
            expect(y.uplot.data[2]).toEqual([1, 1, 1]);
            expect(y.uplot.data[1]).toEqual([2, 2, 2]);
        });
    });

    describe('with processing', () => {
        it('should stack with left interpolation', () => {
            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3, 4],
                scales: {
                    y: {stacking: true},
                },
                processing: {
                    interpolation: {
                        value: 'x',
                        type: 'left',
                    },
                },
                series: [{data: [1, 'x', 1, 'x']}, {data: [1, 1, 'x', 1]}],
            });

            expect(y.uplot.data[2]).toEqual([1, 1, 1, null]);
            expect(y.uplot.data[1]).toEqual([2, 2, 2, 1]);
        });

        it('should stack with left interpolation', () => {
            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3, 4],
                scales: {
                    y: {stacking: true},
                },
                processing: {
                    interpolation: {
                        value: 'x',
                        type: 'previous',
                    },
                },
                series: [{data: [1, 'x', 1, 'x']}, {data: [1, 1, 'x', 1]}],
            });

            expect(y.uplot.data[2]).toEqual([1, 1, 1, 1]);
            expect(y.uplot.data[1]).toEqual([2, 2, 2, 2]);
        });

        it('should stack with right interpolation', () => {
            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3, 4],
                scales: {
                    y: {stacking: true},
                },
                processing: {
                    interpolation: {
                        value: 'x',
                        type: 'right',
                    },
                },
                series: [{data: [1, 'x', 2, 'x']}, {data: [1, 1, 'x', 2]}],
            });

            expect(y.uplot.data[2]).toEqual([1, 2, 2, null]);
            expect(y.uplot.data[1]).toEqual([2, 3, 4, 2]);
        });
    });
});
