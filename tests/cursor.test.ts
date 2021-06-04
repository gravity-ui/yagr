import {SnapToValue} from '../src/YagrCore/types';
import {findDataIdx} from '../src/YagrCore/utils/common';

describe('utils:findDataIdx', () => {
    describe('closest', () => {
        it('should find data idx left', () => {
            expect(
                findDataIdx(
                    [1, null, null, 0],
                    {
                        id: '1',
                        _valuesCount: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                    },
                    1,
                ),
            ).toBe(0);
        });

        it('should find data idx right', () => {
            expect(
                findDataIdx(
                    [1, null, null, 0],
                    {
                        id: '1',
                        _valuesCount: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                    },
                    2,
                ),
            ).toBe(3);
        });
    });

    describe('left', () => {
        it('should find data idx left', () => {
            expect(
                findDataIdx(
                    [1, null, null, 0],
                    {
                        id: '1',
                        _valuesCount: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                    },
                    1,
                    SnapToValue.Left,
                ),
            ).toBe(0);
        });

        it('should find data idx right', () => {
            expect(
                findDataIdx(
                    [1, null, null, 0],
                    {
                        id: '1',
                        _valuesCount: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                    },
                    2,
                    SnapToValue.Left,
                ),
            ).toBe(0);
        });
    });

    describe('right', () => {
        it('should find data idx left', () => {
            expect(
                findDataIdx(
                    [1, null, null, 0],
                    {
                        id: '1',
                        _valuesCount: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                    },
                    1,
                    SnapToValue.Right,
                ),
            ).toBe(3);
        });

        it('should find data idx right', () => {
            expect(
                findDataIdx(
                    [1, null, null, 0],
                    {
                        id: '1',
                        _valuesCount: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                    },
                    2,
                    SnapToValue.Right,
                ),
            ).toBe(3);
        });
    });

    ///////

    describe('closest (specialValue)', () => {
        it('should find data idx left', () => {
            expect(
                findDataIdx(
                    [1, 'x', 'x', 0],
                    {
                        id: '1',
                        _valuesCount: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                    },
                    1,
                    SnapToValue.Closest,
                    'x',
                ),
            ).toBe(0);
        });

        it('should find data idx right', () => {
            expect(
                findDataIdx(
                    [1, 'x', 'x', 0],
                    {
                        id: '1',
                        _valuesCount: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                    },
                    2,
                    SnapToValue.Closest,
                    'x',
                ),
            ).toBe(3);
        });
    });

    describe('left (specialValue)', () => {
        it('should find data idx left', () => {
            expect(
                findDataIdx(
                    [1, 'x', 'x', 0],
                    {
                        id: '1',
                        _valuesCount: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                    },
                    1,
                    SnapToValue.Left,
                    'x',
                ),
            ).toBe(0);
        });

        it('should find data idx right', () => {
            expect(
                findDataIdx(
                    [1, 'x', 'x', 0],
                    {
                        id: '1',
                        _valuesCount: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                    },
                    2,
                    SnapToValue.Left,
                    'x',
                ),
            ).toBe(0);
        });
    });

    describe('right (specialValue)', () => {
        it('should find data idx left', () => {
            expect(
                findDataIdx(
                    [1, 'x', 'x', 0],
                    {
                        id: '1',
                        _valuesCount: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                    },
                    1,
                    SnapToValue.Right,
                    'x',
                ),
            ).toBe(3);
        });

        it('should find data idx right', () => {
            expect(
                findDataIdx(
                    [1, 'x', 'x', 0],
                    {
                        id: '1',
                        _valuesCount: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                    },
                    2,
                    SnapToValue.Right,
                    'x',
                ),
            ).toBe(3);
        });
    });
});
