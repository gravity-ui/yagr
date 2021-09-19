# Data alignment

## Problem

Sometimes you have different data sources on different time grid. And when you point them on a single timeline there is data alignment artifacts appearing.

```
Source 1: [
    timestamps: [1, 20, 30],
    values:     [1, 1,  1],
]

Source 2: [
    timestamps: [0, 15, 30, 45],
    values:     [2, 2,  2,  2],
]
```

Produces:

```
{
    timeline: [0, 1, 15, 20, 30, 45],
    series: [{
        name: 'Source 1',
        data: [x, 1, x,  1,  1,  x]
    }, {
        name: 'Source 2',
        data: [2, x, 2,  x,  2,  2]
    }]
}
```

In this example we marked with `x` all artifacts. By default uPlot can handle such input if we replace `x` with undefined and set `spanGaps = true` in series options. But there are problems with stacked areas and columns.

## Solution

So Yagr has solution. If you have data alignment artifacts you can setup processing options:

```ts
timeline: [1, 2, 3],
series: [{
    name: 'Source',
    data: [1, 'x', 3],
}],
processing: {
    interpolation: {
        value: 'x',
        type: 'linear'
    }
}
```

Will produce chart where data `[1, 'x', 3]` will be rendered as `[1, 2, 3]` by linear interpolation type of initial value `'x'`.

-   `yagr.config.processing`

    for data transformations before options generation and rendering. If this section is empty, than Yagr just skips [processing stage](./lifecycle.md#lifecycle-stages)

### Null values

-   `nullValues: Record<string, string | null>`

Map of string values which Yagr will replace with `null` in resulting series but will show given string value (or null) in tooltip. For instance it's usefull to show Infinity values of asymptotic growth:

![Null values](../assets/null-values.png =600x100%)

Config:

```
module.exports = {
    "timeline": [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000],
    "series": [{
        "data": [1, 100, 1000, 10000, '+inf', 10000, 1000, 100, 1],
        "color": "red"
    }],
    processing: {
        nullValues: {
            '+inf': 'Infinity'
        }
    },
}
```

## Data Interpolation

Interpolation options define how to transform data alignment artifacts.

### Interpolation

-   `interpolation.value`- value in series `data` field which will been replaced with interpolated value.

-   `interpolation.type`- type of interpolation. Examples are given for dataset:

```js
['x', 2, 'x', 'x', 4, 'x'];
```

-   `linear` - use simple linear interpolation between two points.
    ![Linear](../assets/proc-linear.png "proc-linear" =600x100%)

-   `left` - takes previous point's value if given point is not last one
    ![Left](../assets/proc-left.png "proc-left" =600x100%)

-   `previous` - takes previous point's value
    ![Previous](../assets/proc-previous.png "proc-previous" =600x100%)

-   `right` - takes next point's value if given point is not first on
    ![Right](../assets/proc-right.png "proc-right" =600x100%)

-   `next` - takes next point's value
    ![Next](../assets/proc-next.png "proc-next" =600x100%)

-   `closest` - takes closest point's value
    ![Closest](../assets/proc-closest.png "proc-closest" =600x100%)

-   `<your value>` - replace value with yours
    ![Given value](../assets/proc-const.png "proc-const" =600x100%)
