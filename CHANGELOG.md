### master

## [3.11.2](https://github.com/gravity-ui/yagr/compare/v3.11.1...v3.11.2) (2023-11-17)


### Bug Fixes

* fixed react component to drop ref on disposing ([#179](https://github.com/gravity-ui/yagr/issues/179)) ([c419cb9](https://github.com/gravity-ui/yagr/commit/c419cb9119c5cb08057bc02973700ce9acb167e6))

## [3.11.1](https://github.com/gravity-ui/yagr/compare/v3.11.0...v3.11.1) (2023-11-08)


### Bug Fixes

* fixed tooltip render on pin with empty data ([#176](https://github.com/gravity-ui/yagr/issues/176)) ([52a0847](https://github.com/gravity-ui/yagr/commit/52a0847e8ff4a653ab34194c54af5a24870a6193))

## [3.11.0](https://github.com/gravity-ui/yagr/compare/v3.10.6...v3.11.0) (2023-10-23)


### Features

* added options for custom tooltip tracking fn ([#171](https://github.com/gravity-ui/yagr/issues/171)) ([03697d0](https://github.com/gravity-ui/yagr/commit/03697d03990957a7ca744845f5550b77ef00b133))


### Bug Fixes

* fixed empty chart updating ([#174](https://github.com/gravity-ui/yagr/issues/174)) ([05f9964](https://github.com/gravity-ui/yagr/commit/05f99646e8ef2e6ea930cea86556f562e96b2784))

## [3.10.6](https://github.com/gravity-ui/yagr/compare/v3.10.5...v3.10.6) (2023-10-10)


### Bug Fixes

* fixed tooltip render when a lot of lines ([#168](https://github.com/gravity-ui/yagr/issues/168)) ([8fff973](https://github.com/gravity-ui/yagr/commit/8fff9735395ac3df754e84ea73fe69364106f3f7))

## [3.10.5](https://github.com/gravity-ui/yagr/compare/v3.10.4...v3.10.5) (2023-10-09)


### Bug Fixes

* fixed pagination infinity pages ([#166](https://github.com/gravity-ui/yagr/issues/166)) ([4de5b30](https://github.com/gravity-ui/yagr/commit/4de5b30b603b3db4072f7f31e2ea865dcdbf49c0))

## [3.10.4](https://github.com/gravity-ui/yagr/compare/v3.10.3...v3.10.4) (2023-10-05)


### Bug Fixes

* fixed width and height of plotlines for filling full rect ([#164](https://github.com/gravity-ui/yagr/issues/164)) ([a6e94c6](https://github.com/gravity-ui/yagr/commit/a6e94c6f7610628564d0ffab0721b563258c35af))

## [3.10.3](https://github.com/gravity-ui/yagr/compare/v3.10.2...v3.10.3) (2023-10-05)


### Bug Fixes

* fixed drawMarkersIfRequired in case if timeline.length == 1 ([#163](https://github.com/gravity-ui/yagr/issues/163)) ([9a506f4](https://github.com/gravity-ui/yagr/commit/9a506f491814b5145ea98498a91e383ab2e98859))
* fixed update point cursro in case if it's empty ([#161](https://github.com/gravity-ui/yagr/issues/161)) ([25c1da4](https://github.com/gravity-ui/yagr/commit/25c1da420c5f5f8e66c072d27048b23b771ddfd3))

## [3.10.2](https://github.com/gravity-ui/yagr/compare/v3.10.1...v3.10.2) (2023-10-02)


### Bug Fixes

* changed legends totalSpace calculation formula ([#159](https://github.com/gravity-ui/yagr/issues/159)) ([900193c](https://github.com/gravity-ui/yagr/commit/900193cae53f4b69948ce328a5027064999e3851))

## [3.10.1](https://github.com/gravity-ui/yagr/compare/v3.10.0...v3.10.1) (2023-09-30)


### Bug Fixes

* set option "updateLegend" to false in "extended" behaviour ([#157](https://github.com/gravity-ui/yagr/issues/157)) ([7f5d065](https://github.com/gravity-ui/yagr/commit/7f5d06568a9eff4df51d29ddd3a642e2017d9ed0))

## [3.10.0](https://github.com/gravity-ui/yagr/compare/v3.9.0...v3.10.0) (2023-09-28)


### Features

* added 'extended' legends item onClick behaviour ([#154](https://github.com/gravity-ui/yagr/issues/154)) ([13e19d3](https://github.com/gravity-ui/yagr/commit/13e19d3e1d01cab152ed7782b71e38868ce88758))

## [3.9.0](https://github.com/gravity-ui/yagr/compare/v3.8.1...v3.9.0) (2023-09-27)


### Features

* added tooltip.omitBy option to omit arbitrary line from tooltip by predicate ([#152](https://github.com/gravity-ui/yagr/issues/152)) ([735e62b](https://github.com/gravity-ui/yagr/commit/735e62bcec95a856a27578fefe69351710538255))

## [3.8.1](https://github.com/gravity-ui/yagr/compare/v3.8.0...v3.8.1) (2023-09-15)


### Bug Fixes

* fixed cursor points updating on series update ([#147](https://github.com/gravity-ui/yagr/issues/147)) ([1185d21](https://github.com/gravity-ui/yagr/commit/1185d218b10df12d7822f024eacc60584f862df6))

## [3.8.0](https://github.com/gravity-ui/yagr/compare/v3.7.13...v3.8.0) (2023-09-11)


### Features

* add tooltip.strategy = 'drag' ([#145](https://github.com/gravity-ui/yagr/issues/145)) ([2d102f0](https://github.com/gravity-ui/yagr/commit/2d102f05801d5ac3ad5e66095e378bf15e407553))

## [3.7.13](https://github.com/gravity-ui/yagr/compare/v3.7.12...v3.7.13) (2023-09-05)


### Bug Fixes

* forced plot bands to draw only inside plotting area ([#140](https://github.com/gravity-ui/yagr/issues/140)) ([72839b1](https://github.com/gravity-ui/yagr/commit/72839b1c3ceac884230ff21806b5892283109c29))

## [3.7.12](https://github.com/gravity-ui/yagr/compare/v3.7.11...v3.7.12) (2023-08-31)


### Bug Fixes

* fixed default bars width passing ([#138](https://github.com/gravity-ui/yagr/issues/138)) ([7dd18e5](https://github.com/gravity-ui/yagr/commit/7dd18e512132b4ca867fea16a7d3f423f6a33985))

## [3.7.11](https://github.com/gravity-ui/yagr/compare/v3.7.10...v3.7.11) (2023-08-26)


### Bug Fixes

* fixed common spanGaps option passing ([#130](https://github.com/gravity-ui/yagr/issues/130)) ([b71905f](https://github.com/gravity-ui/yagr/commit/b71905f282c6f1deb10440a9fd0d2268607ce0d2))

## [3.7.10](https://github.com/gravity-ui/yagr/compare/v3.7.9...v3.7.10) (2023-08-23)


### Bug Fixes

* fixed data aggregation plugin ([#135](https://github.com/gravity-ui/yagr/issues/135)) ([d4ae62c](https://github.com/gravity-ui/yagr/commit/d4ae62c31ed20171e28174a04420024789f378f2))

## [3.7.9](https://github.com/gravity-ui/yagr/compare/v3.7.8...v3.7.9) (2023-08-18)


### Bug Fixes

* fixed markers plugin initiation ([#133](https://github.com/gravity-ui/yagr/issues/133)) ([ed82236](https://github.com/gravity-ui/yagr/commit/ed822362f9acb3001505ed25265bb62f2531be3e))

## [3.7.8](https://github.com/gravity-ui/yagr/compare/v3.7.7...v3.7.8) (2023-08-15)


### Bug Fixes

* fixed tooltip pin/unpin for all strategies ([#131](https://github.com/gravity-ui/yagr/issues/131)) ([f1d5c28](https://github.com/gravity-ui/yagr/commit/f1d5c287cd02a3e35227da600763bad3dabea452))

## [3.7.7](https://github.com/gravity-ui/yagr/compare/v3.7.6...v3.7.7) (2023-08-10)


### Bug Fixes

* fixed data-refs plugin ([#128](https://github.com/gravity-ui/yagr/issues/128)) ([f7de2a9](https://github.com/gravity-ui/yagr/commit/f7de2a92a6a33d12f2b899847a81d1860e74c188))
* updated uplot ([#127](https://github.com/gravity-ui/yagr/issues/127)) ([642cda1](https://github.com/gravity-ui/yagr/commit/642cda1b03ea1fba0f7af101a71927691ec99d8b))

## [3.7.6](https://github.com/gravity-ui/yagr/compare/v3.7.5...v3.7.6) (2023-08-09)


### Bug Fixes

* fixed plotlines removes, update bug with cached uHook ([#125](https://github.com/gravity-ui/yagr/issues/125)) ([9709797](https://github.com/gravity-ui/yagr/commit/9709797f9f79f5308ff5b25d7c7ef8c45cf19e3d))

## [3.7.5](https://github.com/gravity-ui/yagr/compare/v3.7.4...v3.7.5) (2023-08-03)


### Bug Fixes

* fixed plotlines update ([#123](https://github.com/gravity-ui/yagr/issues/123)) ([d3f24d4](https://github.com/gravity-ui/yagr/commit/d3f24d452f8d86beedf9139fd091f4de7452f2a2))

## [3.7.4](https://github.com/gravity-ui/yagr/compare/v3.7.3...v3.7.4) (2023-08-02)


### Bug Fixes

* fixed cursor pin in case if uplot not rendered yet ([#121](https://github.com/gravity-ui/yagr/issues/121)) ([3b7e58c](https://github.com/gravity-ui/yagr/commit/3b7e58c1d102d7b90423ecc1a5d918fa78387b6b))

## [3.7.3](https://github.com/gravity-ui/yagr/compare/v3.7.2...v3.7.3) (2023-08-01)


### Bug Fixes

* fixde setScales method ([#119](https://github.com/gravity-ui/yagr/issues/119)) ([e693065](https://github.com/gravity-ui/yagr/commit/e69306532eeda4c55be0ddaae73f48d76cb3fb5b))

## [3.7.2](https://github.com/gravity-ui/yagr/compare/v3.7.1...v3.7.2) (2023-07-31)


### Bug Fixes

* fixed series update ([#117](https://github.com/gravity-ui/yagr/issues/117)) ([d5afe05](https://github.com/gravity-ui/yagr/commit/d5afe05d4ba4d8e9598496149b3209bcefc8213f))

## [3.7.1](https://github.com/gravity-ui/yagr/compare/v3.7.0...v3.7.1) (2023-07-28)


### Bug Fixes

* fixed hooks update ([#113](https://github.com/gravity-ui/yagr/issues/113)) ([9272e5e](https://github.com/gravity-ui/yagr/commit/9272e5e7016b5a7ef781c8c2c5e1c60b97a70b5f))

## [3.7.0](https://github.com/gravity-ui/yagr/compare/v3.6.1...v3.7.0) (2023-07-24)


### Features

* added tooltip on update strategy ([#111](https://github.com/gravity-ui/yagr/issues/111)) ([41f0c10](https://github.com/gravity-ui/yagr/commit/41f0c105eb3e42fc18644797e5fe113f146f3217))

## [3.6.1](https://github.com/gravity-ui/yagr/compare/v3.6.0...v3.6.1) (2023-07-21)


### Bug Fixes

* react and refs ([#109](https://github.com/gravity-ui/yagr/issues/109)) ([de8058d](https://github.com/gravity-ui/yagr/commit/de8058d85aea1390f9270c507fc7b3243388de59))

## [3.6.0](https://github.com/gravity-ui/yagr/compare/v3.5.5...v3.6.0) (2023-07-17)


### Features

* add new tooltip actions + reset method ([#104](https://github.com/gravity-ui/yagr/issues/104)) ([f02c3e8](https://github.com/gravity-ui/yagr/commit/f02c3e812b7b45f528c01369fa7724d69777ec64))
* added  hard-update option for setConfig and react component ([#105](https://github.com/gravity-ui/yagr/issues/105)) ([104334f](https://github.com/gravity-ui/yagr/commit/104334fe4ce9754193495337086aa50929edac78))


### Bug Fixes

* ensure unique ticks ([#106](https://github.com/gravity-ui/yagr/issues/106)) ([67bd3d0](https://github.com/gravity-ui/yagr/commit/67bd3d0d6c58802468e7de631637af4a1e5d1f20))

## [3.5.5](https://github.com/gravity-ui/yagr/compare/v3.5.4...v3.5.5) (2023-07-13)


### Bug Fixes

* tooltip pinnig ([#102](https://github.com/gravity-ui/yagr/issues/102)) ([2d2b4a4](https://github.com/gravity-ui/yagr/commit/2d2b4a4ac26c2e4be1c203a4d9cfca452b4e8eef))

## [3.5.4](https://github.com/gravity-ui/yagr/compare/v3.5.3...v3.5.4) (2023-07-13)


### Bug Fixes

* fixed drawMarkersIfRequired ([#100](https://github.com/gravity-ui/yagr/issues/100)) ([0dee458](https://github.com/gravity-ui/yagr/commit/0dee45812240ab4c9c9107d4c415b39525bfaf9d))

## [3.5.3](https://github.com/gravity-ui/yagr/compare/v3.5.2...v3.5.3) (2023-07-13)


### Bug Fixes

* fixed pinning tooltip on range selection ([#98](https://github.com/gravity-ui/yagr/issues/98)) ([2762387](https://github.com/gravity-ui/yagr/commit/2762387c361104b9175651c827f83972ae59212b))

## [3.5.2](https://github.com/gravity-ui/yagr/compare/v3.5.1...v3.5.2) (2023-07-13)


### Bug Fixes

* fixed typings for tooltip and plotLines ([#96](https://github.com/gravity-ui/yagr/issues/96)) ([fe2f59b](https://github.com/gravity-ui/yagr/commit/fe2f59bac91915eef8a939a2e4d076322618ec6e))

## [3.5.1](https://github.com/gravity-ui/yagr/compare/v3.5.0...v3.5.1) (2023-07-12)


### Bug Fixes

* fixed setSeries for dots ([#94](https://github.com/gravity-ui/yagr/issues/94)) ([5fedb3d](https://github.com/gravity-ui/yagr/commit/5fedb3de41b07017c0a96c3ef9feeb82cb913e62))

## [3.5.0](https://github.com/gravity-ui/yagr/compare/v3.4.1...v3.5.0) (2023-07-12)


### Features

* added tooltip pin strategy + fixed dynamic updates of dot-series ([#92](https://github.com/gravity-ui/yagr/issues/92)) ([3babd4b](https://github.com/gravity-ui/yagr/commit/3babd4bf8d4dd65c2c3a9a8b0bd2eb8d61360da2))

## [3.4.1](https://github.com/gravity-ui/yagr/compare/v3.4.0...v3.4.1) (2023-07-11)


### Bug Fixes

* updated data refs notations ([#90](https://github.com/gravity-ui/yagr/issues/90)) ([79437df](https://github.com/gravity-ui/yagr/commit/79437df91917e352a777c00859778da3eca0a66f))

## [3.4.0](https://github.com/gravity-ui/yagr/compare/v3.3.6...v3.4.0) (2023-07-10)


### Features

* added .setTitle method, subscription state, data refs and range tracking ([8fbbb5c](https://github.com/gravity-ui/yagr/commit/8fbbb5ccfcb2ab7b78e78da108bba83c1e0e4d04))

## [3.3.6](https://github.com/gravity-ui/yagr/compare/v3.3.5...v3.3.6) (2023-07-10)


### Bug Fixes

* **dynamic-updates:** fixed series options override ([#86](https://github.com/gravity-ui/yagr/issues/86)) ([9fdd83e](https://github.com/gravity-ui/yagr/commit/9fdd83e3430b5380db2fb7d14aaa1885a6574407))

## [3.3.5](https://github.com/gravity-ui/yagr/compare/v3.3.4...v3.3.5) (2023-07-06)


### Bug Fixes

* removed redundant reinit after full update + fixed batch series update ([#84](https://github.com/gravity-ui/yagr/issues/84)) ([5f181ec](https://github.com/gravity-ui/yagr/commit/5f181ec76dff76be93a8c811a2f69cb4fbfbf384))

## [3.3.4](https://github.com/gravity-ui/yagr/compare/v3.3.3...v3.3.4) (2023-07-05)


### Bug Fixes

* fixed dynamic updates of series in case if changed only data ([#82](https://github.com/gravity-ui/yagr/issues/82)) ([9ff1979](https://github.com/gravity-ui/yagr/commit/9ff1979aa280b9f77272ba62134a4dcc4948424d))

## [3.3.3](https://github.com/gravity-ui/yagr/compare/v3.3.2...v3.3.3) (2023-07-05)


### Bug Fixes

* **react:** fixed react typings ([#80](https://github.com/gravity-ui/yagr/issues/80)) ([532d1f4](https://github.com/gravity-ui/yagr/commit/532d1f46b8c2c0a7e50e0601962ce154ba52dea6))

## [3.3.2](https://github.com/gravity-ui/yagr/compare/v3.3.1...v3.3.2) (2023-07-04)


### Bug Fixes

* fixed setConfig config update ([#78](https://github.com/gravity-ui/yagr/issues/78)) ([0c43ac1](https://github.com/gravity-ui/yagr/commit/0c43ac1bd568bb248da4b29f6cc5882ee076e3c2))

## [3.3.1](https://github.com/gravity-ui/yagr/compare/v3.3.0...v3.3.1) (2023-07-02)


### Bug Fixes

* fixed initRender to support updates without legend dom node change ([c8810d6](https://github.com/gravity-ui/yagr/commit/c8810d632dda66901f776bd372d4304868d25deb))

## [3.3.0](https://github.com/gravity-ui/yagr/compare/v3.2.1...v3.3.0) (2023-06-30)


### Features

* version bump ([#74](https://github.com/gravity-ui/yagr/issues/74)) ([e2d6743](https://github.com/gravity-ui/yagr/commit/e2d6743f05bb836fed77e98cbf926717e110d771))

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
