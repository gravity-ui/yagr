## Lifecycle stages

![Lifecycle](../../assets/yagr-stages.png "Yagr stages" =600x100%)

Yagr has four stages:

-   `config`: **Generate config and plugins** - initialize and configure plugins, parse CSS colors, prepare default settings for scales and axes, register default hooks, ultimately create the config and data series for uPlot.

-   `processing`: **Processing** - at this stage, Yagr executes all required data transformation, including data alignment with interpolation, stacking, and normalization, caching everything that might be needed later, and preparing to create a uPlot config.

-   `uplot`: **Create uPlot instance** - create a uPlot instance.

-   `render`: **Render** - use the custom renderer to render a node, also render a legend if required.

-   `listen`: **Listen** - a Yagr instance waits for events, triggers hooks, and rerenders the chart.

When a Yagr instance is being removed, call `yagr.dispose()` to dispose of all handlers and event listeners for that chart instance.

## Hooks

Yagr hooks defined as `Hooks.Arrays & YagrHooks` where `YagrHooks` are:

-   `load` - call when the chart is fully processed and rendered and Yagr has initialized all plugins.
-   `onSelect` - call when a user selects a range on a chart
-   `error` - call when there is a runtime error at any lifecycle stage
-   `processed` - call when data is processed
-   `inited` - equivalent of uPlot `ready`
-   `dispose` - call when Yagr instance is being deleted
-   `resize` - call to resize any chart
