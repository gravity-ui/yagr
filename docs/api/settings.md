## Settings

Global chart settings goes here.

## Configuration

### Zoom

`settings.zoom?: boolean`

Is chart zooming enabled. `true` by default

### Localization

`settings.locale?: 'ru' | 'en'`

See [localization](#localization).

### Time units

`settings.timeMultiplier?: number`

Multiplier for timestamps to get UNIX timestamps.
Use:

-   `0.001` - if timestamps are seconds
-   `1` - if timestamps are milliseconds

### Theme

`settings.theme?: 'light' | 'dark'`

Yagr theme. `'light'` by default.

### Minimum selection width

`settings.minSelectionWidth?: number;`

Width in pixels of minimal allowed range selection.

### Adaptivity

`settings.adaptive?: boolean`

If true then charts will be responsive and take 100% of width and height of container. Also adaptive charts will autoresize if required. Responsiveness implemented with [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)

### Interpolation

`settings.interpolation?: InterpolationSetting`

```ts
type InterpolationSetting = 'linear' | 'left' | 'right' | 'smooth';
```

Interpolation of line curves. Don't confuse it with [data alignment interpolation](#data-alignment)

-   `linear` - linear interpolation
    ![Interpolation linear](../assets/interpolation-linear.png =600x100%)

-   `left` - left interpolation (previous point value)
    ![Interpolation left](../assets/interpolation-left.png =600x100%)

-   `right` - right interpolation (next point value)
    ![Interpolation right](../assets/interpolation-right.png =600x100%)

-   `smooth` - smooth interpolation (Bezier's curves interpolation)
    ![Interpolation smooth](../assets/interpolation-smooth.png =600x100%)

### Draw layers order

`settings.drawOrder`

Draw layers order: `'plotLines' | 'axes' | 'series'`.
By default: `['series', 'axes', 'plotLines']`, which means that axes will be over series, but under plotLines.
