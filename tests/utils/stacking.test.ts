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

        expect(y.uplot.data[2]).toEqual([25, 75, 50]);
        expect(y.uplot.data[1]).toEqual([75, 25, 50]);
    });
});
