import {Options} from 'uplot';
import {PADDING_BOTH, PADDING_LEFT, PADDING_RIGHT} from '../src/YagrCore/defaults';
import {getPaddingByAxes} from '../src/YagrCore/utils/chart';

describe('utils:charts', () => {
    it('empty is left', () => {
        expect(getPaddingByAxes({} as Options)).toEqual(PADDING_LEFT);
    });

    it('right only', () => {
        expect(
            getPaddingByAxes({
                axes: [{side: 3}],
            } as Options),
        ).toEqual(PADDING_LEFT);
    });
    it('right only', () => {
        expect(
            getPaddingByAxes({
                axes: [{side: 1}],
            } as Options),
        ).toEqual(PADDING_RIGHT);
    });

    it('both', () => {
        expect(
            getPaddingByAxes({
                axes: [{}, {side: 1}],
            } as Options),
        ).toEqual(PADDING_BOTH);
    });
});
