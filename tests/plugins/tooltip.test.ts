import {MinimalValidConfig, TooltipHandler} from '../../src';
import Yagr from '../../src/YagrCore';

const gen = (cfg: MinimalValidConfig) => {
    const el = window.document.createElement('div');
    window.document.body.appendChild(el);

    return new Yagr(el, cfg);
};

describe('tooltip', () => {
    describe('options', () => {
        beforeEach(() => {
            window.document.body.innerHTML = '';
        });

        it('should render tooltip', () => {
            const yagr = gen({
                timeline: [1, 2, 3, 4],
                series: [{data: [1, 2, 3, 4]}],
            });

            expect(window.document.querySelector(`#${yagr.id}_tooltip`)).toBeTruthy();
        });

        it('should render tooltip sum', async () => {
            const yagr = gen({
                timeline: [1, 2, 3, 4],
                series: [{data: [1, 2, 3, 4]}],
            });

            yagr.uplot.setCursor({left: 10, top: 10});

            await expect(window.document.querySelector(`.__section_sum`)).toBeFalsy();

            yagr.uplot.setCursor({left: -10, top: -10});
            yagr.plugins.tooltip?.updateOptions({
                sum: true,
            });

            yagr.uplot.setCursor({left: 15, top: 15});
            yagr.plugins.tooltip?.on('show', () => {
                expect(window.document.querySelector(`.__section_sum`)).not.toBeNull();
            });
        });
    });

    describe('perScale', () => {
        const y = gen({
            timeline: [1, 2, 3, 4],
            series: [
                {data: [1, 2, 3, 4], scale: 'y'},
                {data: [1, 2, 3, 4], scale: 'r'},
            ],
            tooltip: {
                title: {
                    y: 'X Title',
                    r: 'R Title',
                },
                sum: {
                    y: true,
                    r: false,
                },
            },
        });

        y.plugins.tooltip?.display({left: 0, top: 0, idx: 0});

        const tElem = window.document.querySelector(`#${y.id}_tooltip`) as HTMLElement;

        it('should separate tooltip sections by scales', () => {
            expect(tElem.querySelectorAll('.yagr-tooltip .__section').length).toBe(2);
        });

        it('should render data-scale attr', () => {
            expect(tElem.querySelectorAll('[data-scale]').length).toBe(2);
        });

        it('should render tooltip sum', () => {
            expect(tElem.querySelectorAll('.__section_sum').length).toBe(1);
        });
    });

    describe('on/off', () => {
        const yagr = gen({
            timeline: [1, 2, 3, 4],
            series: [{data: [1, 2, 3, 4]}],
        });

        const handler = jest.fn();

        it('should .on(event) work', async () => {
            const data = await new Promise<Parameters<TooltipHandler>[1]>((resolve) => {
                yagr.plugins.tooltip?.on('show', handler);
                yagr.plugins.tooltip?.on('show', (_, data) => {
                    resolve(data);
                });
                yagr.uplot.setCursor({left: 10, top: 10});
            });

            expect(handler).toBeCalledTimes(1);
            expect(data.state.visible).toBe(true);
        });

        it('should .of(event) work', async () => {
            yagr.plugins.tooltip?.off('show', handler);
            yagr.uplot.setCursor({left: 12, top: 12});

            await new Promise((resolve) => setTimeout(resolve, 1000));

            expect(handler).toBeCalledTimes(1);
        });
    });

    describe('pinning', () => {
        it('shouldnt pin tooltip if strategy=none', async () => {
            const yagr = gen({
                timeline: [1, 2, 3, 4],
                series: [{data: [1, 2, 3, 4]}],
                tooltip: {
                    strategy: 'none',
                },
            });

            yagr.uplot.over.dispatchEvent(new MouseEvent('mousedown', {clientX: 30, clientY: 30}));
            await new Promise((resolve) => setTimeout(resolve, 100));
            yagr.uplot.over.dispatchEvent(new MouseEvent('mouseup', {clientX: 30, clientY: 30}));
            expect(yagr.plugins.tooltip?.state.pinned).toBe(false);
        });

        it('shouldnt pin tooltip if strategy=none', async () => {
            const yagr = gen({
                timeline: [1, 2, 3, 4],
                series: [{data: [1, 2, 3, 4]}],
                tooltip: {
                    strategy: 'none',
                },
            });

            yagr.uplot.over.dispatchEvent(new MouseEvent('mousedown', {clientX: 30, clientY: 30}));
            await new Promise((resolve) => setTimeout(resolve, 100));
            yagr.uplot.over.dispatchEvent(new MouseEvent('mouseup', {clientX: 30, clientY: 30}));
            expect(yagr.plugins.tooltip?.state.pinned).toBe(false);
        });

        it('should pin tooltip if strategy=pin', async () => {
            const yagr = gen({
                timeline: [1, 2, 3, 4],
                series: [{data: [1, 2, 3, 4]}],
                tooltip: {
                    strategy: 'pin',
                },
            });

            yagr.uplot.over.dispatchEvent(new MouseEvent('mousedown', {clientX: 30, clientY: 30}));
            await new Promise((resolve) => setTimeout(resolve, 100));
            yagr.uplot.over.dispatchEvent(new MouseEvent('mouseup', {clientX: 30, clientY: 30}));
            expect(yagr.plugins.tooltip?.state.pinned).toBe(true);
        });

        it('shouldnt pin tooltip on drag if strategy=pin', async () => {
            const yagr = gen({
                timeline: [1, 2, 3, 4],
                series: [{data: [1, 2, 3, 4]}],
                tooltip: {
                    strategy: 'pin',
                },
            });

            yagr.uplot.over.dispatchEvent(new MouseEvent('mousedown', {clientX: 30, clientY: 30}));
            await new Promise((resolve) => setTimeout(resolve, 100));
            yagr.uplot.over.dispatchEvent(new MouseEvent('mousemove', {clientX: 40, clientY: 30}));
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(yagr.plugins.tooltip?.state.range).toHaveLength(2);
            yagr.uplot.over.dispatchEvent(new MouseEvent('mouseup', {clientX: 40, clientY: 30}));
            expect(yagr.plugins.tooltip?.state.pinned).toBe(false);
            expect(yagr.plugins.tooltip?.state.range).toBeNull();
        });

        it('should pin tooltip on drag if strategy=all', async () => {
            const yagr = gen({
                timeline: [1, 2, 3, 4],
                series: [{data: [1, 2, 3, 4]}],
                tooltip: {
                    strategy: 'all',
                },
            });

            yagr.uplot.over.dispatchEvent(new MouseEvent('mousedown', {clientX: 30, clientY: 30}));
            await new Promise((resolve) => setTimeout(resolve, 100));
            yagr.uplot.over.dispatchEvent(new MouseEvent('mousemove', {clientX: 40, clientY: 30}));
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(yagr.plugins.tooltip?.state.range).toHaveLength(2);
            yagr.uplot.over.dispatchEvent(new MouseEvent('mouseup', {clientX: 40, clientY: 30}));
            expect(yagr.plugins.tooltip?.state.pinned).toBe(true);
            expect(yagr.plugins.tooltip?.state.range).toBeNull();
        });
    });
});
