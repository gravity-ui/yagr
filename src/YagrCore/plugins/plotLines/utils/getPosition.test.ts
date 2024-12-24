import {getPosition} from './calculateFromTo';
import {DEFAULT_X_SCALE} from '../../../defaults';

describe('getPosition', () => {
    const width = 1000;
    const height = 500;

    it('should return width when val > 0 and scale is DEFAULT_X_SCALE', () => {
        const result = getPosition(10, DEFAULT_X_SCALE, width, height);
        expect(result).toBe(width);
    });

    it('should return 0 when val > 0 and scale is not DEFAULT_X_SCALE', () => {
        const result = getPosition(10, 'some_other_scale', width, height);
        expect(result).toBe(0);
    });

    it('should return 0 when val <= 0 and scale is DEFAULT_X_SCALE', () => {
        const result1 = getPosition(0, DEFAULT_X_SCALE, width, height);
        const result2 = getPosition(-1, DEFAULT_X_SCALE, width, height);
        expect(result1).toBe(0);
        expect(result2).toBe(0);
    });

    it('should return height when val <= 0 and scale is not DEFAULT_X_SCALE', () => {
        const result1 = getPosition(0, 'some_other_scale', width, height);
        const result2 = getPosition(-1, 'some_other_scale', width, height);
        expect(result1).toBe(height);
        expect(result2).toBe(height);
    });
});
