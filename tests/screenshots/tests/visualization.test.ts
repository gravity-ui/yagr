import {ChartType, InterpolationType} from '../../../src';
import {getImage} from '../utils';

describe('visualization types', () => {
    it.each(['line', 'area', 'column', 'dots'])('should render chart.series.type = %s', async (type) => {
        const image = await getImage({
            chart: {
                series: {
                    type: type as ChartType,
                },
            },
            timeline: [1, 2, 3],
            series: [
                {
                    data: [1, 2, 3],
                    color: 'red',
                },
                {
                    data: [3, 2, 1],
                    color: 'green',
                },
            ],
        });
        expect(image).toMatchImageSnapshot();
    });

    it.each(['line', 'area', 'column', 'dots'])('should render series.type = %s', async (type) => {
        const image = await getImage({
            chart: {
                series: {
                    type: type === 'line' ? 'area' : 'line',
                },
            },
            timeline: [1, 2, 3],
            series: [
                {
                    data: [1, 2, 3],
                    color: 'red',
                },
                {
                    data: [3, 2, 1],
                    color: 'green',
                    type: type as ChartType,
                },
            ],
        });
        expect(image).toMatchImageSnapshot();
    });
});

describe('common properties', () => {
    it.each([
        {
            key: 'show = false',
            value: {
                show: false,
            },
        },
        {
            key: 'color = orange',
            value: {
                color: 'orange',
            },
        },
        {
            key: 'spanGaps = true',
            value: {
                spanGaps: true,
                data: [1, null, 2],
            },
        },
    ])('should render with specific option: $key', async ({value}) => {
        const image = await getImage({
            timeline: [1, 2, 3],
            series: [
                {
                    data: [1, 2, 3],
                    color: 'red',
                },
                {
                    data: [3, 2, 1],
                    ...value,
                },
            ],
        });
        expect(image).toMatchImageSnapshot();
    });
});

describe('line properties', () => {
    it.each([
        {
            key: 'width = 10',
            value: {
                width: 10,
            },
        },
    ])('should render with specific option: $key', async ({value}) => {
        const image = await getImage({
            timeline: [1, 2, 3],
            series: [
                {
                    data: [1, 2, 3],
                    color: 'red',
                },
                {
                    data: [3, 2, 1],
                    ...value,
                },
            ],
        });
        expect(image).toMatchImageSnapshot();
    });

    it('should render with transform = x2', async () => {
        const image = await getImage(async () => {
            await new Promise<any>((resolve) => {
                // eslint-disable-next-line no-new
                new window.Yagr(window.test, {
                    timeline: [1, 2, 3],
                    series: [
                        {
                            data: [1, 2, 3],
                            color: 'red',
                            transform: (v: any) => v * 2,
                        },
                    ],
                    hooks: {
                        load: [resolve],
                    },
                });
            });
        });

        expect(image).toMatchImageSnapshot();
    });

    it('should render with postProcess = [1,1,1]', async () => {
        const image = await getImage(async () => {
            await new Promise<any>((resolve) => {
                // eslint-disable-next-line no-new
                new window.Yagr(window.test, {
                    timeline: [1, 2, 3],
                    series: [
                        {
                            data: [1, 2, 3],
                            color: 'red',
                            postProcess: () => [1, 1, 1],
                        },
                    ],
                    hooks: {
                        load: [resolve],
                    },
                });
            });
        });

        expect(image).toMatchImageSnapshot();
    });
});

describe('area properties', () => {
    it.each([
        {
            key: 'lineWidth = 5',
            value: {
                lineWidth: 10,
            },
        },
        {
            key: 'lineColor = orange',
            value: {
                lineColor: 'orange',
            },
        },
    ])('should render with specific option: $key', async ({value}) => {
        const image = await getImage({
            timeline: [1, 2, 3],
            series: [
                {
                    data: [1, 2, 3],
                    color: 'red',
                },
                {
                    data: [3, 2, 1],
                    color: 'green',
                    type: 'area',
                    ...value,
                },
            ],
        });
        expect(image).toMatchImageSnapshot();
    });
});

describe('dots properties', () => {
    it.each([
        {
            key: 'pointSize = 20',
            value: {
                pointsSize: 20,
            },
        },
    ])('should render with specific option: $key', async ({value}) => {
        const image = await getImage({
            timeline: [1, 2, 3],
            series: [
                {
                    data: [1, 2, 3],
                    color: 'red',
                },
                {
                    data: [3, 2, 1],
                    color: 'blue',
                    type: 'dots',
                    ...value,
                },
            ],
        });
        expect(image).toMatchImageSnapshot();
    });
});

describe('interpolation properties', () => {
    it.each([
        ['line', 'left'],
        ['line', 'right'],
        ['line', 'linear'],
        ['line', 'smooth'],
        ['area', 'left'],
        ['area', 'right'],
        ['area', 'linear'],
        ['area', 'smooth'],
    ])('should interpolate type = %s, interpolation = %s', async (cType, iType) => {
        const image = await getImage({
            timeline: [1, 2, 3, 4, 5],
            chart: {
                series: {
                    type: cType as ChartType,
                    interpolation: iType as InterpolationType,
                },
            },
            series: [
                {
                    data: [1, 3, 2, 6, 2],
                    color: 'red',
                },
            ],
        });
        expect(image).toMatchImageSnapshot();
    });
});
