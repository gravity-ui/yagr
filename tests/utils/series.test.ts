import {colorParser} from '../../src/YagrCore/utils/colors';
import {YagrConfig} from '../../src/YagrCore/types';
import {getSerie} from '../../src/YagrCore/utils/series';
import {
    DEFAULT_Y_SCALE,
    SERIE_AREA_BORDER_COLOR,
    SERIE_AREA_BORDER_WIDTH,
    SERIE_LINE_WIDTH,
} from '../../src/YagrCore/defaults';

describe('series options', () => {
    colorParser.setContext({
        style: {
            color: 'string',
        },
    } as any);
    const empty = {
        name: 'Line',
        color: '#000000',
        data: [1, 2, 3],
    };

    const cfg = {chart: {}} as YagrConfig;

    it('should setup default .id ', () => {
        expect(getSerie(empty, cfg, 1)).toHaveProperty('id');
    });

    it('should setup default .type ', () => {
        expect(getSerie(empty, cfg, 1)).toHaveProperty('type', 'line');
    });

    it('should set default Y scale ', () => {
        expect(getSerie(empty, cfg, 1)).toHaveProperty('scale', DEFAULT_Y_SCALE);
    });

    it('should set default cache for original data ', () => {
        expect(getSerie(empty, cfg, 1)).toHaveProperty('$c', empty.data);
    });

    it('should setup uPlot fields', () => {
        expect(getSerie(empty, cfg, 1)).toHaveProperty('show', true);
        expect(getSerie(empty, cfg, 1)).toHaveProperty('width', SERIE_LINE_WIDTH);
        expect(getSerie(empty, cfg, 1)).toHaveProperty('lineColor', SERIE_AREA_BORDER_COLOR);
        expect(getSerie(empty, cfg, 1)).toHaveProperty('lineWidth', SERIE_AREA_BORDER_WIDTH);
    });
});
