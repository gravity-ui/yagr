import Yagr from '../../src/YagrCore';

describe('scales: stacking', () => {
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
