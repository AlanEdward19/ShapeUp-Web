# Import path patches (stitch-migration)

Canonical implementations move out of `src/stitch/`; legacy paths stay as thin re-exports until screen tasks update imports.

## T7 — `useHydration`

| Consumer | Import (unchanged) | Resolves to |
| --- | --- | --- |
| `src/stitch/Nutrition.jsx` | `./useHydration` | `src/hooks/useHydration.ts` via `src/stitch/useHydration.js` |
| `src/stitch/OperationalPages.jsx` | `./useHydration` | same |

**Preferred import after stitch screens migrate:** `import useHydration from '../hooks/useHydration'` (or path-relative equivalent).
