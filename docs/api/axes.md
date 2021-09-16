## Axes

Axes is key-value object, where keys are axis names (one-to-one with scales) and values axes configs. Axis config has type `AxisOptions` which extends uPlot `Axis`. See [axes config in uPlot](https://github.com/leeoniya/uPlot/blob/c58561b91bb47e74f00ce43760c3edf988557e2e/dist/uPlot.d.ts#L904).

Example:

```js
axes: {
    y: {
        precision: 3,
    }
}
```

## Configuration

Axis configuration pass to uPlot `axes`.

### Precision

`axes.precision` - setups axis labels precision.

-   `number` - decimals count
-   `'auto'` - calculates automaticaly minimal correct precision

### PlotLines

`axes.plotlines: PlotLineConfig[];`

See [Plot Lines plugin](../plugins/plot-lines.md#plot-lines).

### Position

`axes.side: 'top' | 'right' | 'bottom' | 'left'` - position of axis. `'left'` by default.
