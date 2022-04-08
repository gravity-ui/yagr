import Yagr from '../../src/YagrCore';

describe('cursor plugin', () => {
    describe('rendering', () => {
        const y = new Yagr(window.document.body, {
            timeline: [1, 2, 3],
            series: [{data: [1, 2, 3], color: 'rgb(255, 0, 0)'}],
        });

        it('should render cursror points', () => {
            expect(y.root.querySelectorAll('.yagr-point').length).toBe(1);
        });

        it('should render cursor points with correct colors', () => {
            const pt = y.root.querySelector('.yagr-point') as HTMLElement;
            expect(pt.style.background).toBe('rgb(255, 0, 0)');
        });

        it('should change color when setSeries triggered', () => {
            y.setSeries(0, {color: 'rgb(0, 255, 0)'});
            const pt = y.root.querySelector('.yagr-point') as HTMLElement;
            expect(pt.style.background).toBe('rgb(0, 255, 0)');
        });
    });
});
