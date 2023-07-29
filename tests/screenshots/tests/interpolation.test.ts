import {getScreenshot} from '../utils';

describe('interpolation', () => {
    it.each([
        {
            type: 'closest',
            snapToValues: 'closest',
        } as const,
        {
            type: 'closest',
            snapToValues: 'left',
        } as const,
        {
            type: 'closest',
            snapToValues: 'right',
        } as const,
        {
            type: 'closest',
            snapToValues: false,
        } as const,
        {
            type: 'next',
            snapToValues: 'closest',
        } as const,
        {
            type: 'next',
            snapToValues: 'left',
        } as const,
        {
            type: 'next',
            snapToValues: 'right',
        } as const,
        {
            type: 'next',
            snapToValues: false,
        } as const,
        {
            type: 'previous',
            snapToValues: 'closest',
        } as const,
        {
            type: 'previous',
            snapToValues: 'left',
        } as const,
        {
            type: 'previous',
            snapToValues: 'right',
        } as const,
        {
            type: 'previous',
            snapToValues: false,
        } as const,
        {
            type: 'linear',
            snapToValues: 'closest',
        } as const,
        {
            type: 'linear',
            snapToValues: 'left',
        } as const,
        {
            type: 'linear',
            snapToValues: 'right',
        } as const,
        {
            type: 'linear',
            snapToValues: false,
        } as const,
        {
            type: 'right',
            snapToValues: 'closest',
        } as const,
        {
            type: 'right',
            snapToValues: 'left',
        } as const,
        {
            type: 'right',
            snapToValues: 'right',
        } as const,
        {
            type: 'right',
            snapToValues: false,
        } as const,
        {
            type: 'left',
            snapToValues: 'closest',
        } as const,
        {
            type: 'left',
            snapToValues: 'left',
        } as const,
        {
            type: 'left',
            snapToValues: 'right',
        } as const,
        {
            type: 'left',
            snapToValues: false,
        } as const,
    ])('should render type=$type snap=$snapToValues', async (conf) => {
        const image = await getScreenshot(async (conf) => {
            const y = await window.AsyncYagr(window.test, {
                timeline: [1, 2, 3, 4, 5],
                chart: {
                    series: {
                        type: 'area',
                    },
                },
                scales: {
                    y: {
                        stacking: true,
                    },
                },
                series: [
                    {
                        data: [1, 'x', 2, 'x', 2],
                        color: 'red',
                    },
                    {
                        data: [1, 3, 2, 5, 2],
                        color: 'green',
                    },
                    {
                        data: ['x', 'x', 2, 4, 'x'],
                        color: 'blue',
                    },
                    {
                        data: ['x', 3, 3, 4, 'x'],
                        color: 'orange',
                    },
                ],
                processing: {
                    interpolation: {
                        value: 'x',
                        type: 'linear',
                        ...conf,
                    },
                },
            });

            y.uplot.setCursor({left: 150, top: 50});
        }, conf);
        expect(image).toMatchImageSnapshot();

        const after = await getScreenshot(async (conf) => {
            const y = await window.AsyncYagr(window.test, {
                timeline: [1, 2, 3, 4, 5],
                chart: {
                    series: {
                        type: 'area',
                    },
                },
                scales: {
                    y: {
                        stacking: true,
                    },
                },
                series: [
                    {
                        data: [1, 'x', 2, 'x', 2],
                        color: 'red',
                    },
                    {
                        data: [1, 3, 2, 5, 2],
                        color: 'green',
                    },
                    {
                        data: ['x', 'x', 2, 4, 'x'],
                        color: 'blue',
                    },
                    {
                        data: ['x', 3, 3, 4, 'x'],
                        color: 'orange',
                    },
                ],
                processing: {
                    interpolation: {
                        value: 'x',
                        type: 'linear',
                        ...conf,
                    },
                },
            });

            y.uplot.setCursor({left: 700, top: 50});
        }, conf);

        expect(after).toMatchImageSnapshot({
            customSnapshotIdentifier: ({defaultIdentifier}) => {
                return `${defaultIdentifier}-end`;
            },
        });
    });
});
