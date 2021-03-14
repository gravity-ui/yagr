
import * as defaults from '../defaults';

import {YagrConfig, RawSerieData} from '../types';
import {genId} from './common';

export function getSerie(rawSerie: RawSerieData, config: YagrConfig) {
    return {
        ...rawSerie,

        id: (rawSerie.id === undefined ? rawSerie.name : String(rawSerie.id)) || genId(),
        show: rawSerie.visible === undefined ? true : rawSerie.visible,
        originalData: rawSerie.data,
        width: rawSerie.width || defaults.SERIE_LINE_WIDTH,
        lineColor: rawSerie.lineColor || defaults.SERIE_AREA_BORDER_COLOR,
        lineWidth: rawSerie.lineWidth || defaults.SERIE_AREA_BORDER_WIDTH,
        scale: rawSerie.scale || defaults.DEFAULT_Y_SCALE,
        type: rawSerie.type || config.chart.type,

        _valuesCount: 0,
    };
}
