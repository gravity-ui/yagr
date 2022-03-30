### master

### New features

### Yagr methods

-   Added `yagr.setSeries` method which updates/sets series and redraws them
-   Added `yagr.setAxes` method which updates/adds axes and redraws them if required
-   Added `yagr.setLocale` method which changes locale and redraws all i18n-including elements
-   Added `yagr.setTheme` method which changes theme and redraws chart

### Config

-   Removed `settings` fields
-   Refactored `chart` field, now it includes all settings from `settings` field, and diverged fields by domains

### Hooks

-   Add `stage` hook which fires when `yagr.state.stage` changes
-   All hooks' types redesigned to support hook arguments completeions

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
