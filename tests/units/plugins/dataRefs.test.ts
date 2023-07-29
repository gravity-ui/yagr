import Yagr from '../../../src/YagrCore';
import DataRefs from '../../../src/plugins/dataRefs/dataRefs';

describe('DataRefs plugin', () => {
    describe('plain data', () => {
        const y = new Yagr(window.document.createElement('div'), {
            timeline: [1, 2, 3, 4],
            series: [
                {data: [1, 2, 3, 4], scale: 'y', id: 'one'},
                {data: [3, 3, 3, 3], scale: 'y', id: 'two'},
                {data: [5, 6, 7, 8], scale: 'r', id: 'three'},
            ],
            plugins: {
                refs: DataRefs({}),
            },
        });

        it('should calc refs for series perScale', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.refs?.getRefs()).toEqual({
                y: {min: 1, max: 4, count: 8, last: null, avg: 2.75, sum: 22, integral: 0.0165},
                r: {min: 5, max: 8, count: 4, last: null, avg: 6.5, sum: 26, integral: 0.0195},
            });
        });

        it('should calc refs by idxs', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.refs?.calcRefs(0, 1, 'one')).toEqual({
                min: 1,
                max: 2,
                count: 2,
                avg: 1.5,
                last: 2,
                sum: 3,
                integral: 0.0015,
            });
        });

        it('should calc refs by ranges', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.refs?.getRefs(0, 1)).toEqual({
                y: {
                    series: {
                        one: {
                            min: 1,
                            max: 2,
                            count: 2,
                            avg: 1.5,
                            sum: 3,
                            integral: 0.0015,
                            last: 2,
                        },
                        two: {
                            avg: 3,
                            count: 2,
                            integral: 0.003,
                            last: 3,
                            max: 3,
                            min: 3,
                            sum: 6,
                        },
                    },
                    total: {
                        avg: 2.25,
                        count: 4,
                        integral: 0.0045000000000000005,
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
                            integral: 0.0055,
                            last: 6,
                            max: 6,
                            min: 5,
                            sum: 11,
                        },
                    },
                    total: {
                        avg: 5.5,
                        count: 2,
                        integral: 0.0055,
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
                refs: DataRefs({}),
            },
        });

        it('should calc refs for series perScale', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.refs?.getRefs()).toEqual({
                y: {min: 1, max: 4, count: 8, last: null, avg: 2.75, sum: 22, integral: 0.0165},
            });
        });

        it('should calc refs by idxs', async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(y.plugins.refs?.calcRefs(0, 1, 'one')).toEqual({
                min: 1,
                max: 2,
                count: 2,
                avg: 1.5,
                last: 2,
                sum: 3,
                integral: 0.0015,
            });
            expect(y.plugins.refs?.calcRefs(0, 1, 'two')).toEqual({
                min: 3,
                max: 3,
                count: 2,
                avg: 3,
                last: 3,
                sum: 6,
                integral: 0.003,
            });
        });
    });
});
