import Yagr from '../../src/YagrCore';
import WeekendsPlugin from '../../src/plugins/weekends/weekends';

describe('weekends plugin', () => {
    const now = 0;
    const day = 24 * 60 * 60 * 1000;
    const cfg = {
        series: [
            {
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
            },
        ],
        timeline: new Array(10).fill(0).map((_, i) => now + i * day),
    };

    it('should set plotline with label', () => {
        const y = new Yagr(document.createElement('div'), {
            ...cfg,
            plugins: {
                weekends: WeekendsPlugin(),
            },
        });

        expect(y.plugins.plotLines?.get().length).toBe(2);
        expect(y.plugins.plotLines?.get()[0].label).toBe('Weekend');
    });

    it('should set plotline with custom label and color', () => {
        const y = new Yagr(document.createElement('div'), {
            ...cfg,
            plugins: {
                weekends: WeekendsPlugin({
                    label: 'some',
                    color: 'orange',
                }),
            },
        });

        expect(y.plugins.plotLines?.get().length).toBe(2);
        expect(y.plugins.plotLines?.get()[0].label).toBe('some');
        expect(y.plugins.plotLines?.get()[0].color).toBe('orange');
    });
});
