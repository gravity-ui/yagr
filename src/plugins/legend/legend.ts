import {DEFAULT_X_SERIES_NAME} from '../../utils/defaults';
import {html} from '../../utils/html';
import {preventMouseEvents} from '../../utils/events';
import type I18n from '../../utils/i18n';
import {CommonApi, CommonSeries} from 'src/types/common';

export type LegendPosition = 'top' | 'bottom';
export interface LegendOptions {
    /** Show legend (default: false) */
    show?: boolean;
    /** Root class name */
    className?: string;
    /** Legend placement position */
    position?: LegendPosition;
    /** Maximal space fro legend as a fraction of chart height (default: 0.3) */
    maxLegendSpace?: number;
    /** Basic behavior includes only toggle behavior ("Hide/show all" button exists) */
    behavior?: 'basic' | 'extended';
}

const ALL_SERIES_IDX = 'null' as const;
const PAGINATION_BUTTON_HEIGHT = 18;
const TOTAL_LEGEND_VERTICAL_PADDING_BOTTOM = 20;
const TOTAL_LEGEND_VERTICAL_PADDING_TOP = 48;
const DEFAULT_FONT_SIZE = 12;
const DEFAULT_LEGEND_PLACE_RATIO = 0.3;

export const hasOneVisibleLine = (series: CommonSeries[]) => {
    return series.some(({show, id}) => id !== DEFAULT_X_SERIES_NAME && show);
};

const getPrependingTitle = (i18n: ReturnType<typeof I18n>, series: CommonSeries[]) => {
    return series.length > 3 && i18n(hasOneVisibleLine(series) ? 'hide-all' : 'show-all');
};

const getPrependingTitleId = (series: CommonSeries[]): typeof ALL_SERIES_IDX | undefined => {
    return (series.length > 3 && ALL_SERIES_IDX) || undefined;
};

const DEFAULT_OPTIONS: LegendOptions = {
    show: false,
    position: 'bottom',
    maxLegendSpace: DEFAULT_LEGEND_PLACE_RATIO,
    className: undefined,
    behavior: 'basic',
};

interface Props<T extends CommonApi> {
    onToggleSeries: (t: T, id: string, visibility: boolean, redraw: boolean) => void;
    onSetFocus: (t: T, id: string | null, redraw: boolean) => void;
    getSeries: (t: T) => CommonSeries[];
    onDestroy?: (t: T) => void;
    getChartHeight: (t: T) => number;
}

export function legendBase<T extends CommonApi>(props: Props<T>) {
    return function Legend(yagr: T, options: LegendOptions) {
        options = {...DEFAULT_OPTIONS, ...options};
        let sPage = 0;
        let sPages = 1;
        let sPageSize = 0;
        let sPaginated = false;
        let sRequiredSpace = 0;
        let sTotalSpace = 0;
        let startSeriesRange = undefined as CommonSeries | undefined;

        let _chart: HTMLElement | null = null;
        let _height: number;
        let _series: CommonSeries[];

        let _legendEl: HTMLElement | null = null;
        let _itemsHtml: string | null = null;
        let _items: HTMLElement | null = null;
        let _container: HTMLElement | null = null;
        let _onDestroy;

        function redraw() {
            if (!options.show) {
                return destroy();
            }

            _render();
        }

        function destroy() {
            props.onDestroy?.(yagr);
            _legendEl?.remove();
        }

        function setChart(chart: HTMLElement) {
            _chart = chart;
        }

        function setOptions(newOptions: Partial<LegendOptions>) {
            options = {...DEFAULT_OPTIONS, ...newOptions};
        }

        function _applyHandlers() {
            const {root} = yagr;
            const seriesHtml: NodeListOf<HTMLDivElement> = root.querySelectorAll('[data-series-id]');
            const unsubscribe: (() => void)[] = [];

            const onSeriesClickBasic = (seriesNode: HTMLElement) => () => {
                const seriesId = seriesNode.getAttribute('data-series-id');
                const seriesToToggle: [CommonSeries, boolean][] = [];

                const series = _getSeries();

                if (seriesId === ALL_SERIES_IDX) {
                    const nextToggleState = !hasOneVisibleLine(series);

                    for (let idx = 0; idx < series.length; idx++) {
                        seriesToToggle.push([series[idx], nextToggleState]);
                    }
                } else {
                    const seriesItem = series.find(({id}) => id === seriesId);
                    if (!seriesItem) {
                        return;
                    }
                    seriesToToggle.push([seriesItem, !seriesItem.show]);
                }

                seriesToToggle.forEach(([seriesItem, nextState]) => {
                    if (seriesItem.show === nextState) {
                        return;
                    }
                    const node = root.querySelector(`[data-series-id="${seriesItem.id}"]`);

                    props.onToggleSeries(yagr, seriesItem.id, nextState, false);
                    node?.classList[nextState ? 'remove' : 'add']('yagr-legend__item_hidden');
                });

                const allSeriesItem = root.querySelector('.yagr-legend__all-series');

                if (allSeriesItem) {
                    const title = getPrependingTitle(yagr.utils.i18n, series);
                    allSeriesItem.innerHTML = title || '';
                }
            };

            const onSeriesClickExtended = (seriesNode: HTMLElement) => {
                const changeVisibility = (id: string, visibility: boolean) => {
                    const node = root.querySelector(`[data-series-id="${id}"]`);
                    props.onToggleSeries(yagr, id, visibility, false);
                    node?.classList[visibility ? 'remove' : 'add']('yagr-legend__item_hidden');
                };

                const toggleSeries = (seriesItem: CommonSeries) => {
                    changeVisibility(seriesItem.id, !seriesItem.show);
                };

                const selectSeries = (seriesItem: CommonSeries) => {
                    const series = _getSeries();
                    startSeriesRange = seriesItem;

                    const otherSeries = series.filter((s) => s.id !== seriesItem.id);
                    const otherVisibility = !hasOneVisibleLine(otherSeries) && seriesItem.show !== false;

                    series.forEach((s) => {
                        const visibility = seriesItem.id === s.id ? true : otherVisibility;
                        changeVisibility(s.id, visibility);
                    });
                };

                const selectRange = (seriesItem: CommonSeries) => {
                    const series = _getSeries();

                    // If startSeriesRange is undefined then startSeriesRange = first valid legend element
                    if (!startSeriesRange) {
                        startSeriesRange = series[1];
                    }

                    const range: number[] = [];

                    series.forEach((s, i) => {
                        if (s.id === seriesItem.id) {
                            range.push(i);
                        }
                        // There is no 'else' because exist case when startSeriesRange and target series are same elements
                        if (s.id === startSeriesRange?.id) {
                            range.push(i);
                        }
                    });

                    series.forEach((s, i) => {
                        const visibility = i >= range[0] && i <= range[1];
                        changeVisibility(s.id, visibility);
                    });
                };

                return (e: MouseEvent) => {
                    const seriesId = seriesNode.getAttribute('data-series-id');
                    const series = _getSeries().find(({id}) => id === seriesId);

                    if (!series) {
                        return;
                    }

                    e.preventDefault();

                    if (e.ctrlKey || e.metaKey) {
                        toggleSeries(series);
                    } else if (e.shiftKey) {
                        selectRange(series);
                    } else {
                        selectSeries(series);
                    }
                };
            };

            const onSeriesClick = {
                basic: onSeriesClickBasic,
                extended: onSeriesClickExtended,
            };

            const onSeriesMouseEnter = (seriesNode: HTMLElement) => () => {
                const seriesId = seriesNode.getAttribute('data-series-id');

                if (seriesNode.classList.contains('yagr-legend__item_hidden') || seriesId === ALL_SERIES_IDX) {
                    return;
                }

                const targetSeries = _getSeries().find(({id}) => id === seriesId);

                if (targetSeries) {
                    props.onSetFocus(yagr, targetSeries.id, true);
                }
            };

            const onSeriesMouseLeave = () => {
                props.onSetFocus(yagr, null, true);
            };

            seriesHtml.forEach((seriesNode) => {
                const onClick = onSeriesClick[options.behavior || 'basic'](seriesNode);
                const onFocus = onSeriesMouseEnter(seriesNode);

                seriesNode.addEventListener('click', onClick);
                seriesNode.addEventListener('mouseenter', onFocus);
                seriesNode.addEventListener('mouseleave', onSeriesMouseLeave);
                seriesNode.addEventListener('mousedown', preventMouseEvents);

                unsubscribe.push(() => {
                    seriesNode.removeEventListener('click', onClick);
                    seriesNode.removeEventListener('mouseenter', onFocus);
                    seriesNode.removeEventListener('mouseleave', onSeriesMouseLeave);
                    seriesNode.removeEventListener('mousedown', preventMouseEvents);
                });
            });

            _onDestroy = () => unsubscribe.forEach((fn) => fn());
            return _onDestroy;
        }

        function _render() {
            _calc();
            let reRender = false;
            let legendEl = yagr.root.querySelector('.yagr-legend') as HTMLElement;

            if (legendEl) {
                reRender = true;
            } else {
                legendEl = html('div', {
                    class: `yagr-legend yagr-legend__${options.position} ${options?.className || ''}`,
                });
            }

            if (!legendEl) {
                return;
            }

            if (!reRender) {
                if (options.position === 'top') {
                    _chart!.before(legendEl);
                } else {
                    _chart!.after(legendEl);
                }
            }

            _legendEl = legendEl;

            if (!_itemsHtml || reRender) {
                _calc();
            }

            _legendEl.innerHTML = `<div class="yagr-legend__container" style="height: ${sRequiredSpace}px">${_itemsHtml}</div>`;

            _items = legendEl.querySelector('.yagr-legend__items') as HTMLElement;
            _container = legendEl.querySelector('.yagr-legend__container') as HTMLElement;

            if (sPaginated) {
                const pagination = _renderPagination();
                _container?.after(pagination);
            } else {
                _items.style.justifyContent = 'center';
            }

            _applyHandlers();
        }

        function _measureLegend(body: string) {
            const rootEl = yagr.root;
            const pseudo = html(
                'div',
                {
                    class: 'yagr-legend',
                    style: {visibility: 'hidden'},
                },
                body,
            );

            rootEl.appendChild(pseudo);

            const items = pseudo.childNodes[0] as HTMLElement;
            const result = items.getBoundingClientRect();
            pseudo.remove();

            return result;
        }

        function _nextPage() {
            sPage += 1;

            if (_items) {
                _items.style.transform = `translate(0, ${-1 * sPage * sPageSize}px)`;
                _renderPagination();
            }
        }

        function _prevPage() {
            sPage -= 1;

            if (_items) {
                _items.style.transform = `translate(0, ${-1 * sPage * sPageSize}px)`;
                _renderPagination();
            }
        }

        function _renderPagination() {
            let pagination = yagr.root.querySelector('.yagr-legend__pagination');

            if (pagination) {
                const nextPage = pagination.querySelector('.yagr-legend__icon-down') as HTMLElement;
                const prevPage = pagination.querySelector('.yagr-legend__icon-up') as HTMLElement;

                nextPage.removeEventListener('click', _nextPage);
                prevPage.removeEventListener('click', _prevPage);
            } else {
                pagination = html('div', {
                    class: 'yagr-legend__pagination',
                });
            }

            const upClassName = sPage === 0 ? 'yagr-legend__icon-up_disabled' : '';
            const downClassName = sPage === sPages - 1 ? 'yagr-legend__icon-down_disabled' : '';

            pagination.innerHTML = `<span class="yagr-legend__icon-up ${upClassName}"></span>
<span class="yagr-legend__pagination-text">${sPage + 1}/${sPages}</span>
<span class="yagr-legend__icon-down ${downClassName}"></span>`;

            const nextPage = pagination.querySelector('.yagr-legend__icon-down') as HTMLElement;
            const prevPage = pagination.querySelector('.yagr-legend__icon-up') as HTMLElement;

            if (!downClassName) {
                nextPage.addEventListener('click', _nextPage);
            }
            if (!upClassName) {
                prevPage.addEventListener('click', _prevPage);
            }

            return pagination;
        }

        function _createIconLineElement(series: CommonSeries) {
            const iconLineElement = html('span', {
                class: `yagr-legend__icon yagr-legend__icon_${series.type}`,
                style: {'background-color': series.color},
            });

            return iconLineElement;
        }

        function _createSerieNameElement(series: CommonSeries) {
            const seriesNameElement = html('span');
            seriesNameElement.innerText = series.name || 'unnamed';

            return seriesNameElement;
        }

        function _renderItems() {
            const _series = _getSeries();
            const title = getPrependingTitle(yagr.utils.i18n, _series);
            const titleId = options.behavior !== 'extended' && getPrependingTitleId(_series);
            const series: (CommonSeries | typeof ALL_SERIES_IDX)[] = titleId ? [titleId] : [];

            for (let i = 0; i < _series.length; i++) {
                series.push(_series[i]);
            }

            const content = series
                .map((serie) => {
                    let serieContent;
                    let sId;
                    let additionalCn = ' ';

                    if (serie === ALL_SERIES_IDX) {
                        serieContent = title;
                        sId = titleId;
                        additionalCn = ' yagr-legend__all-series ';
                    } else {
                        sId = serie.id;
                        const icon = _createIconLineElement(serie);
                        const name = _createSerieNameElement(serie);

                        serieContent = `${icon.outerHTML}${name.outerHTML}`;
                    }

                    const visible = typeof serie === 'string' ? true : serie.show !== false;

                    return `<div class="yagr-legend__item${additionalCn}${
                        visible ? '' : 'yagr-legend__item_hidden'
                    }" data-series-id="${sId}">${serieContent}</div>`;
                })
                .join('');

            return `<div class="yagr-legend__items">${content}</div>`;
        }

        function _calc() {
            if (!options.show) {
                return;
            }

            const chartHeight = _getChartHeight() - _getVerticalPadding();
            const html = _renderItems();
            const {height: requiredHeight} = _measureLegend(html);
            const rowHeight = DEFAULT_FONT_SIZE + 2;

            const maxPossiblePlace = chartHeight * (options.maxLegendSpace as number);
            const rowsPerPage = Math.floor(maxPossiblePlace / rowHeight);
            const itemsRowsPerPage = rowsPerPage - 1;
            const itemsPageSize = Math.min(itemsRowsPerPage * rowHeight, maxPossiblePlace);
            const paginatedPageSize = Math.min(rowsPerPage * rowHeight, maxPossiblePlace);
            const paginated = requiredHeight > itemsPageSize && itemsPageSize > 0;
            const requiredSpace = Math.min(paginated ? paginatedPageSize : itemsPageSize, requiredHeight);
            const pages = Math.ceil(requiredHeight / itemsPageSize);
            const additionalSpace = paginated
                ? _getVerticalPadding() + PAGINATION_BUTTON_HEIGHT
                : _getVerticalPadding();

            sRequiredSpace = requiredSpace;
            sTotalSpace = requiredSpace + additionalSpace;
            sPaginated = paginated;
            sPage = sPage || 0;
            sPages = pages;
            sPageSize = itemsPageSize;
            _itemsHtml = html;
        }

        function _getVerticalPadding() {
            return options.position === 'bottom'
                ? TOTAL_LEGEND_VERTICAL_PADDING_BOTTOM
                : TOTAL_LEGEND_VERTICAL_PADDING_TOP;
        }

        function _getSeries(): CommonSeries[] {
            _series = _series || props.getSeries(yagr);
            return _series;
        }

        function _getChartHeight(): number {
            _height = _height || props.getChartHeight(yagr);
            return _height;
        }

        return {
            hooks: {
                resize: () => redraw(),
            },
            redraw,
            destroy,
            setChart,
            getTotalSpace: () => sTotalSpace,
            setOptions,
        };
    };
}
