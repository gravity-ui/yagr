## Plot Lines

```js
const y1 = new Yagr(chart1, {
    title: {text: 'Vertical lines'},
    timeline: [1, 2, 3, 4, 5],
    series: [{data: [1, 2, 3, 2, 2], color: 'red'}],
    scales: {y: {min: 0, max: 6}},
    axes: {
        x: {
            plotLines: [
                {
                    value: 2.3,
                    width: 4,
                    color: 'rgba(20, 20, 244, 0.5)',
                },
                {
                    value: 4.5,
                    width: 4,
                    color: 'rgba(20, 20, 244, 0.5)',
                },
            ],
        },
    },
    settings: {adaptive: true},
});

const y2 = new Yagr(chart2, {
    title: {text: 'Horizontal lines'},
    timeline: [1, 2, 3, 4, 5],
    series: [{data: [1, 2, 3, 3, 2], color: 'red'}],
    scales: {y: {min: 0, max: 6}},
    axes: {
        y: {
            plotLines: [
                {
                    value: 2.4,
                    width: 4,
                    color: 'rgba(130, 20, 244, 0.9)',
                },
                {
                    value: 0.3,
                    width: 4,
                    color: 'rgba(130, 20, 244, 0.0)',
                },
            ],
        },
    },
    settings: {adaptive: true},
});

const y3 = new Yagr(chart3, {
    title: {text: 'Vertical bands'},
    timeline: [1, 2, 3, 4, 5],
    series: [{data: [1, 2, 3, 2, 2], color: 'red'}],
    scales: {y: {min: 0, max: 6}},
    axes: {
        x: {
            plotLines: [
                {
                    value: [2, 3],
                    color: 'rgba(20, 20, 244, 0.3)',
                },
                {
                    value: [4, 5],
                    color: 'rgba(20, 20, 244, 0.3)',
                },
            ],
        },
    },
    settings: {adaptive: true},
});

const y4 = new Yagr(chart4, {
    title: {text: 'Horizontal bands'},
    timeline: [1, 2, 3, 4, 5],
    series: [{data: [1, 2, 3, 3, 2], color: 'red'}],
    scales: {y: {min: 0, max: 6}},
    axes: {
        y: {
            plotLines: [
                {
                    value: [2, 3],
                    color: 'rgba(130, 20, 244, 0.3)',
                },
                {
                    value: [0, 1],
                    color: 'rgba(130, 20, 244, 0.3)',
                },
            ],
        },
    },
    settings: {adaptive: true},
});
```

<iframe src="../../../demo/examples/plotlines.html" width="100%" height="1000px" style="border: none;">
