# Yagr

Yagr is high performance HTML5 canvas chart renderer for timeseries data based on [uPlot](https://github.com/leeoniya/uPlot). 

## Features

 - Lines, Areas, Columns, Dots as visualization type
 - Configurable Legend Tooltip 
 - Different Scaling
 - Plot lines and bands
 - Configurable Tooltip
 - Responsive charts
 - High support of stacked areas/columns
 - Light/Dark theme
 - Data normalization
 - Configurable crosshairs, cursor markers and snapping
 - Typescript
 - Localization
 - Support of missing data

## Usage 

```ts
import Yagr from 'yagr';

const config = {
    timeline: [0, 100, 200],
    data: [
        {name: 'First', data: [1, 2, 3], color: 'red'},
        {name: 'Second', data: [2, 4, 1], color: 'green'}
    ],
    axes: [
        {
            scale: 'x',
            values: (_, i) => i,
        }
    ]
};

const y = new Yagr(document.body, config);
```
