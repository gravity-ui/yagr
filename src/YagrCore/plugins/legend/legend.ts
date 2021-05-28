import UPlot, {Options, Series} from 'uplot';

import Yagr from '../../index';
import {DEFAULT_X_SERIE_NAME} from '../../defaults';

export enum LegendPosition {
    Top = 'top',
    Bottom = 'bottom',

    // Not implemented
    // Left = 'left',
    // Right = 'right',
}
export interface LegendOptions {
    /** Show legend (default: false) */
    show?: boolean;
    /** Root classname */
    className?: string;
    /** Legend placement position @TODO Implement me please */
    position?: LegendPosition;
    /** Maximal space fro legend as a fraction of chart height (default: 0.3) */
    maxLegendSpace?: number;
    /** @TODO Maybe bugs here  */
    fontSize?: number;
}

interface LegendState {
    page: number;
    pages: number;
    paginated: boolean;
    rowsPerPage: number;
    pageSize: number;
}

const ALL = 'yagr.series.all';
const TOTAL_LEGEND_VERTICAL_PADDING = 20;
const DEFAULT_FONT_SIZE = 12;
const DEFAULT_LEGEND_PLACE_RATIO = 0.3;

const hasOneVisibleLine = (series: Series[]) => {
    return series.some(({show, id}) => id !== DEFAULT_X_SERIE_NAME && show);
};

const getPrependingTitle = (i18n: Yagr['i18n'], series: Series[]) => {
    return series.length > 3 && i18n(hasOneVisibleLine(series) ? 'hide-all' : 'show-all');
};

export default class Legend {
    yagr: Yagr;
    uplot?: UPlot;
    options: LegendOptions;
    pagesCount: number;
    state: LegendState;
    itemsHtml = '';
    legendEl?: HTMLElement;
    items?: HTMLElement;
    container?: HTMLElement;
    _onDestroy?: () => void;

    constructor(yagr: Yagr, options?: LegendOptions) {
        this.yagr = yagr;
        this.pagesCount = 0;
        this.state = {
            page: 0,
            pages: 1,
            pageSize: 0,
            rowsPerPage: 1,
            paginated: false,
        };

        this.options = Object.assign(
            {
                show: false,
                position: LegendPosition.Bottom,
                fontSize: DEFAULT_FONT_SIZE,
                maxLegendSpace: DEFAULT_LEGEND_PLACE_RATIO,
                className: undefined,
            },
            options || {},
        );

        if (this.options.show) {
            this.calc();
        }
    }

    redraw() {
        if (!this.options.show) {
            return;
        }
        this.destroy();
        this.calc();
        this.prepareLegend();
    }

    destroy() {
        if (this._onDestroy) {
            this._onDestroy();
        }
        this.legendEl?.remove();
    }

    init = (u: UPlot, done: Function) => {
        this.uplot = u;

        /** Removing native uPlot legend */
        u.root.querySelector('.u-legend')?.remove();
        /** Reimplementing appedning u.root to root */
        this.yagr.root.appendChild(u.root);

        if (this.options.show) {
            this.prepareLegend();
        }
        done();
    };

    private applyHandlers() {
        const {yagr, uplot: u} = this;

        if (!u) {
            return () => {};
        }

        const series: NodeListOf<HTMLDivElement> = u.root.querySelectorAll('[data-serie-id]');
        const unsubsribe: (() => void)[] = [];

        const onSerieClick = (serieNode: HTMLElement) => () => {
            const serieId = serieNode.getAttribute('data-serie-id');
            const seriesToToggle: [number, Series, boolean][] = [];

            if (serieId === ALL) {
                const nextToggleState = !hasOneVisibleLine(u.series);

                for (let idx = 1; idx < u.series.length; idx++) {
                    seriesToToggle.push([idx, u.series[idx], nextToggleState]);
                }
            } else {
                let idx = 0;
                const serie = u.series.find((serie) => {
                    const r = serie.id === serieId;
                    if (!r) {
                        idx += 1;
                    }
                    return r;
                });
                if (!serie) {
                    return;
                }
                seriesToToggle.push([idx, serie, !serie.show]);
            }

            seriesToToggle.forEach(([idx, serie, nextState]) => {
                const node = u.root.querySelector(`[data-serie-id="${serie.id}"]`);
                yagr.toggleSerieVisibility(idx, serie, nextState);
                node?.classList[serie.show ? 'remove' : 'add']('yagr-legend__item_hidden');
            });

            const allSeriesItem = u.root.querySelector(`[data-serie-id="${ALL}"]`);

            if (allSeriesItem) {
                const title = getPrependingTitle(this.yagr.i18n, u.series);
                allSeriesItem.innerHTML = title || '';
            }
        };

        const onSerieMouseEnter = (serieNode: HTMLElement) => () => {
            const serieId = serieNode.getAttribute('data-serie-id');
            if (serieId === ALL) {
                return;
            }
            yagr.focus(serieId, true);
        };

        const onSerieMouseLeave = () => {
            yagr.focus(null, true);
        };

        series.forEach((serieNode) => {
            const onClick = onSerieClick(serieNode);
            const onFocus = onSerieMouseEnter(serieNode);

            serieNode.addEventListener('click', onClick);
            serieNode.addEventListener('mouseenter', onFocus);
            serieNode.addEventListener('mouseleave', onSerieMouseLeave);

            unsubsribe.push(() => {
                serieNode.removeEventListener('click', onClick);
                serieNode.removeEventListener('mouseenter', onFocus);
                serieNode.removeEventListener('mouseleave', onSerieMouseLeave);
            });
        });

        const destroy = () => unsubsribe.forEach((fn) => fn());
        this._onDestroy = destroy;
        return destroy;
    }

    private prepareLegend() {
        const {uplot: u, options} = this;
        if (!u) {
            return;
        }

        const wrapEl = u.root.querySelector('.u-wrap') as HTMLElement;
        const legendEl = document.createElement('div');

        legendEl.classList.add('yagr-legend');

        if (options?.className) {
            legendEl.classList.add(options?.className);
        }

        if (options?.position) {
            u.root.classList.add('yagr-legend_' + options?.position);
        }

        if (options.position === LegendPosition.Top) {
            const titleEl = u.root.querySelector('.u-title');
            const firstEl = titleEl || wrapEl;
            firstEl.before(legendEl);
        } else {
            wrapEl?.after(legendEl);
        }

        this.legendEl = legendEl;

        if (!this.itemsHtml) {
            this.calc();
        }

        legendEl.innerHTML = `<div class="yagr-legend__container" style="height: ${this.state.pageSize}px">${this.itemsHtml}</div>`;

        this.items = legendEl.querySelector('.yagr-legend__items') as HTMLElement;
        this.container = legendEl.querySelector('.yagr-legend__container') as HTMLElement;

        if (this.state.paginated) {
            const pagination = this.renderPagination();
            this.container?.after(pagination);
        } else {
            this.items.style.justifyContent = 'center';
        }

        const destroy = this.applyHandlers();
        this.uplot?.hooks.destroy?.push(() => {
            destroy();
            this.destroy();
        });
    }

    private measureLegend = (html: string) => {
        const rootEl = this.yagr.root;
        const pseudo = document.createElement('div');
        pseudo.classList.add('yagr-legend');
        pseudo.innerHTML = html;
        pseudo.style.visibility = 'hidden';
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
            pagination = document.createElement('div');
            pagination.classList.add('yagr-legend__pagination');
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

    private renderItems(uplotOptions: Options) {
        const title = getPrependingTitle(this.yagr.i18n, uplotOptions.series);

        const series: (string | Series)[] = title ? [title] : [];

        for (let i = 1; i < uplotOptions.series.length; i++) {
            series.push(uplotOptions.series[i]);
        }

        const content = series
            .map((serie) => {
                let id, content;

                if (typeof serie === 'string') {
                    id = ALL;
                    content = serie;
                } else {
                    const iconCname = `yagr-legend__icon yagr-legend__icon_${serie.type}`;
                    id = serie.id;
                    content = `
                    ${serie.color ? `<span class="${iconCname}" style="background-color: ${serie.color};"></span>` : ''}
                    ${serie.name || serie}
                `;
                }

                const visible = typeof serie === 'string' ? true : serie.show;

                return `<div class="yagr-legend__item ${
                    visible ? '' : 'yagr-legend__item_hidden'
                }" data-serie-id="${id}">${content}</div>`;
            })
            .join('');

        return `<div class="yagr-legend__items">${content}</div>`;
    }

    private calc() {
        if (!this.options.show) {
            return;
        }
        const uplotOptions = this.yagr.options;

        const chartHeight = uplotOptions.height - TOTAL_LEGEND_VERTICAL_PADDING;
        const html = this.renderItems(uplotOptions);
        const {height: requiredHeight} = this.measureLegend(html);
        const rowHeight = (this.options.fontSize as number) + 2;

        const maxPossiblePlace = chartHeight * (this.options.maxLegendSpace as number);
        const rowsPerPage = Math.floor(maxPossiblePlace / rowHeight);
        const itemsRowsPerPage = rowsPerPage - 1;
        const itemsPageSize = Math.min(itemsRowsPerPage * rowHeight, maxPossiblePlace);
        const paginatedPageSize = Math.min(rowsPerPage * rowHeight, maxPossiblePlace);
        const paginated = requiredHeight > itemsPageSize;
        const requiredSpace = Math.min(paginated ? paginatedPageSize : itemsPageSize, requiredHeight);
        const pages = Math.ceil(requiredHeight / itemsPageSize);

        uplotOptions.height = chartHeight - requiredSpace;

        this.state.paginated = paginated;
        this.state.page = this.state.page || 0;
        this.state.pages = pages;
        this.state.pageSize = itemsPageSize;
        this.state.rowsPerPage = rowsPerPage;
        this.itemsHtml = html;
    }
}
