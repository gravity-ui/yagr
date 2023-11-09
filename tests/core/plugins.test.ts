import {MinimalValidConfig} from '../../src';
import Yagr from '../../src/YagrCore';
import Aggregates from '../../src/plugins/aggregates/aggregates';

describe('yagr plugins', () => {
    it('should be able to use dataRefs plugin', async () => {
        const cfg = {
            timeline: [1, 2, 3],
            series: [{data: [1, 2, 3]}],
            plugins: {
                aggregates: Aggregates({}),
            },
        };

        const u = await new Promise<Yagr<typeof cfg>>((resolve) => {
            const y = new Yagr<MinimalValidConfig>(window.document.body, {
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

        expect(u.plugins.aggregates).toBeDefined();
        expect(u.plugins.aggregates?.get()).toEqual({
            y: {
                avg: 2,
                count: 3,
                max: 3,
                min: 1,
                sum: 6,
                last: null,
                integral: 0.004,
            },
        });
    });
});
