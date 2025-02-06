# Yagr <img src="https://raw.githubusercontent.com/gravity-ui/yagr/main/docs/assets/yagr.svg" width="24px" height="24px" />

`Yagr` — это высокопроизводительный рендерер графиков, использующий технологию HTML5 canvas и основанный на библиотеке [uPlot](https://github.com/leeoniya/uPlot). Он обеспечивает поддержку высокоуровневых функций для графиков uPlot.

<img src="https://raw.githubusercontent.com/gravity-ui/yagr/main/docs/assets/demo.png" width="800" />

## Характеристики

-   [Линии, области, столбцы и точки как типы визуализации: возможность настройки для каждой серии](https://yagr.tech/en/api/visualization).
-   [Легенда с настраиваемыми тултипами](https://yagr.tech/en/plugins/tooltip).
-   [Оси с дополнительными параметрами для десятичной точности](https://yagr.tech/en/api/axes).
-   [Шкалы с настраиваемыми функциями диапазона и возможностью преобразования](https://yagr.tech/en/api/scales).
-   [Линии и полосы графика: настраиваемый слой отрисовки](https://yagr.tech/en/plugins/plot-lines).
-   [Адаптивные графики](https://yagr.tech/en/api/settings#adaptivity) (требуют использования API [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)).
-   [Поддержка стековых областей/столбцов на высоком уровне](https://yagr.tech/en/api/scales#stacking).
-   [Настраиваемые маркеры](./docs/api/markers.md).
-   [Поддержка светлой и темной темы](https://yagr.tech/en/api/settings#theme).
-   [Нормализация данных](https://yagr.tech/en/api/scales#normalization).
-   [Настраиваемые перекрестия, маркеры курсора и привязка](https://yagr.tech/en/api/cursor).
-   Typescript.
-   [Локализация](https://yagr.tech/en/api/settings#localization).
-   [CSS-переменные для имен цветов](https://yagr.tech/en/api/css).
-   [Встроенная легенда с пагинацией](https://yagr.tech/en/plugins/legend).
-   [Обработка ошибок и расширенные хуки](https://yagr.tech/en/api/lifecycle).
-   [Выравнивание данных и интерполяция для отсутствующих значений](https://yagr.tech/en/api/data-processing).
-   [Обновления в режиме реального времени](https://yagr.tech/en/api/dynamic-updates).

## [Документация](https://yagr.tech)

## Быстрый старт

```
npm i @gravity-ui/yagr
```

### Модуль NPM

```typescript
import Yagr from '@gravity-ui/yagr';

new Yagr(document.body, {
    timeline: [1, 2, 3, 4, 5],
    series: [
        {
            data: [1, 2, 3, 4, 5],
            color: 'red',
        },
        {
            data: [2, 3, 1, 4, 5],
            color: 'green',
        },
    ],
});
```

### Тег скрипта

```html
<script src="https://unpkg.com/@gravity-ui/yagr/dist/yagr.iife.min.js"></script>
<script>
    new Yagr(document.body, {
        timeline: [1, 2, 3, 4, 5],
        series: [
            {
                data: [1, 2, 3, 4, 5],
                color: 'red',
            },
            {
                data: [2, 3, 1, 4, 5],
                color: 'green',
            },
        ],
    });
</script>
```

### Примеры

Конкретные примеры с применением `Yagr` можно найти в папке [`demo/examples`] (./demo/examples/). Для их запуска в вашей текущей версии выполните следующее:

1. Склонируйте репозиторий.
2. Установите зависимости `npm i`.
3. Запустите `npm run build`:
4. Запустите `npx http-server .`.
5. Откройте примеры в браузере в соответствии с выводом HTTP-сервера.
