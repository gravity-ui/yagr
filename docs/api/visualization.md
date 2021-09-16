# Visualization types

Yagr support 4 timeseries vizualization types:

## Line

-   `'line'`

![Line](../assets/line.png =600x100%)

## Area

Areas are lines filled area under the line. If two areas overlaping with the lowest series index will be on background.

-   `'area'`

![Area](../assets/area.png =600x100%)

## Dots

-   `'dots'`

![Dots](../assets/dots.png =600x100%)

## Column

-   `'column'`

![Column](../assets/column.png =600x100%)

## Configuration

You can configure chart type for whole chart:

```js
chart: {
    type: 'line';
}
```

or per series

```js
chart: {
    type: 'line'
},
series: [
    {data: [2, 4, 1], color: 'green'},             // will render line (by default in chart.type)
    {data: [1, 2, 3], color: 'red', type: 'area'}, // will render area
]
```

Keep in mind that Yagr draws first series from the last one to the first, so if you render non-transparent area at first, it can overlap other series. Be careful.
