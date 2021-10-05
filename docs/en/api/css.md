# CSS and named colors

Yagr supports CSS variables and CSS named color values (eg. `cyan`). One you should take an attention is that you CSS variable should be available to resolve in `yagr.root` HTML element:

```html
<div id="graph"></div>

<style>
    #graph {
        --custom-color: red;
    }
</style>
<script>
    new Yagr(window.graph, {
        timline: [1, 2, 3],
        series: [
            {
                data: [1, 2, 3],
                color: '--custom-color', // or var(--custom-color)
            },
        ],
    });
</script>
```
