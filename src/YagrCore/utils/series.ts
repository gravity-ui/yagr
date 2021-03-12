
import * as defaults from '../defaults';

import {YagrConfig, RawSerieData} from '../types';
import {genId} from './common';

export function getSerie(rawSerie: RawSerieData, config: YagrConfig) {
    return {
        ...rawSerie,

        name: rawSerie.name, // @TODO rename to label using uPlot
        id: rawSerie.id || rawSerie.name || genId(),
        show: rawSerie.visible === undefined ? true : rawSerie.visible,
        color: rawSerie.color,
        originalData: rawSerie.data,
        spanGaps: rawSerie.spanGaps,
        cursorOptions: rawSerie.cursorOptions,
        width: rawSerie.width || defaults.SERIE_LINE_WIDTH,
        lineColor: rawSerie.lineColor || defaults.SERIE_AREA_BORDER_COLOR,
        lineWidth: rawSerie.lineWidth || defaults.SERIE_AREA_BORDER_WIDTH,
        scale: rawSerie.scale || defaults.DEFAULT_Y_SCALE,
        type: rawSerie.type || config.chart.type,
        refPoints: rawSerie.refPoints,
        formatter: rawSerie.formatter,
        showInTooltip: rawSerie.showInTooltip,
        precision: rawSerie.precision,
        snapToValues: rawSerie.snapToValues,

        _valuesCount: 0,
    };
}
