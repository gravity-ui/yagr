import Yagr from '../../src/YagrCore';
import {getSerie} from '../../src/YagrCore/utils/series';
import {
    DEFAULT_Y_SCALE,
    // SERIE_AREA_BORDER_COLOR,
    // SERIE_AREA_BORDER_WIDTH,
    SERIE_LINE_WIDTH,
} from '../../src/YagrCore/defaults';

describe('series options', () => {
    const empty = {
        name: 'Line',
        color: '#000000',
        data: [1, 2, 3],
    };

    const y = new Yagr(window.document.body, {
        timeline: [1, 2, 3],
        scales: {
            y: {normalize: true},
        },
        series: [{data: [1, 3, 3]}, {data: [3, 1, 3]}],
    });

    y.utils.colors.setContext({
        style: {
            color: 'string',
        },
    } as any);

    it('should setup default .id ', () => {
        expect(getSerie(empty, y, 1)).toHaveProperty('id');
    });

    it('should setup default .type ', () => {
        expect(getSerie(empty, y, 1)).toHaveProperty('type', 'line');
    });

    it('should set default Y scale ', () => {
        expect(getSerie(empty, y, 1)).toHaveProperty('scale', DEFAULT_Y_SCALE);
    });

    it('should set default cache for original data ', () => {
        expect(getSerie(empty, y, 1)).toHaveProperty('$c', empty.data);
    });

    it('should setup uPlot fields', () => {
        expect(getSerie(empty, y, 1)).toHaveProperty('width', SERIE_LINE_WIDTH);
    });
});
