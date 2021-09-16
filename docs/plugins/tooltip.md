## Tooltip

Yagr has default legend tooltip. By default it has pretty simple renderer, but you can easy implement your own renderer.
Most of tooltip options are typeof `PerScale`, which means that it could be `value` or `{scale: value}`. You can see example of multi-scale tooltip on picture:

![Tooltip exanple](../assets/tooltip-scales.png =600x100%)

Configuration for this example:

```js
{
    timeline: [1, 2, 3],
    series: [
        {
            data: [1, 2, 3],
            color: 'red',
        },
        {
            data: [2, 3, 1],
            scale: 'percent',
            color: 'green',
        },
    ],
    tooltip: {
        scales: {
            y: 'Left',
            percent: 'Percent',
        },
    },
    axes: {
        y: {},
        percent: {
            side: 'right',
            values: (u, x) => x.map(i => i + '%'),
        },
    },
    scales: {
        y: {},
        percent: {},
    },
};
```

## Configuration

### General

-   `tooltip.enabled: boolean` - enable tooltip
-   `tooltip.maxLines: PerScale<number> = 10;` - maximum count of lines per scale in tooltip
-   `tooltip.sum: PerScale<boolean> = false` - should show `Sum` row in tooltip
-   `tooltip.sort?: PerScale<SortFn>` - rows comparator function.
-   `tooltip.pinable: boolean` - is tooltip pinable.
-   `hideNoData?: PerScale<boolean>` - should hide rows if Y value is equal to `null`
-   `tooltip.precision?: PerScale<number>` - decimals count in numbers when formatting in tooltip.

-   `tooltip.value: PerScale<ValueFormatter>`- formatter for line values.

```ts
type ValueFormatter = (value: string | number | null, precision?: number) => string;
```

```ts
type SortFn = ((s1: TooltipRow, s2: TooltipRow) => number) | undefined;
```

### Tracking

-   `tooltip.highlight: PerScale<boolean>` - should highlight **active** line in tooltip.
-   `tooltip.tracking`- tracking is a function which calculates **active** line index. Available next options:

1.  `'sticky'` - finds closest line index
2.  `'area'` - finds overlaped by cursor area's index
3.  `(y: number, ranges: (number | null | string)[]) => number | null` - custom function which gives cursor Y value and list of Y values of lines. Should return active line index or null

### Render

-   `tooltip.render: (data: TooltipRenderOptions) => string` - tooltip renderer. See [TooltipRenderOptions](#custom-renderer)

-   `tooltip.showIndicies: PerScale<boolean>` - should show indicies in tooltip rows.

-   `tooltip.percent?: PerScale<boolean>` - **Not implemented** Should show percents in tooltip rows

-   `tooltip.boundClassName?: string` - CSS selector to find element in which tooltip will be rendered (visualy, not in DOM)

#### Custom renderer

You can replace native tooltip render with your own renderer wich accepts `TooltipRenderOptions` type.

```ts
type TooltipRow = {
    /** Name of DataLine, gets from series.name */
    name?: string;
    /** Current Y value of DataLine */
    value: string | number | null;
    /** Color of DataLine */
    color: string;
    /** Is cursor over DataLine */
    active?: boolean;
    /** Custom className */
    className?: string;
    /** Y Axis value */
    y?: number | null;
    /** Index of series in u.series */
    seriesIdx: number;
    /** Original value before all transormations */
    originalValue?: number | null;
    /** Transformed value  */
    transformed?: number | null | string;
};

interface TooltipScale {
    scale: string;
    rows: TooltipRow[];
    sum?: number;
}
interface TooltipRenderOptions {
    scales: TooltipScale[];
    options: TooltipOptions;
    x: number;
    pinned: boolean;
    yagr: Yagr;
}
```
