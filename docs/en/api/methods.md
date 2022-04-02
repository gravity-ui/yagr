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
-   `dataRefs?: Record<string, DataRefs>` - data reference points (`min/max/avg/sum/count` per scale)
-   `utils!` - Yagr utility helpers such as color parser, i18n etc
-   `isEmpty` - is chart empty

### Methods

-   `setLocale(locale: string | Record<string, string>): void` - set's locale of chart and redraws all locale-dependent elements.
-   `setTheme(themeValue: YagrTheme): void` - set's theme of chart and redraws all theme-dependent elements.
-   `redraw(series = true, axes = true): void` - redraws Yagr instance by given options. Can redraw separately series or axes. By default fully rebuild axes and series.
-   `setVisible(lineId: string | null, show: boolean): void` - sets series visibility (pass `null` to show/hide ass)
-   `setFocus(lineId: string | null, focus: boolean): void` - sets series focus (pass `null` to focus/defocus all)
-   `dispose(): void` - dispose Yagr instance and remove all listeners
-   `toDataUrl(): string` - returns canvas's `png/img` DataURL string
-   `subscribe(): void` - subsribe to uPlot's sync
-   `unsubscribe(): void` - unsubscribe from uPlot's sync
-   `getById(id: string): Series` - finds Series by id
-   `setAxes(axes: YagrConfig['axes']): void` - sets new axes config and rerender chart's axes (and series if required)
-   `setSeries` - see [setSerie](#setseries)

### setSeries
