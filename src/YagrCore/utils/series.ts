import {Series} from 'uplot';

import * as defaults from '../defaults';
import type Yagr from '../../';

import {InterpolationType, RawSerieData} from '../types';
import {genId} from './common';
import {getSerieFocusColors} from './colors';
import {drawMarkersIfRequired} from '../plugins/markers';
import {pathsRenderer} from './paths';

export function getSerie(rawSerie: RawSerieData, yagr: Yagr, serieIdx: number): Series {
    const type = rawSerie.type || yagr.config.chart.series?.type || 'line';

    const common: Series = {
        ...rawSerie,
        type,
        name: rawSerie.name || `${yagr.utils.i18n('series')} ${serieIdx + 1}`,
        color: rawSerie.color ? yagr.utils.colors.parse(rawSerie.color) : yagr.utils.theme.DEFAULT_LINE_COLOR,
        id: (rawSerie.id === undefined ? rawSerie.name : String(rawSerie.id)) || genId(),
        $c: rawSerie.data,
        scale: rawSerie.scale || defaults.DEFAULT_Y_SCALE,
        count: 0,
        sum: 0,
        avg: 0,
    };

    let series: Series;

    switch (common.type) {
        case 'area': {
            series = {
                ...common,
                lineColor: yagr.utils.colors.parse(common.lineColor || defaults.SERIE_AREA_BORDER_COLOR),
                lineWidth: common.lineWidth || defaults.SERIE_AREA_BORDER_WIDTH,
            };
            break;
        }
        case 'column': {
            series = common;
            break;
        }
        case 'dots': {
            series = {
                ...common,
                pointsSize: common.pointsSize || defaults.DEFAULT_POINT_SIZE,
            };
            break;
        }
        case 'line':
        default: {
            series = {
                ...common,
                width: common.width || defaults.SERIE_LINE_WIDTH,
            };
            break;
        }
    }

    return series;
}

export function configureSeries(yagr: Yagr, serie: Series): Series {
    serie.points = serie.points || {};

    const colorFn = getSerieFocusColors(yagr.utils.theme, yagr.utils.colors, serie.color);

    serie._color = serie.color;
    serie._modifiedColor = colorFn.defocusColor;

    if (serie.type === 'area') {
        serie.fill = colorFn;
        serie.stroke = getSerieFocusColors(
            yagr.utils.theme,
            yagr.utils.colors,
            serie.lineColor || 'rgba(0, 0, 0, 0.2)',
        );
        serie.width = serie.lineWidth;
        serie.points.show = drawMarkersIfRequired;
    }

    if (serie.type === 'line') {
        serie.stroke = colorFn;
        serie.points.show = drawMarkersIfRequired;
    }

    if (serie.type === 'column') {
        serie.stroke = colorFn;
        serie.fill = colorFn;
        serie.points.show = false;
    }

    if (serie.type === 'dots') {
        serie.stroke = serie.color;
        serie.fill = colorFn;
        serie.width = 2;
    }

    let commonI = 'linear' as InterpolationType;
    const seriesOptions = yagr.config.chart.series;
    if (seriesOptions && 'interpolation' in seriesOptions) {
        commonI = seriesOptions.interpolation || commonI;
    }
    serie.interpolation = serie.interpolation || commonI;

    serie.paths = pathsRenderer;
    return serie;
}
