import {YagrConfig} from '../../../src/YagrCore/types';
import {getTimeFormatter} from '../../../src/YagrCore/utils/axes';

describe('axes:getTimeFormatter', () => {
    const formatter = getTimeFormatter({
        chart: {
            timeMultiplier: 1e-3,
        },
    } as YagrConfig);
    const formatterMs = getTimeFormatter({
        chart: {
            timeMultiplier: 1,
        },
    } as YagrConfig);

    it('should always be UTC', () => {
        expect(new Date().getTimezoneOffset()).toBe(0);
    });

    describe('timeMultiplier: 1e-3', () => {
        it('< second', () => {
            expect(formatter(null, [1, 2])).toEqual(['00:01.000', '00:02.000']);
        });

        it('< minute', () => {
            expect(formatter(null, [1, 12])).toEqual(['00:01', '00:12']);
        });

        it('< day', () => {
            expect(formatter(null, [1, 71])).toEqual(['00:01', '01:11']);
        });

        it('> days', () => {
            expect(formatter(null, [1, 3000000])).toEqual(['01.01.1970', '04.02.1970']);
        });

        it('>= years', () => {
            expect(formatter(null, [1, 300000000])).toEqual(['1970', '1979']);
        });
    });

    describe('timeMultiplier: 1', () => {
        it('< second', () => {
            expect(formatterMs(null, [1000, 2000])).toEqual(['00:01.000', '00:02.000']);
        });

        it('< minute', () => {
            expect(formatterMs(null, [1000, 12000])).toEqual(['00:01', '00:12']);
        });

        it('< day', () => {
            expect(formatterMs(null, [1000, 71000])).toEqual(['00:01', '01:11']);
        });

        it('> days', () => {
            expect(formatterMs(null, [1000, 3000000000])).toEqual(['01.01.1970', '04.02.1970']);
        });

        it('>= years', () => {
            expect(formatter(null, [1, 300000000])).toEqual(['1970', '1979']);
        });
    });
});
