## Scales

Scales is a key-value object where keys are scale names and values are scale configs.

```js
scales: {
    y: {
        type: 'linear'
        min: 0,
    }
}
```

## Configuration

### Type

`scale.type`.

-   `'linear'` - linear scale
-   `'logarithmic'` - logarithmic scale (log<sub>10</sub>)

### Normalization

`scale.normalize: boolean`

If true, then normalize all series data in the scale to the given base (100% by default)

`scale.normalizeBase: number`

Normalization base

### Ranges

#### Minimum and maximum

-   `scale.min: number` - scale minimum
-   `scale.max: number` - scale maximum

#### Range

`scale.range:`

-   `'nice'` - NiceScale implementation with extra features to make charts look nice for stacked areas
-   `'offset'` - static offset from data min and max
-   `(u: uPlot, min: number, max: number, ref: RefPoints | undefined, cfg: YagrConfig) => [min: number, max: number]` - custom function

`scale.offset: number`

Offset value for `scale.range = 'offset'`.
`scale.minRange: number`

The minimum value of the scale range between min and max. Use to stabilize NiceScale with different scale bases.

### Max ticks

`scale.maxTicks: number`

Number of max ticks for `scale.range = 'nice'`.

### Stacking

`scale.stacking: boolean`

This stacks values on a given scale. False by default. To define different stacks see [stacking groups](./series.md#stacking-group) for more info.

### Transformations

`scale.transform`

```ts
transform?: (v: number | null, series: DataSeries[], idx: number) => number;
```

This function is used to transform all the values on a given scale.
