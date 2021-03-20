# Yagr

Yagr is high performance HTML5 canvas chart renderer for timeseries data based on [uPlot](https://github.com/leeoniya/uPlot). It provides high-level features for uPlot charts. 

## Features

 - Lines, Areas, Columns, Dots as visualization type
 - Configurable Legend Tooltip 
 - Different Scaling
 - Plot lines and bands
 - Configurable Tooltip
 - Responsive charts (requires [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver))
 - High support of stacked areas/columns
 - Light/Dark theme
 - Data normalization
 - Configurable crosshairs, cursor markers and snapping
 - Typescript
 - Localization
 - Support of missing data
 - CSS Variables as color names
 - Paginated inline legend
 - Error handling and extended hooks

## Usage 

Let's ee a minimal chart's config:

```ts
import Yagr from 'yagr';

const config = {
    timeline: [0, 1000, 2000],
    data: [
        {name: 'First', data: [1, 2, 3], color: 'red'},
        {name: 'Second', data: [2, 4, 1], color: 'green'}
    ],
};

const y = new Yagr(document.body, config);
```

# Examples
