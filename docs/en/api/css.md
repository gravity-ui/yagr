# CSS and named colors

Yagr supports CSS variables and CSS named color values (for example, `cyan`). One thing to note is that your CSS variable should be available for resolution in the `yagr.root` HTML element:

```html
<div id="graph"></div>

<style>
    #graph {
        --custom-color: red;
    }
</style>
<script>
    new Yagr(window.graph, {
        timeline: [1, 2, 3],
        series: [
            {
                data: [1, 2, 3],
                color: '--custom-color', // or var(--custom-color)
            },
        ],
    });
</script>
```
