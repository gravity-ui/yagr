import Yagr from '../../src/YagrCore';
import dataRefs from '../../src/YagrCore/plugins/dataRefs/dataRefs';

describe('yagr plugins', () => {
    it('should be able to use dataRefs plugin', async () => {
        const cfg = {
            timeline: [1, 2, 3],
            series: [{data: [1, 2, 3]}],
            plugins: {
                dataRefs,
            },
        };

        const u = await new Promise<Yagr<typeof cfg>>((resolve) => {
            const y = new Yagr(window.document.body, {
                ...cfg,
                hooks: {
                    error: [console.error],
                    ready: [
                        () => {
                            resolve(y);
                        },
                    ],
                },
            });
        });

        expect(u.plugins.dataRefs).toBeDefined();
        expect(u.plugins.dataRefs.getRefs()).toEqual({
            y: {
                avg: 2,
                count: 3,
                max: 3,
                min: 1,
                sum: 6,
            },
        });
    });
});
