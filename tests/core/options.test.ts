import {DEFAULT_X_SCALE, DEFAULT_X_SERIE_NAME} from '../../src/YagrCore/defaults';
import Yagr from '../../src/YagrCore';

const DEFAULT_CONFIG = {
    timeline: [1, 2],
    series: [{data: [1, 2]}],
};

describe('options', () => {
    describe('base series', () => {
        it('check X-series generation', () => {
            const y = new Yagr(window.document.body, DEFAULT_CONFIG);

            /** Check X-series generation */
            expect(y.options.series.length).toBe(2);
            expect(y.options.series[0].scale).toBe(DEFAULT_X_SCALE);
            expect(y.options.series[0].id).toBe(DEFAULT_X_SERIE_NAME);
            expect(y.options.series[0].$c).toEqual(DEFAULT_CONFIG.timeline);
        });
    });

    describe('custom settings and configs', () => {
        describe('settings.timeMultiplier', () => {
            it('should transform settings.timeMultiplier (default)', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);
                expect(y.options.ms).toBe(1);
            });

            it('should transform settings.timeMultiplier (passed)', () => {
                const y = new Yagr(window.document.body, {...DEFAULT_CONFIG, settings: {timeMultiplier: 1e-3}});
                expect(y.options.ms).toBe(1e-3);
            });
        });

        describe('chart.title', () => {
            it('undefined by default', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);
                expect(y.options.title).toBe(undefined);
            });

            it('title.text', () => {
                const y = new Yagr(window.document.body, {...DEFAULT_CONFIG, title: {text: 'Hey Joe!'}});
                expect(y.options.title).toBe('Hey Joe!');
            });

            it('title.fontSize', () => {
                const y = new Yagr(window.document.body, {...DEFAULT_CONFIG, title: {text: 'Hey Joe!', fontSize: 40}});
                const titleElem = y.root.querySelector('.u-title') as HTMLElement;
                expect(titleElem.style.lineHeight).toBe('40px');
                expect(titleElem.style.fontSize).toBe('40px');
            });
        });
    });
});
