## Multiscales

```js
const y1 = new Yagr(chart1, {
    title: {text: 'Two scales'},
    timeline: [1, 2, 3],
    series: [
        {data: [1, 2, 3], color: 'red'},

        {data: [2, 1, 2], color: 'green', scale: 'r', type: 'area'},
        {data: [1, 2, 3], color: 'lime', scale: 'r', type: 'area'},
    ],
    axes: {
        y: {values: (u, v) => v.map((x) => x + ' Mb')},
        r: {side: 'right', label: 'Stacked'},
    },
    scales: {
        y: {min: 0, max: 5},
        r: {stacking: true, max: 5},
    },
    tooltip: {
        scales: {
            y: 'Mb',
            r: 'Stacked',
        },
        sum: {
            y: false,
            r: true,
        },
        tracking: {
            y: 'closest',
            r: 'area',
        },
    },
    settings: {adaptive: true},
});
```

<iframe src="../../../demo/examples/multiscales.html" width="100%" height="450px" style="border: none;">
