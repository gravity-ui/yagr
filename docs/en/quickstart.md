# Quick start

## Install

```
npm install @gravity-ui/yagr
```

## Integration

Yagr automatically exposes the ES2019 ESM build to `import` and the CommonJS
build to `require`. Use the package's public entry points:

-   `@gravity-ui/yagr`
-   `@gravity-ui/yagr/react`
-   `@gravity-ui/yagr/index.css`

## Run

Let's see the config for a minimum valid chart:

```ts
import Yagr from '@gravity-ui/yagr';

// don't forget to import styles
import '@gravity-ui/yagr/index.css';


const config = {
    timeline: [0, 1000, 2000],
    series: [
        {data: [1, 2, 3], color: 'red'},
        {data: [2, 4, 1], color: 'green'},
    ],
};

const y = new Yagr(document.body, config);
```

Yagr will render а simple line chart with two lines:

![Sample chart](../assets/1.png =600x100%)

By default, Yagr turns on plugins like tooltip and axis formating, and you can see how they behave by default in the plugins section. See [documentation](./api/visualization.md) for configuration.

To understand Yagr, you should know about some restrictions on implementation:

-   All series should be aligned on a single timeline. This restriction can cause some alignment artifacts when you have data sources with mismatching timestamps. See [data alignment section](./api/data-processing.md#data-alignment) to understand what to do when that happens.
-   Either define the chart size in config or use `settings.adaptive: true` and define the size of the chart's root HTML element using CSS.
