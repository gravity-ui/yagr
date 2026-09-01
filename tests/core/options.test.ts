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
        it('forwards orientation and direction for horizontal bars', () => {
            const each = jest.fn();
            const y = new Yagr(window.document.body, {
                timeline: [1, 2],
                scales: {
                    x: {time: false, ori: 1, dir: 1},
                    y: {ori: 0, dir: 1},
                },
                axes: {
                    x: {side: 'left'},
                    y: {side: 'bottom'},
                },
                series: [{type: 'column', data: [1, 2], renderOptions: {each}}],
            });

            expect(y.options.scales).toMatchObject({
                x: {time: false, ori: 1, dir: 1},
                y: {ori: 0, dir: 1},
            });
            expect(y.options.axes).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({scale: 'x', side: 3}),
                    expect.objectContaining({scale: 'y', side: 2}),
                ]),
            );
            expect(y.options.series[1]).toMatchObject({
                type: 'column',
                renderOptions: {each},
            });
        });

        describe('settings.timeMultiplier', () => {
            it('should transform settings.timeMultiplier (default)', () => {
                const y = new Yagr(window.document.body, DEFAULT_CONFIG);
                expect(y.options.ms).toBe(1);
            });

            it('should transform settings.timeMultiplier (passed)', () => {
                const y = new Yagr(window.document.body, {...DEFAULT_CONFIG, chart: {timeMultiplier: 1e-3}});
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
