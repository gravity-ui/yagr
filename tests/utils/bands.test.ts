import type {Series} from 'uplot';

import {getStackedLineBands} from '../../src/YagrCore/utils/bands';

describe('utils: stacked line bands', () => {
    const x = {} as Series;

    it('creates bands between filled lines in the same stack', () => {
        const series = [
            x,
            {type: 'line', scale: 'y', fill: 'red'},
            {type: 'line', scale: 'y', fill: 'blue'},
            {type: 'line', scale: 'y', fill: 'green'},
        ] as Series[];

        expect(getStackedLineBands(series, {y: {stacking: true}})).toEqual([
            {series: [1, 2]},
            {series: [2, 3]},
        ]);
    });

    it('does not connect different scales or stack groups', () => {
        const series = [
            x,
            {type: 'line', scale: 'y', stackGroup: 0, fill: 'red'},
            {type: 'line', scale: 'y', stackGroup: 1, fill: 'blue'},
            {type: 'line', scale: 'r', stackGroup: 0, fill: 'green'},
            {type: 'line', scale: 'y', stackGroup: 0, fill: 'yellow'},
        ] as Series[];

        expect(getStackedLineBands(series, {y: {stacking: true}, r: {stacking: true}})).toEqual([
            {series: [1, 4]},
        ]);
    });

    it('keeps configured bands and skips hidden series', () => {
        const configured = [{series: [1, 3]}] as const;
        const series = [
            x,
            {type: 'line', fill: 'red'},
            {type: 'line', fill: 'blue', show: false},
            {type: 'line', fill: 'green'},
        ] as Series[];

        expect(getStackedLineBands(series, {y: {stacking: true}}, configured as never)).toEqual(
            configured,
        );
    });
});
