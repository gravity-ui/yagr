## Chart settings

Global chart settings go here.

## Configuration

### Series configurations

Series configurations depends on series type. Particular series options see in [series configuration](./series.md). Here we just listing the available configs which can be setted up globally.

#### Common configs

- `type?: ChartType`
- `color?: string`
- `spanGaps?: boolean`
- `cursorOptions?: Pick<CursorOptions, 'markersSize' | 'snapToValues'>`
- `formatter?: (value: string | number | null, serie: Series) => string`
- `precision?: number`
- `snapToValues?: SnapToValue | false`
- `stackGroup?: number`
- `title?: string | ((sIdx: number) => string)`
- `transform?: (val: number | null | string, series: DataSeries[], idx: number) => number | null`
- `showInTooltip?: boolean`
- `showInLegend?: boolean`

#### Lines configs (extends common configs)

- `type: 'line'`
- `width?: number;` - width of series stroke
- `interpolation?: InterpolationType`

#### Areas configs (extends common configs)

- `type: 'area'`
- `lineColor?: string` - color of area's top line
- `lineWidth?: number` - width of line over area
- `interpolation?: InterpolationType`

#### Dots configs (extends common configs)

- `type: 'dots'`
- `pointsSize?: number` - point size (default: 4px)

#### Columns configs (extends common configs)

- `type: 'column'`

### Appearance configurations

- `chart.appearance.locale?: 'ru' | 'en'` - Locale. See [more about customizing I18N](./i18n.md).
- `chart.appearance.theme?: 'light' | 'dark'` - Yagr theme, `'light'` by default. See [more about theming](./theme.md)
- `chart.appearance.drawOrder?: 'plotLines' | 'axes' | 'series'` - defines order in which will be drawn axes, series, plot lines and bands. By default, `['series', 'axes', 'plotLines']`, which means that axes will be over series but under plotLines.

### Selection configurations

- `chart.selection.minSelectionWidth?: number;` - width in pixels of the minimal permitted range selection, `15` by default.
- `chart.selection.zoom?: boolean` - whether chart zooming on range selection is enabled, `true` by default

### Size configurations

- `width?: number` - chart whidth in px.
- `height?: number` - chart height in px.
- `padding?: [top: number, right: number, bottom: number, left number]` - chart internal paddings, `utils.chart.getPaddingByAxes` by default
- `resizeDebounceMs?: number` - Debounce timer for ResizeObserver to trigger: (default 100 ms)
- `settings.adaptive?: boolean` - if true, then charts will be responsive and occupy 100% of the container width and height. Adaptive charts will also autoresize if required. Responsiveness implemented with [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)

### Time units

`settings.timeMultiplier?: number`

Timestamp multiplier to get UNIX timestamps
Use:

- `0.001` - if timestamps are seconds
- `1` - if timestamps are milliseconds
