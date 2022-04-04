import Yagr from '../../src/YagrCore';

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
