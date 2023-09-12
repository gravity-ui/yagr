import {getImage} from '../utils';

describe('markers plugin', () => {
    it('should render markers', async () => {
        const image = await getImage({
            timeline: [1, 2, 3, 4, 5],
            series: [
                {
                    data: [1, 3, 2, 6, 2],
                    color: 'red',
                },
            ],
            markers: {
                show: true,
            },
        });
        expect(image).toMatchImageSnapshot();
    });

    it('should set marker size', async () => {
        const image = await getImage({
            timeline: [1, 2, 3, 4, 5],
            series: [
                {
                    data: [1, 3, 2, 6, 2],
                    color: 'red',
                },
            ],
            markers: {
                show: true,
                size: 15,
            },
        });
        expect(image).toMatchImageSnapshot();
    });

    it('should set marker strokeWidth and color', async () => {
        const image = await getImage({
            timeline: [1, 2, 3, 4, 5],
            series: [
                {
                    data: [1, 3, 2, 6, 2],
                    color: 'black',
                },
            ],
            markers: {
                show: true,
                size: 10,
                strokeWidth: 20,
                strokeColor: 'orange',
            },
        });
        expect(image).toMatchImageSnapshot();
    });
});
