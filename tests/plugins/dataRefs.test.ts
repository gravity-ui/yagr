import Yagr from '../../src/YagrCore';
import DataRefs from '../../src/plugins/dataRefs/dataRefs';

describe('DataRefs plugin', () => {
    const y = new Yagr(window.document.createElement('div'), {
        timeline: [1, 2, 3, 4],
        series: [
            {data: [1, 2, 3, 4], scale: 'y', id: 'one'},
            {data: [5, 6, 7, 8], scale: 'r'},
        ],
        plugins: {
            refs: DataRefs({}),
        },
    });

    it('should calc refs for series perScale', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(y.plugins.refs?.getRefs()).toEqual({
            y: {min: 1, max: 4, count: 4, avg: 2.5, sum: 10, integral: 0.0075},
            r: {min: 5, max: 8, count: 4, avg: 6.5, sum: 26, integral: 0.0195},
        });
    });

    it('should calc refs by idxs', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(y.plugins.refs?.calcRefs(0, 1, 'one')).toEqual({
            min: 1,
            max: 2,
            count: 2,
            avg: 1.5,
            sum: 3,
            integral: 0.0015,
        });
    });
});
