import {TooltipHandler} from '../../src';
import Yagr from '../../src/YagrCore';

describe('tooltip', () => {
    const yagr = new Yagr(window.document.body, {
        timeline: [1, 2, 3, 4],
        series: [{data: [1, 2, 3, 4]}],
    });

    it('should render tooltip', () => {
        expect(yagr.root.querySelector('.yagr-tooltip')).toBeTruthy();
    });

    describe('on/off', () => {
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
});
