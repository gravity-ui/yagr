import {Series} from 'uplot';

import * as defaults from '../defaults';
import {colorParser} from './colors';

import {YagrConfig, RawSerieData} from '../types';
import {genId} from './common';

export function getSerie(rawSerie: RawSerieData, config: YagrConfig, serieIdx: number): Series {
    return {
        ...rawSerie,
        name: rawSerie.name || 'Serie ' + (serieIdx + 1),
        color: rawSerie.color ? colorParser.parse(rawSerie.color) : defaults.theme.DEFAULT_LINE_COLOR,
        id: (rawSerie.id === undefined ? rawSerie.name : String(rawSerie.id)) || genId(),
        show: rawSerie.visible === undefined ? true : rawSerie.visible,
        $c: rawSerie.data,
        width: rawSerie.width || defaults.SERIE_LINE_WIDTH,
        lineColor: colorParser.parse(rawSerie.lineColor || defaults.SERIE_AREA_BORDER_COLOR),
        lineWidth: rawSerie.lineWidth || defaults.SERIE_AREA_BORDER_WIDTH,
        scale: rawSerie.scale || defaults.DEFAULT_Y_SCALE,
        type: rawSerie.type || config.chart.type || 'line',

        _valuesCount: 0,
    };
}
