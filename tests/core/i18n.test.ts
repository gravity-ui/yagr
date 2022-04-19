import Yagr from '../../src/YagrCore';

const DEFAULT_CONFIG = {
    timeline: [1, 2],
    series: [{data: [1, 2]}],
};

describe('i18n', () => {
    it('should set EN locale as default', () => {
        const y = new Yagr(window.document.body, DEFAULT_CONFIG);
        expect(y.utils.i18n('sum')).toBe('Total');
    });

    it('should set RU locale from settings.locale', () => {
        const y = new Yagr(window.document.body, {...DEFAULT_CONFIG, chart: {appereance: {locale: 'ru'}}});
        expect(y.utils.i18n('sum')).toBe('Сумма');
    });

    it('should accept custom locale', () => {
        const y = new Yagr(window.document.body, {...DEFAULT_CONFIG, chart: {appereance: {locale: {sum: 'Գումարը'}}}});
        expect(y.utils.i18n('sum')).toBe('Գումարը');
    });
});
