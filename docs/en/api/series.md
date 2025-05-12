## Series

Series type adds extra features to [uPlot series](https://github.com/leeoniya/uplot/blob/f099796c4e7b659cfd22c668bbb919aa3cbd84c8/dist/uplot.d.ts#l777):

## Configuration

### Data

- `series.data: (number | string | null)[]` - series data

- `series.transform?: (val: number | null | string, series: DataSeries[], idx: number) => number | null` - series data transformation method

- `series.postProcess?: (data: (number | null)[], idx: number, y: Yagr) => (number | null)[];` - series data post processing method (will be called if exists after all data transformations)

### Name and ID

- `series.name?: string` - series name Renders in the tooltip and inline legend. If not this is not passed, `Series <series index>` name will be generated.

- `series.id?: string` - series ID, generated automatically if not passed

### Appearance

- `series.color?: string` - single property to avoid uPlot's fill/stroke for different series types For lines and points, color refers to the stroke color, while it is the fill color for areas and columns. Sets to black if not passed.

- `series.width?: number` - line width (line type charts)

- `series.lineColor?: string` - line color (area type charts)

- `series.legendColorKey?: 'color' | 'lineColor'` - determines which color field to use for serie in legend and tooltip

- `series.lineWidth?: number` - line width over area (area type charts)

- `series.visible?: boolean;` - series visibility

### Scale

- `series.scale?: string` - series scale

### Visualization

- `series.type?: ChartType` - series visualization type
- `series.spanGaps?: boolean` - join paths over null-points
- `series.interpolation?: InterpolationSetting` - series line interpolation type
- `series.cursorOptions?: CursorOptions` - series cursor options

### Data references

- `series.max?: number` - comes from uPlot
- `series.min?: number` - comes from uPlot
- `series.avg?: number` - calculates before uPlot data will be set
- `series.sum?: number` - calculates before uPlot data will be set
- `series.count?: number` - calculates before uPlot data will be set

### Tooltip

- `series.formatter?: (value: string | number | null, serie: Series) => string` - formatter for series point values (formatting in tooltip)

- `series.showInTooltip?: boolean` - show series in tooltip, added to implement more flexible line hiding patterns

- `series.precision?: number` - series precision in tooltip Used to override axis precision.

### Legend

- `series.showInLegend?: boolean` - show series in legend, added to implement more flexible line hiding patterns

### Cursor snapToValues override

`series.snapToValues?: SnapToValue | false` - snap dataIdx value (default: `closest`) Used to override `cursor.snapToValues`.

### Stacking group

`series.stackGroup?: number` - stack series group Used to combine series in different stacks. Keep in mind that stacks are just the sum of all real values, and stacks will be calculated wrong if there are data alignment artifacts on a given X-point on some lines. To avoid that, there are special data interpolation options in Yagr (see [data alignment](./data-processing.md) for more information). `null` values in stacks will be interpreted as zeros.

### Interpolation

Interpolation of line curves. Don't confuse it with [data alignment interpolation](./data-processing.md#data-interpolation)
`series.interpolation?: InterpolationSetting`

```ts
type InterpolationType = 'linear' | 'left' | 'right' | 'smooth';
```

- `linear` - linear interpolation
  ![Interpolation linear](../../assets/interpolation-linear.png =600x100%)

- `left` - left interpolation (previous point value)
  ![Interpolation left](../../assets/interpolation-left.png =600x100%)

- `right` - right interpolation (next point value)
  ![Interpolation right](../../assets/interpolation-right.png =600x100%)

- `smooth` - smooth interpolation (Bezier curve interpolation)
  ![Interpolation smooth](../../assets/interpolation-smooth.png =600x100%)
