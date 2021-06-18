# Ẏagr [![build status](https://teamcity.yandex-team.ru/app/rest/builds/buildType:DataUI_Yagr_BuildAndPublish/statusIcon.svg)](https://teamcity.yandex-team.ru/buildConfiguration/DataUI_Yagr_BuildAndPublish)

Yagr is high performance HTML5 canvas chart renderer for timeseries data based on [uPlot](https://github.com/leeoniya/uPlot). It provides high-level features for uPlot charts. 

## Features

 - Lines, Areas, Columns, Dots as visualization type. Configurable per series.
 - Configurable Legend Tooltip
 - Different scaling, axes with extra options for decimals precision
 - Plot lines and bands. Configurable draw layer.
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

Let's see a minimal chart's config:

```ts
import Yagr from 'yagr';

const config = {
    timeline: [0, 1000, 2000],
    graphs: [
        {data: [1, 2, 3], color: 'red'},
        {data: [2, 4, 1], color: 'green'}
    ],
};

const y = new Yagr(document.getElementById('chart'), config);
```

This code produces simple line chart:

<img src="./imgs/1.png" width="600">

# Feature examples 

## Visualization types 

There are 4 types supported in Yagr: 
 - Line 
 - Area
 - Columns
 - Dots

You can choose whole chart type by:

```js
config.chart.type = 'area';
```

or setup each series: 

```js
config.data[0].type = 'line'
config.data[1].type = 'area'
```
