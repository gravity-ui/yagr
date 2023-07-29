import {preprocess} from '../../../src/YagrCore/utils/common';

describe('utils:preprocess', () => {
    describe('nullValues', () => {
        it('should replace nullValues', () => {
            expect(
                preprocess([[100, 'NULL', 12]], [1, 2, 3], {
                    nullValues: {
                        NULL: 'null',
                    },
                }),
            ).toEqual([[100, null, 12]]);
        });

        it('should replace multiple values', () => {
            expect(
                preprocess([['NULL', 'MULL', 'ZHULL']], [1, 2, 3], {
                    nullValues: {
                        NULL: 'null',
                        MULL: 'null',
                        ZHULL: 'null',
                    },
                }),
            ).toEqual([[null, null, null]]);
        });
    });

    describe('interpolation: linear', () => {
        it('base', () => {
            expect(
                preprocess([[100, 'x', 0]], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'linear',
                    },
                }),
            ).toEqual([[100, 50, 0]]);
        });

        it('should bring borders to null', () => {
            expect(
                preprocess([[100, 'x', 'x']], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'linear',
                    },
                }),
            ).toEqual([[100, null, null]]);

            expect(
                preprocess([['x', 100, 'x']], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'linear',
                    },
                }),
            ).toEqual([[null, 100, null]]);
        });

        it('should avoid nulls', () => {
            expect(
                preprocess([[100, 'x', null, 0]], [1, 2, 3, 4], {
                    interpolation: {
                        value: 'x',
                        type: 'linear',
                    },
                }),
            ).toEqual([[100, null, null, 0]]);

            expect(
                preprocess([[100, null, 'x', 0]], [1, 2, 3, 4], {
                    interpolation: {
                        value: 'x',
                        type: 'linear',
                    },
                }),
            ).toEqual([[100, null, null, 0]]);
        });
    });

    describe('interpolation: left', () => {
        it('base', () => {
            expect(
                preprocess([[100, 'x', 0]], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'left',
                    },
                }),
            ).toEqual([[100, 100, 0]]);
        });

        it('should bring left border to null, except continues empty line', () => {
            expect(
                preprocess([[100, 'x', 'x']], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'left',
                    },
                }),
            ).toEqual([[100, null, null]]);

            expect(
                preprocess([[100, 'x', 100, 'x']], [1, 2, 3, 4], {
                    interpolation: {
                        value: 'x',
                        type: 'left',
                    },
                }),
            ).toEqual([[100, 100, 100, null]]);

            expect(
                preprocess([['x', 100, 'x']], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'left',
                    },
                }),
            ).toEqual([[null, 100, null]]);
        });

        it('should avoid nulls', () => {
            expect(
                preprocess([[100, 'x', null, 0]], [1, 2, 3, 4], {
                    interpolation: {
                        value: 'x',
                        type: 'left',
                    },
                }),
            ).toEqual([[100, null, null, 0]]);

            expect(
                preprocess([[100, null, 'x', 0]], [1, 2, 3, 4], {
                    interpolation: {
                        value: 'x',
                        type: 'left',
                    },
                }),
            ).toEqual([[100, null, null, 0]]);
        });
    });

    describe('interpolation: right', () => {
        it('base', () => {
            expect(
                preprocess([[100, 'x', 0]], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'right',
                    },
                }),
            ).toEqual([[100, 0, 0]]);
        });

        it('should bring right border to null, except starting empty line', () => {
            expect(
                preprocess([[100, 'x', 'x']], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'right',
                    },
                }),
            ).toEqual([[100, null, null]]);

            expect(
                preprocess([['x', 100, 'x']], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'right',
                    },
                }),
            ).toEqual([[null, 100, null]]);

            expect(
                preprocess([['x', 100, 'x', 100]], [1, 2, 3, 4], {
                    interpolation: {
                        value: 'x',
                        type: 'right',
                    },
                }),
            ).toEqual([[null, 100, 100, 100]]);
        });

        it('should avoid nulls', () => {
            expect(
                preprocess([[100, 'x', null, 0]], [1, 2, 3, 4], {
                    interpolation: {
                        value: 'x',
                        type: 'right',
                    },
                }),
            ).toEqual([[100, null, null, 0]]);

            expect(
                preprocess([[100, null, 'x', 0]], [1, 2, 3, 4], {
                    interpolation: {
                        value: 'x',
                        type: 'right',
                    },
                }),
            ).toEqual([[100, null, 0, 0]]);
        });
    });

    describe('interpolation: previous', () => {
        it('base', () => {
            expect(
                preprocess([[100, 'x', 0]], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'previous',
                    },
                }),
            ).toEqual([[100, 100, 0]]);
        });

        it('should bring right border to null, including continues empty line', () => {
            expect(
                preprocess([[100, 'x', 'x']], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'previous',
                    },
                }),
            ).toEqual([[100, 100, 100]]);

            expect(
                preprocess([['x', 100, 'x']], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'previous',
                    },
                }),
            ).toEqual([[null, 100, 100]]);

            expect(
                preprocess([['x', 100, 'x', 100]], [1, 2, 3, 4], {
                    interpolation: {
                        value: 'x',
                        type: 'previous',
                    },
                }),
            ).toEqual([[null, 100, 100, 100]]);
        });
    });

    describe('interpolation: next', () => {
        it('base', () => {
            expect(
                preprocess([[100, 'x', 0]], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'next',
                    },
                }),
            ).toEqual([[100, 0, 0]]);
        });

        it('should bring right border to null, include starting empty line', () => {
            expect(
                preprocess([[100, 'x', 'x']], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'next',
                    },
                }),
            ).toEqual([[100, null, null]]);

            expect(
                preprocess([['x', 100, 'x']], [1, 2, 3], {
                    interpolation: {
                        value: 'x',
                        type: 'next',
                    },
                }),
            ).toEqual([[100, 100, null]]);

            expect(
                preprocess([['x', 100, 'x', 100]], [1, 2, 3, 4], {
                    interpolation: {
                        value: 'x',
                        type: 'next',
                    },
                }),
            ).toEqual([[100, 100, 100, 100]]);
        });
    });
});
