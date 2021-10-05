## Cursor

Yagr allows to setup chart's cursor behavior. You can configure crosshairs, markers size and count, and snapping behavior.

## Configuration

### Value snaping

`cursor.snapToValues?: SnapToValue | false`

```ts
type SnapToValue = 'left' | 'right' | 'closest';
```

Snap to values allows to render markers only on existing points on timeline. If cursor points to value X value on which Y has null with `snapToValues` you can configure which real point to highligh with marker.

-   `'left'` - finds nearest non-null value to the left
    ![Snap to left](../../assets/snap-left.png =600x100%)

-   `'right'` - finds nearest non-null value to the right
    ![Snap to right](../../assets/snap-right.png =600x100%)

-   `'closest'` - finds nearest non-null

-   `false` - doesn't snaping to non-null values
    ![Without snapping](../../assets/snap-false.png =600x100%)

### Markers

-   `cursor.markersSize?: number`

Radius of markers.

-   `cursor.maxMarkers?: number`

Maximal count of markers. If count of lines > `maxMarkers`, then markers don't drawing.

### Crosshairs

You can set X and Y crosshairs in cursor options:

```js
cursor: {
    x: {visible: true, style: '1px solid red'},
    y: {visible: true, style: '1px dash grey'},
},
```
