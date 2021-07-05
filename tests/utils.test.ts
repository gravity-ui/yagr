import {Series} from 'uplot';
import {getSumByIdx} from '../src/YagrCore/utils/common';

describe('utils:getSumByIdx', () => {
    it('should sum all series by idx', () => {
        const series = [
            [100, 10, 1],
            [200, 20, 2],
            [300, 30, 3],
        ];
        const options = [{id: 'date'}, {show: true}, {show: true}, {show: true}] as Series[];

        expect(getSumByIdx(series, 0, options)).toBe(600);
        expect(getSumByIdx(series, 1, options)).toBe(60);
        expect(getSumByIdx(series, 2, options)).toBe(6);
        expect(getSumByIdx(series, 3, options)).toBe(0);
    });

    it('should sum only visible series by idx', () => {
        const series = [
            [100, 10, 1],
            [200, 20, 2],
            [300, 30, 3],
        ];
        const options = [{id: 'date'}, {show: true}, {show: false}, {show: true}] as Series[];

        expect(getSumByIdx(series, 0, options)).toBe(400);
        expect(getSumByIdx(series, 1, options)).toBe(40);
        expect(getSumByIdx(series, 2, options)).toBe(4);
        expect(getSumByIdx(series, 3, options)).toBe(0);
    });
});
