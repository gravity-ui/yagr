# Visualization types

Yagr support 4 timeseries vizualization types:

## Line

-   `'line'`

![alt text](../assets/line.png "Line" =600x100%)

## Area

Areas are lines filled area under the line. If two areas overlaping with the lowest series index will be on background.

-   `'area'`

![alt text](../assets/area.png "area" =600x100%)

## Dots

-   `'dots'`

![alt text](../assets/dots.png "dots" =600x100%)

## Column

-   `'column'`

![alt text](../assets/column.png "column" =600x100%)

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
