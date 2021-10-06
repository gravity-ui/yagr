## Lifecycle stages

![Lifecycle](../../assets/yagr-stages.png "Yagr stages" =600x100%)

Yagr has 4 stages:

-   `config`: **Generate config and plugins** - initialize and configure plugins, parse CSS-colors, preparing default settings for scales, axes, register default hooks, finally creates config and data series for uPlot.

-   `processing`: **Processing** - on this stage yagr makes all data transformation if required: data alignment with interpolation, stacking, normalization, caches everything which will be useful later and prepares to create uPlot config.
-   `uplot`: **Create uPlot instance** - creates uPlot instance.
-   `render`: **Render** - renders node with custom renderer, also render legend if required.
-   `listen`: **Listen** - yagr instance awaits for events, triggers hooks, rerenders chart and

When yagr instance is removing `yagr.dispose()` should be called to dispose all handlers and event listeners of chart instance.

## Hooks

Yagr hooks defined as `Hooks.Arrays & YagrHooks` where `YagrHooks` are:

-   `load` - calls when chart fully processed and rendered and Yagr initialized all plugins.
-   `onSelect` - calls when user selects some range on chart
-   `error` - calls when there was runtime error in some stage of lifecycle
-   `processed` - calls when data is processed
-   `inited` - equivalent of `ready` of uPlot
-   `dispose` - calls when Yagr instance is deleting
-   `resize` - calls on any chart resize
