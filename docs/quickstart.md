# Quick start

## Install

```
npm install yagr
```

## Integration

By default Yagr exposed ES2017 module for TypeScript but you can import different modules:

-   `yagr/dist/yagr.es5.js` - ES5 module
-   `yagr/dist/yagr.umd.js` - UMD module
-   `yagr/dist/yagr.iife.js` - IIFE module

## Run

Let's see a minimal valid chart's config:

```ts
import Yagr from 'yagr';

const config = {
    timeline: [0, 1000, 2000],
    series: [
        {data: [1, 2, 3], color: 'red'},
        {data: [2, 4, 1], color: 'green'},
    ],
};

const y = new Yagr(document.body, config);
```

Yagr will render simple line chart with two lines:

![Sample chart](./assets/1.png =600x100%)

By default Yagr turns on some plugins such as tooltip and axes formating, details of default behavior you can see in plugins section. See [documentation](./api/visualization.md) for configuration.

To undestand Yagr you should know about some restrictions of implementations:

-   all series should be aligned on single timeline. This restriction can cause some alignment artifacts when you have different data sources which timestamps doesn't match each other. See [data alignment section](./api/data-processing.md#data-alignment) to undestand how to handle such cases.
-   you should or define chart size in config, or use `settings.adaptive: true` and define size of chart's root HTML element by CSS.
