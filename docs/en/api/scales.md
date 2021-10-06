## Scales

Scales is a key-value object, where keys are scale names and values scale configs.

```js
scales: {
    y: {
        type: 'linear',
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

If true, then normalize all scale's series data to given base (100% by default)

`scale.normalizeBase: number`

Base of normalization

### Ranges

#### Minimum and maximum

-   `scale.min: number` - ,inimum of scale
-   `scale.max: number` - maximum of scale

#### Range

`scale.range:`

-   `'nice'` - implementation of NiceScale with extra features to make charts nice for stacked areas
-   `'offset'` - static offset from data min and max
-   `(u: uPlot, min: number, max: number, ref: RefPoints | undefined, cfg: YagrConfig) => [min: number, max: number]` - custom function

`scale.offset: number`

Value of offset for `scale.range = 'offset'`.
`scale.minRange: number`

Minimal value of scale range between min and max. Use for stabilize nice-scale with different base of scales.

### Max ticks

`scale.maxTicks: number`

Count of max ticks for `scale.range = 'nice'`.

### Stacking

`scale.stacking: boolean`

Should stack values on given scale. False by default. See [stacking](./series.md#stacking-group) for more info.

### Transformations

`scale.transform`

```ts
transform?: (v: number | null, series: DataSeries[], idx: number) => number;
```

Funtion to transform all values on given scale.
