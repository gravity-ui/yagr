## Shared crosshairs

### With single tooltip

```js
const showTooltip = (y) => y.state.isMouseOver;

const y1 = new Yagr(chart1, {
    title: {text: 'Example 1'},
    timeline: [1, 2, 3],
    series: [{data: [1, 2, 3], color: 'red'}],
    cursor: {sync: 'a'},
    tooltip: {show: showTooltip},
    settings: {adaptive: true},
});

const y2 = new Yagr(chart2, {
    title: {text: 'Example 2'},
    timeline: [1, 2, 3],
    series: [{data: [3, 2, 1], color: 'green'}],
    cursor: {sync: 'a'},
    tooltip: {show: showTooltip},
    settings: {adaptive: true},
});

y1.subscribe();
y2.subscribe();
```

### Synced tooltips

```js
const y3 = new Yagr(chart3, {
    title: {text: 'Example 3'},
    timeline: [1, 2, 3],
    series: [{data: [1, 2, 3], color: 'red'}],
    cursor: {sync: 'b'},
    settings: {adaptive: true},
});

const y4 = new Yagr(chart4, {
    title: {text: 'Example 4'},
    timeline: [1, 2, 3],
    series: [{data: [3, 2, 1], color: 'green'}],
    cursor: {sync: 'b'},
    settings: {adaptive: true},
});

y4.subscribe();
y3.subscribe();
```

<iframe src="../../../demo/examples/shared-crosshairs.html" width="100%" height="1000px" style="border: none;">
