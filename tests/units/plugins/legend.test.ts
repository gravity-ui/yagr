import {Series} from 'uplot';
import {MinimalValidConfig} from '../../../src';
import Yagr from '../../../src/YagrCore';
import {hasOneVisibleLine} from '../../../src/YagrCore/plugins/legend/legend';

const getUSeries = (series: Series[]) => {
    const [, ...s] = series;
    return s;
};

describe('legend', () => {
    const cfg: MinimalValidConfig = {
        series: [
            {
                data: [1, 2, 3],
                id: '1',
            },
            {
                data: [1, 2, 3],
                id: '2',
            },
            {
                data: [1, 2, 3],
                id: '3',
            },
        ],
        timeline: [1, 2, 3],
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

    describe('interaction', () => {
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
});
