import {Series} from 'uplot';

import * as defaults from '../defaults';
import type Yagr from '../../';

import {RawSerieData} from '../types';
import {genId} from './common';

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
