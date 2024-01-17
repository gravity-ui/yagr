import {DEFAULT_X_SERIES_NAME} from '../../utils/defaults';
import {html} from '../../utils/html';
import {preventMouseEvents} from '../../utils/events';
import type I18n from '../..//utils/i18n';
import {CommonSeries} from 'src/types/common';

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
    /** @TODO Maybe bugs here  */
    fontSize?: number;
    /** Basic behavior includes only toggle behavior ("Hide/show all" button exists) */
    behavior?: 'basic' | 'extended';
}

interface LegendState {
    page: number;
    pages: number;
    paginated: boolean;
    rowsPerPage: number;
    pageSize: number;
    requiredSpace: number;
    totalSpace: number;
    startSeriesRange?: CommonSeries;
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
    fontSize: DEFAULT_FONT_SIZE,
    maxLegendSpace: DEFAULT_LEGEND_PLACE_RATIO,
    className: undefined,
    behavior: 'basic',
};

export default class BaseLegendPlugin {
    readonly root: HTMLElement;
    chart?: HTMLElement;

    options!: LegendOptions;
    pagesCount = 0;
    state: LegendState = {
        page: 0,
        pages: 1,
        pageSize: 0,
        rowsPerPage: 1,
        paginated: false,
        requiredSpace: 0,
        totalSpace: 0,
    };
    itemsHtml = '';
    legendEl?: HTMLElement;
    items?: HTMLElement;
    container?: HTMLElement;

    _series?: CommonSeries[];
    _height?: number;

    onPreInit?: () => void;
    onInit?: () => void;
    onUpdate?: () => void;
    onDestroy?: () => void;

    protected onSetFocus!: (id: string | null, emit: boolean) => void;
    protected onToggleSeries!: (id: string, state: boolean, emit: boolean) => void;
    protected getSeries!: () => CommonSeries[];
    protected getChartElement!: () => HTMLElement;
    protected getChartHeight!: () => number;

    private _onDestroy?: () => void;
    private readonly i18n: ReturnType<typeof I18n>;

    constructor(root: HTMLElement, options: LegendOptions, i18n: ReturnType<typeof I18n>) {
        this.root = root;
        this.options = Object.assign(DEFAULT_OPTIONS, options || {});
        this.i18n = i18n;
    }

    redraw() {
        if (!this.options.show) {
            return;
        }

        this.render();
    }

    destroy() {
        if (this._onDestroy) {
            this._onDestroy();
        }
        this.legendEl?.remove();
    }

    preInit = (chart: HTMLElement) => {
        this.chart = chart;
        this.calc();
        this.onPreInit?.();
    };

    init() {
        if (!this.options.show) {
            return;
        }

        this.onInit?.();
    }

    update() {
        this.onUpdate?.();
    }

    private applyHandlers() {
        const {root} = this;
        const seriesHtml: NodeListOf<HTMLDivElement> = this.root.querySelectorAll('[data-series-id]');
        const unsubscribe: (() => void)[] = [];

        const onSeriesClickBasic = (seriesNode: HTMLElement) => () => {
            const seriesId = seriesNode.getAttribute('data-series-id');
            const seriesToToggle: [CommonSeries, boolean][] = [];

            const series = this.series;

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

                this.onToggleSeries(seriesItem.id, nextState, false);
                node?.classList[nextState ? 'remove' : 'add']('yagr-legend__item_hidden');
            });

            const allSeriesItem = root.querySelector('.yagr-legend__all-series');

            if (allSeriesItem) {
                const title = getPrependingTitle(this.i18n, series);
                allSeriesItem.innerHTML = title || '';
            }
        };

        const onSeriesClickExtended = (seriesNode: HTMLElement) => {
            const changeVisibility = (id: string, visibility: boolean) => {
                const node = root.querySelector(`[data-series-id="${id}"]`);
                this.onToggleSeries(id, visibility, false);
                node?.classList[visibility ? 'remove' : 'add']('yagr-legend__item_hidden');
            };

            const toggleSeries = (seriesItem: CommonSeries) => {
                changeVisibility(seriesItem.id, !seriesItem.show);
            };

            const selectSeries = (seriesItem: CommonSeries) => {
                const series = this.series;
                this.state.startSeriesRange = seriesItem;

                const otherSeries = series.filter((s) => s.id !== seriesItem.id);
                const otherVisibility = !hasOneVisibleLine(otherSeries) && seriesItem.show !== false;

                series.forEach((s) => {
                    const visibility = seriesItem.id === s.id ? true : otherVisibility;
                    changeVisibility(s.id, visibility);
                });
            };

            const selectRange = (seriesItem: CommonSeries) => {
                const series = this.series;

                // If startSeriesRange is undefined then startSeriesRange = first valid legend element
                if (!this.state.startSeriesRange) {
                    this.state.startSeriesRange = series[1];
                }

                const range: number[] = [];

                series.forEach((s, i) => {
                    if (s.id === seriesItem.id) {
                        range.push(i);
                    }
                    // There is no 'else' because exist case when startSeriesRange and target series are same elements
                    if (s.id === this.state.startSeriesRange?.id) {
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
                const series = this.series.find(({id}) => id === seriesId);

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

            const targetSeries = this.series.find(({id}) => id === seriesId);

            if (targetSeries) {
                this.onSetFocus(targetSeries.id, true);
            }
        };

        const onSeriesMouseLeave = () => {
            this.onSetFocus(null, true);
        };

        seriesHtml.forEach((seriesNode) => {
            const onClick = onSeriesClick[this.options.behavior || 'basic'](seriesNode);
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

        const destroy = () => unsubscribe.forEach((fn) => fn());
        this._onDestroy = destroy;
        return destroy;
    }

    private render() {
        let reRender = false;
        const {options} = this;

        let legendEl = this.root.querySelector('.yagr-legend') as HTMLElement;

        if (legendEl) {
            reRender = true;
        } else {
            legendEl = html('div', {
                class: `yagr-legend yagr-legend__${this.options.position} ${options?.className || ''}`,
            });
        }

        if (!legendEl) {
            return;
        }

        if (!reRender) {
            if (options.position === 'top') {
                this.chart!.before(legendEl);
            } else {
                this.chart!.after(legendEl);
            }
        }

        this.legendEl = legendEl;

        if (!this.itemsHtml || reRender) {
            this.calc();
        }

        legendEl.innerHTML = `<div class="yagr-legend__container" style="height: ${this.state.requiredSpace}px">${this.itemsHtml}</div>`;

        this.items = legendEl.querySelector('.yagr-legend__items') as HTMLElement;
        this.container = legendEl.querySelector('.yagr-legend__container') as HTMLElement;

        if (this.state.paginated) {
            const pagination = this.renderPagination();
            this.container?.after(pagination);
        } else {
            this.items.style.justifyContent = 'center';
        }

        this.applyHandlers();
    }

    private measureLegend = (body: string) => {
        const rootEl = this.root;
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
    };

    private nextPage = () => {
        const {state} = this;
        this.state.page += 1;

        if (this.items) {
            this.items.style.transform = `translate(0, ${-1 * state.page * state.pageSize}px)`;
            this.renderPagination();
        }
    };

    private prevPage = () => {
        const {state} = this;
        this.state.page -= 1;

        if (this.items) {
            this.items.style.transform = `translate(0, ${-1 * state.page * state.pageSize}px)`;
            this.renderPagination();
        }
    };

    private renderPagination() {
        const {state} = this;

        let pagination = this.root.querySelector('.yagr-legend__pagination');

        if (pagination) {
            const nextPage = pagination.querySelector('.yagr-legend__icon-down') as HTMLElement;
            const prevPage = pagination.querySelector('.yagr-legend__icon-up') as HTMLElement;

            nextPage.removeEventListener('click', this.nextPage);
            prevPage.removeEventListener('click', this.prevPage);
        } else {
            pagination = html('div', {
                class: 'yagr-legend__pagination',
            });
        }

        const upClassName = state.page === 0 ? 'yagr-legend__icon-up_disabled' : '';
        const downClassName = state.page === state.pages - 1 ? 'yagr-legend__icon-down_disabled' : '';

        pagination.innerHTML = `<span class="yagr-legend__icon-up ${upClassName}"></span>
<span class="yagr-legend__pagination-text">${state.page + 1}/${state.pages}</span>
<span class="yagr-legend__icon-down ${downClassName}"></span>`;

        const nextPage = pagination.querySelector('.yagr-legend__icon-down') as HTMLElement;
        const prevPage = pagination.querySelector('.yagr-legend__icon-up') as HTMLElement;

        if (!downClassName) {
            nextPage.addEventListener('click', this.nextPage);
        }
        if (!upClassName) {
            prevPage.addEventListener('click', this.prevPage);
        }

        return pagination;
    }

    private createIconLineElement(series: CommonSeries) {
        const iconLineElement = html('span', {
            class: `yagr-legend__icon yagr-legend__icon_${series.type}`,
            style: {'background-color': series.color},
        });

        return iconLineElement;
    }

    private createSerieNameElement(series: CommonSeries) {
        const seriesNameElement = html('span');
        seriesNameElement.innerText = series.name || 'unnamed';

        return seriesNameElement;
    }

    private renderItems() {
        const title = getPrependingTitle(this.i18n, this.series);
        const titleId = this.options.behavior !== 'extended' && getPrependingTitleId(this.series);
        const series: (CommonSeries | typeof ALL_SERIES_IDX)[] = titleId ? [titleId] : [];

        for (let i = 0; i < this.series.length; i++) {
            series.push(this.series[i]);
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
                    const icon = this.createIconLineElement(serie);
                    const name = this.createSerieNameElement(serie);

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

    private calc() {
        if (!this.options.show) {
            return;
        }

        const chartHeight = this.chartHeight - this.VERTICAL_PADDING;
        const html = this.renderItems();
        const {height: requiredHeight} = this.measureLegend(html);
        const rowHeight = (this.options.fontSize as number) + 2;

        const maxPossiblePlace = chartHeight * (this.options.maxLegendSpace as number);
        const rowsPerPage = Math.floor(maxPossiblePlace / rowHeight);
        const itemsRowsPerPage = rowsPerPage - 1;
        const itemsPageSize = Math.min(itemsRowsPerPage * rowHeight, maxPossiblePlace);
        const paginatedPageSize = Math.min(rowsPerPage * rowHeight, maxPossiblePlace);
        const paginated = requiredHeight > itemsPageSize && itemsPageSize > 0;
        const requiredSpace = Math.min(paginated ? paginatedPageSize : itemsPageSize, requiredHeight);
        const pages = Math.ceil(requiredHeight / itemsPageSize);
        const additionalSpace = paginated ? this.VERTICAL_PADDING + PAGINATION_BUTTON_HEIGHT : this.VERTICAL_PADDING;

        this.state.requiredSpace = requiredSpace;
        this.state.totalSpace = requiredSpace + additionalSpace;
        this.state.paginated = paginated;
        this.state.page = this.state.page || 0;
        this.state.pages = pages;
        this.state.pageSize = itemsPageSize;
        this.state.rowsPerPage = rowsPerPage;
        this.itemsHtml = html;
    }

    private get VERTICAL_PADDING() {
        return this.options.position === 'bottom'
            ? TOTAL_LEGEND_VERTICAL_PADDING_BOTTOM
            : TOTAL_LEGEND_VERTICAL_PADDING_TOP;
    }

    get series(): CommonSeries[] {
        this._series = this._series || this.getSeries();
        return this._series;
    }

    get chartHeight(): number {
        this._height = this._height || this.getChartHeight();
        return this._height;
    }
}
