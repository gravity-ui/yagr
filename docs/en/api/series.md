## Series

Series type extends [uPlot series](https://github.com/leeoniya/uplot/blob/f099796c4e7b659cfd22c668bbb919aa3cbd84c8/dist/uplot.d.ts#l777) with extra features:

## Configuration

### Data

-   `series.data: (number | string | null)[]` - series data.

-   `series.transform?: (val: number | null | string, series: DataSeries[], idx: number) => number | null` - series data transformation method.

### Name & ID

-   `series.name?: string` - name of serie. Renders in tooltip and inline legend. If not passed then will be generated `Series <series index>` name.

-   `series.id?: string` - series ID, if not passed generates automatically.

### Appearence

-   `series.color?: string` - single property to avoid uPlot's fill/stroke for different serie types. For lines and points color means the stroke color, for areas and columns means fill color. If not passed sets to black.

-   `series.width?: number` - width of line (line type charts).

-   `series.lineColor? string` - color of line (area type charts).

-   `series.lineWidth?: number` - line's width over area (area type charts)

-   `series.visible?: boolean;` - series visibility.

### Scale

-   `series.scale?: string` - scale of series

### Visualization

-   `series.type?: ChartType` - series visualisation type.
-   `series.spanGaps?: boolean` - should join paths over null-points
-   `series.interpolation?: InterpolationSetting` - series line interpolation type.
-   `series.cursorOptions?: CursorOptions` - cursor options for series.

### References points

`series.refPoints?: RefPoints` - calculated references points for Yagr plot. If not provided, Yagr calculates them by itself. Useful in cases when you preload ad process data on server-side and can easily precalculate reference points for Yagr and therefore a little bit optimize Yagr.

### Tooltip

-   `series.formatter?: (value: string | number | null, serie: Series) => string` - formatter for series' points values (formatting in tooltip).
-   `series.showInTooltip?: boolean` - should show series in tooltip, added to implement more flexible patterns of lines hiding.

-   `series.precision?: number` - series's precision in tooltip. Uses to override axes precision.

### Cursor snapToValues override

`snapToValues?: SnapToValue | false` - snap dataIdx value (default: `closest`). Use to override `cursor.snapToValues`.

### Stacking group

`series.stackGroup?: number` - stack group of series. Used to combient series to different stacks. Keep in mind that stacks are just a sum of all real values and if there are artifacts of data alignment on a given X-point on some lines then stacks will be calculated wrong. To avoid it there is a special data interpolation options in Yagr (see [data alignment](#data-alignment) for more information). `null` values in stacks will be interpreted as zeros.
