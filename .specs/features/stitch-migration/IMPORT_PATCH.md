# Import path patches (stitch-migration)

Canonical implementations move out of `src/stitch/`; legacy paths stay as thin re-exports until screen tasks update imports.

## T7 — `useHydration`

| Consumer | Import (unchanged) | Resolves to |
| --- | --- | --- |
| `src/stitch/Nutrition.jsx` | `./useHydration` | `src/hooks/useHydration.ts` via `src/stitch/useHydration.js` |
| `src/stitch/OperationalPages.jsx` | `./useHydration` | same |

**Preferred import after stitch screens migrate:** `import useHydration from '../hooks/useHydration'` (or path-relative equivalent).

## T13 — Nutrition diary shell

| Consumer | Old import | New import |
| --- | --- | --- |
| `src/App.jsx` | `./stitch/Nutrition` (default export used as diary route) | `./pages/Dashboard/Nutrition/NutritionDiaryShell` |
| `src/stitch/Nutrition.jsx` | full `sourceRuntime` implementation | re-export from `../pages/Dashboard/Nutrition/NutritionDiaryShell` |
| `src/pages/Dashboard/Nutrition/NutritionDiaryShell.tsx` | — | `./DiaryDay` (logic container), `../../../stitch/Workspace`, `../../../stitch/HistoryChart`, `../../../stitch/useHydration` |

**Note:** `DiaryDay.jsx` remains the domain data layer; the stitch visual shell lives in `NutritionDiaryShell.tsx`.
