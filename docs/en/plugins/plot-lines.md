## Plot Lines

Plot Lines plugin allows to render custom lines on bands over the chart:

![Plot lines](../../assets/plotlines.png "Plot Lines" =600x100%)

Plotlines are binded to axes which are binded to scales, so to render plotline you should pass it's config to given axis:

```js
// Render vertical band on X axis from X=Now-1s to X=Now
axes: {
    x: {
        plotLines: [{
            value: [Date.now() - 1000, Date.now()],
            color: 'rgba(255, 0, 0, 0.5)',
        }],
    },
}
```

or

```js
// Render blue horizontal line in width 2px, on the Y=2
axes: {
    y: {
        plotLines: [{
            value: 2,
            color: 'blue',
            width: 2 * devicePixelRatio
        }],
    },
}
```

By default plotlines drawing over the series and axes, you can choose draw layer in [settings.drawOrder](../api/settings.md#drawOrder)

## Plot line config

```ts
export interface PlotLineConfig {
    /** Value of plotLine or [from, to] on given scale */
    value: number | [number, number];

    /** Color of line */
    color: string;

    /** Line width in px/devicePixelRatio */
    width?: number;
}
```
