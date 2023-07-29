import {getScreenshot} from '../utils';

describe('tooltip plugin', () => {
    describe('options', () => {
        it('should render tooltip', async () => {
            const image = await getScreenshot(async () => {
                const y = await window.AsyncYagr(window.test, {
                    timeline: [1, 2, 3, 4, 5],
                    series: [
                        {
                            data: [1, 3, 2, 6, 2],
                            color: 'red',
                        },
                    ],
                });

                y.uplot.setCursor({left: 20, top: 100});
            });
            expect(image).toMatchImageSnapshot();
        });

        it('shouldnt render tooltip if disable', async () => {
            const image = await getScreenshot(async () => {
                const y = await window.AsyncYagr(window.test, {
                    timeline: [1, 2, 3, 4, 5],
                    series: [
                        {
                            data: [1, 3, 2, 6, 2],
                            color: 'red',
                        },
                    ],
                    tooltip: {
                        show: false,
                    },
                });

                y.uplot.setCursor({left: 20, top: 100});
            });
            expect(image).toMatchImageSnapshot();
        });

        it.each([
            {
                key: 'sum',
                value: {
                    sum: true,
                },
            },
            {
                key: 'sum [per scale]',
                value: {
                    sum: {
                        y: true,
                        r: false,
                    },
                },
            },
            {
                key: 'percent',
                value: {
                    percent: true,
                },
            },
            {
                key: 'percent [per scale]',
                value: {
                    percent: {
                        y: true,
                        r: false,
                    },
                },
            },
            {
                key: 'title',
                value: {
                    title: 'Title',
                },
            },
            {
                key: 'title [per scale]',
                value: {
                    title: {
                        y: 'Y Title',
                        r: 'R Title',
                    },
                },
            },
            {
                key: 'precision',
                value: {
                    precision: 3,
                },
            },
            {
                key: 'precision [per scale]',
                value: {
                    precision: {
                        y: 3,
                        r: 2,
                    },
                },
            },
            {
                key: 'value',
                value: {
                    value: (x: string | number | null) => x + ' [MOD]',
                },
            },
            {
                key: 'value [per scale]',
                value: {
                    value: {
                        y: (x: string | number | null) => x + ' [MOD] Y',
                        r: (x: string | number | null) => x + ' [MOD] R',
                    },
                },
            },
        ])('should render tooltip with $key = $value', async ({value}) => {
            const image = await getScreenshot(async (patch) => {
                const y = await window.AsyncYagr(window.test, {
                    timeline: [1, 2, 3, 4, 5],
                    series: [
                        {
                            data: [1, 3, 2, 6, 2],
                            color: 'red',
                            scale: 'y',
                        },
                        {
                            data: [5, 3, 2, 5, 1],
                            color: 'blue',
                            scale: 'r',
                        },
                    ],
                    tooltip: {
                        ...patch,
                    },
                });

                y.uplot.setCursor({left: 20, top: 100});
            }, value);
            expect(image).toMatchImageSnapshot();
        });

        it('should track correct line, sticky', async () => {
            const image = await getScreenshot(async () => {
                const y = await window.AsyncYagr(window.test, {
                    timeline: [1, 2, 3],
                    series: [
                        {
                            data: [1, 1, 1],
                            color: 'red',
                        },
                        {
                            data: [5, 5, 5],
                            color: 'blue',
                        },
                    ],
                    tooltip: {
                        tracking: 'sticky',
                    },
                });

                y.uplot.setCursor({left: 20, top: 100});
            });
            expect(image).toMatchImageSnapshot();
        });

        it('should track correct line, area', async () => {
            const image = await getScreenshot(async () => {
                const y = await window.AsyncYagr(window.test, {
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
                    timeline: [1, 2, 3],
                    series: [
                        {
                            data: [1, 1, 1],
                            color: 'red',
                        },
                        {
                            data: [5, 5, 5],
                            color: 'blue',
                        },
                    ],
                    tooltip: {
                        tracking: 'sticky',
                    },
                });

                y.uplot.setCursor({left: 20, top: 100});
            });
            expect(image).toMatchImageSnapshot();
        });

        it('should track correct line, sticky, bottom', async () => {
            const image = await getScreenshot(async () => {
                const y = await window.AsyncYagr(window.test, {
                    timeline: [1, 2, 3],
                    series: [
                        {
                            data: [1, 1, 1],
                            color: 'red',
                        },
                        {
                            data: [5, 5, 5],
                            color: 'blue',
                        },
                    ],
                    tooltip: {
                        tracking: 'sticky',
                    },
                });

                y.uplot.setCursor({left: 20, top: 300});
            });
            expect(image).toMatchImageSnapshot();
        });

        it('should track correct line, area, bottom', async () => {
            const image = await getScreenshot(async () => {
                const y = await window.AsyncYagr(window.test, {
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
                    timeline: [1, 2, 3],
                    series: [
                        {
                            data: [1, 1, 1],
                            color: 'red',
                        },
                        {
                            data: [5, 5, 5],
                            color: 'blue',
                        },
                    ],
                    tooltip: {
                        tracking: 'sticky',
                    },
                });

                y.uplot.setCursor({left: 20, top: 300});
            });
            expect(image).toMatchImageSnapshot();
        });
    });
});
