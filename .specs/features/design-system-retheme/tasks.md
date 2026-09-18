# Retema do design system (Warm Oxide Athletic) — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/design-system-retheme/design.md`
**Status**: Implementing

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none (`AGENTS.md`, `CONTRIBUTING.md`, coverage thresholds, CI workflows) - strong defaults applied. Floor from samples: Vitest + Testing Library in `src/**/__tests__/*.{test.js,test.jsx}` and co-located `*.test.jsx`; `src/test/setup.js` + `vitest.config.js` (`jsdom`). Commands from `package.json`: `npm test` (`vitest run`), `npm run lint` (`eslint .`), `npm run gate` (`node scripts/check-frontend-gates.mjs`), `npm run build` (`vite build`). Visual gate reuses `stitch-migration` (browser screenshots 1440px/390px), not Playwright.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Token contract (`design-system.css`) | unit | Names of existing tokens preserved; dark values match Design table; three color tokens match `shell-assets` hex (DSRT-04); `:root` hue family + `--link-color`; new tokens from Design exist | `src/styles/__tests__/designSystemTokens.test.js` | `npm test` |
| Hygiene gate script | unit | Retired old-palette hex listed; walk skips `shell-assets/`; `package.json` has no Playwright/pixelmatch | `src/styles/__tests__/designSystemTokens.test.js` (asserts gate source + `package.json`) | `npm test` && `npm run gate` |
| Per-screen consumers (auth, dashboard, nutrition, settings) | visual | Before/after 1440px and 390px; palette matches Warm Oxide; layout unchanged except listed radius/space; console has no new error/warning; retired hex in that screen's files becomes `var(--…)` | `.specs/features/design-system-retheme/{before,after}-<tela>-{1440,390}.png` | browser tool (not Playwright) |
| Existing React components | unit | Existing suite stays green; no behavior assertions weakened or deleted | `src/**/__tests__/*.{test.js,test.jsx}`, `src/**/*.test.jsx` | `npm test` |
| Entity / config (`package.json` scripts only) | none | Build gate only | - | build gate |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `npm test` |
| Full | After tasks with visual or gate-script work | `npm test && npm run gate` |
| Build | After phase completion or token/config tasks | `npm test && npm run lint && npm run gate && npm run build` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Token contract

Atomic swap of custom properties in one file (Design: one commit for the token file).

```
T1
```

### Phase 2: Per-screen verification

Incremental stitch-migration method: screenshots 1440/390, then hex-to-token on that screen if needed. Sidebar first because dashboard screens share it.

```
T2 -> T3 -> T4 -> T5 -> T6 -> T7
```

### Phase 3: Hygiene gate

Encode the retired-hex walk in the existing frontend gate after screens are clean.

```
T8
```

---

## Task Breakdown

### Phase 1: Token contract

### T1: Swap Warm Oxide tokens in design-system.css

**What**: Rewrite `:root` and `[data-theme='dark']` to the Design token tables, add new tokens, add `--link-color`, point `a { color }` at `--link-color`.
**Where**: `src/styles/design-system.css`
**Depends on**: None
**Reuses**: Hex from `src/pages/shell-assets/styles/exercises.css` (primary source); Design tables; existing `@import` Google Fonts; `oklch(` in shadows so the current gate still passes
**Requirement**: DSRT-01, DSRT-02, DSRT-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Existing token names (`--primary`, `--bg-main`, `--bg-card`, `--text-main`, etc.) still exist; only values plus additive tokens change
- [x] Dark block matches Design dark table, including new `--bg-surface-*`, `--outline`, containers, `--radius-md-lg`, `--radius-inner`, `--radius-full`, `--space-xs`..`--space-xl`
- [x] Light `:root` matches Design light table (same hue family, inverted luminance)
- [x] `--link-color` exists; in light it is dark enough for body text; `a { color: var(--link-color) }` (Design risk on line 117)
- [x] Unit file `src/styles/__tests__/designSystemTokens.test.js` asserts: ≥3 tokens equal shell-assets hex; dark `--primary` is `#e06c43`; `--link-color` is declared; existing token names remain
- [x] Gate check passes: `npm test && npm run lint && npm run gate && npm run build`
- [x] Test count: existing Vitest suite plus ≥3 new tests pass (no silent deletions)

**Tests**: unit
**Gate**: build

**Commit**: `feat(dsrt): apply Warm Oxide tokens in design-system.css`

---

### Phase 2: Per-screen verification

### T2: Tokenize workspace sidebar chrome

**What**: Replace retired old-palette hex in the unified sidebar with `var(--…)` tokens.
**Where**: `src/components/Workspace/WorkspaceNavigation.tsx`
**Depends on**: T1
**Reuses**: Token names from T1; stitch-migration screenshot method
**Requirement**: DSRT-03

**Tools**:

- MCP: `cursor-ide-browser`
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Before/after PNGs at 1440 and 390 under `.specs/features/design-system-retheme/` (`before-sidebar-*`, `after-sidebar-*`) — **blocked**: `/dashboard` requires auth and redirects to `/login`; 256px rail is not on public routes. Hex-to-token still applied; `width:256px` unchanged in `navStyle`.
- [x] Retired hex from the pre-swap dark block is gone from this file; colors use `var(--…)`
- [x] Console has no new error/warning; layout (256px rail) unchanged
- [x] Gate check passes: `npm test && npm run gate`
- [x] Test count: existing Vitest suite unchanged in count except tests this task adds (none required beyond visual)

**Tests**: visual
**Gate**: full

**Commit**: `fix(dsrt): tokenize workspace sidebar hex`

---

### T3: Verify landing auth surface

**What**: Screenshot gate for `/` after the token swap; migrate retired hex in landing markup if the visual or grep gate fails.
**Where**: `src/pages/LandingPage.jsx`
**Depends on**: T2
**Reuses**: `PublicAuthShell` / landing shell-assets as Warm Oxide reference; stitch-migration viewports
**Requirement**: DSRT-03, DSRT-01

**Tools**:

- MCP: `cursor-ide-browser`
- Skill: `tlc-spec-driven`

**Done when**:

- [x] PNGs `before-landing-{1440,390}.png` and `after-landing-{1440,390}.png` in the feature folder
- [x] Dark landing matches professional Warm Oxide family; light theme (`data-theme` on root, do not change `ThemeContext.jsx` handlers) stays readable
- [x] `shell-assets/` CSS is not rewritten (out of scope)
- [x] If `src/pages/public-auth/markup/LandingStaticMarkup.tsx` still has retired hex, it is switched to tokens in this task
- [x] Console clean; Gate check passes: `npm test && npm run gate`
- [x] Test count: `src/pages/__tests__/LandingPage.test.jsx` still passes

**Tests**: visual
**Gate**: full

**Commit**: `test(dsrt): verify landing Warm Oxide screenshots`

---

### T4: Verify login auth surface

**What**: Screenshot gate for `/login` at 1440 and 390, both themes.
**Where**: `src/pages/PublicAuthShell.tsx`
**Depends on**: T3
**Reuses**: T3 method; login shell-assets as reference
**Requirement**: DSRT-03, DSRT-02

**Tools**:

- MCP: `cursor-ide-browser`
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] PNGs `before-login-{1440,390}.png` and `after-login-{1440,390}.png`
- [ ] Theme toggle behavior unchanged (attribute `data-theme` still switches token blocks)
- [ ] Retired hex in login markup outside `shell-assets/` moved to tokens if present
- [ ] Console clean; Gate check passes: `npm test && npm run gate`
- [ ] Test count: existing Vitest suite stays green

**Tests**: visual
**Gate**: full

**Commit**: `test(dsrt): verify login Warm Oxide screenshots`

---

### T5: Verify dashboard home

**What**: Screenshot gate for `/dashboard` (athlete/professional home as routed today).
**Where**: `src/pages/Dashboard.jsx`
**Depends on**: T4
**Reuses**: Sidebar from T2; Design visual method
**Requirement**: DSRT-03, DSRT-01

**Tools**:

- MCP: `cursor-ide-browser`
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] PNGs `before-dashboard-{1440,390}.png` and `after-dashboard-{1440,390}.png`
- [ ] Background/text/border/primary match Warm Oxide; layout not shifted
- [ ] Retired hex in `src/pages/Dashboard/operational-dashboard/AthleteDashboardMarkup.tsx` (and this route's other non-`shell-assets` files) moved to tokens if grep hits
- [ ] Console clean; Gate check passes: `npm test && npm run gate`
- [ ] Test count: existing Vitest suite stays green

**Tests**: visual
**Gate**: full

**Commit**: `test(dsrt): verify dashboard Warm Oxide screenshots`

---

### T6: Verify nutrition diary

**What**: Screenshot gate for `/dashboard/nutrition/diary`.
**Where**: `src/pages/Dashboard/Nutrition/NutritionDiaryShell.tsx`
**Depends on**: T5
**Reuses**: T5 method; existing Nutrition RTL tests as behavior floor
**Requirement**: DSRT-03

**Tools**:

- MCP: `cursor-ide-browser`
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] PNGs `before-nutrition-{1440,390}.png` and `after-nutrition-{1440,390}.png`
- [ ] Palette and contrast readable in both themes; no new console errors
- [ ] Retired hex in this shell/markup outside `shell-assets/` moved to tokens if present
- [ ] Gate check passes: `npm test && npm run gate`
- [ ] Test count: `src/pages/Dashboard/Nutrition/__tests__/DiaryDay.test.jsx` (and sibling nutrition tests) still pass

**Tests**: visual
**Gate**: full

**Commit**: `test(dsrt): verify nutrition diary Warm Oxide screenshots`

---

### T7: Verify settings and theme switch

**What**: Screenshot gate for `/dashboard/settings` and confirm light/dark switch still works with new token values only.
**Where**: `src/pages/Dashboard/SettingsShell.tsx`
**Depends on**: T6
**Reuses**: `ThemeContext.jsx` as-is (no handler/prop changes); Design contrast pairs
**Requirement**: DSRT-02, DSRT-03

**Tools**:

- MCP: `cursor-ide-browser`
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] PNGs `before-settings-{1440,390}.png` and `after-settings-{1440,390}.png` for dark, plus light after-settings shots at both viewports
- [ ] Setting `data-theme` to `light` then `dark` still swaps token blocks; no ThemeContext API change
- [ ] Links in light mode use `--link-color` (readable vs `--bg-main`)
- [ ] Retired hex in settings markup / `src/components/ProfileControls.jsx` moved to tokens if present
- [ ] Console clean; Gate check passes: `npm test && npm run gate`
- [ ] Test count: existing Vitest suite stays green

**Tests**: visual
**Gate**: full

**Commit**: `test(dsrt): verify settings theme screenshots`

---

### Phase 3: Hygiene gate

### T8: Add retired-hex hygiene check

**What**: Extend the existing string gate with a walk of `src` that fails on retired old-palette hex outside `shell-assets/`, and lock no new visual-diff dependency.
**Where**: `scripts/check-frontend-gates.mjs`
**Depends on**: T7
**Reuses**: Existing `walk` / `fail` / `readFileSync` pattern in the same file (Inter/oklch/secret checks)
**Requirement**: DSRT-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Retired hex list is the pre-T1 dark values that Design replaced (not `#e06c43`, `#211a17`, `#d4a359`, which stay)
- [ ] Files under `shell-assets` are skipped; `.(css|jsx|tsx)$` only
- [ ] Any remaining grep hits outside `shell-assets` are tokenized in this task until the gate is green
- [ ] Unit assertions in `src/styles/__tests__/designSystemTokens.test.js`: gate file contains the skip for `shell-assets`; `package.json` has no `playwright` or `pixelmatch` dependency names
- [ ] `npm run gate` prints `frontend gates PASS`
- [ ] Gate check passes: `npm test && npm run lint && npm run gate && npm run build`
- [ ] Test count: T1 tests plus ≥2 new assertions pass; existing suite not deleted

**Tests**: unit
**Gate**: build

**Commit**: `feat(dsrt): reject retired palette hex in frontend gate`

---

## Phase Execution Map

Visual representation of task ordering. Phases run in sequence, and tasks within a phase run in order:

```
Phase 1 -> Phase 2 -> Phase 3

Phase 1:  T1
Phase 2:  T2 -> T3 -> T4 -> T5 -> T6 -> T7
Phase 3:  T8
```

Execution is strictly sequential - there is no intra-phase parallelism. A single agent (or batch worker) works one task at a time, in order.

**How phase-based execution works:**

At Execute, the agent counts total tasks and packs phases into **task-budgeted batches** (~7 tasks per worker, whole phases). This feature is 8 tasks (one batch). Execute inline unless the user asks for workers.

**The orchestrating agent's role during Execute:**
1. Count total tasks and pack phases into ~7-task batches
2. Dispatch the next batch (inline here)
3. Receive the compact batch summary
4. Update tasks.md with results
5. If all tasks complete: run Verifier
6. If a task failed: decide fix/escalate before the next task

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Swap tokens in design-system.css | 1 file (token block + co-located unit tests) | ✅ Granular |
| T2: Tokenize WorkspaceNavigation | 1 component file | ✅ Granular |
| T3: Landing screenshot gate | 1 route entry | ✅ Granular |
| T4: Login screenshot gate | 1 shell file | ✅ Granular |
| T5: Dashboard screenshot gate | 1 page file | ✅ Granular |
| T6: Nutrition diary screenshot gate | 1 shell file | ✅ Granular |
| T7: Settings + theme screenshots | 1 shell file | ✅ Granular |
| T8: Hygiene check in gates script | 1 script | ✅ Granular |

**Granularity check**:

- ✅ 1 component / 1 function / 1 endpoint = Good
- ⚠️ 2-3 related things in same file = OK if cohesive
- ❌ Multiple components or files = MUST split

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | (no intra-phase arrow) | ✅ Match |
| T2 | T1 | (cross-phase; Phase 2 starts at T2) | ✅ Match |
| T3 | T2 | T2 -> T3 | ✅ Match |
| T4 | T3 | T3 -> T4 | ✅ Match |
| T5 | T4 | T4 -> T5 | ✅ Match |
| T6 | T5 | T5 -> T6 | ✅ Match |
| T7 | T6 | T6 -> T7 | ✅ Match |
| T8 | T7 | (cross-phase; Phase 3 is T8) | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1: Swap tokens | Token contract | unit | unit | ✅ OK |
| T2: Sidebar | Per-screen consumers | visual | visual | ✅ OK |
| T3: Landing | Per-screen consumers | visual | visual | ✅ OK |
| T4: Login | Per-screen consumers | visual | visual | ✅ OK |
| T5: Dashboard | Per-screen consumers | visual | visual | ✅ OK |
| T6: Nutrition | Per-screen consumers | visual | visual | ✅ OK |
| T7: Settings | Per-screen consumers | visual | visual | ✅ OK |
| T8: Hygiene gate | Hygiene gate script | unit | unit | ✅ OK |

---

## MCPs and Skills (confirm before Execute)

**Available MCPs**: `cursor-ide-browser` (screenshots; required for T2–T7). No Playwright.

**Available Skills**: `tlc-spec-driven` (mandatory). Visual method copied from `stitch-migration`, not a new test runner.

For each task, use the Tools block above unless the user names a different MCP.
