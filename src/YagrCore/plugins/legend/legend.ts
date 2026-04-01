import UPlot, {Options, Series} from 'uplot';

import Yagr from '../../index';
import {DEFAULT_X_SERIE_NAME} from '../../defaults';
import {html} from '../../utils/common';
import {preventMouseEvents} from '../../utils/events';
import {escapeAttribute} from './utils';

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

export const getSeriesInLegend = (series: Series[]) => {
    return series.filter(
        ({id, showInLegend}) => id !== DEFAULT_X_SERIE_NAME && showInLegend !== false,
    );
};

export const hasOneVisibleLine = (series: Series[]) => {
    return series.some(
        ({id, show, showInLegend, showInGraph}) =>
            id !== DEFAULT_X_SERIE_NAME && showInLegend !== false && show && showInGraph !== false,
    );
};

/**
 * Любая серия с show: true в легенде (без учёта showInGraph).
 * Нужна для behaviour: 'extended' — там «solo / показать все» завязаны на show, как до showInGraph.
 */
const hasAnySeriesWithShowTrue = (series: Series[]) => {
    return series.some(
        ({id, show, showInLegend}) => id !== DEFAULT_X_SERIE_NAME && showInLegend !== false && show,
    );
};

const isSeriesVisibleOnGraph = (serie: Series) => {
    return serie.show !== false && serie.showInGraph !== false;
};

/** If the line hidden with option showInGraph, but it showed at tooltip — we are disabling legend item. */
const isLegendItemDisabled = (serie: Series) => {
    if (serie.show === false) {
        return false;
    }
    if (serie.showInGraph === false) {
        return true;
    }
    return false;
};

const shouldRestoreShowAfterShowAll = (serie: Series) => {
    return serie.show === false && serie.showInGraph === false;
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
        const series: NodeListOf<HTMLDivElement> =
            this.yagr.root.querySelectorAll('[data-serie-id]');

        series.forEach((serieNode) => {
            const serieId = serieNode.getAttribute('data-serie-id');
            if (!serieId || serieId === ALL_SERIES_IDX) {
                return;
            }
            const serie = this.uplot?.series[this.yagr.state.y2uIdx[serieId]];
            const hidden = serie?.show === false;
            const disabled = Boolean(serie && isLegendItemDisabled(serie));

            serieNode.classList[hidden ? 'add' : 'remove']('yagr-legend__item_hidden');
            serieNode.classList[disabled ? 'add' : 'remove']('yagr-legend__item_disabled');
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
            if (serieNode.classList.contains('yagr-legend__item_disabled')) {
                return;
            }
            const serieId = serieNode.getAttribute('data-serie-id');
            const seriesToToggle: [Series, boolean][] = [];
            const series = getSeriesInLegend(u.series);
            let isShowAll = false;

            if (serieId === ALL_SERIES_IDX) {
                const nextToggleState = !hasOneVisibleLine(series);
                isShowAll = nextToggleState;

                series.forEach((s) => {
                    if (isLegendItemDisabled(s)) {
                        return;
                    }
                    seriesToToggle.push([s, nextToggleState]);
                });
            } else {
                const serie = series.find(({id}) => id === serieId);
                if (!serie || isLegendItemDisabled(serie)) {
                    return;
                }
                seriesToToggle.push([serie, !isSeriesVisibleOnGraph(serie)]);
            }

            seriesToToggle.forEach(([serie, nextState]) => {
                if (isSeriesVisibleOnGraph(serie) === nextState) {
                    return;
                }
                const node = yagr.root.querySelector(
                    `[data-serie-id="${escapeAttribute(serie.id)}"]`,
                );
                yagr.setVisible(serie.id, nextState, false);
                node?.classList[nextState ? 'remove' : 'add']('yagr-legend__item_hidden');
            });

            if (serieId === ALL_SERIES_IDX && isShowAll) {
                series.forEach((s) => {
                    if (!shouldRestoreShowAfterShowAll(s)) {
                        return;
                    }
                    const node = yagr.root.querySelector(
                        `[data-serie-id="${escapeAttribute(s.id)}"]`,
                    );
                    yagr.setVisible(s.id, true, false);
                    node?.classList.remove('yagr-legend__item_hidden');
                });
            }

            const allSeriesItem = yagr.root.querySelector('.yagr-legend__all-series');

            if (allSeriesItem) {
                const title = getPrependingTitle(this.yagr.utils.i18n, series);
                allSeriesItem.innerHTML = title || '';
            }
        };

        const onSerieClickExtended = (serieNode: HTMLElement) => {
            const changeVisibility = (id: string, visibility: boolean) => {
                const node = yagr.root.querySelector(`[data-serie-id="${escapeAttribute(id)}"]`);
                yagr.setVisible(id, visibility, false);
                node?.classList[visibility ? 'remove' : 'add']('yagr-legend__item_hidden');
            };

            const toggleSerie = (serie: UPlot.Series) => {
                changeVisibility(serie.id, !isSeriesVisibleOnGraph(serie));
            };

            const selectSerie = (serie: UPlot.Series) => {
                this.state.startSerieRange = serie;
                const series = getSeriesInLegend(u.series);

                const otherSeries = series.filter((s) => s.id !== serie.id);
                const otherVisibility =
                    !hasAnySeriesWithShowTrue(otherSeries) && serie.show !== false;

                series.forEach((s) => {
                    if (isLegendItemDisabled(s)) {
                        return;
                    }
                    const visibility = serie.id === s.id ? true : otherVisibility;
                    changeVisibility(s.id, visibility);
                });

                if (otherVisibility) {
                    series.forEach((s) => {
                        if (!shouldRestoreShowAfterShowAll(s)) {
                            return;
                        }
                        const node = yagr.root.querySelector(
                            `[data-serie-id="${escapeAttribute(s.id)}"]`,
                        );
                        yagr.setVisible(s.id, true, false);
                        node?.classList.remove('yagr-legend__item_hidden');
                    });
                }
            };

            const selectRange = (serie: UPlot.Series) => {
                const series = getSeriesInLegend(u.series);

                // If startSerieRange is undefined then startSerieRange = first valid legend element
                if (!this.state.startSerieRange) {
                    this.state.startSerieRange = series[0];
                }

                const range: number[] = [];

                series.forEach((s, i) => {
                    if (s.id === serie.id) {
                        range.push(i);
                    }
                    // There is no 'else' because exist case when startSerieRange and target serie are same elements
                    if (s.id === this.state.startSerieRange?.id) {
                        range.push(i);
                    }
                });

                series.forEach((s, i) => {
                    if (isLegendItemDisabled(s)) {
                        return;
                    }
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

                if (isLegendItemDisabled(serie)) {
                    e.preventDefault();
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

            if (
                serieNode.classList.contains('yagr-legend__item_hidden') ||
                serieNode.classList.contains('yagr-legend__item_disabled') ||
                serieId === ALL_SERIES_IDX
            ) {
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
        const downClassName =
            state.page === state.pages - 1 ? 'yagr-legend__icon-down_disabled' : '';

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
        const serieNameElement = html('span', {class: 'yagr-legend__name'});
        serieNameElement.textContent = serie.name || 'unnamed';

        return serieNameElement;
    }

    private renderItems(uplotOptions: Options) {
        const seriesInLegend = getSeriesInLegend(uplotOptions.series);
        const title = getPrependingTitle(this.yagr.utils.i18n, seriesInLegend);
        const titleId =
            this.options.behaviour !== 'extended' && getPrependingTitleId(seriesInLegend);
        const series: (Series | typeof ALL_SERIES_IDX)[] = titleId
            ? [titleId, ...seriesInLegend]
            : [...seriesInLegend];

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
                    sId = escapeAttribute(serie.id);
                    const icon = this.createIconLineElement(serie);
                    const name = this.createSerieNameElement(serie);

                    serieContent = `${icon.outerHTML}${name.outerHTML}`;
                }

                if (typeof serie === 'string') {
                    return `<div class="yagr-legend__item${additionalCn}" data-serie-id="${sId}">${serieContent}</div>`;
                }

                const isHidden = serie.show === false;
                const isDisabled = isLegendItemDisabled(serie);
                let itemClass = `yagr-legend__item${additionalCn}`.trim();
                if (isHidden) {
                    itemClass += ' yagr-legend__item_hidden';
                }
                if (isDisabled) {
                    itemClass += ' yagr-legend__item_disabled';
                }

                const aria = isDisabled ? ' aria-disabled="true"' : '';
                return `<div class="${itemClass}" data-serie-id="${sId}"${aria}>${serieContent}</div>`;
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
        const requiredSpace = Math.min(
            paginated ? paginatedPageSize : itemsPageSize,
            requiredHeight,
        );
        const pages = Math.ceil(requiredHeight / itemsPageSize);
        const additionalSpace = paginated
            ? this.VERTICAL_PADDING + PAGINATION_BUTTON_HEIGHT
            : this.VERTICAL_PADDING;

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
