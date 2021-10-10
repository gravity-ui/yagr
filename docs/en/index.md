# About

Yagr is a high level library for rendering HTML5 Canvas charts based on the extra-fast library [uPlot](https://github.com/leeoniya/uPlot).

## Why Yagr?

Why not to use uPlot directly? uPlot is very flexible library, and it provides amazing API to create your own plugins and implement different visualizations, but uPlot is too low level library. If you need a lot of common for chart [features](#features) such as [legend tooltip](./plugins/tooltip.md#tooltip), [stacking](./api/scales.md#stacking), [normalization](./api/scales.md#normalization) etc then you should implement them by yourself if you choose uPlot. Yagr has already implented many of that features. Yagr pretty much configurable, and you can extend it or customize view and behavior, and also it allows to extend uPlot object directly.

## Why not Yagr

If you doesn't need Yagr features but need something specific which is not implemented in Yagr then you should use uPlot directly or welcome to the issues. Otherwise, I recommend to use Yagr and try to extend it, feel free to ask questions and bring you ideas into our [Issues Page](https://github.com/yandex-cloud/yagr/issues).

## Features

-   [Lines, Areas, Columns, Dots as visualization type. Configurable per series](./api/visualization.md#visualization-types)
-   [Configurable Legend Tooltip](./plugins/tooltip.md#tooltip)
-   [Axes with extra options for decimals precision](./api/axes.md#axes)
-   [Scales with configurable range functions and transformations](./api/scales.md#scales)
-   [Plot lines and bands. Configurable draw layer](./plugins/plot-lines.md#plot-lines)
-   [Responsive charts](./api/settings.md#settings.adaptive) (requires [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver))
-   [High level support of stacked areas/columns](./api/scales.md#stacking)
-   [Light/Dark theme](./api/settings.md#Theme)
-   [Data normalization](./api/scales.md#Normalization)
-   [Configurable crosshairs, cursor markers and snapping](./api/cursor.md#cursor)
-   Typescript
-   [Localization](./api/settings.md#localization)
-   [CSS Variables in color names](./api/css.md#css)
-   [Paginated inline legend](./plugins/legend.md#legend)
-   [Error handling and extended hooks](./api/lifecycle.md#hooks)
-   [Data alignment and interpolation for missing data](./api/data-processing.md#data-alignment)
