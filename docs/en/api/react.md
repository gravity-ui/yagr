# React

Yagr exports default React wrapper. You can import it as:

```tsx
import {YagrConfig} from 'yagr/react';
import YagrComponent from 'yagr/react';

function App({config}: {config: YagrConfig}) {
    return <YagrComponent config={config} />;
}
```
