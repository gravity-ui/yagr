import type {MinimalValidConfig, RawSerieData, SupportedLocales, YagrConfig, YagrTheme} from '../types';
import Yagr from '..';

import i18n from '../locale';
import {DEFAULT_X_SCALE, DEFAULT_Y_SCALE} from '../defaults';
import {UPDATE_KEYS, configureSeries} from '../utils/series';
import {getRedrawOptionsForAxesUpdate, updateAxis} from '../utils/axes';
import {Paths, assignKeys, containsOnly, deepIsEqual, get} from '../utils/common';
import {Batch} from './batch-updates';

interface UpdateOptions {
    incremental?: boolean;
    splice?: boolean;
}

function setLocaleImpl(yagr: Yagr, batch: Batch, locale: SupportedLocales | Record<string, string>) {
    yagr.utils.i18n = i18n(locale);
    batch.redrawLegend = true;
}

function setThemeImpl(yagr: Yagr, themeValue: YagrTheme, batch: Batch) {
    yagr.utils.theme.setTheme(themeValue);
    const availableThemes: YagrTheme[] = ['light', 'light-hc', 'dark', 'dark-hc'];
    const classesToRemove = availableThemes.map((theme) => `yagr_theme_${theme}`);
    yagr.root.classList.remove(...classesToRemove);
    yagr.root.classList.add('yagr_theme_' + themeValue);
    batch.redraw = [false, true];
}

function setAxesImpl(yagr: Yagr, batch: Batch, axes: YagrConfig['axes']) {
    const {x, ...rest} = axes;

    if (x) {
        const xAxis = yagr.uplot.axes.find(({scale}) => scale === DEFAULT_X_SCALE);

        if (xAxis) {
            updateAxis(yagr, xAxis, {scale: DEFAULT_X_SCALE, ...x});
        }
    }

    Object.entries(rest).forEach(([scaleName, scaleConfig]) => {
        const axis = yagr.uplot.axes.find(({scale}) => scale === scaleName);

        if (axis) {
            updateAxis(yagr, axis, {scale: scaleName, ...scaleConfig});
        }
    });

    batch.redraw = getRedrawOptionsForAxesUpdate(axes);
}

function setFocusImpl(yagr: Yagr, lineId: string | null, focus: boolean) {
    const seriesIdx = lineId === null ? null : yagr.state.y2uIdx[lineId];
    yagr.plugins.cursor?.focus(seriesIdx, focus);
    yagr.uplot.setSeries(seriesIdx, {focus});
}

function setVisibleImpl(yagr: Yagr, lineId: string | null, show: boolean, updateLegend: boolean, batch: Batch) {
    const seriesIdx = lineId === null ? null : yagr.state.y2uIdx[lineId];
    const seriesCfg = lineId === null ? yagr.config.series : [yagr.config.series.find(({id}) => id === lineId)];

    seriesCfg.forEach((serie) => {
        if (serie) {
            serie.show = show;
        }
    });

    batch.fns.push(() => {
        yagr.uplot.setSeries(seriesIdx, {
            show,
        });
    });

    yagr.options.series = yagr.uplot.series;

    let shouldRebuildStacks = false;

    if (seriesIdx) {
        const series = yagr.uplot.series[seriesIdx];
        series.show = show;
        const scaleName = series.scale || DEFAULT_Y_SCALE;
        const scale = yagr.config.scales[scaleName];
        shouldRebuildStacks = Boolean(scale && scale.stacking);
    } else {
        shouldRebuildStacks = yagr.options.series.reduce((acc, serie) => {
            const {scale} = serie;
            serie.show = show;
            return Boolean((scale && yagr.config.scales[scale]?.stacking) || acc);
        }, false as boolean);
    }

    if (shouldRebuildStacks) {
        // batch.reopt = true;
        batch.recalc = true;
        batch.fns.push(() => {
            yagr.uplot.setData(yagr.series, true);
            updateLegend && yagr.plugins.legend?.update();
        });
    }
}

function setScalesImpl(yagr: Yagr, scales: YagrConfig['scales'], batch: Batch) {
    let stackingIsChanged = false;
    let typeIsChanged = false;
    let normalizationIsChanged = false;

    Object.entries(scales).forEach(([scaleName, scaleConfig]) => {
        const scale = yagr.config.scales[scaleName];

        if (scale) {
            const {stacking, type} = scale;
            const {stacking: newStacking, type: newType} = scaleConfig;

            if (stacking !== newStacking) {
                stackingIsChanged = true;
            }

            if (type !== newType) {
                typeIsChanged = true;
            }

            if (scaleConfig.normalize !== scale.normalize || scaleConfig.normalizeBase !== scale.normalizeBase) {
                normalizationIsChanged = true;
            }
        }
    });

    const isChangingOnlyMinMax = Object.values(scales).every((scaleConfig) =>
        containsOnly(scaleConfig as Record<string, unknown>, ['min', 'max']),
    );

    const isChangingXAxis = Object.keys(scales).includes(DEFAULT_X_SCALE);

    /**
     * In case if we change only min/max on data-scales, then we can just use uplot.setScale,
     * otherwise we need to rebuild all series and stacks in order to apply new scales;
     */
    if (isChangingOnlyMinMax && !isChangingXAxis) {
        return Object.entries(scales).forEach(([scaleName, scaleConfig]) => {
            batch.fns.push(() => {
                yagr.uplot.setScale(scaleName, {
                    min: scaleConfig.min!,
                    max: scaleConfig.max!,
                });
            });
        });
    }

    if (stackingIsChanged || normalizationIsChanged) {
        batch.reinit = true;
    }

    if (typeIsChanged) {
        batch.reopt = true;
        batch.recalc = true;
    }

    yagr.config.scales = scales;
    batch.redraw = [true, true];
}

function isChanged(oldConfig: YagrConfig, newConfig: Partial<YagrConfig>) {
    return function isChangedPath(
        path: Paths<YagrConfig>,
        predicate?: (oldValue: unknown, newValue: unknown) => boolean,
    ) {
        const oldValue = get(oldConfig, path);
        const newValue = get(newConfig, path);

        return predicate ? !predicate(oldValue, newValue) : oldValue !== newValue;
    };
}

function areSeriesChanged(a: YagrConfig['series'], b?: YagrConfig['series']) {
    if (a.length !== b?.length) {
        return true;
    }

    const mapA = new Map<string, YagrConfig['series'][0]>();
    const mapB = new Map<string, YagrConfig['series'][0]>();

    a.forEach((serie) => {
        mapA.set(serie.id!, serie);
    });

    b.forEach((serie) => {
        mapB.set(serie.id!, serie);
    });

    if (b.some(({id}) => !mapA.has(id!)) || a.some(({id}) => !mapB.has(id!))) {
        return true;
    }

    return false;
}

function setConfigImpl(yagr: Yagr, batch: Batch, newConfig: Partial<YagrConfig>) {
    const isChangedKey = isChanged(yagr.config, newConfig);

    if (newConfig.chart?.appearance?.theme && isChangedKey('chart.appearance.theme')) {
        yagr.setTheme(newConfig.chart?.appearance?.theme!);
    }

    if (newConfig.chart?.series && isChangedKey('chart.series', deepIsEqual)) {
        yagr.config.chart.series = newConfig.chart!.series!;
        batch.reopt = true;
        batch.redraw = [true, false];
    }

    if (newConfig.chart?.appearance?.locale && isChangedKey('chart.appearance.locale')) {
        yagr.setLocale(newConfig.chart?.appearance?.locale!);
    }

    if (newConfig.axes && isChangedKey('axes', deepIsEqual)) {
        yagr.setAxes(newConfig.axes!);
    }

    if (newConfig.scales && isChangedKey('scales', deepIsEqual)) {
        yagr.setScales(newConfig.scales!);
    }

    const isChangedSeries = areSeriesChanged(yagr.config.series, newConfig.series);

    if (isChangedSeries) {
        batch.redrawLegend = true;
    }

    if (newConfig.series || newConfig.timeline) {
        yagr.setSeries(newConfig.timeline ?? yagr.config.timeline, newConfig.series ?? yagr.config.series, {
            incremental: false,
        });
    }

    batch.reopt = true;
    yagr.config = {...yagr.config, ...newConfig};
}

function setSeriesImpl(
    this: Yagr,
    batch: Batch,
    timelineOrSeriesOrId: Partial<RawSerieData>[] | number[] | number | string,
    maybeSeries?: Partial<RawSerieData>[] | Partial<RawSerieData>,
    options: UpdateOptions = {
        incremental: true,
        splice: false,
    },
) {
    let timeline: number[] = [],
        series: RawSerieData[] = [],
        updateId: null | string | number = null,
        useIncremental = false,
        shouldRecalcData = false,
        useFullyRedraw;

    if (['number', 'string'].includes(typeof timelineOrSeriesOrId)) {
        useIncremental = false;
        useFullyRedraw = false;
        series = [maybeSeries] as RawSerieData[];
        updateId = timelineOrSeriesOrId as number | string;
    } else if (typeof (timelineOrSeriesOrId as Array<number | RawSerieData>)[0] === 'number') {
        timeline = timelineOrSeriesOrId as number[];
        series = maybeSeries as RawSerieData[];
        useIncremental = Boolean(options.incremental);
        useFullyRedraw = !options.incremental;
    } else {
        series = timelineOrSeriesOrId as RawSerieData[];
        useFullyRedraw = true;
    }

    if (useFullyRedraw === false) {
        let shouldUpdateCursror = false;

        useIncremental && this.config.timeline.push(...timeline);
        series.forEach((serie) => {
            let matched =
                typeof updateId === 'number'
                    ? this.config.series[0]
                    : this.config.series.find(({id}) => id === serie.id || id === updateId);

            let id: number | string | undefined = matched?.id;

            if (typeof updateId === 'number' && this.state.y2uIdx[updateId]) {
                matched = this.config.series[updateId];
                id = updateId;
            }

            if (matched && id) {
                const {data, ...rest} = serie;
                const seriesIdx = this.state.y2uIdx[id];

                if (useIncremental) {
                    matched.data = data ? matched.data.concat(data) : matched.data;
                } else if (data?.length) {
                    matched.data = data;
                    /**
                     * We're reprocessing data on every series' data change,
                     * cause we don't know is it required to process current line or not
                     * Possible non clear pattern:
                     *  - series may contain string values to process out with `interpolate` option
                     *  - series may be in stack group
                     * @TODO fixme when you got a good idea
                     */
                    shouldRecalcData = true;
                }

                const newSeries = configureSeries(this, Object.assign(matched, rest), seriesIdx);
                const opts = this.options.series[seriesIdx];
                const uOpts = this.uplot.series[seriesIdx];

                if (uOpts.show !== newSeries.show) {
                    batch.fns.push(() => {
                        this.uplot.setSeries(seriesIdx, {show: newSeries.show});
                    });
                }

                if (uOpts._focus === null ? true : uOpts._focus !== newSeries.focus) {
                    batch.fns.push(() => {
                        this.uplot.setSeries(seriesIdx, {focus: newSeries.focus});
                    });
                }

                if (uOpts.color !== newSeries.color) {
                    shouldUpdateCursror = true;
                }

                if (newSeries.scale && this.config.scales[newSeries.scale]?.stacking) {
                    shouldRecalcData = true;
                }

                assignKeys(UPDATE_KEYS, opts, newSeries);
                assignKeys(UPDATE_KEYS, uOpts, newSeries);
            } else {
                batch.fns.push(() => {
                    const newSeries = configureSeries(this, serie, this.config.series.length);
                    this.state.y2uIdx[newSeries.id] = this.uplot.series.length;
                    this.uplot.addSeries(newSeries, this.config.series.length);
                });
                this.config.series.push(serie);
            }
        });

        if (shouldUpdateCursror) {
            batch.fns.push(() => {
                this.plugins.cursor?.updatePoints();
            });
        }

        if (options.splice) {
            const sliceLength = series[0].data.length;
            this.config.series.forEach((s) => {
                s.data.splice(0, sliceLength);
            });
            this.config.timeline.splice(0, timeline.length);
        }
    } else {
        /** If we're adding new series */
        if (
            series.some(({id}) => {
                return this.config.series.find((s) => s.id !== id);
            })
        ) {
            batch.reinit = true;
        }

        this.config.series = series;
        this.config.timeline = timeline;
        batch.reopt = true;
        shouldRecalcData = true;
    }

    if (shouldRecalcData || timeline.length) {
        batch.recalc = true;
        batch.fns.push(() => {
            this.uplot.setData(this.series);
        });
    }
}

export class DynamicUpdatesMixin<T extends MinimalValidConfig> {
    /**
     * @public
     * @param locale string | Record<string, string>
     * @description Set's locale of chart and redraws all locale-dependent elements.
     */
    setLocale(this: Yagr<T>, locale: SupportedLocales | Record<string, string>) {
        this.batch((batch) => setLocaleImpl(this, batch, locale));
    }

    /**
     * @public
     * @param themeValue YagrTheme
     * @description Set's theme of chart and redraws all theme-dependent elements.
     */
    setTheme(this: Yagr<T>, themeValue: YagrTheme) {
        this.batch((batch) => setThemeImpl(this, themeValue, batch));
    }

    /**
     * @public
     * @param axes axes config
     * @description Sets new axes config and redraws all axes.
     */
    setAxes(this: Yagr<T>, axes: YagrConfig['axes']) {
        this.batch((batch) => setAxesImpl(this, batch, axes));
    }

    /**
     * @public
     * @param seriesId string
     * @param series Partial<RawSerieData>
     * @description Sets new series by series id and redraws series.
     */
    setSeries(this: Yagr<T>, seriesId: string, series: Partial<RawSerieData>): void;
    /**
     * @public
     * @param seriesIdx number
     * @param series Partial<RawSerieData>
     * @description Sets new series by series index and redraws series.
     */
    setSeries(this: Yagr<T>, seriesIdx: number, series: Partial<RawSerieData>): void;
    /**
     * @public
     * @param series Partial<RawSerieData>
     * @description Sets new series dataset (matching to current timeline) and redraws.
     */
    setSeries(this: Yagr<T>, series: Partial<RawSerieData>[]): void;
    /**
     * @public
     * @param timeline number[]
     * @param series Partial<RawSerieData>
     * @param options UpdateOptions
     * @description Sets new series dataset with different timeline and redraws.
     */
    setSeries(this: Yagr<T>, timeline: number[], series: Partial<RawSerieData>[], options: UpdateOptions): void;
    setSeries(
        this: Yagr<T>,
        timelineOrSeriesOrId: Partial<RawSerieData>[] | number[] | number | string,
        maybeSeries?: Partial<RawSerieData>[] | Partial<RawSerieData>,
        options: UpdateOptions = {
            incremental: true,
            splice: false,
        },
    ) {
        this.batch((batch) => setSeriesImpl.call(this, batch, timelineOrSeriesOrId, maybeSeries, options));
    }

    /**
     * @public
     * @param lineId string | null
     * @param focus boolean
     * @description Sets focus on line with given id. If id is null, removes focus from all lines.
     * @returns void
     */
    setFocus(this: Yagr<T>, lineId: string | null, focus: boolean) {
        this.batch(() => setFocusImpl(this, lineId, focus));
    }

    /**
     * @public
     * @param lineId string | null
     * @param show boolean
     * @description Sets visibility of line with given id. If id is null, sets visibility of all lines.
     */
    setVisible(this: Yagr<T>, lineId: string | null, show: boolean, updateLegend = true) {
        this.batch((batch) => setVisibleImpl(this, lineId, show, updateLegend, batch));
    }

    /**
     * @public
     * @param scales Record<string, Partial<ScaleConfi>>
     * @description Sets new scales config and redraws.
     */
    setScales(this: Yagr<T>, scales: Record<string, Partial<YagrConfig['scales'][string]>>) {
        this.batch((batch) => setScalesImpl(this, scales, batch));
    }

    /**
     * @public
     * @experimental
     * @param newConfig Partial<YagrConfig>
     * @descriptino Sets new config and redraws.
     */
    setConfig(this: Yagr<T>, newConfig: Partial<YagrConfig>) {
        this.batch((batch) => setConfigImpl(this, batch, newConfig));
    }
}
