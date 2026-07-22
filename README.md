# Ẏagr <img src="https://raw.githubusercontent.com/gravity-ui/yagr/main/docs/assets/yagr.svg" width="24px" height="24px" />

Yagr is a high-performance HTML5 canvas chart renderer based on [uPlot](https://github.com/leeoniya/uPlot). It provides high-level features for uPlot charts.

<img src="https://raw.githubusercontent.com/gravity-ui/yagr/main/docs/assets/demo.png" width="800" />

## Features

-   [Lines, areas, columns, and dots as visualization types. Configurable per series](https://yagr.tech/en/api/visualization)
-   [Configurable Legend Tooltip](https://yagr.tech/en/plugins/tooltip)
-   [Axes with extra options for decimal-level precision](https://yagr.tech/en/api/axes)
-   [Scales with configurable range functions and transformations](https://yagr.tech/en/api/scales)
-   [Plot lines and bands. Configurable draw layer](https://yagr.tech/en/plugins/plot-lines)
-   [Responsive charts](https://yagr.tech/en/api/settings#adaptivity) (requires [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver))
-   [High-level support of stacked areas/columns](https://yagr.tech/en/api/scales#stacking)
-   [Configurable markers](./docs/api/markers.md)
-   [Light/Dark theme](https://yagr.tech/en/api/settings#theme)
-   [Data normalization](https://yagr.tech/en/api/scales#normalization)
-   [Configurable crosshairs, cursor markers and snapping](https://yagr.tech/en/api/cursor)
-   Typescript
-   [Localization](https://yagr.tech/en/api/settings#localization)
-   [CSS Variables in color names](https://yagr.tech/en/api/css)
-   [Paginated inline legend](https://yagr.tech/en/plugins/legend)
-   [Error handling and extended hooks](https://yagr.tech/en/api/lifecycle)
-   [Data alignment and interpolation for missing data](https://yagr.tech/en/api/data-processing)
-   [Realtime updates](https://yagr.tech/en/api/dynamic-updates)

## [Documentation](https://yagr.tech)

## Install

```shell
npm install @gravity-ui/yagr
```

## Quick Start

### NPM Module

```typescript
import Yagr from '@gravity-ui/yagr';

new Yagr(document.body, {
    timeline: [1, 2, 3, 4, 5],
    series: [
        {
            data: [1, 2, 3, 4, 5],
            color: 'red',
        },
        {
            data: [2, 3, 1, 4, 5],
            color: 'green',
        },
    ],
});
```

### Script Tag

```html
<script src="https://unpkg.com/@gravity-ui/yagr/dist/yagr.iife.min.js"></script>
<script>
    new Yagr(document.body, {
        timeline: [1, 2, 3, 4, 5],
        series: [
            {
                data: [1, 2, 3, 4, 5],
                color: 'red',
            },
            {
                data: [2, 3, 1, 4, 5],
                color: 'green',
            },
        ],
    });
</script>
```

### Examples

Need something specific? Yagr presents some useful examples in the [demo/examples](./demo/examples/) folder. How to start them with current version:

1. Clone the repository.
2. Install dependencies `npm i`.
3. Run `npm run build`.
4. Run `npx http-server .`.
5. Open examples in browser according to the http-server output.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

## For AI agents

A high-performance HTML5 canvas time-series renderer built on uPlot — reach for it to draw large line/area/column/dot datasets (thousands of points) where SVG/React chart libs are too slow, instead of a general-purpose charting toolkit.

### When to use

- Large time-series datasets (monitoring, metrics, realtime streams) that need canvas-level performance.
- Stacked areas/columns, normalization, per-series visualization types, plot lines/bands.
- Realtime updates and data interpolation for missing points.

### When not to use

- For bar/pie/scatter/radar and the full breadth of ECharts-style chart types, use [`@gravity-ui/charts`](https://gravity-ui.com/charts) — Yagr is focused on time-series and continuous-axis plots.
- For a legacy Highcharts-based integration, use [`@gravity-ui/chartkit`](https://github.com/gravity-ui/chartkit) — it wraps Highcharts; Yagr is the modern canvas alternative.
- For a tiny static line chart with a handful of points, an SVG lib or uPlot directly may be lighter.

### Common pitfalls

- **Hallucinated React component `<YagrChart>`** — the core export is the `Yagr` class (`new Yagr(container, config)`); there is no first-class React component in this package.
- **Mounting before the container has size** — Yagr relies on `ResizeObserver`; render after the target element has dimensions, or the chart draws at zero size.
- **Forgetting the `timeline` array** — config requires `timeline` (x values) plus one entry per series in `series`; lengths must match.
- **Importing plugins that aren't bundled** — tooltip, legend, plot-lines are separate plugins; import and enable them explicitly if needed.
