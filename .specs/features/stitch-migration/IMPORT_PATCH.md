# Import path patches (stitch-migration)

## T9 — Exercises shell

Apply in `src/App.jsx`:

```diff
-import Exercises from './stitch/Exercises';
+import Exercises from './pages/Dashboard/ExercisesShell';
```

Until this patch is applied, `src/stitch/Exercises.jsx` re-exports `../pages/Dashboard/ExercisesShell` so the legacy import keeps working.
