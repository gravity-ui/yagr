# Scale Values API Documentation

## Overview

Yagr now provides functionality to retrieve real min/max values from chart scales. This is useful for:

- Displaying scale ranges in UI
- Synchronizing multiple charts
- Storing current zoom levels
- Implementing custom zoom controls
- Reacting to scale changes

## Methods

### `getScales(scaleName?: string)`

Retrieves the current min/max values for chart scales.

**Parameters:**

- `scaleName` (optional): The name of a specific scale to retrieve (e.g., 'y', 'x', 'y2'). If not provided, returns all scales.

**Returns:**

```typescript
Record<string, {min: number; max: number}>;
```

**Example - Get all scales:**

```javascript
const yagr = new Yagr(element, config);

// Get all scales
const scales = yagr.getScales();
console.log(scales);
// Output: { x: { min: 0, max: 49000 }, y: { min: 0, max: 15 } }
```

**Example - Get specific scale:**

```javascript
// Get only Y scale
const yScale = yagr.getScales('y');
console.log(yScale);
// Output: { y: { min: 0, max: 15 } }
```

## Hooks

### `scaleUpdate` Hook

This hook is triggered whenever scales are updated, including:

- When data changes
- When using `setScales()` method
- When zooming in/out
- On initial render

**Hook Signature:**

```typescript
scaleUpdate?: HookHandler<{
    scales: Record<string, {min: number; max: number}>;
}>
```

**Example:**

```javascript
const yagr = new Yagr(element, {
  timeline: [
    /* ... */
  ],
  series: [
    /* ... */
  ],
  hooks: {
    scaleUpdate: [
      ({scales, chart}) => {
        console.log('Scales updated:', scales);
        // scales = { x: { min: 0, max: 49000 }, y: { min: 0, max: 15 } }

        // You can access the chart instance
        console.log('Chart ID:', chart.id);
      },
    ],
  },
});
```

## Use Cases

### 1. Display Scale Range in UI

```javascript
const displayScaleInfo = (scales) => {
  const infoPanel = document.getElementById('scale-info');
  let html = '';
  for (const [name, values] of Object.entries(scales)) {
    html += `<div>${name}: ${values.min} to ${values.max}</div>`;
  }
  infoPanel.innerHTML = html;
};

const yagr = new Yagr(element, {
  // ... config
  hooks: {
    scaleUpdate: [({scales}) => displayScaleInfo(scales)],
    load: [({chart}) => displayScaleInfo(chart.getScales())],
  },
});
```

### 2. Synchronize Multiple Charts

```javascript
const charts = [];

// Create first chart
const yagr1 = new Yagr(element1, {
  // ... config
  hooks: {
    scaleUpdate: [
      ({scales}) => {
        // When this chart's scale changes, update other charts
        charts.forEach((chart) => {
          if (chart !== yagr1) {
            chart.setScales({y: scales.y});
          }
        });
      },
    ],
  },
});

// Create second chart with same behavior
const yagr2 = new Yagr(element2, {
  // ... config
  hooks: {
    scaleUpdate: [
      ({scales}) => {
        charts.forEach((chart) => {
          if (chart !== yagr2) {
            chart.setScales({y: scales.y});
          }
        });
      },
    ],
  },
});

charts.push(yagr1, yagr2);
```

### 3. Store and Restore Zoom State

```javascript
const yagr = new Yagr(element, {
  // ... config
  hooks: {
    scaleUpdate: [
      ({scales}) => {
        // Auto-save scale state
        localStorage.setItem('chartScales', JSON.stringify(scales));
      },
    ],
  },
});

// Restore button
document.getElementById('restore').onclick = () => {
  const saved = localStorage.getItem('chartScales');
  if (saved) {
    const scales = JSON.parse(saved);
    yagr.setScales(scales);
  }
};

// Reset button
document.getElementById('reset').onclick = () => {
  yagr.setScales({y: {min: null, max: null}});
};
```

### 4. Custom Zoom Controls

```javascript
const yagr = new Yagr(element, config);

document.getElementById('zoom-in').onclick = () => {
  const scales = yagr.getScales();
  const range = scales.y.max - scales.y.min;
  const center = (scales.y.max + scales.y.min) / 2;

  // Zoom in by reducing range by 50%
  const newRange = range * 0.5;
  yagr.setScales({
    y: {
      min: center - newRange / 2,
      max: center + newRange / 2,
    },
  });
};

document.getElementById('zoom-out').onclick = () => {
  const scales = yagr.getScales();
  const range = scales.y.max - scales.y.min;
  const center = (scales.y.max + scales.y.min) / 2;

  // Zoom out by increasing range by 200%
  const newRange = range * 2;
  yagr.setScales({
    y: {
      min: center - newRange / 2,
      max: center + newRange / 2,
    },
  });
};

document.getElementById('reset-zoom').onclick = () => {
  // Reset to auto scale
  yagr.setScales({y: {min: null, max: null}});
};
```

### 5. Monitor Changes for Analytics

```javascript
const yagr = new Yagr(element, {
  // ... config
  hooks: {
    scaleUpdate: [
      ({scales}) => {
        // Send analytics about zoom
        analytics.track('chart_scale_changed', {
          y_min: scales.y.min,
          y_max: scales.y.max,
          range: scales.y.max - scales.y.min,
        });
      },
    ],
  },
});
```

## Important Notes

- The `getScales()` method returns the actual rendered scale values from uPlot, which may differ from the configured values due to nice scaling or other scale transformations.
- Scale values are always numeric, even for time scales (values are in milliseconds/seconds depending on `timeMultiplier`).
- The `scaleUpdate` hook fires after the scale has been updated and the chart has been redrawn.
- For time-based X scales, the min/max values are in the chart's time units (milliseconds by default, or seconds if `timeMultiplier: 1e-3`).
- If the chart is not yet initialized, `getScales()` will return an empty object `{}`.

## Demo

A complete working example is available in `demo/examples/get-scales.html`, which includes:

- Real-time display of current scale values
- Buttons for scale manipulation
- Change logging
- Various usage scenarios

To run the demo:

```bash
npm run build
open demo/examples/get-scales.html
```

## Implementation Details

### Modified Files:

1. **src/YagrCore/index.ts** - Added `getScales()` method to Yagr class
2. **src/YagrCore/types.ts** - Added `ScaleUpdateHandlerArg` type and `scaleUpdate` hook to `InternalYargHooks`
3. **src/YagrCore/mixins/create-options.ts** - Registered `setScale` hook in uPlot options

### Type Definitions:

```typescript
// In Yagr class
getScales(scaleName?: string): Record<string, {min: number; max: number}>

// Hook type
export type ScaleUpdateHandlerArg = CommonHookHandlerArg<{
    scales: Record<string, {min: number; max: number}>;
}>;

// In YagrConfig
hooks: {
    scaleUpdate?: HookHandler<{scales: Record<string, {min: number; max: number}>}>;
    // ... other hooks
}
```

## See Also

- [setScales() method](./docs/en/api/methods.md#setscales)
- [Scales configuration](./docs/en/api/scales.md)
- [Hooks API](./docs/en/api/lifecycle.md)
