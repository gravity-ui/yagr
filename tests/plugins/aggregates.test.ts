import Yagr from '../../src/YagrCore';
import Aggregates from '../../src/plugins/aggregates/aggregates';

describe('Aggregates plugin', () => {
    describe('plain data', () => {
        const y = new Yagr(window.document.createElement('div'), {
            timeline: [1, 2, 3, 4],
            series: [
                {data: [1, 2, 3, 4], scale: 'y', id: 'one'},
                {data: [3, 3, 3, 3], scale: 'y', id: 'two'},
                {data: [5, 6, 7, 8], scale: 'r', id: 'three'},
            ],
            plugins: {
                aggr: Aggregates({}),
            },
        });

        it('should calc refs for series perScale', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.aggr?.get()).toEqual({
                y: {min: 1, max: 4, count: 8, last: null, avg: 2.75, sum: 22, integral: 16.5},
                r: {min: 5, max: 8, count: 4, last: null, avg: 6.5, sum: 26, integral: 19.5},
            });
        });

        it('should calc refs by idxs', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.aggr?.calc(0, 1, 'one')).toEqual({
                min: 1,
                max: 2,
                count: 2,
                avg: 1.5,
                last: 2,
                sum: 3,
                integral: 1.5,
            });
        });

        it('should calc refs by ranges', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.aggr?.get(0, 1)).toEqual({
                y: {
                    series: {
                        one: {
                            min: 1,
                            max: 2,
                            count: 2,
                            avg: 1.5,
                            sum: 3,
                            integral: 1.5,
                            last: 2,
                        },
                        two: {
                            avg: 3,
                            count: 2,
                            integral: 3,
                            last: 3,
                            max: 3,
                            min: 3,
                            sum: 6,
                        },
                    },
                    total: {
                        avg: 2.25,
                        count: 4,
                        integral: 4.5,
                        last: null,
                        max: 3,
                        min: 1,
                        sum: 9,
                    },
                },
                r: {
                    series: {
                        three: {
                            avg: 5.5,
                            count: 2,
                            integral: 5.5,
                            last: 6,
                            max: 6,
                            min: 5,
                            sum: 11,
                        },
                    },
                    total: {
                        avg: 5.5,
                        count: 2,
                        integral: 5.5,
                        last: null,
                        max: 6,
                        min: 5,
                        sum: 11,
                    },
                },
            });
        });
    });

    describe('stacked data', () => {
        const y = new Yagr(window.document.createElement('div'), {
            timeline: [1, 2, 3, 4],
            scales: {
                y: {stacking: true},
            },
            series: [
                {data: [1, 2, 3, 4], scale: 'y', id: 'one'},
                {data: [3, 3, 3, 3], scale: 'y', id: 'two'},
            ],
            plugins: {
                aggr: Aggregates({}),
            },
        });

        it('should calc refs for series perScale', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.aggr?.get()).toEqual({
                y: {min: 1, max: 4, count: 8, last: null, avg: 2.75, sum: 22, integral: 16.5},
            });
        });

        it('should calc refs by idxs', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.aggr?.calc(0, 1, 'one')).toEqual({
                min: 1,
                max: 2,
                count: 2,
                avg: 1.5,
                last: 2,
                sum: 3,
                integral: 1.5,
            });
            expect(y.plugins.aggr?.calc(0, 1, 'two')).toEqual({
                min: 3,
                max: 3,
                count: 2,
                avg: 3,
                last: 3,
                sum: 6,
                integral: 3,
            });
        });
    });

    describe('weird data', () => {
        const y = new Yagr(window.document.createElement('div'), {
            timeline: [1, 2, 3, 4],
            scales: {
                y: {stacking: true},
            },
            series: [
                {data: [1, null, 3, 4], scale: 'y', id: 'one'},
                {data: [null, null, null, 3], scale: 'y', id: 'two'},
                {data: [null, null, null, null], scale: 'y', id: 'three'},
            ],
            plugins: {
                aggr: Aggregates({}),
            },
        });

        it('should calc refs for series perScale', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.aggr?.get()).toEqual({
                y: {min: 1, max: 4, count: 4, last: null, avg: 2.75, sum: 11, integral: 7},
            });
        });

        it('should calc refs by idxs', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.aggr?.calc(0, 1, 'one')).toEqual({
                min: 1,
                max: 1,
                count: 1,
                avg: 1,
                last: 1,
                sum: 1,
                integral: 0.5,
            });
            expect(y.plugins.aggr?.calc(0, 1, 'two')).toEqual({
                min: null,
                max: null,
                count: 0,
                avg: null,
                last: null,
                sum: null,
                integral: 0,
            });
        });
    });

    describe('data with strings', () => {
        const y = new Yagr(window.document.createElement('div'), {
            timeline: [1, 2, 3, 4],
            scales: {
                y: {stacking: true},
            },
            series: [
                {data: [1, 'x', 3, 4], scale: 'y', id: 'one'},
                {data: [2, 'x', null, 3], scale: 'y', id: 'two'},
            ],
            processing: {
                interpolation: {
                    value: 'x',
                    type: 'left',
                },
            },
            plugins: {
                aggr: Aggregates({}),
            },
        });

        it('should calc refs for series perScale', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.aggr?.get()).toEqual({
                y: {min: 1, max: 4, count: 5, last: null, avg: 2.6, sum: 13, integral: 5},
            });
        });

        it('should calc refs by idxs', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.aggr?.calc(0, 1, 'one')).toEqual({
                min: 1,
                max: 1,
                count: 1,
                avg: 1,
                last: 1,
                sum: 1,
                integral: 0,
            });
            expect(y.plugins.aggr?.calc(1, 3, 'two')).toEqual({
                min: 3,
                max: 3,
                count: 1,
                avg: 3,
                last: 3,
                sum: 3,
                integral: 1.5,
            });
        });
    });
});
