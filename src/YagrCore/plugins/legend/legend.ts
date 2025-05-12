import UPlot, {Options, Series} from 'uplot';

import Yagr from '../../index';
import {DEFAULT_X_SERIE_NAME} from '../../defaults';
import {html} from '../../utils/common';
import {preventMouseEvents} from '../../utils/events';

export type LegendPosition = 'top' | 'bottom';
export interface LegendOptions {
    /** Show legend (default: false) */
    show?: boolean;
    /** Root classname */
    className?: string;
    /** Legend placement position */
    position?: LegendPosition;
    /** Maximal space fro legend as a fraction of chart height (default: 0.3) */
    maxLegendSpace?: number;
    /** @TODO Maybe bugs here  */
    fontSize?: number;
    /** Basic behaviour includes only toggle behaviuor ("Hide/show all" button exists) */
    behaviour?: 'basic' | 'extended';
}

interface LegendState {
    page: number;
    pages: number;
    paginated: boolean;
    rowsPerPage: number;
    pageSize: number;
    requiredSpace: number;
    totalSpace: number;
    startSerieRange?: UPlot.Series;
}

const ALL_SERIES_IDX = 'null' as const;
const PAGINATION_BUTTON_HEIGHT = 18;
const TOTAL_LEGEND_VERTICAL_PADDING_BOTTOM = 20;
const TOTAL_LEGEND_VERTICAL_PADDING_TOP = 48;
const DEFAULT_FONT_SIZE = 12;
const DEFAULT_LEGEND_PLACE_RATIO = 0.3;

export const hasOneVisibleLine = (series: Series[]) => {
    return series.some(({show, id}) => id !== DEFAULT_X_SERIE_NAME && show);
};

const getPrependingTitle = (i18n: Yagr['utils']['i18n'], series: Series[]) => {
    return series.length > 3 && i18n(hasOneVisibleLine(series) ? 'hide-all' : 'show-all');
};

const getPrependingTitleId = (series: Series[]): typeof ALL_SERIES_IDX | undefined => {
    return (series.length > 3 && ALL_SERIES_IDX) || undefined;
};

export default class LegendPlugin {
    yagr!: Yagr;
    uplot?: UPlot;
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
    private _onDestroy?: () => void;

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

    preInit = (yagr: Yagr, options: LegendOptions, uplotOptions: Options) => {
        this.yagr = yagr;
        this.options = Object.assign(
            {
                show: false,
                position: 'bottom',
                fontSize: DEFAULT_FONT_SIZE,
                maxLegendSpace: DEFAULT_LEGEND_PLACE_RATIO,
                className: undefined,
                behaviour: 'basic',
            },
            options || {},
        );
        this.calc(uplotOptions);
    };

    init = (u: uPlot) => {
        if (!this.options.show) {
            return;
        }

        this.uplot = u;

        /** Removing native uPlot legend */
        u.root.querySelector('.u-legend')?.remove();
        this.render();
    };

    update = () => {
        const series: NodeListOf<HTMLDivElement> = this.yagr.root.querySelectorAll('[data-serie-id]');

        series.forEach((serieNode) => {
            const serieId = serieNode.getAttribute('data-serie-id');
            if (!serieId || serieId === ALL_SERIES_IDX) {
                return;
            }
            const serieVisible = this.uplot?.series[this.yagr.state.y2uIdx[serieId]]?.show;

            serieNode.classList[serieVisible ? 'remove' : 'add']('yagr-legend__item_hidden');
        });
    };

    private applyHandlers() {
        const {yagr, uplot: u} = this;

        if (!u) {
            return () => {};
        }

        const series: NodeListOf<HTMLDivElement> = yagr.root.querySelectorAll('[data-serie-id]');
        const unsubsribe: (() => void)[] = [];

        const onSerieClickBasic = (serieNode: HTMLElement) => () => {
            const serieId = serieNode.getAttribute('data-serie-id');
            const seriesToToggle: [Series, boolean][] = [];

            if (serieId === ALL_SERIES_IDX) {
                const nextToggleState = !hasOneVisibleLine(u.series);

                for (let idx = 1; idx < u.series.length; idx++) {
                    seriesToToggle.push([u.series[idx], nextToggleState]);
                }
            } else {
                const serie = u.series.find(({id}) => id === serieId);
                if (!serie) {
                    return;
                }
                seriesToToggle.push([serie, !serie.show]);
            }

            seriesToToggle.forEach(([serie, nextState]) => {
                if (serie.show === nextState) {
                    return;
                }
                const node = yagr.root.querySelector(`[data-serie-id="${serie.id}"]`);
                yagr.setVisible(serie.id, nextState, false);
                node?.classList[nextState ? 'remove' : 'add']('yagr-legend__item_hidden');
            });

            const allSeriesItem = yagr.root.querySelector('.yagr-legend__all-series');

            if (allSeriesItem) {
                const title = getPrependingTitle(this.yagr.utils.i18n, u.series);
                allSeriesItem.innerHTML = title || '';
            }
        };

        const onSerieClickExtended = (serieNode: HTMLElement) => {
            const changeVisibility = (id: string, visibility: boolean) => {
                const node = yagr.root.querySelector(`[data-serie-id="${id}"]`);
                yagr.setVisible(id, visibility, false);
                node?.classList[visibility ? 'remove' : 'add']('yagr-legend__item_hidden');
            };

            const toggleSerie = (serie: UPlot.Series) => {
                changeVisibility(serie.id, !serie.show);
            };

            const selectSerie = (serie: UPlot.Series) => {
                this.state.startSerieRange = serie;

                const otherSeries = u.series.filter((s) => s.id !== serie.id);
                const otherVisibility = !hasOneVisibleLine(otherSeries) && serie.show !== false;

                u.series.forEach((s) => {
                    const visibility = serie.id === s.id ? true : otherVisibility;
                    changeVisibility(s.id, visibility);
                });
            };

            const selectRange = (serie: UPlot.Series) => {
                // If startSerieRange is undefined then startSerieRange = first valid legend element
                if (!this.state.startSerieRange) {
                    this.state.startSerieRange = u.series[1];
                }

                const range: number[] = [];

                u.series.forEach((s, i) => {
                    if (s.id === serie.id) {
                        range.push(i);
                    }
                    // There is no 'else' because exist case when startSerieRange and target serie are same elements
                    if (s.id === this.state.startSerieRange?.id) {
                        range.push(i);
                    }
                });

                u.series.forEach((s, i) => {
                    const visibility = i >= range[0] && i <= range[1];
                    changeVisibility(s.id, visibility);
                });
            };

            return (e: MouseEvent) => {
                const serieId = serieNode.getAttribute('data-serie-id');

                const serie = u.series.find(({id}) => id === serieId);

                if (!serie) {
                    return;
                }

                e.preventDefault();

                if (e.ctrlKey || e.metaKey) {
                    toggleSerie(serie);
                } else if (e.shiftKey) {
                    selectRange(serie);
                } else {
                    selectSerie(serie);
                }
            };
        };

        const onSerieClick = {
            basic: onSerieClickBasic,
            extended: onSerieClickExtended,
        };

        const onSerieMouseEnter = (serieNode: HTMLElement) => () => {
            const serieId = serieNode.getAttribute('data-serie-id');

            if (serieNode.classList.contains('yagr-legend__item_hidden') || serieId === ALL_SERIES_IDX) {
                return;
            }

            const targetSerie = this.yagr.uplot.series.find(({id}) => id === serieId);
            if (targetSerie) {
                yagr.setFocus(targetSerie.id, true);

                // fix bug with focus in stacking column chart
                yagr.redraw(true, false);
            }
        };

        const onSerieMouseLeave = () => {
            yagr.setFocus(null, true);

            // fix bug with focus in stacking column chart
            yagr.redraw(true, false);
        };

        series.forEach((serieNode) => {
            const onClick = onSerieClick[this.options.behaviour || 'basic'](serieNode);
            const onFocus = onSerieMouseEnter(serieNode);

            serieNode.addEventListener('click', onClick);
            serieNode.addEventListener('mouseenter', onFocus);
            serieNode.addEventListener('mouseleave', onSerieMouseLeave);
            serieNode.addEventListener('mousedown', preventMouseEvents);

            unsubsribe.push(() => {
                serieNode.removeEventListener('click', onClick);
                serieNode.removeEventListener('mouseenter', onFocus);
                serieNode.removeEventListener('mouseleave', onSerieMouseLeave);
                serieNode.removeEventListener('mousedown', preventMouseEvents);
            });
        });

        const destroy = () => unsubsribe.forEach((fn) => fn());
        this._onDestroy = destroy;
        return destroy;
    }

    private render() {
        let reRender = false;
        const {uplot: u, options} = this;
        if (!u) {
            return;
        }

        let legendEl = this.yagr.root.querySelector('.yagr-legend') as HTMLElement;

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
                u.root.before(legendEl);
            } else {
                u.root?.after(legendEl);
            }
        }

        this.legendEl = legendEl;

        if (!this.itemsHtml || reRender) {
            this.calc(this.yagr.options);
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
        const rootEl = this.yagr.root;
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

        let pagination = this.yagr.root.querySelector('.yagr-legend__pagination');

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

    private createIconLineElement(serie: Series) {
        const iconLineElement = html('span', {
            class: `yagr-legend__icon yagr-legend__icon_${serie.type}`,
            style: {'background-color': this.yagr.getSerieLegendColor(serie)},
        });

        return iconLineElement;
    }

    private createSerieNameElement(serie: Series) {
        const serieNameElement = html('span');
        serieNameElement.innerText = serie.name || 'unnamed';

        return serieNameElement;
    }

    private renderItems(uplotOptions: Options) {
        const title = getPrependingTitle(this.yagr.utils.i18n, uplotOptions.series);
        const titleId = this.options.behaviour !== 'extended' && getPrependingTitleId(uplotOptions.series);
        const series: (Series | typeof ALL_SERIES_IDX)[] = titleId ? [titleId] : [];

        for (let i = 1; i < uplotOptions.series.length; i++) {
            const serie = uplotOptions.series[i];
            const showInLegend = serie.showInLegend === undefined ? true : serie.showInLegend;

            if (showInLegend) {
                series.push(serie);
            }
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
                }" data-serie-id="${sId}">${serieContent}</div>`;
            })
            .join('');

        return `<div class="yagr-legend__items">${content}</div>`;
    }

    private calc(uplotOptions: Options) {
        if (!this.options.show) {
            return;
        }

        const chartHeight = uplotOptions.height - this.VERTICAL_PADDING;
        const html = this.renderItems(uplotOptions);
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
}
