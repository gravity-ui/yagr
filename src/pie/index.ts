import type {Theme, Title} from '../types/common';
import type {YagrPie, PieConfig, PieHooks} from './types';

import {wrapPieConfig} from './config';
import {drawPie, findSegmentByCoords, setFocusImpl, setVisibleImpl} from './draw';

import {debounce, isNil, microTask} from '../utils/common';
import {genId} from '../utils/id';
import {html, px} from '../utils/html';
import {isResponsiveSize} from './utils';

import type {LegendOptions} from 'src/plugins/legend/legend';
import {PieLegend} from './plugins/legend';
import {Tooltip} from './plugins/tooltip';

import ColorParser from '../utils/colors';
import I18n from '../utils/i18n';
import ThemedDefaults from '../utils/defaults';

import {wrapEmitter} from '../utils/emitter';

interface Plugins {
    tooltip?: ReturnType<ReturnType<typeof Tooltip>>;
    legend?: ReturnType<typeof PieLegend>;
}

export function Pie(root: HTMLElement, cfg: PieConfig) {
    const config = wrapPieConfig(cfg);
    const plugins: Plugins = {};
    let resizeOb: ResizeObserver;
    const chart = html('div', {
        class: 'yagr__chart',
    });

    const canvas = html<HTMLCanvasElement>('canvas', {
        class: 'yagr__canvas',
    });

    let title = config.chart.title ? _getTitle() : null;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.imageSmoothingEnabled = true;

    const colorParser = new ColorParser();
    const theme = new ThemedDefaults(colorParser, config.chart.appearance.theme);

    const yagr: YagrPie = wrapEmitter({
        id: root.id || genId(),
        root,
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
        setTitle,
        setLegend,
        redraw,
        run,
    });

    let legend: Plugins['legend'];
    if (config.legend.show) {
        plugins.legend = PieLegend(yagr, config.legend);
        legend = plugins.legend;
    }

    if (config.tooltip.show !== false) {
        plugins.tooltip = Tooltip(config.tooltip)(yagr);
    }

    function onMouseOver(e: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rrect = root.getBoundingClientRect();
        const xr = e.clientX - rrect.left;
        const yr = e.clientY - rrect.top;

        const dataItem = findSegmentByCoords(yagr, x, y) ?? null;
        setFocusImpl(yagr, dataItem, Boolean(dataItem));
        plugins.tooltip?.onItem(dataItem, xr, yr);
    }

    function onClick(e: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dataItem = findSegmentByCoords(yagr, x, y) ?? null;
        plugins.tooltip?.onClick(dataItem);
    }

    function dispose() {
        canvas.removeEventListener('mousemove', onMouseOver);
        canvas.removeEventListener('click', onClick);
    }

    function redraw() {
        drawPie(yagr);
    }

    function toDataURL(type = 'image/png') {
        return canvas.toDataURL(type);
    }

    let _inited = false;
    function setTheme(themeValue: Theme) {
        theme.setTheme(themeValue);
        const classesToRemove = root.classList.value
            .split(' ')
            .filter((className) => className.startsWith('yagr_theme_'));
        root.classList.remove(...classesToRemove);
        root.classList.add('yagr_theme_' + themeValue);

        _inited && redraw();
    }

    function setFocus(seriesIdxOrId: number | string | null, focus: boolean) {
        const series = _getSeries(seriesIdxOrId);
        setFocusImpl(yagr, series, focus);
    }

    function setVisible(seriesIdxOrId: number | string | null, visible: boolean) {
        const series = _getSeries(seriesIdxOrId);
        setVisibleImpl(yagr, series, visible);
    }

    function setTitle(_title: Title) {
        config.chart.title = _title;

        if (config.chart.title?.text) {
            if (!title) {
                title = _getTitle() as HTMLDivElement;
                root.prepend(title);
            }
            title.textContent = _title.text;
            title.style.fontSize = px(_title.fontSize ?? 14);
            title.style.lineHeight = px(_title.fontSize ?? 14);
            title.style.textAlign = _title.align ?? 'center';
        } else if (title) {
            title.remove();
            title = null;
        }

        _reflow();
        redraw();
    }

    function run<T extends keyof PieHooks>(s: T, ...args: any[]) {
        // @ts-ignore
        _run(s, yagr, ...args);
    }

    function setLegend(_options: LegendOptions) {
        config.legend = _options;
        if (legend) {
            legend?.setOptions(_options);
            legend.redraw();
        } else {
            plugins.legend = PieLegend(yagr, _options);
            legend = plugins.legend;
            legend.redraw();
        }
        _reflow();
        redraw();
    }

    function _getSeries(seriesIdxOrId: number | string | null) {
        const idx =
            typeof seriesIdxOrId === 'string'
                ? yagr.config.data.findIndex((s) => s.id === seriesIdxOrId)
                : seriesIdxOrId;
        return isNil(idx) ? null : yagr.config.data[idx];
    }

    function _getTitle() {
        const _t = config.chart?.title;

        if (!_t) {
            return null;
        }

        return html(
            'div',
            {
                class: 'yagr__title',
                style: {
                    ['font-size']: px(_t.fontSize ?? 14),
                    ['line-height']: px(_t.fontSize ?? 14),
                    ['text-align']: _t.align ?? 'center',
                },
            },
            _t.text,
        );
    }

    function _run<T extends keyof PieHooks>(s: T, ...args: Parameters<PieHooks[T][number]>) {
        const h = config.hooks[s];

        if (h) {
            // @ts-ignore
            h.forEach((fn) => fn(...args));
        }

        Object.values(plugins).forEach((plugin) => {
            const h = plugin.hooks?.[s];
            if (h) {
                h(...args);
            }
        });
    }

    function _onResize(entries: ResizeObserverEntry[]) {
        canvas.width = chart.clientWidth;
        canvas.height = chart.clientHeight;
        yagr.run('resize', entries);
        _reflow();
        drawPie(yagr);
    }

    let _initialHeight: number;
    function _reflow() {
        if (config.legend?.show && legend) {
            legend.setChart(chart);
            legend.redraw();
            const plottingAreaSpace = _initialHeight - legend.getTotalSpace();
            canvas.height = plottingAreaSpace;
            chart.style.height = px(plottingAreaSpace);
        } else {
            canvas.height = _initialHeight;
            chart.style.height = px(_initialHeight);
        }

        if (config.chart.title?.text) {
            const plottingAreaSpace = chart.clientHeight - title!.clientHeight;
            canvas.height = plottingAreaSpace;
            chart.style.height = px(plottingAreaSpace - 8);
        }
    }

    function _commit() {
        yagr.run('opts');

        const id = root.id || genId();
        root.setAttribute('id', id);
        root.classList.add('yagr');

        colorParser.setContext(root);

        const size = config.chart.size;
        const isResponsive = isResponsiveSize(size);

        if (isResponsive) {
            resizeOb = new ResizeObserver(debounce(_onResize, size.debounce));
            resizeOb.observe(root);
        }

        if (isResponsive) {
            canvas.width = root.clientWidth;
            canvas.height = root.clientHeight;
        } else {
            canvas.width = size.width;
            canvas.height = size.height;
        }

        setTheme(config.chart.appearance.theme);

        chart.appendChild(canvas);
        if (title) {
            root.appendChild(title);
        }
        root.appendChild(chart);
        _initialHeight = chart.clientHeight;
        _inited = true;

        _reflow();
        yagr.run('init');

        drawPie(yagr);

        canvas.addEventListener('mousemove', onMouseOver);
        canvas.addEventListener('click', onClick);

        yagr.run('ready');
    }

    microTask(() => {
        try {
            _commit();
        } catch (e) {
            console.error(e);
            run('error', yagr, e as Error);
        }
    });

    return yagr;
}
