import {Scale} from '../src/YagrCore/types';
import {offsetScale} from '../src/YagrCore/utils/scales';

type TArgs = [number, number, Scale];
type TResult = {min: number; max: number};
type Samples = Record<string, [TArgs, TResult]>;
type DSamples = Record<string, Samples>;

describe('utils:scales', () => {
    describe('offsetScale', () => {
        const SIMPLE: Scale = {type: 'linear'};
        const SIMPLE_STACKED: Scale = {type: 'linear', stacking: true};
        const SIMPLE_10: Scale = {type: 'linear', offset: 0.1};
        const SIMPLE_10_STACKED: Scale = {type: 'linear', offset: 0.1, stacking: true};

        const SAMPLES: DSamples = {
            'simple line, 5% (default)': {
                '(50, 1000) -> (48, 1050)': [[50, 1000, SIMPLE], {min: 48, max: 1050}],
                '(0, 100) -> (0, 105)': [[0, 100, SIMPLE], {min: 0, max: 105}],
                '(-100, 100) -> (-105, 105)': [[-100, 100, SIMPLE], {min: -105, max: 105}],
            },
            'simple line, 10% (custom)': {
                '(50, 1000) -> (45, 1100)': [[50, 1000, SIMPLE_10], {min: 45, max: 1100}],
                '(0, 100) -> (0, 110)': [[0, 100, SIMPLE_10], {min: 0, max: 110}],
                '(-100, 100) -> (-110, 110)': [[-100, 100, SIMPLE_10], {min: -110, max: 110}],
            },
            'area (stacked)': {
                'should start from zero, if dataMin >= 0:  (50, 1000) -> (0, 1050)': [
                    [50, 1000, SIMPLE_STACKED],
                    {min: 0, max: 1050},
                ],
                "shouldn't start from zero if dataMin < 0:  (-100, 100) -> (-105, 105)": [
                    [-100, 100, SIMPLE_STACKED],
                    {min: -105, max: 105},
                ],
            },
            'bars (stacked)': {
                'should start from zero, if dataMin >= 0:  (50, 1000) -> (0, 1100)': [
                    [50, 1000, SIMPLE_10_STACKED],
                    {min: 0, max: 1100},
                ],
                "shouldn't start from zero if dataMin < 0:  (-100, 100) -> (-110, 110)": [
                    [-100, 100, SIMPLE_10_STACKED],
                    {min: -110, max: 110},
                ],
            },
        };

        Object.entries(SAMPLES).forEach(([title, samples]) => {
            describe(title, () => {
                Object.entries(samples).forEach(([text, [args, target]]) => {
                    test(text, () => {
                        expect(offsetScale(...args)).toEqual(target);
                    });
                });
            });
        });
    });
});
