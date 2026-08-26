import UPlot from 'uplot';

import {BARS_DRAW_FACTOR, BARS_DRAW_MAX} from '../../src/YagrCore/defaults';
import {pathsRenderer} from '../../src/YagrCore/utils/paths';

describe('utils:paths', () => {
    it('uses native bars and forwards the public each callback', () => {
        const each = jest.fn();
        const drawer = jest.fn(() => null);
        const bars = jest.spyOn(UPlot.paths, 'bars').mockReturnValue(drawer);
        const uplot = {
            series: [{}, {type: 'column', renderOptions: {each}}],
        } as unknown as UPlot;

        pathsRenderer(uplot, 1, 0, 1);

        expect(bars).toHaveBeenCalledWith({
            size: [BARS_DRAW_FACTOR, BARS_DRAW_MAX],
            each,
        });
        expect(drawer).toHaveBeenCalledWith(uplot, 1, 0, 1);
    });
});
