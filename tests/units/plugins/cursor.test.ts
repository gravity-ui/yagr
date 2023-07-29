import Yagr from '../../../src/YagrCore';
import {cursorPoint} from '../../../src/YagrCore/plugins/cursor/cursor';

describe('cursor plugin', () => {
    describe('rendering', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);

        afterAll(() => {
            document.body.removeChild(el);
        });

        const y = new Yagr(el, {
            timeline: [1, 2, 3],
            series: [{id: '0', data: [1, 2, 3], color: 'rgb(255, 0, 0)'}],
        });

        it('should render cursor points', () => {
            expect(y.root.querySelectorAll('.yagr-point').length).toBe(1);
        });

        it('should render cursor points with correct colors', () => {
            const pt = y.root.querySelector('.yagr-point') as HTMLElement;
            expect(pt.style.background).toBe('rgb(255, 0, 0)');
        });

        it('should change color when setSeries triggered', async () => {
            y.setSeries(0, {color: 'rgb(0, 128, 0)'});
            setTimeout(() => {
                const pt = y.root.querySelector('.yagr-point') as HTMLElement;
                expect(pt.style.background).toBe('rgb(0, 128, 0)');
            }, 15);
        });

        it('should hide cursor point when series is empty', async () => {
            y.setSeries(0, {data: [null, null, null]});
            setTimeout(() => {
                const pt = y.root.querySelector('.yagr-point') as HTMLElement;
                expect(pt.style.display).toBe('none');
            }, 15);
        });
    });

    describe('methods', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);

        const y = new Yagr(el, {
            timeline: [1, 2, 3],
            series: [
                {id: '0', data: [1, 2, 3], color: 'rgb(255, 0, 0)'},
                {id: '1', data: [null, null, null], color: 'rgb(0, 255, 0)'},
            ],
        });

        afterAll(() => {
            document.body.removeChild(el);
        });

        it('should render cursor point element', () => {
            expect(cursorPoint(y.uplot, y.state.y2uIdx['0']).style.display).not.toBe('none');
            expect(cursorPoint(y.uplot, y.state.y2uIdx['1']).style.display).toBe('none');
        });
    });
});
