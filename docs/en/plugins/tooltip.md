## Tooltip

Yagr has a default legend tooltip. It has a simple renderer built in, though you can also easily implement your own.
Most tooltip options are the `PerScale` type, which means that they could be `value` or `{scale: value}`. You can see an example of a multi-scale tooltip in this picture:

![Tooltip exanple](../../assets/tooltip-scales.png =600x100%)

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

-   `tooltip.show: boolean` - enable tooltip
-   `tooltip.maxLines: PerScale<number> = 10;` - maximum number of lines per scale in the tooltip
-   `tooltip.sum: PerScale<boolean> = false` - show the `Sum` row in the tooltip
-   `tooltip.sort?: PerScale<SortFn>` - row comparator
-   ~~`tooltip.pinable: boolean` - is tooltip pinable~~ (DEPRECATED)
-   `tooltip.strategy: 'pin' | 'all' | 'none'` - tooltip strategy. `pin` - pin tooltip on click, `all` - pin both on click and drag, `none` - don't pin
-   `hideNoData?: PerScale<boolean>` - hide rows if the Y value is equal to `null`
-   `tooltip.precision?: PerScale<number>` - decimals count in numbers when formatting in the tooltip
-   `tooltip.value: PerScale<ValueFormatter>`- formatter for line values
-   `tooltip.onUpdate: 'none' | 'reset'` - how to update tooltip when data is updated. `none` - do nothing, `reset` - reset tooltip state

```ts
type ValueFormatter = (value: string | number | null, precision?: number) => string;
```

```ts
type SortFn = ((s1: TooltipRow, s2: TooltipRow) => number) | undefined;
```

### Tracking

-   `tooltip.highlight: PerScale<boolean>` - highlight the **active** line in the tooltip
-   `tooltip.tracking`- tracking is a function that calculates the **active** line index Next available options:

1. `'sticky'` - find the closest line index
2. `'area'` - find the index overlapping the cursor area
3. `(y: number, ranges: (number | null | string)[]) => number | null` - a custom function that gives the cursor Y value and a list of Y line values Return the active line index or null

### Render

-   `tooltip.render: (data: TooltipRenderOptions) => string` - tooltip renderer See [TooltipRenderOptions](#custom-renderer)
-   `tooltip.showIndicies: PerScale<boolean>` - show indices in tooltip rows
-   `tooltip.percent?: PerScale<boolean>` - **Not implemented** show percentages in tooltip rows
-   `tooltip.boundClassName?: string` - an CSS selector that finds the element in which the tooltip will be displayed (used only for calculations of offsets, not DOM rendering)
-   `tooltip.renderClassName?: string` - an CSS selector that finds the element in which the tooltip will be rendered (used only for rendering, not for offset calculations)

### Events

Tooltip instance is an EventEmitter, which supports the following events:

-   `init` - tooltip was initialized
-   `mount` - tooltip was mounted into DOM
-   `show` - tooltip is shown
-   `hide` - tooltip is hidden
-   `pin` - tooltip is pinned
-   `unpin` - tooltip is unpinned
-   `render` - tooltip is rendered
-   `destroy` - tooltip is destroyed

Example:

```ts
const yagr = new Yagr(...);

yagr.plugins.tooltip.on('show', () => console.log('Tooltip is shown'));
```

#### Custom renderer

You can replace the native tooltip renderer with a renderer of your own that accepts the `TooltipRenderOptions` type.

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

interface TooltipSection {
    rows: TooltipRow[];
}

interface TooltipRenderOptions {
    scales: TooltipScale[];
    options: TooltipOptions;
    x: number;
    pinned: boolean;
    yagr: Yagr;
}
```

## Using external non string-to-HTML rendering system (React, Vue, etc)

Tooltip supports virtualization which means that "tooltip' backend" still will work, but tooltip won't render any DOM-elements. This approach allows to use any rendering system you want, just by subscribing to tooltip events. You can find an example of this approach applied to React in the [React Tooltip example](https://github.com/gravity-ui/yagr/blob/main/demo/examples/react/react-tooltip.html).

Use `tooltip.virtual: true` to enable virtualization.

```js
tooltip: {
    virtual: true,
}
```
