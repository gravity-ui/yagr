import Yagr from '../../src/YagrCore';
import {configureSeries} from '../../src/YagrCore/utils/series';
import {
    DEFAULT_Y_SCALE,
    SERIE_AREA_BORDER_COLOR,
    SERIE_AREA_BORDER_WIDTH,
    SERIE_LINE_WIDTH,
    DEFAULT_POINT_SIZE,
    LIGHT_DEFAULT_LINE_COLOR,
} from '../../src/YagrCore/defaults';
import {AreaSeriesOptions, LineSeriesOptions, RawSerieData} from '../../src';

const COLOR = '#000000';

describe('series options', () => {
    describe('empty', () => {
        const empty = {
            data: [1, 2, 3],
        };

        const y = new Yagr(window.document.body, {
            timeline: [1, 2, 3],
            series: [empty],
        });

        it('should setup default .id', () => {
            expect(configureSeries(y, empty, 0)).toHaveProperty('id');
        });

        it('should setup default .name', () => {
            expect(configureSeries(y, empty, 0)).toHaveProperty('name', 'Series 1');
        });

        it('should setup default .color', () => {
            expect(configureSeries(y, empty, 0)).toHaveProperty('color', LIGHT_DEFAULT_LINE_COLOR);
        });

        it('should setup default .type ', () => {
            expect(configureSeries(y, empty, 0)).toHaveProperty('type', 'line');
        });

        it('should set default Y scale ', () => {
            expect(configureSeries(y, empty, 0)).toHaveProperty('scale', DEFAULT_Y_SCALE);
        });

        it('should set default cache for original data ', () => {
            expect(configureSeries(y, empty, 0)).toHaveProperty('$c', empty.data);
        });

        it('should setup uPlot fields', () => {
            expect(configureSeries(y, empty, 0)).toHaveProperty('width', SERIE_LINE_WIDTH);
        });
    });

    describe('line', () => {
        describe('defaults', () => {
            const line = {
                data: [1, 2, 3],
            };

            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3],
                chart: {
                    series: {
                        type: 'line',
                    },
                },
                series: [line],
            });

            const cfgSeries = configureSeries(y, line, 0);

            it('should get type from config.chart.series', () => {
                expect(cfgSeries).toHaveProperty('type', 'line');
            });

            it('should setup middle properties', () => {});

            it('should setup uPlot fields', () => {
                expect(cfgSeries).toHaveProperty('width', SERIE_LINE_WIDTH);
                // @ts-ignore
                expect(cfgSeries.stroke(y.uplot, 1)).toBe(LIGHT_DEFAULT_LINE_COLOR);
            });
        });

        describe('overrides', () => {
            const WIDTH = 10;
            const INTERPOLATION = 'left';

            const line: RawSerieData<LineSeriesOptions> = {
                type: 'line',
                name: 'Line',
                color: COLOR,
                data: [1, 2, 3],
                width: WIDTH,
                interpolation: INTERPOLATION,
            };

            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3],
                series: [line],
            });

            it('should override uPlot fields from config.series[0]', () => {
                expect(configureSeries(y, line, 0)).toHaveProperty('width', WIDTH);
                expect(configureSeries(y, line, 0)).toHaveProperty('interpolation', INTERPOLATION);
            });
        });
    });

    describe('area', () => {
        describe('defaults', () => {
            const line = {
                data: [1, 2, 3],
            };

            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3],
                chart: {
                    series: {
                        type: 'area',
                    },
                },
                series: [line],
            });

            const s = configureSeries(y, line, 0);

            it('should get type from config.chart.series', () => {
                expect(s).toHaveProperty('type', 'area');
            });

            it('should setup uPlot fields', () => {
                // @ts-ignore
                expect(s.fill(y.uplot, 1)).toBe(LIGHT_DEFAULT_LINE_COLOR);
                expect(s).toHaveProperty('lineColor', SERIE_AREA_BORDER_COLOR);
                expect(s).toHaveProperty('lineWidth', SERIE_AREA_BORDER_WIDTH);
            });
        });

        describe('overrides', () => {
            const LINE_COLOR = 'black';
            const LINE_WIDTH = 10;
            const INTERPOLATION = 'left';

            const line: RawSerieData<AreaSeriesOptions> = {
                type: 'area',
                name: 'Line',
                color: COLOR,
                data: [1, 2, 3],
                lineColor: LINE_COLOR,
                lineWidth: LINE_WIDTH,
                interpolation: INTERPOLATION,
            };

            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3],
                series: [line],
            });

            it('should override uPlot fields from config.series[0]', () => {
                // @ts-ignore
                expect(configureSeries(y, line, 0).fill(y.uplot, 1)).toBe(COLOR);
                expect(configureSeries(y, line, 0)).toHaveProperty('lineColor', LINE_COLOR);
                expect(configureSeries(y, line, 0)).toHaveProperty('lineWidth', LINE_WIDTH);
                expect(configureSeries(y, line, 0)).toHaveProperty('interpolation', INTERPOLATION);
            });
        });
    });

    describe('dots', () => {
        const line = {
            name: 'Line',
            color: COLOR,
            data: [1, 2, 3],
        };

        const y = new Yagr(window.document.body, {
            timeline: [1, 2, 3],
            chart: {
                series: {
                    type: 'dots',
                },
            },
            series: [line],
        });

        it('should setup uPlot fields', () => {
            expect(configureSeries(y, line, 0)).toHaveProperty('pointsSize', DEFAULT_POINT_SIZE);
        });
    });
});
