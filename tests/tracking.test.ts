import {findInRange, findSticky} from '../src/YagrCore/utils/common';

describe('utils:findInRange', () => {
    describe('stickToRanges = true', () => {
        it('should find correct in range int[]', () => {
            const range = [100, 30, 12];

            expect(findInRange(range, 40)).toBe(0);
            expect(findInRange(range, 20)).toBe(1);
            expect(findInRange(range, 3)).toBe(2);
            expect(findInRange(range, 120)).toBe(0);
        });

        it('should find correct in range with nulls', () => {
            const range = [null, 100, null, 30, null, 12];

            expect(findInRange(range, 40)).toBe(1);
            expect(findInRange(range, 20)).toBe(3);
            expect(findInRange(range, 3)).toBe(5);
            expect(findInRange(range, 120)).toBe(1);
        });

        it('should work with negative numbers', () => {
            const range = [-300, -200, -100];

            expect(findInRange(range, -250)).toBe(0);
            expect(findInRange(range, -150)).toBe(1);
            expect(findInRange(range, 100)).toBe(2);
        });
    });

    describe('stickToRanges = false', () => {
        it('should find correct in range int[]', () => {
            const range = [100, 30, 12];

            expect(findInRange(range, 40, false)).toBe(0);
            expect(findInRange(range, 20, false)).toBe(1);
            expect(findInRange(range, 3, false)).toBe(2);
            expect(findInRange(range, 120, false)).toBe(null);
        });

        it('should find correct in range with nulls', () => {
            const range = [null, 100, null, 30, null, 12];

            expect(findInRange(range, 40, false)).toBe(1);
            expect(findInRange(range, 20, false)).toBe(3);
            expect(findInRange(range, 3, false)).toBe(5);
            expect(findInRange(range, 120, false)).toBe(null);
        });
    });

    it('should return null id range is empty', () => {
        expect(findInRange([null, null], 3)).toBe(null);
    });
});

describe('utils:findSticky', () => {
    it('should find nearest point', () => {
        const range = [100, 50, 0];

        expect(findSticky(range, 120)).toBe(0);
        expect(findSticky(range, 80)).toBe(0);
        expect(findSticky(range, 70)).toBe(1);
        expect(findSticky(range, 40)).toBe(1);
        expect(findSticky(range, 20)).toBe(2);
        expect(findSticky(range, -30)).toBe(2);
    });

    it('should find nearest point with nulls', () => {
        const range = [null, 100, null, null, 50, null, 0, null];
        expect(findSticky(range, 80)).toBe(1);
        expect(findSticky(range, 70)).toBe(4);
        expect(findSticky(range, 40)).toBe(4);
        expect(findSticky(range, 20)).toBe(6);
        expect(findSticky(range, -3)).toBe(6);
        expect(findSticky(range, 300)).toBe(1);
    });

    it('should return null if range is empty', () => {
        expect(findSticky([null, null, null], 80)).toBe(null);
        expect(findSticky([null, 3, null], 80)).toBe(1);
    });
});
