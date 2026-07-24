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
import {AreaSeriesOptions, DotsSeriesOptions, LineSeriesOptions, RawSerieData} from '../../src';

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
                        spanGaps: true,
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

            it('should setup default .spanGaps', () => {
                expect(cfgSeries).toHaveProperty('spanGaps', true);
            });
        });

        describe('overrides', () => {
            const WIDTH = 10;
            const INTERPOLATION = 'left';

            const line: RawSerieData<LineSeriesOptions> = {
                type: 'line',
                name: 'Line',
                color: COLOR,
                spanGaps: false,
                data: [1, 2, 3],
            };

            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3],
                series: [line],
                chart: {
                    series: {
                        type: 'line',
                        spanGaps: true,
                        width: WIDTH,
                        interpolation: INTERPOLATION,
                    },
                },
            });

            it("should override series' fields from config.chart.series", () => {
                expect(configureSeries(y, line, 0)).toHaveProperty('width', WIDTH);
                expect(configureSeries(y, line, 0)).toHaveProperty('interpolation', INTERPOLATION);
                expect(configureSeries(y, line, 0)).toHaveProperty('spanGaps', false);
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
                        spanGaps: true,
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

            it('should setup default .spanGaps', () => {
                expect(s).toHaveProperty('spanGaps', true);
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
                spanGaps: false,
            };

            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3],
                series: [line],
                chart: {
                    series: {
                        type: 'area',
                        lineColor: LINE_COLOR,
                        lineWidth: LINE_WIDTH,
                        interpolation: INTERPOLATION,
                        spanGaps: true,
                    },
                },
            });

            it('should override uPlot fields from config.chart.series', () => {
                // @ts-ignore
                expect(configureSeries(y, line, 0).fill(y.uplot, 1)).toBe(COLOR);
                expect(configureSeries(y, line, 0)).toHaveProperty('lineColor', LINE_COLOR);
                expect(configureSeries(y, line, 0)).toHaveProperty('lineWidth', LINE_WIDTH);
                expect(configureSeries(y, line, 0)).toHaveProperty('interpolation', INTERPOLATION);
                expect(configureSeries(y, line, 0)).toHaveProperty('spanGaps', false);
            });
        });
    });

    describe('dots', () => {
        describe('defaults', () => {
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
                expect(configureSeries(y, line, 0)).toHaveProperty(
                    'pointsSize',
                    DEFAULT_POINT_SIZE,
                );
            });
        });
    });

    describe('overrides', () => {
        const POINTS_SIZE = 10;

        const line: RawSerieData<DotsSeriesOptions> = {
            type: 'dots',
            name: 'Line',
            color: COLOR,
            data: [1, 2, 3],
        };

        const y = new Yagr(window.document.body, {
            timeline: [1, 2, 3],
            series: [line],
            chart: {
                series: {
                    type: 'dots',
                    pointsSize: POINTS_SIZE,
                },
            },
        });

        it('should override uPlot fields from config.chart.series', () => {
            // @ts-ignore
            expect(configureSeries(y, line, 0).fill(y.uplot, 1)).toBe(COLOR);
            expect(configureSeries(y, line, 0)).toHaveProperty('pointsSize', POINTS_SIZE);
        });
    });

    describe('showInGraph', () => {
        describe('defaults', () => {
            const series = {
                data: [1, 2, 3],
            };

            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3],
                series: [series],
            });

            it('should default showInGraph to true', () => {
                expect(configureSeries(y, series, 0)).toHaveProperty('showInGraph', true);
            });

            it('should default show to true when showInGraph is not set', () => {
                expect(configureSeries(y, series, 0)).toHaveProperty('show', true);
            });
        });

        describe('showInGraph: false', () => {
            const series = {
                data: [1, 2, 3],
                showInGraph: false,
            };

            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3],
                series: [series],
            });

            it('should set showInGraph to false', () => {
                expect(configureSeries(y, series, 0)).toHaveProperty('showInGraph', false);
            });

            it('should keep show as true when showInGraph is false', () => {
                expect(configureSeries(y, series, 0)).toHaveProperty('show', true);
            });
        });

        describe('explicit show overrides showInGraph', () => {
            const series1 = {
                data: [1, 2, 3],
                show: true,
                showInGraph: false,
            };

            const series2 = {
                data: [1, 2, 3],
                show: false,
                showInGraph: true,
            };

            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3],
                series: [series1, series2],
            });

            it('should respect explicit show: true even when showInGraph is false', () => {
                const configured = configureSeries(y, series1, 0);
                expect(configured).toHaveProperty('showInGraph', false);
                expect(configured).toHaveProperty('show', true);
            });

            it('should respect explicit show: false even when showInGraph is true', () => {
                const configured = configureSeries(y, series2, 0);
                expect(configured).toHaveProperty('showInGraph', true);
                expect(configured).toHaveProperty('show', false);
            });
        });

        describe('combination with showInTooltip and showInLegend', () => {
            const series = {
                data: [1, 2, 3],
                showInGraph: false,
                showInTooltip: true,
                showInLegend: true,
            };

            const y = new Yagr(window.document.body, {
                timeline: [1, 2, 3],
                series: [series],
            });

            it('should allow hiding line on graph while keeping it in tooltip and legend', () => {
                const configured = configureSeries(y, series, 0);
                expect(configured).toHaveProperty('showInGraph', false);
                expect(configured).toHaveProperty('showInTooltip', true);
                expect(configured).toHaveProperty('showInLegend', true);
                expect(configured).toHaveProperty('show', true);
            });
        });
    });
});
