# T5 — Layout import patch (Workspace navigation)

## `src/components/Layout.jsx`

**Before**

```javascript
import { WorkspaceNavigation as Sidebar } from '../stitch/Workspace';
```

**After**

```javascript
import { WorkspaceNavigation as Sidebar } from './Workspace/WorkspaceNavigation';
```

## Notes

- `WorkspaceNavigation` is implemented in `src/components/Workspace/WorkspaceNavigation.tsx` (native TSX, no `sourceRuntime` / `StitchTemplate`).
- `src/stitch/Workspace.jsx` remains as a thin re-export (`export { WorkspaceNavigation }`) plus the default `Workspace` shell for unconverted `stitch/*.jsx` screens.
