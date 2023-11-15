## Labels

Labels plugin allows to render labels on chart. You can use it to render any text on points, axes and plot lines and bands. You can override render method to render any HTML/SVG/canvas you want.

### Usage

```js
import Labels from '@gravity-ui/yagr/labels';

const yagr = new Yagr(document.body, {
    timline: [1, 2, 3],
    series: [{
        data: [1, 2, 3],
        id: 'my-series',
    }],
    plugins: [
        Labels({
            series: {
                draw: {
                    'my-series': {
                        labels: (x, y) => `${y}`
                    }
                }
            }  
        })
    ],
});

```

### Configuration

You can setup different labels for different series, scales, axes and plot lines and bands. To setup labels rendering condition you should use `draw`, `foces`, `cursor` predicate in configuration. For instance, following configurations says: 

```javascript
{
    scales: {
        draw: {
            y: {}
        }
    },
    series: {
        focus: {
            'my-series': {}
        }
    }
}
```
 - Render labels on `y` scale when series from `y` scale will be drawn
 - Render labels on `my-series` series, when `my-series` will be focused

Label settings:

-  `show?: boolean` - show label or not
-  `className?: string` - classname for label html element`
-  `position?: (xVal: number, y: number | null | undefined) => [x: number, y: number]` - position of label
-  `onRender?: (e: HTMLElement) => void` - on render callback`
-  `onDestroy?: (e: HTMLElement) => void` - on destroy callback`


Theres is 3 different types labels. You can use them in different combinations.
 
 - `draw` - render labels on draw
 - `focus` - render labels when series is focused
 - `cursor` - render labels when cursor x position is over series

#### Point labels

Point labels drawn over points, They can configured per scales or per series. 

Point label options: 

- `label?: (x: number, y: number | null | undefined) => string | undefined | null` - label text
- `render?: (yagr: Yagr, seriesIdx: number, xIdx: number, scale: string, label: PointLabel) => Clear` - custom render method

##### Per scales

Per scales setting enables labels for all series on given scale by given predicate (`draw` or `cursor`)

```javascript
{
    scales: {
        draw: {
            y: {
                label: (x, y) => `${y}`
            }
        },
        cursor: {
            r: {
                label: (x, y) => `${y}`
            
            }
        }
    }
}
```

##### Per series

Per series setting enables labels for given series by given predicate (`draw`, `cursor` or `focus`)

```javascript
{
    series: {
        draw: {
            'my-series': {
                label: (x, y) => `${y}`
            }
        },
        cursor: {
            'other-series': {
                label: (x, y) => `${x} - ${y}`
            
            }
        }
    }
}
```

#### Axis labels

Axis labels drawn on axes. They can configured per axes.

Axis label options:

- `value: number` - value of label (value on axis)
- `label: (a: AxisLabel) => string | undefined | null` - label text
- `render?: (yagr: Yagr, x: number, y: number, label: AxisLabel) => Clear` - custom render method

```javascript
{
    axes: {
        x: {
            labels: [
                {
                    value: 1,
                    label: (a) => `X = ${a.value}`
                },
                {
                    value: 2,
                    label: (a) => `X = ${a.value}`
                },
                {
                    value: 3,
                    label: (a) => `X = ${a.value}`
                }
            ]
        }
    }
}
```

#### Plot lines and bands labels

- `label: (band: PlotLineConfig) => string | undefined | null` - label text 
- `render?: (yagr: Yagr, plotLine: PlotLineConfig, x: number, y: number, label: PlotLabel) => Clear` - custom render method

```javascript
{
    plotLines: {
        x: [
            {
                label: (_, pline) => `X = ${pline.label}`
            },
        ]
    }
}
```
