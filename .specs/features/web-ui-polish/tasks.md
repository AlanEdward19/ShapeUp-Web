# Web UI Polish Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/web-ui-polish/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none for coverage thresholds (`vitest.config.js` has no `coverage` block; `README.md` is the Vite template; no `AGENTS.md` / `CONTRIBUTING.md`). Strong defaults applied. Style/location floor from samples: `src/pages/Dashboard/Nutrition/__tests__/*.test.jsx`, `src/pages/__tests__/LegalAndNotFound.test.jsx`, `src/pages/public-auth/Usability.test.jsx`, `src/pages/Dashboard/__tests__/MessagesShell.test.jsx`, `src/components/shared/__tests__/Card.test.jsx`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| UI primitive (`Skeleton`) | unit | All variants; `role="status"`; reduced-motion does not require pulse; listed edge (generic size) | `src/components/__tests__/Skeleton.test.tsx` | `npm test` |
| Nutrition pages (diary/foods/plans/goal) | unit | 1:1 to POL-01/POL-02 ACs touched by the file; loading → skeleton; error → alert not stuck skeleton; empty ≠ error | `src/pages/Dashboard/Nutrition/__tests__/*.test.jsx` | `npm test` |
| Nutrition shell (shadow host + nav) | unit | POL-01: nav on all 4 routes, active tab, nav node identity across tab clicks, direct URL; Suspense fallback uses Skeleton | `src/pages/Dashboard/Nutrition/__tests__/NutritionWorkspaceShell.test.jsx` | `npm test` |
| Layout bypass | unit | Paths `/dashboard/nutrition/*` do not render `.su-layout-content` chrome | `src/components/__tests__/Layout.nutrition.test.jsx` | `npm test` |
| Legal page | unit | POL-03 AC1: no `transform`/`scale` on `.su-legal`; body text uses 1rem / line-height ≥ 1.5 | `src/pages/__tests__/LegalAndNotFound.test.jsx` | `npm test` |
| Recovery / auth markup | unit | POL-03 AC2–AC4: `AuthBrand` / `.st-auth-brand`; shell body `bg-brand-bg`; primary submit tokens; secondary stays distinct | `src/pages/public-auth/Usability.test.jsx` | `npm test` |
| Manifest / CSS tokens | unit | Asserted via Recovery host class (`bg-brand-bg`), not a raw JSON parser test | same Usability test | `npm test` |
| Entity / config only | none | Build gate | — | build gate |

## Gate Check Commands

> Generated from codebase (`package.json` scripts: `test` = `vitest run`, `lint` = `eslint .`, `gate` = `node scripts/check-frontend-gates.mjs`, `build` = `vite build`). Confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `npm test` |
| Full | After tasks that touch pages/shell/CSS used in several suites | `npm test && npm run lint` |
| Build | After phase completion or manifest/config | `npm test && npm run lint && npm run gate && npm run build` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Skeleton primitive

```
T1
```

### Phase 2: Nutrition shell unification

```
T2 -> T3 -> T4 -> T5 -> T6 -> T7 -> T8 -> T9
```

### Phase 3: Skeleton on nutrition screens

```
T10 -> T11 -> T12 -> T13 -> T14
```

### Phase 4: Localized CSS / auth polish

```
T15 -> T16 -> T17 -> T18
```

---

## Task Breakdown

### Phase 1: Skeleton primitive

### T1: Create Skeleton primitive

**What**: Add reusable `Skeleton` with variants `text` | `card` | `list` | `table` and pulse CSS (no third-party lib).
**Where**: `src/components/Skeleton.tsx`
**Depends on**: None
**Reuses**: `src/components/shared/__tests__/Card.test.jsx` RTL style; tokens `--bg-card`
**Requirement**: POL-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `Skeleton` exports default component with `variant`, optional `rows`, `className`
- [x] `role="status"`, `aria-busy="true"`, `data-testid="skeleton"`, `data-variant`
- [x] Pulse respects `prefers-reduced-motion` (no extra animation under reduce)
- [x] Unit tests cover all 4 variants
- [x] Gate check passes: `npm test`
- [x] Test count: existing suite plus ≥4 new tests (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### Phase 2: Nutrition shell unification

### T2: Add NutritionWorkspaceShell

**What**: Create the persistent nutrition parent: `WorkspaceShellPage`, one `NutritionNav`, `Suspense` fallback `Skeleton`, pathname outlet cache.
**Where**: `src/pages/Dashboard/Nutrition/NutritionWorkspaceShell.tsx`
**Depends on**: T1
**Reuses**: `WorkspaceShellPage`, `NutritionNav`, `DashboardShellHost` `css` extra, `MessagesShell.test.jsx` shadow queries
**Requirement**: POL-01, POL-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Injects `Nutrition.css?inline` plus `:host,.shell-body` token bridge (dark DS custom properties)
- [x] Moves diary overflow CSS (`article table{min-width:520px}` / mobile `pl-64`) into this host `css`
- [x] Tests render nested routes for the 4 paths; `nutrition-nav` is in the shadow root; active tab matches path; clicking another tab keeps the same nav node (no remount); Suspense fallback is `skeleton`
- [x] Gate check passes: `npm test`
- [x] Test count: existing suite plus ≥3 new tests (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### T3: Bypass Layout chrome for all nutrition paths

**What**: Skip the old Sidebar/Header wrapper for every `/dashboard/nutrition*` path, not only diary.
**Where**: `src/components/Layout.jsx`
**Depends on**: T2
**Reuses**: existing pathname allow-list at `Layout.jsx`
**Requirement**: POL-01

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Prefix `/dashboard/nutrition` bypasses `.su-layout-wrapper`
- [x] Non-nutrition dashboard paths still use the old chrome
- [x] Tests cover diary, foods, meal-plans, goal
- [x] Gate check passes: `npm test`
- [x] Test count: existing suite plus ≥2 new tests (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### T4: Nest nutrition routes and lazy-load children

**What**: Wire `NutritionWorkspaceShell` as parent of the 4 existing URLs and lazy-load the child pages.
**Where**: `src/App.jsx`
**Depends on**: T3
**Reuses**: current path strings; `React.lazy` / `Suspense` already specified on the parent
**Requirement**: POL-01, POL-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Routes are `nutrition` → shell, children `diary|foods|meal-plans|goal` with the same public URLs
- [x] Child pages are `React.lazy` imports
- [x] Direct URL to each of the 4 still renders (covered by shell tests + this wiring)
- [x] Gate check passes: `npm test && npm run lint`
- [x] Test count: existing suite does not drop (no silent deletions)

**Tests**: unit
**Gate**: full

---

### T5: Unwrap WorkspaceShellPage from diary shell

**What**: `NutritionDiaryShell` / `NutritionDiaryView` render content only; they no longer mount `WorkspaceShellPage`.
**Where**: `src/pages/Dashboard/Nutrition/NutritionDiaryShell.tsx`
**Depends on**: T4
**Reuses**: `DiaryDay` `renderView` contract
**Requirement**: POL-01

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] File has no `WorkspaceShellPage` import/usage
- [ ] Add-food still navigates to `/dashboard/nutrition/foods?...`
- [ ] Gate check passes: `npm test`
- [ ] Test count: existing suite does not drop (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### T6: Remove NutritionNav from FoodSearch

**What**: Stop rendering `NutritionNav` inside `FoodSearch`; keep page tests without asserting nav on the child.
**Where**: `src/pages/Dashboard/Nutrition/FoodSearch.jsx`
**Depends on**: T5
**Reuses**: `FoodSearch.test.jsx`
**Requirement**: POL-01

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] No `NutritionNav` import/render
- [ ] `FoodSearch.test.jsx` no longer expects `nutrition-nav` on the isolated page
- [ ] Search/empty/barcode tests still pass
- [ ] Gate check passes: `npm test`
- [ ] Test count: existing suite does not drop (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### T7: Remove NutritionNav from MealPlanManager

**What**: Stop rendering `NutritionNav` inside `MealPlanManager`.
**Where**: `src/pages/Dashboard/Nutrition/MealPlanManager.jsx`
**Depends on**: T6
**Reuses**: `MealPlanManager.test.jsx`
**Requirement**: POL-01

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] No `NutritionNav` import/render
- [ ] Create/activate tests still pass
- [ ] Gate check passes: `npm test`
- [ ] Test count: existing suite does not drop (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### T8: Remove NutritionNav from GoalOnboarding

**What**: Stop rendering `NutritionNav` inside `GoalOnboarding`.
**Where**: `src/pages/Dashboard/Nutrition/GoalOnboarding.jsx`
**Depends on**: T7
**Reuses**: `GoalOnboarding.test.jsx`
**Requirement**: POL-01

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] No `NutritionNav` import/render
- [ ] TDEE and manual-goal tests still pass
- [ ] Gate check passes: `npm test`
- [ ] Test count: existing suite does not drop (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### T9: Remove NutritionNav from DiaryDay fallback

**What**: Remove `NutritionNav` from the non-`renderView` markup so the fallback page is not a second shell.
**Where**: `src/pages/Dashboard/Nutrition/DiaryDay.jsx`
**Depends on**: T8
**Reuses**: `DiaryDay.test.jsx`
**Requirement**: POL-01

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Fallback markup has no `NutritionNav`
- [ ] Existing meal/empty/remove tests still pass
- [ ] Gate check passes: `npm test && npm run lint`
- [ ] Test count: existing suite does not drop (no silent deletions)

**Tests**: unit
**Gate**: full

---

### Phase 3: Skeleton on nutrition screens

### T10: DiaryDay load error and skeleton contract

**What**: Expose `loadError` + retry; show Skeleton in the fallback view while `loading && !diary`; never treat API failure as an empty day.
**Where**: `src/pages/Dashboard/Nutrition/DiaryDay.jsx`
**Depends on**: T1, T9
**Reuses**: `useNutritionApi` mocks in `DiaryDay.test.jsx`
**Requirement**: POL-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `renderView` receives `loadError` and `loadData`
- [ ] Catch no longer sets a fake empty diary
- [ ] Fallback: skeleton while loading without data; alert + retry on error
- [ ] Tests: delayed fetch shows `skeleton`; rejected fetch shows alert not empty ledger; retry calls `getDiaryDay` again
- [ ] Gate check passes: `npm test`
- [ ] Test count: existing suite plus ≥3 new tests (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### T11: Diary shell Skeleton and error UI

**What**: Replace "Carregando diário…" with table/card `Skeleton`; show `loadError` + retry; keep nav unaffected (parent).
**Where**: `src/pages/Dashboard/Nutrition/NutritionDiaryShell.tsx`
**Depends on**: T10
**Reuses**: `Skeleton` table/card variants; `loadError` from T10
**Requirement**: POL-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Loading without diary data renders `data-testid="skeleton"` with table or card variant
- [ ] Error renders explicit message + retry control
- [ ] Success still renders meals; empty day still empty (not error)
- [ ] Gate check passes: `npm test`
- [ ] Test count: existing suite plus ≥2 new tests (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### T12: FoodSearch list Skeleton

**What**: While search/barcode loading, render list `Skeleton` instead of only "Searching…" copy; keep existing error/empty states.
**Where**: `src/pages/Dashboard/Nutrition/FoodSearch.jsx`
**Depends on**: T11
**Reuses**: `FoodSearch.test.jsx` delayed mocks
**Requirement**: POL-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Loading results region shows `skeleton` `data-variant="list"`
- [ ] Failure still `role="alert"`; skeleton is gone
- [ ] Tests cover slow search and failed search
- [ ] Gate check passes: `npm test`
- [ ] Test count: existing suite plus ≥2 new tests (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### T13: MealPlanManager card Skeleton

**What**: While create/activate `loading`, show card `Skeleton` on the active sheet instead of leaving stale content as the only cue.
**Where**: `src/pages/Dashboard/Nutrition/MealPlanManager.jsx`
**Depends on**: T12
**Reuses**: `MealPlanManager.test.jsx`
**Requirement**: POL-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Pending create/activate shows `skeleton` card variant
- [ ] Error still `role="alert"`; skeleton clears
- [ ] Tests cover delayed create
- [ ] Gate check passes: `npm test`
- [ ] Test count: existing suite plus ≥1 new test (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### T14: GoalOnboarding card Skeleton

**What**: While onboarding/manual save `loading`, show card `Skeleton` on the active form.
**Where**: `src/pages/Dashboard/Nutrition/GoalOnboarding.jsx`
**Depends on**: T13
**Reuses**: `GoalOnboarding.test.jsx`
**Requirement**: POL-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Pending submit shows `skeleton` card variant
- [ ] Error still `role="alert"`; skeleton clears
- [ ] Tests cover delayed TDEE submit
- [ ] Gate check passes: `npm test && npm run lint`
- [ ] Test count: existing suite plus ≥1 new test (no silent deletions)

**Tests**: unit
**Gate**: full

---

### Phase 4: Localized CSS / auth polish

### T15: Fix LegalDocument type scale

**What**: Set kicker/title/body to design-system type scale; no transform/zoom/scale shrinking text at any breakpoint.
**Where**: `src/pages/LegalDocument.css`
**Depends on**: T14
**Reuses**: `LegalAndNotFound.test.jsx`; tokens `--font-display`, `--font-sans`
**Requirement**: POL-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `.su-legal-article p` is `font-size: 1rem; line-height: 1.65`
- [ ] `h1` uses `--font-display` without a shrink transform
- [ ] Tests for privacy and terms assert no `transform` on `.su-legal` and readable body font-size
- [ ] Gate check passes: `npm test`
- [ ] Test count: existing suite plus ≥1 new assertion/test (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### T16: Use AuthBrand on recovery markup

**What**: Replace the external `<img>` logo block with `AuthBrand`.
**Where**: `src/pages/public-auth/markup/RecoveryPublicMarkup.tsx`
**Depends on**: T15
**Reuses**: `LoginPublicMarkup.tsx`; `Usability.test.jsx` shadow mount
**Requirement**: POL-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] No `lh3.googleusercontent.com` image
- [ ] `.st-auth-brand` present in recovery shadow
- [ ] Primary submit still `bg-primary-container hover:bg-primary`; "Tentar outro e-mail" stays surface/secondary tokens
- [ ] Gate check passes: `npm test`
- [ ] Test count: existing suite plus ≥1 new test (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### T17: Align recovery body background token

**What**: Set recovery `bodyClass` to the same solid `bg-brand-bg` token as login/register.
**Where**: `src/pages/shell-assets/manifest.json`
**Depends on**: T16
**Reuses**: `PublicShellHost` applying `entry.bodyClass`; `Usability.test.jsx`
**Requirement**: POL-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `recovery.bodyClass` includes `bg-brand-bg` and not `bg-surface` as the page background
- [ ] Recovery shell-body class list includes `bg-brand-bg`
- [ ] No `bg-gradient-*` on recovery markup/CSS (remove if found)
- [ ] Gate check passes: `npm test && npm run lint && npm run gate && npm run build`
- [ ] Test count: existing suite plus ≥1 new assertion (no silent deletions)

**Tests**: unit
**Gate**: build

---

### T18: Align MealPlanManager action buttons

**What**: Wrap Add/Submit (and same-group actions) in existing `.su-form-actions` so padding/gap match sibling nutrition rows.
**Where**: `src/pages/Dashboard/Nutrition/MealPlanManager.jsx`
**Depends on**: T17
**Reuses**: `.su-form-actions` in `Nutrition.css` (`gap: 0.75rem; align-items: flex-end`)
**Requirement**: POL-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Add + submit sit in `.su-form-actions` (no ad-hoc margin-only stack)
- [ ] Test asserts the group class on the form actions
- [ ] Gate check passes: `npm test && npm run lint && npm run gate && npm run build`
- [ ] Test count: existing suite plus ≥1 new assertion (no silent deletions)

**Tests**: unit
**Gate**: build

---

## Phase Execution Map

Visual representation of task ordering. Phases run in sequence, and tasks within a phase run in order:

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1
Phase 2:  T2 -> T3 -> T4 -> T5 -> T6 -> T7 -> T8 -> T9
Phase 3:  T10 -> T11 -> T12 -> T13 -> T14
Phase 4:  T15 -> T16 -> T17 -> T18
```

Execution is strictly sequential - there is no intra-phase parallelism. A single agent (or batch worker) works one task at a time, in order.

**How phase-based execution works:**

At Execute, the agent counts total tasks and packs phases into **task-budgeted batches** (~7 tasks
per worker, whole phases - the benchmarked sweet spot is ~20 tasks → ~3 workers). A **phase** is the
semantic/dependency unit; a **batch** is one or more *consecutive whole phases* assigned to one
worker. The cut only ever lands on a phase boundary - a phase is never split across workers. When
packing yields more than one batch (> ~8 tasks), the agent offers to dispatch batch sub-agents.
Batches run sequentially: each worker executes ALL its tasks in order, then reports a compact summary
before the next batch starts.

When the whole feature fits a single batch (≤ ~8 tasks), execution happens inline in the main window
with no sub-agents spawned.

**The orchestrating agent's role during Execute:**
1. Count total tasks and pack phases into ~7-task batches - offer batch sub-agents if that yields more than one batch and the user accepts
2. Dispatch the next batch (to a worker, or execute inline)
3. Receive the compact batch summary
4. Update tasks.md with results
5. If the batch summary shows all tasks complete: proceed to the next batch
6. If a task failed: decide fix/escalate before dispatching the next batch

Suggested packing (not executed here): Phase 1+2 (9) as batch A; Phase 3 (5) as batch B; Phase 4 (4) as batch C.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Skeleton primitive | 1 component | ✅ Granular |
| T2: NutritionWorkspaceShell | 1 component | ✅ Granular |
| T3: Layout bypass | 1 file | ✅ Granular |
| T4: App nested routes | 1 file | ✅ Granular |
| T5: Unwrap diary shell | 1 file | ✅ Granular |
| T6: FoodSearch drop nav | 1 file | ✅ Granular |
| T7: MealPlanManager drop nav | 1 file | ✅ Granular |
| T8: GoalOnboarding drop nav | 1 file | ✅ Granular |
| T9: DiaryDay drop nav | 1 file | ✅ Granular |
| T10: DiaryDay error/skeleton | 1 file / 1 contract | ✅ Granular |
| T11: Diary view skeleton | 1 file | ✅ Granular |
| T12: FoodSearch skeleton | 1 file | ✅ Granular |
| T13: MealPlan skeleton | 1 file | ✅ Granular |
| T14: Goal skeleton | 1 file | ✅ Granular |
| T15: LegalDocument.css | 1 file | ✅ Granular |
| T16: Recovery AuthBrand | 1 file | ✅ Granular |
| T17: recovery bodyClass | 1 file | ✅ Granular |
| T18: MealPlan button group | 1 file | ✅ Granular |

**Granularity check**:

- ✅ 1 component / 1 function / 1 endpoint = Good
- ⚠️ 2-3 related things in same file = OK if cohesive
- ❌ Multiple components or files = MUST split

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | (phase start) | ✅ Match |
| T2 | T1 | T1 is prior phase (no intra-phase arrow required) | ✅ Match |
| T3 | T2 | T2 -> T3 | ✅ Match |
| T4 | T3 | T3 -> T4 | ✅ Match |
| T5 | T4 | T4 -> T5 | ✅ Match |
| T6 | T5 | T5 -> T6 | ✅ Match |
| T7 | T6 | T6 -> T7 | ✅ Match |
| T8 | T7 | T7 -> T8 | ✅ Match |
| T9 | T8 | T8 -> T9 | ✅ Match |
| T10 | T1, T9 | T1/T9 prior phase; phase 3 starts at T10 | ✅ Match |
| T11 | T10 | T10 -> T11 | ✅ Match |
| T12 | T11 | T11 -> T12 | ✅ Match |
| T13 | T12 | T12 -> T13 | ✅ Match |
| T14 | T13 | T13 -> T14 | ✅ Match |
| T15 | T14 | T14 prior phase; phase 4 starts at T15 | ✅ Match |
| T16 | T15 | T15 -> T16 | ✅ Match |
| T17 | T16 | T16 -> T17 | ✅ Match |
| T18 | T17 | T17 -> T18 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | UI primitive | unit | unit | ✅ OK |
| T2 | Nutrition shell | unit | unit | ✅ OK |
| T3 | Layout bypass | unit | unit | ✅ OK |
| T4 | Nutrition shell / routes | unit | unit | ✅ OK |
| T5 | Nutrition pages | unit | unit | ✅ OK |
| T6 | Nutrition pages | unit | unit | ✅ OK |
| T7 | Nutrition pages | unit | unit | ✅ OK |
| T8 | Nutrition pages | unit | unit | ✅ OK |
| T9 | Nutrition pages | unit | unit | ✅ OK |
| T10 | Nutrition pages | unit | unit | ✅ OK |
| T11 | Nutrition pages | unit | unit | ✅ OK |
| T12 | Nutrition pages | unit | unit | ✅ OK |
| T13 | Nutrition pages | unit | unit | ✅ OK |
| T14 | Nutrition pages | unit | unit | ✅ OK |
| T15 | Legal page | unit | unit | ✅ OK |
| T16 | Recovery markup | unit | unit | ✅ OK |
| T17 | Manifest via recovery host | unit | unit | ✅ OK |
| T18 | Nutrition pages | unit | unit | ✅ OK |

---

## Task Verification Standards

Every task MUST follow the `Done when` + `Tests` + `Gate` fields defined in the **Task Breakdown** above. Each `Done when` entry must be specific, testable (binary pass/fail), and reference the gate check command from the `Gate Check Commands` section. Include the expected test count to prevent silent deletions.
