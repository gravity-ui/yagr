import {Scale, ScaleType, ChartTypes, YagrConfig} from '../../src/YagrCore/types';
import {offsetScale} from '../../src/YagrCore/utils/scales';

type TArgs = [number, number, Scale, YagrConfig];
type TResult = {min: number; max: number};
type Samples = Record<string, [TArgs, TResult]>;
type DSamples = Record<string, Samples>;

describe('utils:scales', () => {
    describe('offsetScale', () => {
        const LINES = {
            chart: {type: ChartTypes.Line}, settings: {},
        } as YagrConfig;
        // const AREAS = {
        //     chart: {type: ChartTypes.Area},
        // } as YagrConfig;
        const AREAS_STACKED = {
            chart: {type: ChartTypes.Area}, settings: {stacking: true},
        } as YagrConfig
        const BARS_STACKED = {
            chart: {type: ChartTypes.Bars}, settings: {stacking: true},
        } as YagrConfig
        // const BARS = {
        //     chart: {type: ChartTypes.Bars},
        // } as YagrConfig
        // const DOTS = {
        //     chart: {type: ChartTypes.Dots},
        // } as YagrConfig


        const SIMPLE: Scale = {type: ScaleType.Linear, name: 'y'};
        const SIMPLE_10: Scale = {type: ScaleType.Linear, name: 'y', offset: 0.1};
        
        const SAMPLES: DSamples = {
            'simple line, 5% (default)': {
                '(50, 1000) -> (48, 1050)': [
                    [50, 1000, SIMPLE, LINES],
                    {min: 48, max: 1050},
                ],
                '(0, 100) -> (0, 105)': [
                    [0, 100, SIMPLE, LINES],
                    {min: 0, max: 105},
                ],
                '(-100, 100) -> (-105, 105)': [
                    [-100, 100, SIMPLE, LINES],
                    {min: -105, max: 105},
                ]
            },
            'simple line, 10% (custom)': {
                '(50, 1000) -> (45, 1100)': [
                    [50, 1000, SIMPLE_10, LINES],
                    {min: 45, max: 1100},
                ],
                '(0, 100) -> (0, 110)': [
                    [0, 100, SIMPLE_10, LINES],
                    {min: 0, max: 110},
                ],
                '(-100, 100) -> (-110, 110)': [
                    [-100, 100, SIMPLE_10, LINES],
                    {min: -110, max: 110},
                ]
            },
            'area (stacked)': {
                'should start from zero, if dataMin >= 0:  (50, 1000) -> (0, 1050)': [
                    [50, 1000, SIMPLE, AREAS_STACKED],
                    {min: 0, max: 1050},
                ],
                'shouldn\'t start from zero if dataMin < 0:  (-100, 100) -> (-105, 105)': [
                    [-100, 100, SIMPLE, AREAS_STACKED],
                    {min: -105, max: 105},
                ],
            },
            'bars (stacked)': {
                'should start from zero, if dataMin >= 0:  (50, 1000) -> (0, 1050)': [
                    [50, 1000, SIMPLE, BARS_STACKED],
                    {min: 0, max: 1050},
                ],
                'shouldn\'t start from zero if dataMin < 0:  (-100, 100) -> (-105, 105)': [
                    [-100, 100, SIMPLE, BARS_STACKED],
                    {min: -105, max: 105},
                ],
            }
        };

        Object.entries(SAMPLES).forEach(([title, samples]) => {
            describe(title, () => {
                Object.entries(samples).forEach(([text, [args, target]]) => {
                    test(text, () => {
                        expect(offsetScale(...args)).toEqual(target);
                    });
                });
            })
        });
    });
});
