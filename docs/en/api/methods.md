## Yagr methods

### Fields

-   `id!: string` - id of chart's root element. Will set up if not provided.
-   `uplot!: UPlot` - uPlot instance
-   `root!: HTMLElement` - root HTML element
-   `config!: YagrConfig`
-   `resizeOb?: ResizeObserver`
-   `canvas!: HTMLCanvasElement` - uPlot'c HTML5 Canvas element
-   `plugins: YagrPlugins` - map of available plugins
-   `state!: YagrState` - current Yagr state
-   `utils!` - Yagr utility helpers such as color parser, i18n etc
-   `isEmpty` - is chart empty (refers to `state.isEmptyDataSet`)

### Methods

-   `redraw(series = true, axes = true): void` - redraws Yagr instance by given options. Can redraw separately series or axes. By default fully rebuild axes and series.
-   `dispose(): void` - dispose Yagr instance, plugins and remove all listeners
-   `toDataUrl(): string` - returns canvas's `png/img` DataURL string
-   `subscribe(): void` - subsribe to uPlot's sync
-   `unsubscribe(): void` - unsubscribe from uPlot's sync
-   `getById(id: string): Series` - finds uPlot Series by id
-   `reflow()` - reflow chart instance

### Update methods

See more in [dynamic updates docs](./dynamic-updates.md).

-   `setLocale(locale: string | Record<string, string>): void` - set's locale of chart and redraws all locale-dependent elements.
-   `setTheme(themeValue: YagrTheme): void` - set's theme of chart and redraws all theme-dependent elements.
-   `setVisible(lineId: string | null, show: boolean): void` - sets series visibility (pass `null` to show/hide ass)
-   `setFocus(lineId: string | null, focus: boolean): void` - sets series focus (pass `null` to focus/defocus all)
-   `setAxes(axes: YagrConfig['axes']): void` - sets new axes config and rerender chart's axes (and series if required)
-   `setScales(scales: YagrConfig['scales']): void` - sets new scales config and rerender chart if required
-   `setSeries` - update chart series
-   `setConfig(cfgPath: Partial<YagrConfig>)` - applies passed patch to current config and calls all required `set*` functions in single batch
-   `yagr.batch` - allows to run multiple Yagr updates with single redraw and data recalculation
