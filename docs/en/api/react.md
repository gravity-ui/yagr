# React

Yagr exports default React wrapper. You can import it as:

```tsx
import {YagrConfig} from '@gravity-ui/yagr';
import YagrComponent from '@gravity-ui/yagr/dist/react';

function App({config}: {config: YagrConfig}) {
    return <YagrComponent config={config} />;
}
```

### React tooltip

Yagr exports helper for custom tooltips in React. See example in our [React Tooltip example](https://github.com/gravity-ui/yagr/blob/main/demo/examples/react/react-tooltip.html).
