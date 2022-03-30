import {findDataIdx} from '../../src/YagrCore/utils/common';

describe('utils:findDataIdx', () => {
    describe('closest', () => {
        it('should find data idx left', () => {
            expect(
                findDataIdx(
                    [1, null, null, 0],
                    {
                        id: '1',
                        count: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                        sum: 0,
                        avg: 0,
                        getFocusedColor: () => 'red',
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
                        count: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                        sum: 0,
                        avg: 0,
                        getFocusedColor: () => 'red',
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
                        count: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                        sum: 0,
                        avg: 0,
                        getFocusedColor: () => 'red',
                    },
                    1,
                    'left',
                ),
            ).toBe(0);
        });

        it('should find data idx right', () => {
            expect(
                findDataIdx(
                    [1, null, null, 0],
                    {
                        id: '1',
                        count: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                        sum: 0,
                        avg: 0,
                        getFocusedColor: () => 'red',
                    },
                    2,
                    'left',
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
                        count: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                        sum: 0,
                        avg: 0,
                        getFocusedColor: () => 'red',
                    },
                    1,
                    'right',
                ),
            ).toBe(3);
        });

        it('should find data idx right', () => {
            expect(
                findDataIdx(
                    [1, null, null, 0],
                    {
                        id: '1',
                        count: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                        sum: 0,
                        avg: 0,
                        getFocusedColor: () => 'red',
                    },
                    2,
                    'right',
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
                        count: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                        sum: 0,
                        avg: 0,
                        getFocusedColor: () => 'red',
                    },
                    1,
                    'closest',
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
                        count: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                        sum: 0,
                        avg: 0,
                        getFocusedColor: () => 'red',
                    },
                    2,
                    'closest',
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
                        count: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                        sum: 0,
                        avg: 0,
                        getFocusedColor: () => 'red',
                    },
                    1,
                    'left',
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
                        count: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                        sum: 0,
                        avg: 0,
                        getFocusedColor: () => 'red',
                    },
                    2,
                    'left',
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
                        count: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                        sum: 0,
                        avg: 0,
                        getFocusedColor: () => 'red',
                    },
                    1,
                    'right',
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
                        count: 2,
                        $c: [],
                        name: '1',
                        color: 'red',
                        sum: 0,
                        avg: 0,
                        getFocusedColor: () => 'red',
                    },
                    2,
                    'right',
                    'x',
                ),
            ).toBe(3);
        });
    });
});
