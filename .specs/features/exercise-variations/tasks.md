# Variações de Exercício (frontend) — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/exercise-variations/design.md`
**Status**: Draft
**Scope**: ShapeUp-Web frontend only. Backend CLOSED `1b82672`. Do not implement video player / EDD chrome. Do not commit STATE.md.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `.specs/features/stitch-migration/tasks.md` (vitest + `npm run lint` + `npx tsc --noEmit` + `npm run gate`), `package.json` scripts, samples `src/hooks/api/__tests__/useNutritionApi.test.js`, `src/utils/__tests__/workoutStatePayload.test.js`, `src/pages/Dashboard/__tests__/ExercisesShell.test.jsx`. No AGENTS.md in this repo. Strong default for domain helpers.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| `useTrainingApi` GET equivalents | unit | Happy path URL + error throw (same as `useNutritionApi`) | `src/hooks/api/__tests__/useTrainingApi.test.js` | `npm test` |
| Domain helpers (`exerciseEquivalents`, `swapExerciseInSession`) | unit | 1:1 ACs EXVAR-04 unwrap/map, EXVAR-07 retain/drop/duplicate, EXVAR-08 enqueue args; listed edge cases | `src/utils/__tests__/*.test.js` | `npm test` |
| Picker + swap button | unit | Choose≠mutate; confirm callback; disabled when empty | `src/components/training/__tests__/*.test.jsx` | `npm test` |
| `ExercisesShell` inspect populate + empty/error | unit | GET wired, static `drawerSubs` gone, inspect navigation | `src/pages/Dashboard/__tests__/ExercisesShell.test.jsx` | `npm test` |
| Config / i18n keys | none | Build/lint | `src/i18n/` | build gate |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After unit-only tasks | `npm test` |
| Full | After shell/picker tasks | `npm test && npm run lint` |
| Build | After phase or wiring | `npm test && npm run lint && npx tsc --noEmit && npm run gate` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: API and domain helpers

```
T1 -> T2 -> T3
```

### Phase 2: Populate sibling drawer

```
T4 -> T5
```

### Phase 3: Execution choose then swap

```
T6 -> T7 -> T8
```

---

## Task Breakdown

### Phase 1: API and domain helpers

### T1: Add `getExerciseEquivalents` to training API hook

**What**: Export `getExerciseEquivalents(exerciseId)` calling `GET /api/training/exercises/{exerciseId}/equivalents` via `apiClient`.
**Where**: `src/hooks/api/useTrainingApi.js`
**Depends on**: None
**Reuses**: `getExerciseById` in the same hook
**Requirement**: EXVAR-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Function is returned from `useTrainingApi`
- [x] Unit tests: happy path URL; error path throws
- [x] Gate check passes: `npm test`
- [x] Test count: existing suite + 2 (no silent deletions)

**Tests**: unit
**Gate**: quick
**Commit**: `feat(training): fetch exercise equivalents from API`
**Status**: ✅ Complete

---

### T2: Map GET payload to drawer `ExerciseEquivalent` contract

**What**: Pure mapper: unwrap array or `{ items }`; map `id` → `exerciseId`; omit `matchLabel`; produce inspect records (name, muscles, equipment) from `ExerciseResponse`.
**Where**: `src/utils/exerciseEquivalents.js`
**Depends on**: T1
**Reuses**: unwrap pattern in `src/hooks/useExercises.js`
**Requirement**: EXVAR-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Empty/malformed payload yields `{ equivalents: [], records: [] }`
- [ ] No fabricated similarity string
- [ ] Tests cover array vs `{ items }` vs empty
- [ ] Gate check passes: `npm test`
- [ ] Test count: previous + ≥3 (no silent deletions)

**Tests**: unit
**Gate**: quick
**Commit**: `feat(training): map exercise equivalents for the drawer`

---

### T3: Pure session swap + enqueue helper

**What**: `applyExerciseSwap`, `buildRetainedSetsForOriginal`, `enqueueExerciseSwap` in one module. Retain `completed` sets; drop incomplete; append replacement with `sets: []`; reject duplicate `exerciseId` in session; enqueue POST body + `dedupeKey` `workout-swap-{sessionId}-{originalExerciseId}` without calling `apiClient`.
**Where**: `src/utils/swapExerciseInSession.js`
**Depends on**: T2
**Reuses**: `src/utils/workoutStatePayload.js` set mapping
**Requirement**: EXVAR-06, EXVAR-07, EXVAR-08

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Duplicate replacement returns `already-in-session` and enqueue is not called
- [ ] `retainedSetsForOriginal` includes only completed sets
- [ ] `enqueueMutation` mock receives endpoint `/api/training/workouts/{sessionId}/swap-exercise`, method POST
- [ ] Gate check passes: `npm test`
- [ ] Test count: previous + ≥4 (no silent deletions)

**Tests**: unit
**Gate**: quick
**Commit**: `feat(training): apply session exercise swap locally and enqueue`

---

### Phase 2: Populate sibling drawer

### T4: Fetch equivalents when the library drawer opens

**What**: `inspect` loads equivalents for `ex.id`, stale-guards by id, stores `equivalents` + GET records for lookup; GET failure leaves empty equivalents and keeps the drawer open.
**Where**: `src/pages/Dashboard/ExercisesShell.tsx`
**Depends on**: T2
**Reuses**: `getExerciseEquivalents`, `mapExerciseEquivalents`, existing `notice`
**Requirement**: EXVAR-04, EXVAR-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `ExercisesShell.test.jsx` mocks GET and asserts mapped equivalents on the active exercise
- [ ] Failed GET does not throw in UI; equivalents empty
- [ ] Rapid inspect does not apply a stale response to the wrong exercise
- [ ] Gate check passes: `npm test && npm run lint`
- [ ] Test count: previous + ≥2 (no silent deletions)

**Tests**: unit
**Gate**: full
**Commit**: `feat(training): load equivalents when inspecting an exercise`

---

### T5: Render sibling substitutions list from API data

**What**: Replace static `#drawerSubs` copy with the sibling substitutions list fed by `active.equivalents`. Click calls `inspect` with the GET record or `getExerciseById`; unresolved id uses existing toast. Do not add video player, backdrop, or width work.
**Where**: `src/pages/Dashboard/markup/ExercisesPublicMarkup.tsx`
**Depends on**: T4
**Reuses**: `.specs/features/exercise-detail-drawer` list contract; if `ExerciseDrawerSubstitutions.tsx` already exists, edit that file instead and keep this task's Where to that single file
**Requirement**: EXVAR-04, EXVAR-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] String `Consulte a biblioteca para selecionar uma substituição.` is gone from the drawer path
- [ ] Empty GET shows sibling empty copy, not the old placeholder
- [ ] Click navigates drawer title/content to the equivalent
- [ ] Gate check passes: `npm test && npm run lint`
- [ ] Test count: previous + ≥2 (no silent deletions)

**Tests**: unit
**Gate**: full
**Commit**: `feat(training): show API equivalents in the exercise drawer`

---

### Phase 3: Execution choose then swap

### T6: Swap-only equivalents picker (choose, do not mutate)

**What**: `EquivalentPickerModal` single-select list of registered equivalents, explicit confirm, cancel/close does not call `onConfirm`.
**Where**: `src/components/training/EquivalentPickerModal.jsx`
**Depends on**: T1
**Reuses**: overlay patterns from `ExerciseLibraryModal.jsx` (structure only; no full-catalog search)
**Requirement**: EXVAR-01

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Selecting a row without confirm does not fire `onConfirm`
- [ ] Confirm fires once with the chosen equivalent
- [ ] Empty list shows an explicit no-alternative message (picker not blank)
- [ ] Gate check passes: `npm test && npm run lint`
- [ ] Test count: previous + ≥3 (no silent deletions)

**Tests**: unit
**Gate**: full
**Commit**: `feat(training): add equivalent picker for execution swap`

---

### T7: Execution header swap control

**What**: `SwapExerciseButton` beside session details; enabled only when equivalents length > 0; click opens picker only (no `applyExerciseSwap`).
**Where**: `src/components/training/SwapExerciseButton.jsx`
**Depends on**: T6
**Reuses**: `Button` outline used by `client.session.card.details`
**Requirement**: EXVAR-01, EXVAR-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `disabled` when `equivalents.length === 0`
- [ ] Click invokes `onClick` only (parent opens picker)
- [ ] Gate check passes: `npm test`
- [ ] Test count: previous + ≥2 (no silent deletions)

**Tests**: unit
**Gate**: quick
**Commit**: `feat(training): add swap control on execution exercise header`

---

### T8: Wire choose→confirm swap into the session client

**What**: In the execution header, load equivalents, mount picker + button, on confirm call `applyExerciseSwap` then `enqueueExerciseSwap`. No direct `apiClient` for swap. Session-only (do not edit plan save).
**Where**: `src/pages/Dashboard/TrainingPlansClient.jsx`
**Depends on**: T3, T7
**Reuses**: `swapExerciseInSession.js`, `getExerciseEquivalents`, `enqueueMutation` already imported
**Requirement**: EXVAR-01, EXVAR-06, EXVAR-07, EXVAR-08

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Button sits in `su-ex-execution-header` next to details
- [ ] Confirm path uses helpers (grep: `enqueueExerciseSwap` or `enqueueMutation` with `swap-exercise`)
- [ ] No `apiClient(` call added for swap-exercise
- [ ] Duplicate-in-session shows a user-visible warning
- [ ] Gate check passes: `npm test && npm run lint && npx tsc --noEmit && npm run gate`
- [ ] Test count: previous + ≥1 focused test of the wired confirm (extract a tiny handler under test if the page is too large; do not weaken T3 tests)

**Tests**: unit
**Gate**: build
**Commit**: `feat(training): confirm exercise swap in the live session`

---

## Phase Execution Map

```
Phase 1 -> Phase 2 -> Phase 3

Phase 1:  T1 -> T2 -> T3
Phase 2:  T4 -> T5
Phase 3:  T6 -> T7 -> T8
```

Execution is strictly sequential - there is no intra-phase parallelism. A single agent (or batch worker) works one task at a time, in order.

**How phase-based execution works:**

At Execute, the agent counts total tasks and packs phases into **task-budgeted batches** (~7 tasks
per worker, whole phases - the benchmarked sweet spot is ~20 tasks → ~3 workers). A **phase** is the
semantic/dependency unit; a **batch** is one or more *consecutive whole phases* assigned to one
worker. The cut only ever lands on a phase boundary - a phase is never split across workers.

When the whole feature fits a single batch (≤ ~8 tasks), execution happens inline in the main window
with no sub-agents spawned.

**The orchestrating agent's role during Execute:**
1. Count total tasks and pack phases into ~7-task batches - offer batch sub-agents if that yields more than one batch and the user accepts
2. Dispatch the next batch (to a worker, or execute inline)
3. Receive the compact batch summary
4. Update tasks.md with results
5. If the batch summary shows all tasks complete: proceed to the next batch
6. If a task failed: decide fix/escalate before dispatching the next batch

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: GET hook function | 1 function | Granular |
| T2: mapper module | 1 module | Granular |
| T3: swap helpers module | 1 cohesive module | Granular |
| T4: inspect fetch | 1 function path | Granular |
| T5: substitutions slot | 1 UI slot | Granular |
| T6: picker | 1 component | Granular |
| T7: button | 1 component | Granular |
| T8: client wiring | 1 page orchestration | Granular |

**Granularity check**: 1 component / 1 function / 1 file per task.

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | start | Match |
| T2 | T1 | T1 -> T2 | Match |
| T3 | T2 | T2 -> T3 | Match |
| T4 | T2 | Phase 2 start (T2 is prior phase) | Match |
| T5 | T4 | T4 -> T5 | Match |
| T6 | T1 | Phase 3 start (T1 is prior phase) | Match |
| T7 | T6 | T6 -> T7 | Match |
| T8 | T3, T7 | T7 -> T8 (T3 prior phase) | Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | useTrainingApi hook | unit | unit | OK |
| T2 | domain mapper | unit | unit | OK |
| T3 | domain swap/enqueue | unit | unit | OK |
| T4 | ExercisesShell | unit | unit | OK |
| T5 | drawer substitutions slot | unit | unit | OK |
| T6 | picker component | unit | unit | OK |
| T7 | button component | unit | unit | OK |
| T8 | TrainingPlansClient wiring | unit | unit | OK |

---

## Tools for Execute (confirm before coding)

Available MCPs: Cursor filesystem, browser, GitHub (optional).
Available Skills: `tlc-spec-driven` (mandatory), `ponytail` if the worker overbuilds.

T5: if `ExerciseDrawerSubstitutions.tsx` exists at Execute, change **only** that file (update this task `Where` in the same commit). Never implement `ExerciseDrawerVideo`.
