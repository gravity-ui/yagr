import {Series} from 'uplot';

import * as defaults from '../defaults';
import type Yagr from '../../';

import {RawSerieData} from '../types';
import {genId} from './common';
import {getSerieFocusColors} from './colors';
import {drawMarkersIfRequired} from '../plugins/markers';
import {pathsRenderer} from './paths';

export function getSerie(rawSerie: RawSerieData, yagr: Yagr, serieIdx: number): Series {
    return {
        ...rawSerie,
        name: rawSerie.name || 'Serie ' + (serieIdx + 1),
        color: rawSerie.color ? yagr.utils.colors.parse(rawSerie.color) : yagr.utils.theme.DEFAULT_LINE_COLOR,
        id: (rawSerie.id === undefined ? rawSerie.name : String(rawSerie.id)) || genId(),
        show: rawSerie.visible ?? true,
        $c: rawSerie.data,
        width: rawSerie.width || defaults.SERIE_LINE_WIDTH,
        lineColor: yagr.utils.colors.parse(rawSerie.lineColor || defaults.SERIE_AREA_BORDER_COLOR),
        lineWidth: rawSerie.lineWidth || defaults.SERIE_AREA_BORDER_WIDTH,
        scale: rawSerie.scale || defaults.DEFAULT_Y_SCALE,
        type: rawSerie.type || yagr.config.chart.type || 'line',

        stackGroup: rawSerie.stackGroup ?? 0,
        count: 0,
        sum: 0,
        avg: 0,
    };
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

    serie.interpolation = serie.interpolation || yagr.config.settings.interpolation || 'linear';

    serie.paths = pathsRenderer;
    return serie;
}
