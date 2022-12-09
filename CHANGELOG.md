### master

## [1.4.0](https://github.com/gravity-ui/yagr/compare/v1.3.2...v1.4.0) (2022-12-09)


### Features

* added batch ([ea43043](https://github.com/gravity-ui/yagr/commit/ea4304359bcd7c15f570f5a4f10930abf6f1f5d7))
* adding separated plugins ([ea67c4d](https://github.com/gravity-ui/yagr/commit/ea67c4d76c07c241e002a09987f5a32db791a21b))
* change hrefs for logos ([42a98a2](https://github.com/gravity-ui/yagr/commit/42a98a2fc1ec02a359563b387ca8770b5d8a529e))
* move yagr to gravity-ui organization ([24b3c27](https://github.com/gravity-ui/yagr/commit/24b3c27ac9902bab824b2897150e246c7c3541bf))
* test release flow ([#34](https://github.com/gravity-ui/yagr/issues/34)) ([97baa13](https://github.com/gravity-ui/yagr/commit/97baa1336df66982b83250b0e1d9a578db1ddc8f))


### Bug Fixes

* added .npmrc file ([5ee5c1c](https://github.com/gravity-ui/yagr/commit/5ee5c1c4673c6faef0fca724123048fa993368b5))
* fixed cursor plugins tests ([4b6042e](https://github.com/gravity-ui/yagr/commit/4b6042e95c9ca27138c0990ea061f77e31703e87))
* fixed left interpolation in case of iGroup border is null ([598cae2](https://github.com/gravity-ui/yagr/commit/598cae21555bf9ade592a557ec6428cbfb63cdff))
* fixed link to demo ([9359561](https://github.com/gravity-ui/yagr/commit/93595616cfb9394b424667c3d472dcfc85026a39))
* fixed redundant draw hook calls from tooltip setFocus on check ([f9a75fd](https://github.com/gravity-ui/yagr/commit/f9a75fdf431a3595a17e6af39c24755760f235b8))
* fixed Series override ([4d23c66](https://github.com/gravity-ui/yagr/commit/4d23c6660758ca49360d391ec0aefa991234fe3d))
* fixed setSeries + added tests ([5a680cd](https://github.com/gravity-ui/yagr/commit/5a680cdc10d65db8a54734290b8a793023557844))
* fixed stacking ([ccfbea5](https://github.com/gravity-ui/yagr/commit/ccfbea5295f4862ec442d542a65874608d4a0fb7))
* fixed tooltip ids and added tests ([04543a3](https://github.com/gravity-ui/yagr/commit/04543a38ce27df44826f3acd1167fc1b8a0794b9))
* fixed types ([100b43b](https://github.com/gravity-ui/yagr/commit/100b43b2b55655c5a2ac685c6a16f8004d87957d))
* fixed types and tests ([9ffac14](https://github.com/gravity-ui/yagr/commit/9ffac147148c02e238eda107769f531d211ffbc3))
* index.md ([525440b](https://github.com/gravity-ui/yagr/commit/525440ba4f27b44754011ac739a1d2c8977e9593))
* **legend:** fix a problem with quotes in legend names ([56c73d1](https://github.com/gravity-ui/yagr/commit/56c73d1c448c49e19d1a17683b20914379ce74a0))
* **legend:** fixed legend render and series toggle ([0c2a37d](https://github.com/gravity-ui/yagr/commit/0c2a37d2dbcf5eb641b537c591b8afa58576ae4b))
* normalization in case of row sum=0 ([4913781](https://github.com/gravity-ui/yagr/commit/4913781ebe95ee6adcdfc9cf38fa082c1c1b43ec))
* **tooltip:** fix pin behavior on resize, add tooltip to yagr.plugins ([84e8255](https://github.com/gravity-ui/yagr/commit/84e82557b97d466651a1298607ff4ec41370b8e0))
* try fix release flow ([516b329](https://github.com/gravity-ui/yagr/commit/516b32976c4b352bd361515905f444997932555e))

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
