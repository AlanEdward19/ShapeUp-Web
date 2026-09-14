# App.jsx — Settings import (optional)

`App.jsx` can keep the existing import; `src/stitch/Settings.jsx` re-exports the native shell:

```jsx
import Settings from './stitch/Settings';
```

To import the shell directly (same runtime component):

```diff
-import Settings from './stitch/Settings';
+import Settings from './pages/Dashboard/SettingsShell';
```

No other `App.jsx` changes are required for T16.
