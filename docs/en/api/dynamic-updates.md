## Dynamic updates of chart

Dynamic updates work in different manner depending on what actually do you change. Some updates may require full uPlot re-instantiation, other may not require even redraw of chart (for example, setting focus of series). This section describes how to update chart in different ways and understand update flow and cost.

### Update flow

Update (as well as initial Yagr instantiation) has 5 different optional stages:

-   create uPlot options
-   calculate and transform data
-   apply updates to plugins
-   redraw uPlot
-   drop uPlot instance and create new one

Each update has it's own flow and cost. For example, changing theme of chart requires only to redraw uPlot, but changing scale type from `linear` to `logarithmic` requires to drop uPlot instance and create new one, as uPlot doesn't support scale type change.

### Methods

#### setLocale

```ts
yagr.setLocale('en');
// or
yagr.setLocale({
    'hide-all': 'Թաքցնել բոլորը',
    'show-all': 'Ցույց տալ բոլորը',
});
```

Cost: **low**. Only redraws chart's locale-dependent elements (such as legend, tooltips etc), without any data recalculation.

#### setTheme

```ts
yagr.setTheme('dark');
```

Cost: **low**. Just call `uPlot.redraw` to redraw chart with new theme.

#### setVisible

```ts
yagr.setVisible('series-id', false);
// or hide all
yagr.setVisible(null, false);
```

Cost for non-stacked chart: **low**. Just call `uPlot.setVisible` to hide/show series.
Cost for stacked chart: **middle**. Requires to recalculate data before uPlot can redraw chart.

#### setFocus

```ts
yagr.setFocus('series-id', true);
// or un-focus all
yagr.setFocus(null, false);
```

Cost: **low**. Just call `uPlot.setSeries` to focus/un-focus series.

#### setAxes

```ts
yagr.setAxes({
    y: {
        precision: 2,
    },
});
```

Cost: **low**. Just re-assigning axes configs and call `uPlot.redraw` to re-render axes (and optionally series if required).

#### setScales

```ts
yagr.setScales({
    y: {
        min: 0,
        max: 100,
    },
});
```

Cost for simple updates: **low**. Require only to re-assign scales config and call `uPlot.redraw` to re-render axes (and optionally series if required).
Cost for stacking/normalization change: **middle**. Requires to recalculate data before uPlot can redraw chart.
Cost for scale type change: **high**. Requires to drop uPlot instance and create new one, as well as recalculate data.

#### setSeries

#### change series by id/index

```ts
// by id
yagr.setSeries('series-id', {
    color: 'green',
});

// by uPlot index
yagr.setSeries(0, {
    color: 'green',
});
```

Cost for appearance changes: **low**. Just re-assign series config and call `uPlot.redraw` to re-render series.
Cost for data changes (no stacking): **low**. Requires to set new data with uPlot
Cost for data changes (stacking): **middle**. Requires to recalculate data before uPlot can redraw chart.

#### change all series without changing timeline

```ts
yagr.setSeries([
    {
        id: 'series-id',
        color: 'green',
    },
]);
```

Cost for simple update (no new lines/ no deleted lines): **middle**. Yagr should re-init and re-calc all series and use `uPlot.setData` to update data.
Cost new lines/removed lines: **high**. Requires to drop uPlot instance and create new one, as well as recalculate data.

#### change all series with new timeline (incremental update or full update)

```ts
// incremental update
yagr.setSeries(
    [1, 2, 3],
    [
        {
            id: 'series-id',
            data: [1, 2, 3],
        },
    ],
    {
        incremental: true,
        splice: true,
    },
);

// full update
yagr.setSeries(
    [1, 2, 3],
    [
        {
            id: 'series-id',
            data: [1, 2, 3],
        },
    ],
    {
        incremental: false,
    },
);
```

Cost for simple updates (adding data to existing lines without stacking or normalization): **low**. Yagr should re-init series and use `uPlot.setData` to update data.
Cost for simple updates (adding data to existing lines with stacking or normalization): **middle**. Requires to recalculate data before uPlot can redraw chart.
Cost for complex updates (new lines / removing lines): **high**. Requires to drop uPlot instance and create new one, as well as recalculate data.

### Set config (currently is experimental feature)

Accepts patch which will be applied to current config. .setConfig is a combo-method which will call all required methods to update chart in single batch request. It's experimental feature and may be changed in future, also, may not support some complex patches, like legend config update, according to new series options, but in most of cases it works fine.

```ts
yagr.setConfig({
    series: [
        {
            id: 'series-id',
            color: 'green',
        },
    ],
    axes: {
        y: {
            precision: 2,
        },
    },
});
```

Cost: the highest cost of all called methods inside of batch

### Batch updates

`yagr.batch` allows to run multiple yagr updates with single redraw and data recalculation

```js
yagr.batch(() => {
    yagr.setTheme('dark');
    yagr.setSeries('1', {color: 'green'});
    yagr.setAxes({y: {splitsCount: 5}});
});
```

Batch methods accepts the function. You can manually set required update stage inside batch function:

```js
yagr.batch((s) => {
    // do some work
    s.reopt = true; // will re-init uPlot options
    s.recalc = true; // will recalculate series
    s.redraw = [true, true]; // will redraw chart (first arg - redraw axes, second - redraw series)
    s.reinit = true; // re-init uPlot chart fully
    s.redrawLegend = true; // will redraw legend
});
```

Keep in mind that one stages may have intersecting effects, for instance there's no need to set all batch options to `true` if you have se the `.reinit` option to `true`. Re-init of uPlot instance automatically implies that all other stages will be set to `true` as well.
