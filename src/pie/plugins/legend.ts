import BaseLegendPlugin, {LegendOptions} from '../../plugins/legend/legend';
import type {YagrPie} from '../types';
import {isResponsiveSize} from '../utils';

export class PieLegend extends BaseLegendPlugin {
    pie: YagrPie;

    constructor(root: HTMLElement, options: LegendOptions, pie: YagrPie) {
        super(root, options, pie.utils.i18n);
        this.pie = pie;
    }

    onInit = () => {
        this.redraw();
    };

    getSeries = () => {
        return this.pie.config.data;
    };

    getChartElement = () => {
        return this.pie.chart;
    };

    getChartHeight = () => {
        const size = this.pie.config.chart.size;
        return isResponsiveSize(size) ? this.pie.chart.clientHeight : size.height;
    };

    onSetFocus = (id: string | null) => {
        const idx = this.pie.config.data.findIndex((s) => s.id === id);
        this.pie.setFocus(idx ?? null, true);
    };

    onToggleSeries = (id: string, state: boolean) => {
        const idx = this.pie.config.data.findIndex((s) => s.id === id);
        this.pie.setVisible(idx ?? null, state);
    };
}
