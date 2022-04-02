## Axes

Axes is a key-value object where keys are axis names (one-to-one with scales) and values are axis configs. Axis config has type `AxisOptions`, which extends uPlot `Axis`. See [axes config in uPlot](https://github.com/leeoniya/uPlot/blob/c58561b91bb47e74f00ce43760c3edf988557e2e/dist/uPlot.d.ts#L904).

Example:

```js
axes: {
    y: {
        precision: 3,
    }
}
```

## Configuration

Most options are described in uPlot axes config. See [axes config in uPlot](https://github.com/leeoniya/uPlot/blob/c58561b91bb47e74f00ce43760c3edf988557e2e/dist/uPlot.d.ts#L904).

### Precision

`axis.precision` - sets up axis label precision

-   `number` - decimal digits count
-   `'auto'` - automatically calculates minimum correct precision

### PlotLines

`axis.plotlines: PlotLineConfig[];`

See [Plot Lines plugin](../plugins/plot-lines.md#plot-lines).

### Position

`axis.side: 'top' | 'right' | 'bottom' | 'left'` - position of axis, `'left'` by default

### Splits and ticks

`axis.splitsCount: number` - count of splits on axis.
