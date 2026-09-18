# Drawer de Detalhe do Exercício — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

This feature is **presentation only**. Do not add API clients, catalog fetches, or workout-swap flows. Those belong to `exercise-variations`. `ExerciseEquivalent` is a UI contract. Populate `equivalents` only via props/mocks in tests.

---

**Design**: `.specs/features/exercise-detail-drawer/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `package.json` (`test`, `lint`, `gate`, `build`), `vitest.config.js` (jsdom, RTL), `eslint.config.js`, sampled `src/pages/Dashboard/__tests__/ExercisesShell.test.jsx`. No `AGENTS.md` / `CONTRIBUTING.md`. Strong defaults apply for AC coverage.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Entity / type (`ExerciseEquivalent` on `ExerciseRecord`) | none | Build/lint only | `src/pages/Dashboard/markup/ExercisesPublicMarkup.tsx` | `npm run lint && npm run gate && npm run build && npm test` |
| Domain helper (`detectVideoKind`) | unit | All URL branches and listed edges (file, YouTube, Vimeo, invalid, empty) | `src/pages/Dashboard/__tests__/exerciseVideo.test.js` | `npm test` |
| Presentation (drawer video, substitutions, composed drawer, markup mount) | unit | 1:1 to spec ACs in scope of the task; every listed edge case for that surface | `src/pages/Dashboard/__tests__/*.test.jsx` | `npm test` |
| Shell wiring (width, backdrop CSS, in-memory equivalent lookup, Escape) | unit | Happy path + edges from spec (empty/invalid video, empty equivalents, missing id, Escape + backdrop) | `src/pages/Dashboard/__tests__/ExercisesShell.test.jsx` | `npm test` |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `npm test` |
| Full | After tasks that change markup/shell behavior | `npm test && npm run lint` |
| Build | After type-only tasks or phase completion | `npm run lint && npm run gate && npm run build && npm test` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Foundation

Types and the pure video-kind helper.

```
T1
T2
```

### Phase 2: Section components

Isolated presentation for video and substitutions.

```
T3
T4
```

### Phase 3: Drawer assembly

Compose the panel, mount it, then size/close behavior in the shell.

```
T5 ------→ T6 ------→ T7
```

---

## Task Breakdown

### Phase 1: Foundation

#### T1: Add ExerciseEquivalent presentation contract

**What**: Export `ExerciseEquivalent` and optional `equivalents?: ExerciseEquivalent[]` on `ExerciseRecord`. No fetch, no catalog, no workout swap.
**Where**: `src/pages/Dashboard/markup/ExercisesPublicMarkup.tsx`
**Depends on**: None
**Reuses**: Existing `ExerciseRecord` in the same file
**Requirement**: EDD-05, EDD-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `ExerciseEquivalent` has `exerciseId`, optional `matchLabel`, optional `note`
- [x] `ExerciseRecord.equivalents` is optional
- [x] No new API module or `fetch` for equivalents
- [x] Gate check passes: `npm run lint && npm run gate && npm run build && npm test`

**Tests**: none
**Gate**: build

**Commit**: `feat(exercises): add ExerciseEquivalent presentation contract`

---

#### T2: Add detectVideoKind helper

**What**: Pure `detectVideoKind(url?: string)` returning `'file' | 'youtube' | 'vimeo' | 'invalid'`.
**Where**: `src/pages/Dashboard/markup/exerciseVideo.ts`
**Depends on**: None
**Reuses**: Spec URL rules (YouTube/youtu.be, Vimeo, `.mp4`/`.webm`/`.mov`/`.ogg`, otherwise invalid)
**Requirement**: EDD-01, EDD-02, EDD-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] File, YouTube, Vimeo, empty, malformed, and unknown-host URLs are classified
- [x] Unknown hosts never classify as a generic iframe provider
- [x] Tests live in `src/pages/Dashboard/__tests__/exerciseVideo.test.js`
- [x] Gate check passes: `npm test`
- [x] Test count: 6 tests pass (no silent deletions)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(exercises): classify library exercise video URLs`

---

### Phase 2: Section components

#### T3: Build ExerciseDrawerVideo

**What**: Embedded player with file `<video>`, YouTube/Vimeo lite-embed, empty copy, and reset when `videoUrl` changes.
**Where**: `src/pages/Dashboard/markup/ExerciseDrawerVideo.tsx`
**Depends on**: T2
**Reuses**: `detectVideoKind`, native `<video>`/`<iframe>`, material icons already in the app
**Requirement**: EDD-01, EDD-02, EDD-03, EDD-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Direct file URLs render 16:9 native video with play/pause, progress, replay, timestamp, fullscreen
- [x] YouTube/Vimeo start as poster + play and swap to iframe only after click
- [x] Missing/invalid/unknown URL shows "Vídeo de execução não cadastrado" (no broken player)
- [x] Changing `videoUrl` resets to paused/start of the new source
- [x] Tests in `src/pages/Dashboard/__tests__/ExerciseDrawerVideo.test.jsx`
- [x] Gate check passes: `npm test`
- [x] Test count: 5 tests pass (no silent deletions)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(exercises): embed exercise drawer video player`

---

#### T4: Build ExerciseDrawerSubstitutions list UI

**What**: Clickable equivalents list with count badge and empty state. Callbacks only; no API.
**Where**: `src/pages/Dashboard/markup/ExerciseDrawerSubstitutions.tsx`
**Depends on**: T1
**Reuses**: `ExerciseRow` hover/truncate/icon pattern; `ExerciseEquivalent` contract
**Requirement**: EDD-05, EDD-06, EDD-07

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Non-empty `equivalents` render name, equipment, optional similarity, chevron, header count
- [ ] Absent/empty `equivalents` render "Nenhuma substituição cadastrada para este exercício."
- [ ] Click calls `onSelect` when `exerciseId` exists in `exercises`; otherwise `onNotFound`
- [ ] Tests in `src/pages/Dashboard/__tests__/ExerciseDrawerSubstitutions.test.jsx`
- [ ] Gate check passes: `npm test`
- [ ] Test count: 4 tests pass (no silent deletions)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(exercises): render equivalent substitutions list UI`

---

### Phase 3: Drawer assembly

#### T5: Compose ExerciseDrawer sections

**What**: Extract the drawer into `ExerciseDrawer` with backdrop, activation bars, numbered steps, hairline stats, terracotta code, and no duplicate muscle/description dumps.
**Where**: `src/pages/Dashboard/markup/ExerciseDrawer.tsx`
**Depends on**: T3, T4
**Reuses**: Current aside ids (`exerciseDrawer`, `drawerCode`, `drawerTitle`, Escape on panel), tokens in `exercises.css`
**Requirement**: EDD-08, EDD-09, EDD-10, EDD-11, EDD-12

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Backdrop (`bg-black/60 backdrop-blur-xs`) calls `state.close` on click
- [ ] Activation rows use `muscleDetails` percents; never hardcode 95%/75%
- [ ] Description fallback is a styled `01.` step, not a bare paragraph
- [ ] Panel class is `w-[460px] max-w-full`; `drawerCode` uses terracotta
- [ ] Stats use `border-y` without the muted boxed frame
- [ ] Loose `description`, "Músculos", and raw `muscleDetails` dumps are gone
- [ ] Primary button copy stays "Adicionar à Ficha do Aluno"
- [ ] Tests in `src/pages/Dashboard/__tests__/ExerciseDrawer.test.jsx`
- [ ] Gate check passes: `npm test && npm run lint`
- [ ] Test count: 6 tests pass (no silent deletions)

**Tests**: unit
**Gate**: full

**Commit**: `feat(exercises): compose exercise detail drawer sections`

---

#### T6: Mount ExerciseDrawer in public markup

**What**: Replace the inline `<aside id="exerciseDrawer">` block with `ExerciseDrawer`. Keep list/filters unchanged.
**Where**: `src/pages/Dashboard/markup/ExercisesPublicMarkup.tsx`
**Depends on**: T5
**Reuses**: `ExercisesPublicMarkup` state props; `ExerciseDrawer`
**Requirement**: EDD-08, EDD-11, EDD-12

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Markup no longer inlines the old drawer sections (video link, static `drawerSubs` paragraph, duplicate muscle dump)
- [ ] `id="exerciseDrawer"` still exists via `ExerciseDrawer`
- [ ] Tests in `src/pages/Dashboard/__tests__/ExercisesPublicMarkup.test.jsx` assert mount + ids
- [ ] Gate check passes: `npm test && npm run lint`
- [ ] Test count: 2 tests pass (no silent deletions)

**Tests**: unit
**Gate**: full

**Commit**: `feat(exercises): mount extracted exercise drawer in markup`

---

#### T7: Size shell drawer and wire equivalent inspect

**What**: Set overlay width to 460px, add backdrop CSS, resolve equivalent clicks from in-memory `state.exercises`, toast when missing. Keep Escape.
**Where**: `src/pages/Dashboard/ExercisesShell.tsx`
**Depends on**: T6
**Reuses**: `drawerCss`, `inspect`/`close`/`notice`; extend `ExercisesShell.test.jsx`
**Requirement**: EDD-04, EDD-07, EDD-08, EDD-11

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `drawerCss` uses `min(460px,100vw)` instead of 440px
- [ ] Backdrop is in the overlay stack and closes the drawer
- [ ] Equivalent click updates the active exercise from the loaded list
- [ ] Missing id shows toast "Exercício não encontrado na lista atual" and keeps the current exercise
- [ ] Escape still closes; existing test is not weakened or deleted
- [ ] `ExercisesShell.test.jsx` covers Escape, activation 62% (not 95%), empty video/subs, equivalent navigation, missing-id toast
- [ ] Gate check passes: `npm run lint && npm run gate && npm run build && npm test`
- [ ] Test count: existing ExercisesShell case plus 5 new cases pass (no silent deletions)

**Tests**: unit
**Gate**: build

**Commit**: `feat(exercises): size drawer 460px and close on backdrop`

---

## Phase Execution Map

Visual representation of task ordering. Phases run in sequence, and tasks within a phase run in order:

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1
          T2
Phase 2:  T3
          T4
Phase 3:  T5 ------→ T6 ------→ T7
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

This feature is **7 tasks / 1 batch**. Execute inline in the main window (no batch sub-agents).

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
| T1: ExerciseEquivalent contract | 1 type in existing file | ✅ Granular |
| T2: detectVideoKind helper | 1 function | ✅ Granular |
| T3: ExerciseDrawerVideo | 1 component | ✅ Granular |
| T4: ExerciseDrawerSubstitutions | 1 component | ✅ Granular |
| T5: ExerciseDrawer compose | 1 file, local subcomponents | ✅ Granular |
| T6: Markup mount | 1 file change | ✅ Granular |
| T7: Shell width/backdrop/inspect | 1 file change | ✅ Granular |

**Granularity check**:

- ✅ 1 component / 1 function / 1 endpoint = Good
- ⚠️ 2-3 related things in same file = OK if cohesive
- ❌ Multiple components or files = MUST split

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | no intra-phase arrow | ✅ Match |
| T2 | None | no intra-phase arrow | ✅ Match |
| T3 | T2 (prior phase) | Phase 2 has no intra-phase arrow | ✅ Match |
| T4 | T1 (prior phase) | Phase 2 has no intra-phase arrow | ✅ Match |
| T5 | T3, T4 (prior phase) | Phase 3 starts at T5 | ✅ Match |
| T6 | T5 | T5 -> T6 | ✅ Match |
| T7 | T6 | T6 -> T7 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1: ExerciseEquivalent contract | Entity / type | none | none | ✅ OK |
| T2: detectVideoKind | Domain helper | unit | unit | ✅ OK |
| T3: ExerciseDrawerVideo | Presentation | unit | unit | ✅ OK |
| T4: ExerciseDrawerSubstitutions | Presentation | unit | unit | ✅ OK |
| T5: ExerciseDrawer | Presentation | unit | unit | ✅ OK |
| T6: Markup mount | Presentation | unit | unit | ✅ OK |
| T7: ExercisesShell wiring | Shell wiring | unit | unit | ✅ OK |

---
