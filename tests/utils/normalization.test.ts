import Yagr from '../../src/YagrCore';

describe('processing:normalization', () => {
    it('should normalize with simple dataset', () => {
        const y = new Yagr(window.document.body, {
            timeline: [1, 2, 3],
            scales: {
                y: {normalize: true},
            },
            series: [{data: [1, 3, 3]}, {data: [3, 1, 3]}],
        });

        expect(y.uplot.data[2]).toEqual([25, 75, 50]);
        expect(y.uplot.data[1]).toEqual([75, 25, 50]);
    });

    it('should normalize with nulls', () => {
        const y = new Yagr(window.document.body, {
            timeline: [1, 2, 3],
            scales: {
                y: {normalize: true},
            },
            series: [{data: [1, null, 3]}, {data: [3, 1, null]}],
        });

        expect(y.uplot.data[2]).toEqual([25, null, 100]);
        expect(y.uplot.data[1]).toEqual([75, 100, null]);
    });

    it('should normalize with zeros', () => {
        const y = new Yagr(window.document.body, {
            timeline: [1, 2, 3],
            scales: {
                y: {normalize: true},
            },
            series: [{data: [1, 0, 0]}, {data: [3, 0, null]}],
        });

        expect(y.uplot.data[2]).toEqual([25, 0, 0]);
        expect(y.uplot.data[1]).toEqual([75, 0, null]);
    });
});
