import {getImage} from '../utils';

describe('plotlines plugin', () => {
    it('should render x plot line width', async () => {
        const image = await getImage({
            timeline: [1, 2, 3, 4, 5],
            series: [
                {
                    data: [1, 3, 2, 6, 2],
                    color: 'red',
                },
            ],
            axes: {
                x: {
                    plotLines: [
                        {
                            value: 2,
                            width: 2,
                            color: 'rgba(255, 0, 0, 0.5)',
                        },
                    ],
                },
            },
        });
        expect(image).toMatchImageSnapshot();
    });

    it('should render x plot line from to', async () => {
        const image = await getImage({
            timeline: [1, 2, 3, 4, 5],
            series: [
                {
                    data: [1, 3, 2, 6, 2],
                    color: 'red',
                },
            ],
            axes: {
                x: {
                    plotLines: [
                        {
                            value: [2, 4],
                            color: 'rgba(255, 0, 0, 0.5)',
                        },
                    ],
                },
            },
        });
        expect(image).toMatchImageSnapshot();
    });

    it('should render y plot line width', async () => {
        const image = await getImage({
            timeline: [1, 2, 3, 4, 5],
            series: [
                {
                    data: [1, 3, 2, 6, 2],
                    color: 'red',
                },
            ],
            axes: {
                y: {
                    plotLines: [
                        {
                            value: 2,
                            width: 2,
                            color: 'rgba(255, 0, 0, 0.5)',
                        },
                    ],
                },
            },
        });
        expect(image).toMatchImageSnapshot();
    });

    it('should render y plot line from to', async () => {
        const image = await getImage({
            timeline: [1, 2, 3, 4, 5],
            series: [
                {
                    data: [1, 3, 2, 6, 2],
                    color: 'red',
                },
            ],
            axes: {
                y: {
                    plotLines: [
                        {
                            value: [2, 4],
                            color: 'rgba(255, 0, 0, 0.5)',
                        },
                    ],
                },
            },
        });
        expect(image).toMatchImageSnapshot();
    });
});
