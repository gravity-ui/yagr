import {legendBase} from 'src/plugins/legend/legend';
import type {YagrPie} from '../types';
import {isResponsiveSize} from '../utils';

export const PieLegend = legendBase<YagrPie>({
    getSeries(yagr: YagrPie) {
        return yagr.config.data;
    },

    getChartHeight(yagr: YagrPie) {
        const size = yagr.config.chart.size;
        return isResponsiveSize(size) ? yagr.chart.clientHeight : size.height;
    },

    onSetFocus(yagr: YagrPie, id: string | null) {
        const idx = yagr.config.data.findIndex((s) => s.id === id);
        yagr.setFocus(idx ?? null, true);
    },

    onToggleSeries(yagr: YagrPie, id: string, state: boolean) {
        const idx = yagr.config.data.findIndex((s) => s.id === id);
        yagr.setVisible(idx ?? null, state);
    },
});
