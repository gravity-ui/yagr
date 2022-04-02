import {MinimalValidConfig} from '../../src';
import Yagr from '../../src/YagrCore';

describe('yagr methods', () => {
    describe('setFocus', () => {
        const DEFAULT_CONFIG: MinimalValidConfig = {
            timeline: [1, 2],
            series: [
                {data: [1, 2], id: '1'},
                {data: [3, 4], id: '2'},
            ],
        };

        it('should set focus on a serie', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            y.setFocus('1', true);
            expect(y.getById('1')._focus).toBe(true);
            expect(y.getById('2')._focus).toBe(false);
        });

        it('should set focus on all series', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            y.setFocus(null, true);
            expect(y.getById('1')._focus).toBe(null);
            expect(y.getById('2')._focus).toBe(null);
        });
    });

    describe('setVisibility', () => {
        const DEFAULT_CONFIG: MinimalValidConfig = {
            timeline: [1, 2],
            series: [
                {data: [1, 2], id: '1', show: false},
                {data: [3, 4], id: '2'},
            ],
        };

        it('should draw correct with initial state', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            expect(y.getById('1').show).toBe(false);
            expect(y.getById('2').show).toBe(true);
        });

        it('should set visible on a serie', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            y.setVisible('1', true);
            expect(y.getById('1').show).toBe(true);
            expect(y.getById('2').show).toBe(true);
        });

        it('should set focus on all series', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);
            y.setVisible(null, false);
            expect(y.getById('1').show).toBe(false);
            expect(y.getById('2').show).toBe(false);

            y.setVisible(null, true);
            expect(y.getById('1').show).toBe(true);
            expect(y.getById('2').show).toBe(true);
        });
    });
});
