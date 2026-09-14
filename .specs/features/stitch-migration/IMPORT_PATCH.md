# App.jsx import patch (T10 — Gyms)

`App.jsx` can keep the existing import; `src/stitch/Gyms.jsx` re-exports the native shell:

```jsx
import ExploreGyms from './stitch/Gyms';
```

Optional direct import (apply when cleaning stitch shims):

```diff
-import ExploreGyms from './stitch/Gyms';
+import ExploreGyms from './pages/Dashboard/GymsExploreShell';
```

Route stays unchanged:

```jsx
<Route path="gyms" element={<ExploreGyms />} />
```
