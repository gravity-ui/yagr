## Settings

Global chart settings go here.

## Configuration

### Zoom

`settings.zoom?: boolean`

Whether chart zooming is enabled, `true` by default

### Localization

`settings.locale?: 'ru' | 'en'`

See [more about customizing I18N](./i18n.md).

### Time units

`settings.timeMultiplier?: number`

Timestamp multiplier to get UNIX timestamps
Use:

-   `0.001` - if timestamps are seconds
-   `1` - if timestamps are milliseconds

### Theme

`settings.theme?: 'light' | 'dark'`

Yagr theme, `'light'` by default

### Minimum selection width

`settings.minSelectionWidth?: number;`

Width in pixels of the minimal permitted range selection.

### Adaptivity

`settings.adaptive?: boolean`

If true, then charts will be responsive and occupy 100% of the container width and height. Adaptive charts will also autoresize if required. Responsiveness implemented with [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)

### interpolation: {

`settings.interpolation?: InterpolationSetting`

```ts
type InterpolationSetting = 'linear' | 'left' | 'right' | 'smooth';
```

Interpolation of line curves Don't confuse it with [data alignment interpolation](./data-processing.md#data-interpolation)

-   `linear` - linear interpolation
    ![Interpolation linear](../../assets/interpolation-linear.png =600x100%)

-   `left` - left interpolation (previous point value)
    ![Interpolation left](../../assets/interpolation-left.png =600x100%)

-   `right` - right interpolation (next point value)
    ![Interpolation right](../../assets/interpolation-right.png =600x100%)

-   `smooth` - smooth interpolation (Bezier curve interpolation)
    ![Interpolation smooth](../../assets/interpolation-smooth.png =600x100%)

### Draw layer order

`settings.drawOrder` - defines order in which will be drawn axes, series, plot lines and bands.

Draw layer order: `'plotLines' | 'axes' | 'series'`.
By default, `['series', 'axes', 'plotLines']`, which means that axes will be over series but under plotLines.
