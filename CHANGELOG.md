### master

## [3.2.1](https://github.com/gravity-ui/yagr/compare/v3.2.0...v3.2.1) (2023-06-30)


### Bug Fixes

* fixed setAxes method ([68ce5c1](https://github.com/gravity-ui/yagr/commit/68ce5c122ef1cbd7c748df7fdeef9e7998361677))

## [3.2.0](https://github.com/gravity-ui/yagr/compare/v3.1.0...v3.2.0) (2023-06-23)

### Features

-   version bump ([e89d01c](https://github.com/gravity-ui/yagr/commit/e89d01c20222e6ab1d1afedccb0150d1d63c3297))

## [3.1.0](https://github.com/gravity-ui/yagr/compare/v3.0.0...v3.1.0) (2023-06-23)

### Features

-   added single-ton tooltip, fixed package config ([55ffc2b](https://github.com/gravity-ui/yagr/commit/55ffc2b52da7c9c86b8cc317ee84cf98dcfd5164))

### Bug Fixes

-   remove tooltip handlers on dispose + don't reiniit hooks ([a33f666](https://github.com/gravity-ui/yagr/commit/a33f666d3a939f761fb3577c7d18357873c7bc6d))
-   removed redundant typings and .d.ts reexporter ([cb291bd](https://github.com/gravity-ui/yagr/commit/cb291bd496d016e65d8d45dc4ba44acd0765b31d))

## [3.0.0](https://github.com/gravity-ui/yagr/compare/v2.2.6...v3.0.0) (2023-06-21)

### Configuratoin

-   Fixed typo `appereance` -> `appearance` in `YagrConfig['chart']`

### Refactor

-   Refactored `YagrCore` class to use mixins.
-   Refactored batch mechanism to support multiple Yagr change calls in single batch
-   Refactored Yagr React component to support `setConfig` instead of re-initialization of Yagr instance on every config update
-   Got rid of Rollup, using ESBuild instead

### Scales

-   Fixed `setVisible` method for stacked areas

### Methods

-   Removed workaround to fix [uPlot issue](https://github.com/leeoniya/uPlot/issues/680) in `setVisible` method
-   Added `setScales` method
-   Added generic `setConfig` method. Currently in expriemental mode

### Tooltip

-   Fixed tooltip render initial position (now it renders in `boundClassName` element)
-   Added virtual tooltip mode
-   Added useCustomTooltip hook for React

### Legend

-   Fixed legend series mark background-color

## [2.2.6](https://github.com/gravity-ui/yagr/compare/v2.2.5...v2.2.6) (2023-06-19)

### Bug Fixes

-   fixed legend rendering ([176a25d](https://github.com/gravity-ui/yagr/commit/176a25d8ba0c273c34b468b56656dfe1edc04fea))

## [2.2.5](https://github.com/gravity-ui/yagr/compare/v2.2.4...v2.2.5) (2023-06-02)

> > > > > > > main

## Examples

-   Added React + Custom React tooltip examples
-   Added `setScales`, dynamic updates and hooks examples

## [2.2.5](https://github.com/gravity-ui/yagr/compare/v2.2.4...v2.2.5) (2023-06-02)

### Bug Fixes

-   **YagrCore:** fix resize handling ([#57](https://github.com/gravity-ui/yagr/issues/57)) ([3ae9b43](https://github.com/gravity-ui/yagr/commit/3ae9b436324fd1ec7a9585f48a82d436a7fb468c))

## [2.2.4](https://github.com/gravity-ui/yagr/compare/v2.2.3...v2.2.4) (2023-04-13)

### Bug Fixes

-   change background color in case of dark-hc theme ([#53](https://github.com/gravity-ui/yagr/issues/53)) ([a647216](https://github.com/gravity-ui/yagr/commit/a647216f0c527b6bfdb9a0cfc630bd07acea3302))

## [2.2.3](https://github.com/gravity-ui/yagr/compare/v2.2.2...v2.2.3) (2022-12-13)

### Bug Fixes

-   columns render options ([#48](https://github.com/gravity-ui/yagr/issues/48)) ([034d652](https://github.com/gravity-ui/yagr/commit/034d65279595b8971a6fb7c03a3e5c9619127123))

## [2.2.2](https://github.com/gravity-ui/yagr/compare/v2.2.1...v2.2.2) (2022-12-12)

### Bug Fixes

-   legend show and hide all button ([da98045](https://github.com/gravity-ui/yagr/commit/da98045ee8f98ab3b3633deff0425c89ab1c6699))

## [2.2.1](https://github.com/gravity-ui/yagr/compare/v2.2.0...v2.2.1) (2022-12-09)

### Bug Fixes

-   build dist with new release flow ([8da1b5d](https://github.com/gravity-ui/yagr/commit/8da1b5d0710d7ea3378fc6a5a6374a3b7a1d0ae2))

## [2.2.0](https://github.com/gravity-ui/yagr/compare/v2.1.1...v2.2.0) (2022-12-09)

### Features

-   move yagr to gravity-ui organization ([24b3c27](https://github.com/gravity-ui/yagr/commit/24b3c27ac9902bab824b2897150e246c7c3541bf))
-   test release flow ([#34](https://github.com/gravity-ui/yagr/issues/34)) ([97baa13](https://github.com/gravity-ui/yagr/commit/97baa1336df66982b83250b0e1d9a578db1ddc8f))

### Bug Fixes

-   try fix release flow ([516b329](https://github.com/gravity-ui/yagr/commit/516b32976c4b352bd361515905f444997932555e))

### 2.1.0 (08-12-2022)

#### Column Series

-   Added pass column render options to `series`

#### PlotLines

-   Added posibility to render dashed lines

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
