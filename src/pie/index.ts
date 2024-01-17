import type {Theme} from '../types/common';
import type {YagrPie, PieConfig} from './types';

import {Config} from './config';
import {createEmitter} from '../utils/emitter';
import {debounce, isNil, microTask} from '../utils/common';
import {drawPie, findSegmentByCoords, setFocusImpl, setVisibleImpl} from './draw';
import {genId} from '../utils/id';
import {html, px} from '../utils/html';
import {isResponsiveSize} from './utils';
import {PieLegend} from './plugins/legend';

import ColorParser from '../utils/colors';
import I18n from '../utils/i18n';
import ThemedDefaults from '../utils/defaults';

export function Pie(root: HTMLElement, cfg: PieConfig) {
    const config = new Config(cfg);

    let resizeOb: ResizeObserver;
    const chart = html('div', {
        class: 'yagr__chart',
    });

    const canvas = html<HTMLCanvasElement>('canvas', {
        class: 'yagr__canvas',
    });

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.imageSmoothingEnabled = true;

    const colorParser = new ColorParser();
    const theme = new ThemedDefaults(colorParser, config.chart.appearance.theme);
    const emitter = createEmitter<{
        redraw: void;
    }>();

    const yagr: YagrPie = {
        chart,
        canvas,
        ctx,
        config,
        utils: {
            colorParser,
            theme,
            i18n: I18n(),
        },

        dispose,
        toDataURL,
        setTheme,
        setFocus,
        setVisible,
        redraw,
    };

    function onResize() {
        canvas.width = chart.clientWidth;
        canvas.height = chart.clientHeight;
        drawPie(yagr);
    }

    function onMouseOver(e: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dataItem = findSegmentByCoords(yagr, x, y) ?? null;
        setFocusImpl(yagr, dataItem, Boolean(dataItem));
    }

    function dispose() {
        canvas.removeEventListener('mousemove', onMouseOver);
    }

    function redraw() {
        drawPie(yagr);
    }

    function toDataURL(type = 'image/png') {
        return canvas.toDataURL(type);
    }

    function setTheme(themeValue: Theme, r = true) {
        theme.setTheme(themeValue);
        const classesToRemove = root.classList.value
            .split(' ')
            .filter((className) => className.startsWith('yagr_theme_'));
        root.classList.remove(...classesToRemove);
        root.classList.add('yagr_theme_' + themeValue);

        r && redraw();
    }

    function setFocus(seriesIdxOrId: number | string | null, focus: boolean) {
        const idx =
            typeof seriesIdxOrId === 'string'
                ? yagr.config.data.findIndex((s) => s.id === seriesIdxOrId)
                : seriesIdxOrId;
        const series = isNil(idx) ? null : yagr.config.data[idx];
        setFocusImpl(yagr, series, focus);
    }

    function setVisible(seriesIdxOrId: number | string | null, visible: boolean) {
        const idx =
            typeof seriesIdxOrId === 'string'
                ? yagr.config.data.findIndex((s) => s.id === seriesIdxOrId)
                : seriesIdxOrId;
        const series = isNil(idx) ? null : yagr.config.data[idx];
        setVisibleImpl(yagr, series, visible);
    }

    function _commit() {
        const id = root.id || genId();
        root.setAttribute('id', id);
        root.classList.add('yagr');

        colorParser.setContext(root);

        const size = config.chart.size;
        const isResponsive = isResponsiveSize(size);

        if (isResponsive) {
            resizeOb = new ResizeObserver(debounce(onResize, size.debounce));
            resizeOb.observe(root);
        }

        if (isResponsive) {
            canvas.width = root.clientWidth;
            canvas.height = root.clientHeight;
        } else {
            canvas.width = size.width;
            canvas.height = size.height;
        }

        setTheme(config.chart.appearance.theme, false);

        config.hooks.init?.forEach((fn) => fn({chart: yagr}));

        chart.appendChild(canvas);
        root.appendChild(chart);

        if (config.legend?.show) {
            const legend = new PieLegend(root, config.legend, yagr);
            legend.preInit(chart);
            legend.init();
            const plottingAreaSpace = chart.clientHeight - legend.state.totalSpace;
            canvas.height = plottingAreaSpace;
            chart.style.height = px(plottingAreaSpace);
        }

        drawPie(yagr);

        canvas.addEventListener('mousemove', onMouseOver);
    }

    microTask(() => {
        try {
            _commit();
        } catch (e) {
            console.error(e);
            config.hooks.error?.forEach((fn) => fn({chart: yagr, error: e as Error}));
        }
    });

    return {
        ...yagr,
        ...emitter,
    };
}
