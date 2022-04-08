## Data Refs

Data refs plugin calculates references points per scales (`avg`, `min`, `max`, `sum`, `count`). Calculations will made after `ready` hook will be fired.

### Usage

```js
import DataRefsPlugin from 'yagr/dist/YagrCore/plugins/datarefs/datarefs';

const yagr = new Yagr(document.body, {
    timline: [1, 2, 3],
    series: [{data: [1, 2, 3]}],
    plugins: {
        dataRefs: DataRefsPlugin,
    },
});

// when ready hook will be fired

y.plugins.dataRefs.getRefs(); // y: {avg: 2, count: 3, max: 3, min: 1, sum: 6}
```
