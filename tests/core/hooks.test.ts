import {MinimalValidConfig} from '../../src';
import Yagr from '../../src/YagrCore';
import dataRefs from '../../src/YagrCore/plugins/dataRefs/dataRefs';

describe('yagr hooks', () => {
    it('should call ready hook', async () => {
        await new Promise<void>((resolve) => {
            const cfg: MinimalValidConfig = {
                timeline: [1, 2, 3],
                series: [{data: [1, 2, 3]}],
                plugins: {
                    dataRefs,
                },
                hooks: {
                    ready: [
                        () => {
                            expect(true).toBeTruthy();
                            resolve();
                        },
                    ],
                },
            };

            // eslint-disable-next-line no-new
            new Yagr(window.document.body, cfg);
        });
    });

    it('should call stage hooks', async () => {
        const processedStages: string[] = [];

        await new Promise<void>((resolve) => {
            const cfg: MinimalValidConfig = {
                timeline: [1, 2, 3],
                series: [{data: [1, 2, 3]}],
                plugins: {
                    dataRefs,
                },
                hooks: {
                    stage: [({stage}) => processedStages.push(stage)],
                    ready: [
                        async () => {
                            await expect(processedStages).toEqual(['config', 'processing', 'uplot', 'render']);
                            resolve();
                        },
                    ],
                },
            };

            // eslint-disable-next-line no-new
            new Yagr(window.document.body, cfg);
        });
    });
});
