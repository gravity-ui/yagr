### master

#### PlotLines

### 2.0.0 (19-04-2022)

#### Documentation

-   Updated documentation to meet new major version.

#### Breaking changes

##### Yagr instances

-   Make charts adaptive by default.
-   All utility helpers (such as `theme`, `i18n`, `colorParser`) moved into `yagr.utils`.
-   Removed `refPoints` and simplified scale min/max calculations.
-   Renamed `toggleSerieVisibility` to `setVisible`, and changed signature to `setVisible(lineId: string | null, show: boolean): void`.
-   Changed `setFocus` signature to `setFocus(lineId: string | null, focus: boolean): void`.

##### ColorParser

-   `ColorParser` now is not a singleton and moved into `yagr.utils.colors`.

##### ThemeDefaults

-   `ThemeDefaults` now is not a singleton and moved into `yagr.utils.theme`.

##### Config

-   Removed `settings` fields.
-   Refactored `chart` field, now it includes all settings from `settings` field, and diverged fields by domains.

##### Hooks

-   All extended `yagr.hooks` now passing consistent `{chart: Yagr}` argument to handlers.

##### Scales

-   Removed `maxTicks` field. It was never worked.

##### Typings

-   Splited different series options by `type`, which allows to enable more comprehensible completions in TypeScript.
-   Renamed: `InterpolationSetting` -> `InterpolationType`.

##### PlotLines

-   Removed `setThreshold` (looks like duplicate for `addPlotLines`).
-   Renamed `addPlotLines` to `add`.

#### New features

##### Config

-   Added custom Yagr plugins support.

##### Yagr methods

-   Added `yagr.setSeries` method which updates/sets series and redraws them.
-   Added `yagr.setAxes` method which updates/adds axes and redraws them if required.
-   Added `yagr.setLocale` method which changes locale and redraws all i18n-including elements.
-   Added `yagr.setTheme` method which changes theme and redraws chart.
-   Added `yagr,getSeriesById` which returns uPlot's `Series` type by Yagr's series ID.
-   Added `yagr.batch` which allows to run multiple changes in single redraw.

##### Axes

-   Added `splitsCount` which helps to render axes with given number of splits.

##### Hooks

-   Add `stage` hook which fires when `yagr.state.stage` changes.
-   All hooks' types redesigned to support hook arguments completeions.

##### Theme

-   Themes now not shared between Yagr instances, they now can be different per instance.
-   Added theme customization docs.

##### Tooltip

-   Combined `tooltip.enabled` with `tooltip.show` (removed `enabled`).
-   Tooltip now support `.on('<action>', <handler>)` which allows to subsribe on tooltip action emitting insted of single `onStateChange` callback. Also `.off` method is available.
-   Added `yagr.plugins.tooltip.display()` method which allows to display tooltip in given place with given X-axis index programmaticaly.

##### Cursor

-   Add `updatePoints` method which redraws cursor points in case of series options was changed.

##### PlotLines

-   Add `yagr.plugins.plotLines.get` method which returns current plotlines

#### Fixes

#### Yagr

-   Fixed Yagr ID generation to avoid IDs starting with numbers

#### Tooltip

-   Fixed tooltip's HTML ID generation
-   Removed redundant `draw` hook calling on `setFocus(null)` via tooltip

### 1.4.1 (15-03-2022)

-   Exporting hooks's signature typings

### 1.4.0 (11-02-2022)

#### Hooks

-   Add new parameter `chart` into the `onSelect` hook
-   use `timeMultiplier` to correctly evaluate `from` and `to` values

### 1.3.8 (26-01-2022)

#### Processing

-   Fixed normalization in case of row sum equals zero

### 1.3.7 (21-12-2021)

#### Scales

-   Properly define logarithmic scale values

#### Legend

-   Fixed legend series toggle

### 1.3.6 (02-12-2021)

#### Legend

-   Fixed legend items' `seried-idx` attribute

### 1.3.5 (30-11-2021)

#### Processing

-   Fixed `left` interpolation

### 1.3.4 (13-10-2021)

#### Tooltip

-   Properly render serie name by escaping html

#### Legend

-   Fix a problem with quoted series names

### 1.3.3 (11-10-2021)

#### Tooltip

-   Store tooltip plugin in `yagr.plugins` for direct access to methods
-   Unpin and hide tooltip when plot resizing.

#### Processing

-   Added `snapToValues = false` for interpolation cursor snapping
