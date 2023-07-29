import Yagr from '../../../src/YagrCore';

const DEFAULT_CONFIG = {
    timeline: [1, 2],
    series: [{data: [1, 2]}],
};

describe('options', () => {
    it('should set default theme = light', () => {
        const y = new Yagr(window.document.body, DEFAULT_CONFIG);
        expect(y.root.classList.contains('yagr_theme_light')).toBe(true);
    });

    it('should accept light theme and set correct class', () => {
        const y = new Yagr(window.document.body, {...DEFAULT_CONFIG, chart: {appearance: {theme: 'light'}}});
        expect(y.root.classList.contains('yagr_theme_light')).toBe(true);
    });

    it('should accept dark theme and set correct class', () => {
        const y = new Yagr(window.document.body, {...DEFAULT_CONFIG, chart: {appearance: {theme: 'dark'}}});
        expect(y.root.classList.contains('yagr_theme_dark')).toBe(true);
    });
});
