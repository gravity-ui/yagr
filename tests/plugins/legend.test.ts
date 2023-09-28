import { Series } from 'uplot';
import {MinimalValidConfig} from '../../src';
import Yagr from '../../src/YagrCore';
import {DEFAULT_X_SERIE_NAME} from '../../src/YagrCore/defaults';
import {hasOneVisibleLine} from '../../src/YagrCore/plugins/legend/legend';

const getUSeries = (series: Series[]) => {
    const [, ...s] = series;
    return s;
};

describe('legend', () => {
    const cfg: MinimalValidConfig = {
        series: [
            {
                data: [1, 2, 3, 4],
                id: '1',
            },
            {
                data: [1, 2, 3, 4],
                id: '2',
            },
            {
                data: [1, 2, 3, 4],
                id: '3',
            },
            {
                data: [1, 2, 3, 4],
                id: '4',
            },
        ],
        timeline: [1, 2, 3, 4],
    };

    const el = document.createElement('div');
    el.style.width = '600px';
    el.style.height = '400px';
    document.body.appendChild(el);

    describe('placement', () => {
        afterEach(() => {
            el.innerHTML = '';
        });

        it('should render legend on top', () => {
            const y = new Yagr(el, {
                ...cfg,
                legend: {
                    show: true,
                    position: 'top',
                },
            });

            expect(y.root.querySelector('.yagr-legend')).toBeTruthy();
            expect(y.root.firstChild).toBe(y.root.querySelector('.yagr-legend'));
        });

        it('should render legend on bottom', () => {
            const y = new Yagr(el, {
                ...cfg,
                legend: {
                    show: true,
                    position: 'bottom',
                },
            });

            expect(y.root.querySelector('.yagr-legend')).toBeTruthy();
            expect(y.root.lastChild).toBe(y.root.querySelector('.yagr-legend'));
        });
    });

    describe('basic interaction', () => {
        it('should toggle series on click', async () => {
            const y = new Yagr(el, {
                ...cfg,
                legend: {
                    show: true,
                },
            });

            const seriesIcon = el.querySelector('[data-serie-id="1"]') as HTMLElement;
            expect(y.uplot.series[y.state.y2uIdx['1']].show).toBeTruthy();
            expect(seriesIcon).toBeTruthy();
            const event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            });
            seriesIcon!.dispatchEvent(event);
            await new Promise((resolve) => setTimeout(resolve, 200));
            expect(seriesIcon?.classList).toContain('yagr-legend__item_hidden');
            expect(y.uplot.series[y.state.y2uIdx['1']].show).toBeFalsy();
            seriesIcon!.dispatchEvent(event);
            await new Promise((resolve) => setTimeout(resolve, 200));
            expect(seriesIcon?.classList).not.toContain('yagr-legend__item_hidden');
            expect(y.uplot.series[y.state.y2uIdx['1']].show).toBeTruthy();
        });

        it('should toggle by hide/show all', async () => {
            const y = new Yagr(el, {
                ...cfg,
                legend: {
                    show: true,
                },
            });

            const toggleBtn = el.querySelector('.yagr-legend__all-series') as HTMLElement;

            expect(hasOneVisibleLine(getUSeries(y.uplot.series))).toBeTruthy();
            expect(toggleBtn).toBeTruthy();
            expect(toggleBtn?.innerHTML).toContain('Hide all');
            const event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            });
            toggleBtn!.dispatchEvent(event);
            await new Promise((resolve) => setTimeout(resolve, 200));
            expect(hasOneVisibleLine(getUSeries(y.uplot.series))).toBeFalsy();
            expect(toggleBtn?.innerHTML).toContain('Show all');
            toggleBtn!.dispatchEvent(event);
            await new Promise((resolve) => setTimeout(resolve, 200));
            expect(toggleBtn?.innerHTML).toContain('Hide all');
            expect(hasOneVisibleLine(getUSeries(y.uplot.series))).toBeTruthy();
        });
    });

    describe('extended interaction', () => {
        it('should toggle series on ctrl/cmd+click', async () => {
            const runEvents = async (key: 'ctrl' | 'meta') => {
                const y = new Yagr(el, {
                    ...cfg,
                    legend: {
                        show: true,
                        behaviour: 'extended',
                    },
                });

                const seriesIcon = el.querySelector('[data-serie-id="1"]') as HTMLElement;
                const serie = y.uplot.series[y.state.y2uIdx['1']];
                expect(seriesIcon).toBeTruthy();
                expect(serie).toBeTruthy();
                expect(serie.show).toBeTruthy();

                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    ctrlKey: key === 'ctrl',
                    metaKey: key === 'meta',
                });

                seriesIcon!.dispatchEvent(clickEvent);
                await new Promise((resolve) => setTimeout(resolve, 200));
                expect(seriesIcon?.classList).toContain('yagr-legend__item_hidden');
                expect(serie.show).toBeFalsy();

                seriesIcon!.dispatchEvent(clickEvent);
                await new Promise((resolve) => setTimeout(resolve, 200));
                expect(seriesIcon?.classList).not.toContain('yagr-legend__item_hidden');
                expect(serie.show).toBeTruthy();
            };

            await runEvents('ctrl');
            await runEvents('meta');
        });

        it('should select series on first click, should show all on second click', async () => {
            const y = new Yagr(el, {
                ...cfg,
                legend: {
                    show: true,
                    behaviour: 'extended',
                },
            });

            const seriesIcon = el.querySelector('[data-serie-id="1"]') as HTMLElement;
            const serie = y.uplot.series[y.state.y2uIdx['1']];
            expect(seriesIcon).toBeTruthy();
            expect(serie).toBeTruthy();
            expect(serie.show).toBeTruthy();

            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            });

            seriesIcon!.dispatchEvent(clickEvent);

            await new Promise((resolve) => setTimeout(resolve, 200));
            y.uplot.series.forEach((s) => {
                if (s.id === DEFAULT_X_SERIE_NAME) {
                    return;
                }

                const node = el.querySelector(`[data-serie-id="${s.id}"]`);

                if (s.id === serie.id) {
                    expect(node?.classList).not.toContain('yagr-legend__item_hidden');
                    expect(s.show).toBeTruthy();
                } else {
                    expect(node?.classList).toContain('yagr-legend__item_hidden');
                    expect(s.show).toBeFalsy();
                }
            });

            seriesIcon!.dispatchEvent(clickEvent);
            await new Promise((resolve) => setTimeout(resolve, 200));
            y.uplot.series.forEach((s) => {
                if (s.id === DEFAULT_X_SERIE_NAME) {
                    return;
                }

                const node = el.querySelector(`[data-serie-id="${s.id}"]`);

                expect(node?.classList).not.toContain('yagr-legend__item_hidden');
                expect(s.show).toBeTruthy();
            });
        });

        it('should select range', async () => {
            const y = new Yagr(el, {
                ...cfg,
                legend: {
                    show: true,
                    behaviour: 'extended',
                },
            });

            const firstIcon = el.querySelector('[data-serie-id="2"]') as HTMLElement;
            const firstSerie = y.uplot.series[y.state.y2uIdx['2']];
            expect(firstIcon).toBeTruthy();
            expect(firstSerie).toBeTruthy();
            const secondIcon = el.querySelector('[data-serie-id="4"]') as HTMLElement;
            const secondSerie = y.uplot.series[y.state.y2uIdx['4']];
            expect(secondIcon).toBeTruthy();
            expect(secondSerie).toBeTruthy();

            const firstClickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            });

            const secondClickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                shiftKey: true,
            });

            firstIcon!.dispatchEvent(firstClickEvent);
            await new Promise((resolve) => setTimeout(resolve, 200));

            secondIcon!.dispatchEvent(secondClickEvent);
            await new Promise((resolve) => setTimeout(resolve, 200));

            const expectedRange = [1, 3];
            y.uplot.series.forEach((s, i) => {
                if (s.id === DEFAULT_X_SERIE_NAME) {
                    return;
                }

                const node = el.querySelector(`[data-serie-id="${s.id}"]`);

                if (i >= expectedRange[0] && i <= expectedRange[1]) {
                    expect(node?.classList).not.toContain('yagr-legend__item_hidden');
                    expect(s.show).toBeTruthy();
                } else {
                    expect(node?.classList).toContain('yagr-legend__item_hidden');
                    expect(s.show).toBeFalsy();
                }
            });
        });
    });
});
