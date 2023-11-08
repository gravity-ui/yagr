import {Series} from 'uplot';

import * as defaults from '../defaults';
import type Yagr from '..';

import {
    AreaSeriesOptions,
    ColumnSeriesOptions,
    DotsSeriesOptions,
    LineSeriesOptions,
    RawSerieData,
    SeriesOptions,
} from '../types';
import {genId} from './common';
import {getFocusedColor, getSerieFocusColors} from './colors';
import {drawMarkersIfRequired} from '../plugins/markers';
import {pathsRenderer} from './paths';

function getCommonProperty<T extends SeriesOptions, K extends keyof T>(
    series: RawSerieData | Series,
    yagr: Yagr,
    key: K,
    defaultValue?: T[K],
): T[K] | undefined {
    if (series[key as keyof typeof series] !== undefined) {
        return series[key as keyof typeof series] as T[K];
    }

    const seriesOptions = yagr.config.chart.series;
    if (seriesOptions && key in seriesOptions) {
        return seriesOptions[key as keyof SeriesOptions] as T[K];
    }

    return defaultValue;
}

// eslint-disable-next-line complexity
export function configureSeries(yagr: Yagr, rawSeries: RawSerieData, idx: number): Series {
    const type = getCommonProperty(rawSeries, yagr, 'type', 'line');

    const serie: Series = {
        ...rawSeries,
        type,
        show: rawSeries.show ?? true,
        name: rawSeries.name || `${yagr.utils.i18n('series')} ${idx + 1}`,
        color: rawSeries.color ? yagr.utils.colors.parse(rawSeries.color) : yagr.utils.theme.DEFAULT_LINE_COLOR,
        id: (rawSeries.id === undefined ? rawSeries.name : String(rawSeries.id)) || genId(),
        $c: rawSeries.data,
        scale: rawSeries.scale || defaults.DEFAULT_Y_SCALE,
        count: 0,
        sum: 0,
        avg: 0,
        getFocusedColor,
    };

    serie.points = serie.points || {};

    const colorFn = getSerieFocusColors(yagr, 'color');

    if (serie.type === 'area') {
        serie.lineColor = yagr.utils.colors.parse(
            getCommonProperty<AreaSeriesOptions, 'lineColor'>(
                rawSeries,
                yagr,
                'lineColor',
                defaults.SERIE_AREA_BORDER_COLOR,
            ),
        );
        serie.lineWidth = getCommonProperty<AreaSeriesOptions, 'lineWidth'>(
            rawSeries,
            yagr,
            'lineWidth',
            defaults.SERIE_AREA_BORDER_WIDTH,
        );

        serie.fill = colorFn;
        serie.stroke = getSerieFocusColors(yagr, 'lineColor');
        serie.width = serie.lineWidth;
        serie.points.show = drawMarkersIfRequired;
        serie.interpolation = getCommonProperty<AreaSeriesOptions, 'interpolation'>(
            rawSeries,
            yagr,
            'interpolation',
            'linear',
        );
        serie.spanGaps = getCommonProperty<AreaSeriesOptions, 'spanGaps'>(rawSeries, yagr, 'spanGaps', false);
    }

    if (serie.type === 'line') {
        serie.width = getCommonProperty<LineSeriesOptions, 'width'>(
            rawSeries,
            yagr,
            'width',
            defaults.SERIE_LINE_WIDTH,
        );
        serie.width = serie.width || defaults.SERIE_LINE_WIDTH;
        serie.stroke = colorFn;
        serie.points.show = drawMarkersIfRequired;
        serie.interpolation = getCommonProperty<LineSeriesOptions, 'interpolation'>(
            rawSeries,
            yagr,
            'interpolation',
            'linear',
        );
        serie.spanGaps = getCommonProperty<LineSeriesOptions, 'spanGaps'>(rawSeries, yagr, 'spanGaps', false);
    }

    if (serie.type === 'column') {
        serie.stroke = colorFn;
        serie.fill = colorFn;
        serie.points.show = false;
        serie.width = serie.width ?? 0;
        serie.renderOptions = getCommonProperty<ColumnSeriesOptions, 'renderOptions'>(serie, yagr, 'renderOptions');
    }

    if (serie.type === 'dots') {
        serie.stroke = () => serie.color;
        serie.fill = colorFn;
        serie.width = 2;
        serie.pointsSize = getCommonProperty<DotsSeriesOptions, 'pointsSize'>(
            serie,
            yagr,
            'pointsSize',
            defaults.DEFAULT_POINT_SIZE,
        );
    }

    serie.paths = pathsRenderer;

    return serie;
}

export const overrideSeriesInUpdate = (dest: Series, source: Series) => {
    dest.$c = source.$c ?? dest.$c;
    dest.show = source.show ?? dest.show;
    dest.data = source.data ?? dest.data;
    dest.width = source.width ?? dest.width;
    dest.pointsSize = source.pointsSize ?? dest.pointsSize;
    dest.color = source.color ?? dest.color;
    dest.lineColor = source.lineColor ?? dest.lineColor;
    dest.lineWidth = source.lineWidth ?? dest.lineWidth;
    dest.stroke = source.stroke ?? dest.stroke;
    dest.getFocusedColor = source.getFocusedColor ?? dest.getFocusedColor;
    dest.formatter = source.formatter ?? dest.formatter;
    dest.paths = source.paths ?? dest.paths;
};
