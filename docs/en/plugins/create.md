## Creating plugin

Yagr allows you to create your own plugins. All plugins should match to type `YagrPlugin<PluginInterface>`, where `PluginInterface` is a interface which describes plugin methods and fields despite of `uplot` which required anyway.

### Example

```ts
import Yagr from 'yagr';

function MyAwesomePlugin(yagr: Yagr) {
    let drawCount = 0;
    return {
        getRedrawCount() {
            return drawCount;
        },
        redraw() {
            yagr.uplot.redraw();
        },
        uplot: {
            hooks: {
                draw: () => {
                    drawCount++;
                    console.log('Chart is drawn');
                },
            },
        },
    };
}

const yagr = new Yagr(document.body, {
    timline: [1, 2, 3],
    series: [{data: [1, 2, 3]}],
    plugins: {
        awesome: MyAwesomePlugin,
    },
});

yagr.plugins.awesome.getRedrawCount();
```
