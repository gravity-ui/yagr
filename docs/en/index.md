# About

Yagr is a high-level library used to render HTML5 Canvas charts based on the extra-fast library [uPlot](https://github.com/leeoniya/uPlot).

## Why Yagr?

Why not use uPlot directly? uPlot is a flexible library that comes with an amazing API you can use to create your own plugins and implement different visualizations, only it's too low-level. If you need a lot of common chart [features](#features) like a [legend tooltip](./plugins/tooltip.md#tooltip), [stacking](./api/scales.md#stacking), and [normalization](./api/scales.md#Normalization), you'll have to implement them manually with uPlot. Yagr already has many of those features in place. Yagr is also configurable, meaning you can extend it or customize its look and behavior, while it also lets you extend uPlot objects directly.

## Why not Yagr

If you aren't looking for Yagr features but instead need something specific that isn't in Yagr, use uPlot directly or check the [issues](https://github.com/yandex-cloud/yagr/issues). Otherwise, I recommend using and trying to expand Yagr, but also feel free to ask questions and bring up ideas on our [Issues Page](https://github.com/yandex-cloud/yagr/issues).

## Features

-   [Lines, areas, columns, and dots as visualization types. Configurable per series](./api/visualization.md#visualization-types)
-   [Configurable Legend Tooltip](./plugins/tooltip.md#tooltip)
-   [Axes with extra options for decimal-level precision](./api/axes.md#axes)
-   [Scales with configurable range functions and transformations](./api/scales.md#scales)
-   [Plot lines and bands. Configurable draw layer](./plugins/plot-lines.md#plot-lines)
-   [Responsive charts](./api/settings.md#settings.adaptive) (requires [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver))
-   [High-level support of stacked areas/columns](./api/scales.md#stacking)
-   [Light/Dark theme](./api/settings.md#Theme)
-   [Data normalization](./api/scales.md#Normalization)
-   [Configurable crosshairs, cursor markers and snapping](./api/cursor.md#cursor)
-   Typescript
-   [Localization](./api/settings.md#localization)
-   [CSS Variables in color names](./api/css.md#css)
-   [Paginated inline legend](./plugins/legend.md#legend)
-   [Error handling and extended hooks](./api/lifecycle.md#hooks)
-   [Data alignment and interpolation for missing data](./api/data-processing.md#data-alignment)
