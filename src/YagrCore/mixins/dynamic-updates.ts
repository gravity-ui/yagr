import uPlot from 'uplot';

import type {MinimalValidConfig, RawSerieData, YagrConfig, YagrTheme} from '../types';
import Yagr from '..';

import i18n from '../locale';
import {DEFAULT_X_SCALE, DEFAULT_Y_SCALE} from '../defaults';
import {UPDATE_KEYS, configureSeries} from '../utils/series';
import {getRedrawOptionsForAxesUpdate, updateAxis} from '../utils/axes';
import {assignKeys, containsOnly} from '../utils/common';

interface UpdateOptions {
    incremental?: boolean;
    splice?: boolean;
}

/**
 * @internal
 * @param this Yagr instance
 * @description Creates uPlot options from Yagr config, sets up plugins. Non idempotent.
 * @returns uPlot options
 */
export class DynamicUpdatesMixin<T extends MinimalValidConfig> {
    protected _batch!: {fns: Function[]; recalc?: boolean};

    initMixin() {
        this._batch = {fns: []};
    }

    /**
     * @public
     * @param locale string | Record<string, string>
     * @description Set's locale of chart and redraws all locale-dependent elements.
     */
    setLocale(this: Yagr<T>, locale: string | Record<string, string>) {
        this.wrapBatch(() => () => {
            this.utils.i18n = i18n(locale);
            this.plugins.legend?.redraw();
        });
    }

    /**
     * @public
     * @param themeValue YagrTheme
     * @description Set's theme of chart and redraws all theme-dependent elements.
     */
    setTheme(this: Yagr<T>, themeValue: YagrTheme) {
        this.utils.theme.setTheme(themeValue);
        const availableThemes: YagrTheme[] = ['light', 'light-hc', 'dark', 'dark-hc'];
        const classesToRemove = availableThemes.map((theme) => `yagr_theme_${theme}`);
        this.root.classList.remove(...classesToRemove);
        this.root.classList.add('yagr_theme_' + themeValue);

        if (!this.uplot) {
            return;
        }

        this.wrapBatch(() => () => this.redraw(false, true));
    }

    /**
     * @public
     * @param axes axes config
     * @description Sets new axes config and redraws all axes.
     */
    setAxes(this: Yagr<T>, axes: YagrConfig['axes']) {
        const {x, ...rest} = axes;

        if (x) {
            const xAxis = this.uplot.axes.find(({scale}) => scale === DEFAULT_X_SCALE);

            if (xAxis) {
                updateAxis(this, xAxis, {scale: DEFAULT_X_SCALE, ...x});
            }
        }

        Object.entries(rest).forEach(([scaleName, scaleConfig]) => {
            const axis = this.uplot.axes.find(({scale}) => scale === scaleName);

            if (axis) {
                updateAxis(this, axis, {scale: scaleName, ...scaleConfig});
            }
        });

        this.redraw(...getRedrawOptionsForAxesUpdate(axes));
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
        this.wrapBatch(() => {
            return this._setSeries(timelineOrSeriesOrId, maybeSeries, options);
        });
    }

    /**
     * @public
     * @param lineId string | null
     * @param focus boolean
     * @description Sets focus on line with given id. If id is null, removes focus from all lines.
     * @returns void
     */
    setFocus(this: Yagr<T>, lineId: string | null, focus: boolean) {
        this.wrapBatch(() => () => {
            const seriesIdx = lineId === null ? null : this.state.y2uIdx[lineId];
            this.plugins.cursor?.focus(seriesIdx, focus);
            this.uplot.setSeries(seriesIdx, {focus});
        });
    }

    /**
     * @public
     * @param lineId string | null
     * @param show boolean
     * @description Sets visibility of line with given id. If id is null, sets visibility of all lines.
     */
    setVisible(this: Yagr<T>, lineId: string | null, show: boolean) {
        const seriesIdx = lineId === null ? null : this.state.y2uIdx[lineId];
        const fns: Function[] = [];

        if (seriesIdx === null) {
            fns.push(() => {
                /**
                 * @TODO Fix after bug in uPlot will be fixed
                 * @see https://github.com/leeoniya/uPlot/issues/680
                 */
                this.uplot.series.forEach((_, i) => {
                    i && this.uplot.setSeries(i, {show});
                });
            });
        } else {
            fns.push(() => {
                this.uplot.setSeries(seriesIdx, {
                    show,
                });
            });
        }

        this.options.series = this.uplot.series;

        let shouldRebuildStacks = false;

        if (seriesIdx) {
            const series = this.uplot.series[seriesIdx];
            const scaleName = series.scale || DEFAULT_Y_SCALE;
            const scale = this.config.scales[scaleName];
            shouldRebuildStacks = Boolean(scale && scale.stacking);
        } else {
            shouldRebuildStacks = this.options.series.reduce((acc, {scale}) => {
                return Boolean((scale && this.config.scales[scale]?.stacking) || acc);
            }, false as boolean);
        }

        return this.wrapBatch(() => [fns, shouldRebuildStacks]);
    }

    /**
     * @public
     * @param scales Record<string, Partial<ScaleConfi>>
     * @description Sets new scales config and redraws.
     */
    setScales(this: Yagr<T>, scales: Record<string, Partial<YagrConfig['scales'][string]>>) {
        this.config.scales = scales;

        const hasChangedStacking = Object.entries(scales).some(([scaleName, scaleConfig]) => {
            const scale = this.config.scales[scaleName];

            if (scale) {
                const {stacking} = scale;
                const {stacking: newStacking} = scaleConfig;

                if (stacking !== newStacking) {
                    return true;
                }
            }

            return false;
        });

        const isChangingOnlyMinMax = Object.values(scales).every((scaleConfig) =>
            containsOnly(scaleConfig, ['min', 'max']),
        );

        const isChanginXAxis = Object.keys(scales).includes(DEFAULT_X_SCALE);

        const fns: Function[] = [];

        /**
         * In case if we change only min/max on data-scales, then we can just use uplot.setScale,
         * otherwise we need to rebuild all series and stacks in order to apply new scales;
         */
        if (isChangingOnlyMinMax && !isChanginXAxis) {
            Object.entries(scales).forEach(([scaleName, scaleConfig]) => {
                fns.push(() => {
                    this.uplot.setScale(scaleName, {
                        min: scaleConfig.min!,
                        max: scaleConfig.max!,
                    });
                });
            });

            return this.wrapBatch(() => {
                return [fns, hasChangedStacking];
            });
        }

        this.updateFully(() => {
            this.config.scales = scales;
        });
    }

    /**
     * @public
     * @param fn function
     * @description Applies changes in yagr and in uplot batch session
     */
    batch(this: Yagr<T>, fn: () => void) {
        this.state.inBatch = true;
        fn();
        this.uplot.batch(() => {
            this._batch.fns.forEach((f) => f());
            if (this._batch.recalc) {
                this.series = this.transformSeries();
                this.uplot.setData(this.series, true);
            }
        });
        this._batch = {fns: [], recalc: false};
        this.state.inBatch = false;
    }

    protected wrapBatch(
        this: Yagr<T>,
        batchFn: (() => [Function | Function[], boolean] | undefined) | (() => Function | undefined),
    ) {
        const res = batchFn();
        if (!res) {
            return;
        }
        const [fnsOrFn, shouldRecalc] = Array.isArray(res) ? res : [res, false];
        const fns = Array.isArray(fnsOrFn) ? fnsOrFn : [fnsOrFn];

        if (this.state.inBatch) {
            this._batch.fns.push(...fns);
            this._batch.recalc = shouldRecalc;
        } else {
            this.uplot.batch(() => {
                fns.forEach((fn) => fn());
                if (shouldRecalc) {
                    this.series = this.transformSeries();
                    this.uplot.setData(this.series, true);
                }
            });
        }
    }

    protected _setSeries(
        this: Yagr<T>,
        timelineOrSeriesOrId: Partial<RawSerieData>[] | number[] | number | string,
        maybeSeries?: Partial<RawSerieData>[] | Partial<RawSerieData>,
        options: UpdateOptions = {
            incremental: true,
            splice: false,
        },
    ): [Function[], boolean] | undefined {
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

        const updateFns: (() => void)[] = [];

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
                        shouldRecalcData = true;
                    }

                    const newSeries = configureSeries(this, Object.assign(matched, rest), seriesIdx);
                    const opts = this.options.series[seriesIdx];
                    const uOpts = this.uplot.series[seriesIdx];

                    if (uOpts.show !== newSeries.show) {
                        updateFns.push(() => {
                            this.uplot.setSeries(seriesIdx, {show: newSeries.show});
                        });
                    }

                    if (uOpts._focus === null ? true : uOpts._focus !== newSeries.focus) {
                        updateFns.push(() => {
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
                    updateFns.push(() => {
                        const newSeries = configureSeries(this, serie, this.config.series.length);
                        this.state.y2uIdx[newSeries.id] = this.uplot.series.length;
                        this.uplot.addSeries(newSeries, this.config.series.length);
                    });
                    this.config.series.push(serie);
                }
            });

            if (shouldUpdateCursror) {
                updateFns.push(() => {
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
            this.updateFully(() => {
                this.config.series = series;
                this.config.timeline = timeline;
            });
            return;
        }

        if (timeline.length) {
            const newData = this.transformSeries();

            updateFns.push(() => {
                this.uplot.setData(newData);
            });
        }

        return [updateFns, shouldRecalcData];
    }

    protected updateFully(this: Yagr<T>, changeConfigFn: () => void) {
        this.inStage('config', () => {
            changeConfigFn();
            const uplotOptions = this.createUplotOptions();
            this._cache = {height: uplotOptions.height, width: uplotOptions.width};
            this.options = this.config.editUplotOptions ? this.config.editUplotOptions(uplotOptions) : uplotOptions;
        })
            .inStage('processing', () => {
                const newSeries = this.transformSeries();
                this.series = newSeries;
                this.dispose();
            })
            .inStage('uplot', () => {
                this.uplot = new uPlot(this.options, this.series, this.initRender);
                this.init();
            })
            .inStage('listen');
    }
}
