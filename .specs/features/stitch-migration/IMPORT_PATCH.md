# Import patches — stitch migration

## T11 — `Messages.jsx` → `MessagesShell.tsx`

`App.jsx` imported the **same default export twice** under different local names. Both routes delegate to `StitchMessages` in `MessagesShell.tsx`.

| Route | Before | After |
| --- | --- | --- |
| `/dashboard/feedback` | `import Feedback from './stitch/Messages';` | `import { StitchFeedback as Feedback } from './pages/Dashboard/MessagesShell';` |
| `/dashboard/messages` | `import Messages from './stitch/Messages';` | `import StitchMessages from './pages/Dashboard/MessagesShell';` |

**Note:** `stitch/Messages.jsx` default export was `StitchMessages` (not a separate Feedback component). The feedback route name was misleading; `StitchFeedback` is an explicit alias of the same shell for documentation clarity.

**Pixel parity:** `/dashboard/messages` (and pro/gym `/dashboard/feedback` stitch view) at **1440×** and **390×** viewports — dev server port **5191** (`npm run dev -- --port 5191`).
