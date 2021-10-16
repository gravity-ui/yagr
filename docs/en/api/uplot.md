# uPlot

You can access uPlot instances via `yagr.uplot`.

## Edit uPlot options

-   `config.editUplotOptions: (opts: Options) => Options;`

This method lets you edit uPlot options once all Yagr transformations are complete. That is useful when you need extend Yagr's behavior or implement a new plugin.
