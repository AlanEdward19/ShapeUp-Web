# XP Feedback Loop (frontend) — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/xp-feedback-loop/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none for coverage thresholds (`AGENTS.md` absent, no `CONTRIBUTING.md` coverage section, no vitest coverage gate in `package.json`). Strong defaults applied. Style floor: `src/components/gamification/__tests__/GamificationProgressCard.test.jsx`, `AthleteScoreboard.test.jsx`, `src/hooks/api/__tests__/useNutritionApi.test.js`. Runner: Vitest (`npm test`).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Presentational component | unit | Spec ACs for that component + listed edge cases that the component can encode | `src/components/**/__tests__/*.test.jsx` | `npm test` |
| Hook / poll logic | unit | All branches: resolve, timeout, abort, GET throw, two session ids | `src/hooks/__tests__/*.test.js` | `npm test` |
| Page wiring (`submitFeedback` mount) | none | Covered by hook + popup unit tests; pages only mount those units | - | build gate |
| CSS / tokens | none | - (build gate only) | - | build gate |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `npm test` |
| Full | After page wiring | `npm test && npm run lint` |
| Build | After phase completion | `npm test && npm run lint && npm run build` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Progress bar lock

```
T1
```

### Phase 2: Celebration primitives

```
T2 → T3
```

### Phase 3: Finish-workout wiring

```
T4 → T5
```

---

## Task Breakdown

### Phase 1: Progress bar lock

### T1: Lock and fix GamificationProgressCard in-level fill

**What**: Extend the existing card test file with XPF-05/XPF-06 cases, then change the card so a positive in-level remainder never paints a zero-width fill.
**Where**: `src/components/gamification/GamificationProgressCard.jsx`
**Depends on**: None
**Reuses**: `src/components/gamification/__tests__/GamificationProgressCard.test.jsx` (extend, do not replace); progressbar assertion style from `AthleteScoreboard.test.jsx`
**Requirement**: XPF-05, XPF-06

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven

**Done when**:

- [x] `GamificationProgressCard.test.jsx` still covers nutrition streak 5 and 0
- [x] New case: profile `totalXp: 750`, `level: 2` (and non-zero streak/coins/score so the empty copy is not used). Progressbar `aria-valuenow` is `250`. Fill width is not `0%`
- [x] New case: `totalXp: 1000` (remainder 0). Fill width is `0%`. Empty copy is absent when other stats are non-zero
- [x] New case: all-zero profile still shows "Complete seu primeiro treino pra começar" and no progressbar
- [x] Production fill does not use `Math.round` in a way that maps remainder `> 0` to `0%`
- [x] Gate check passes: `npm test`
- [x] Test count: existing 2 nutrition cases remain; at least +3 bar cases; no silent deletions

**Tests**: unit
**Gate**: quick

**Commit**: `fix(xp-feedback-loop): lock in-level XP bar fill`

---

### Phase 2: Celebration primitives

### T2: Add useXpCelebration poll hook

**What**: Implement snapshot, 2s poll, 15s timeout, dismiss abort, and per-session isolation against `getGamificationProfile`.
**Where**: `src/hooks/useXpCelebration.js`
**Depends on**: None
**Reuses**: `src/hooks/api/useGamificationApi.js`; mock style from `src/hooks/api/__tests__/useNutritionApi.test.js`
**Requirement**: XPF-01, XPF-02

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven

**Done when**:

- [ ] Exports `XP_POLL_INTERVAL_MS = 2000` and `XP_POLL_TIMEOUT_MS = 15000`
- [ ] `start` with snapshot 100 then profile 220 resolves `delta === 120` and status `resolved`
- [ ] No increase for 15000 ms yields status `neutral` and `delta === null`
- [ ] GET reject during poll does not reset the timeout; still `neutral` at 15s if no delta
- [ ] `dismiss` or unmount stops further GET calls
- [ ] Second `start` with a different `sessionId` does not apply the first session's delta
- [ ] Gate check passes: `npm test`
- [ ] Test count: at least 5 hook cases in `src/hooks/__tests__/useXpCelebration.test.js`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(xp-feedback-loop): poll XP delta after finish`

---

### T3: Add XpCelebrationPopup

**What**: Presentational popup for pending, resolved `+{delta} XP`, neutral "XP em processamento", image slot, and dismiss.
**Where**: `src/components/gamification/XpCelebrationPopup.jsx`
**Depends on**: T2
**Reuses**: lucide-react; overlay/modal markup already used in `TrainingPlansIndependent.jsx`
**Requirement**: XPF-01, XPF-02, XPF-03

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven

**Done when**:

- [ ] `status="pending"` has no `+0 XP` and no numeric `+N XP`
- [ ] `status="resolved"` `delta={120}` shows `+120 XP`
- [ ] `status="neutral"` shows `XP em processamento` and not `+0 XP`
- [ ] Without `mascotImageUrl`, a lucide placeholder is present. With `mascotImageUrl`, that URL is used
- [ ] Dismiss control calls `onDismiss`
- [ ] `open={false}` renders nothing
- [ ] Gate check passes: `npm test`
- [ ] Test count: at least 5 cases in `src/components/gamification/__tests__/XpCelebrationPopup.test.jsx`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(xp-feedback-loop): add XP celebration popup`

---

### Phase 3: Finish-workout wiring

### T4: Open XP popup from independent finish

**What**: On `submitFeedback`, start `useXpCelebration` with `workoutSessionId` and render `XpCelebrationPopup` beside the overview modal.
**Where**: `src/pages/Dashboard/TrainingPlansIndependent.jsx`
**Depends on**: T3
**Reuses**: existing `enqueueMutation` finish; do not change overview stats math
**Requirement**: XPF-01, XPF-02, XPF-03

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven

**Done when**:

- [ ] `submitFeedback` still enqueues `/api/training/workouts/${workoutSessionId}/finish` and sets `showOverviewModal`
- [ ] Same function starts the celebration hook with that session id
- [ ] Popup is mounted; dismiss is wired to hook `dismiss`
- [ ] No edits to rest timer, set logging, or plan fetch
- [ ] Gate check passes: `npm test && npm run lint`

**Tests**: none
**Gate**: full

**Commit**: `feat(xp-feedback-loop): show XP popup after independent finish`

---

### T5: Mirror XP popup on client finish duplicate

**What**: Apply the same `submitFeedback` celebration mount as T4 on the unrouted client finish page.
**Where**: `src/pages/Dashboard/TrainingPlansClient.jsx`
**Depends on**: T4
**Reuses**: T2 hook and T3 popup
**Requirement**: XPF-01, XPF-02, XPF-03

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven

**Done when**:

- [ ] `submitFeedback` still enqueues finish and opens overview
- [ ] Celebration start + popup mount match T4
- [ ] No other session-flow edits
- [ ] Gate check passes: `npm test && npm run lint && npm run build`
- [ ] Spec traceability for XPF-01/02/03/05/06 set to Implementing or left for Execute to flip per task commits

**Tests**: none
**Gate**: build

**Commit**: `feat(xp-feedback-loop): show XP popup after client finish`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1
Phase 2:  T2 ------→ T3
Phase 3:  T4 ------→ T5
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

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Card fill + existing test file | 1 component (tests colocated, Where is the component) | Granular |
| T2: useXpCelebration | 1 hook | Granular |
| T3: XpCelebrationPopup | 1 component | Granular |
| T4: Independent submitFeedback mount | 1 file | Granular |
| T5: Client submitFeedback mount | 1 file | Granular |

**Granularity check**: 5 tasks, each one file in `Where`.

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | no inbound arrow | Match |
| T2 | None | no inbound arrow in phase 2 | Match |
| T3 | T2 | T2 → T3 | Match |
| T4 | T3 | no intra-phase arrow from T3 (cross-phase) | Match |
| T5 | T4 | T4 → T5 | Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Presentational component | unit | unit | OK |
| T2 | Hook / poll logic | unit | unit | OK |
| T3 | Presentational component | unit | unit | OK |
| T4 | Page wiring | none | none | OK |
| T5 | Page wiring | none | none | OK |

---
