import {Series} from 'uplot';
import {getSumByIdx} from '../../src/YagrCore/utils/common';

describe('utils:getSumByIdx', () => {
    it('should sum all series by idx', () => {
        const series = [
            [100, 10, 1],
            [200, 20, 2],
            [300, 30, 3],
        ];
        const options = [
            {id: 'date'},
            {show: true, scale: 'y'},
            {show: true, scale: 'y'},
            {show: true, scale: 'y'},
        ] as Series[];

        expect(getSumByIdx(series, options, 0, 'y')).toBe(600);
        expect(getSumByIdx(series, options, 1, 'y')).toBe(60);
        expect(getSumByIdx(series, options, 2, 'y')).toBe(6);
        expect(getSumByIdx(series, options, 3, 'y')).toBe(0);
    });

    it('should sum only visible series by idx', () => {
        const series = [
            [100, 10, 1],
            [200, 20, 2],
            [300, 30, 3],
        ];
        const options = [
            {id: 'date'},
            {show: true, scale: 'y'},
            {show: false, scale: 'y'},
            {show: true, scale: 'y'},
        ] as Series[];

        expect(getSumByIdx(series, options, 0, 'y')).toBe(400);
        expect(getSumByIdx(series, options, 1, 'y')).toBe(40);
        expect(getSumByIdx(series, options, 2, 'y')).toBe(4);
        expect(getSumByIdx(series, options, 3, 'y')).toBe(0);
    });
});
