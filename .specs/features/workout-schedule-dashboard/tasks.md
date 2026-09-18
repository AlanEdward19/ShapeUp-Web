# Workout Schedule Dashboard (Frontend) Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/workout-schedule-dashboard/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec. Guidelines found: `package.json` (`npm test` = `vitest run`), `vitest.config.js` (jsdom), `src/utils/__tests__/*.test.js` (pure unit), `src/pages/Dashboard/__tests__/*.test.jsx` (RTL + mocks). No AGENTS.md coverage thresholds. Strong defaults for domain utils; page shell gets mocked-unit coverage of the new branches.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domain util (`workoutSchedule.js`) | unit | All branches; 1:1 to WSD-03..WSD-06 ACs + listed edge cases (empty API field, union vs count, N=null, multi-plan same day) | `src/utils/__tests__/workoutSchedule.test.js` | `npm test` |
| Normalization | unit | Legado omitido → `[]`; strings e números 0–6 | `src/utils/__tests__/trainingNormalization.test.js` | `npm test` |
| PlanEditor UI | unit (RTL) | Seletor visível em plano; oculto em template; save com dias e com `[]` | `src/pages/Dashboard/__tests__/PlanEditorWeekdays.test.jsx` | `npm test` |
| Plan body (ClientDetail / Independent) | unit | Body JSON contém `assignedWeekdays` strings; empty array quando limpo | `src/pages/Dashboard/__tests__/workoutPlanBody.weekdays.test.js` | `npm test` |
| Athlete markup | unit (RTL) | Card presente/ausente; agrega dois planos | `src/pages/Dashboard/operational-dashboard/__tests__/AthleteDashboardMarkup.today.test.tsx` | `npm test` |
| Athlete shell wiring | unit | Após planos: `getDashboardMe` com N certo; zero planos: 0 calls; nenhum `getDashboardMe(5)`; nenhum `getWorkoutPlanById` quando hoje vazio | `src/pages/Dashboard/__tests__/OperationalDashboardsShell.schedule.test.tsx` | `npm test` |

## Gate Check Commands

> Generated from codebase.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After unit/RTL tasks | `npm test` |
| Full | After shell/markup wiring | `npm test && npm run lint` |
| Build | After last task of a phase | `npm test && npm run lint && npm run build` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Foundation

```
T1 → T2
```

### Phase 2: Plan editor write path

```
T3 → T4
T5
```

### Phase 3: Dashboard consume

```
T6 → T7
```

---

## Task Breakdown

### Phase 1: Foundation

### T1: Create workoutSchedule helpers

**What**: Add pure helpers for weekday map, plans-for-today, exercise flatten, and sessions target (including `null` when no plans).
**Where**: `src/utils/workoutSchedule.js`
**Depends on**: None
**Reuses**: Canonical rules WSD-05/WSD-06; `Date#getDay`
**Requirement**: WSD-03, WSD-04, WSD-05, WSD-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `unmapAssignedWeekdays` / `mapAssignedWeekdaysToApi` round-trip Sunday=0 … Saturday=6
- [x] `plansForToday` / `exercisesForToday` aggregate all matching plans, never first-only
- [x] `computeSessionsTargetPerWeek` returns `null` for `[]`, union size when any weekday set, else `plans.length`
- [x] Tests cover empty/omitted field, duplicates, same-day multi-plan, examples Seg+Qui & Ter → 3
- [x] Gate check passes: `npm test`
- [x] Test count: at least 8 new assertions in `src/utils/__tests__/workoutSchedule.test.js` (no silent deletions)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(wsd): add weekday schedule helpers`

---

### T2: Normalize assignedWeekdays on plans

**What**: Map API `assignedWeekdays` into `normalizePlan` as `number[]` default `[]`.
**Where**: `src/utils/trainingNormalization.js`
**Depends on**: T1
**Reuses**: `unmapAssignedWeekdays` from T1
**Requirement**: WSD-02, WSD-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `normalizePlan` sets `assignedWeekdays: unmapAssignedWeekdays(plan.assignedWeekdays)`
- [x] `normalizeTemplate` permanece sem o campo de agenda
- [x] Tests: omitido → `[]`; `["Monday","Thursday"]` → `[1,4]`; `[1,1,4]` → `[1,4]`
- [x] Gate check passes: `npm test`
- [x] Test count: at least 3 new tests in `src/utils/__tests__/trainingNormalization.test.js`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(wsd): normalize plan assigned weekdays`

---

### Phase 2: Plan editor write path

### T3: Weekday multi-select in PlanEditor

**What**: Add optional weekday toggles to `PlanEditor` state, settings UI, and `onSave`/`onAssign` payloads; hide when `_templateId` is set.
**Where**: `src/pages/Dashboard/ClientDetail.jsx`
**Depends on**: T2
**Reuses**: `PlanEditor` settings grid; `unmapAssignedWeekdays`
**Requirement**: WSD-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Seletor visível só em plano (não template)
- [x] Estado inicial reflete `plan.assignedWeekdays`
- [x] Save/assign inclui `assignedWeekdays` (number[]) inclusive `[]`
- [x] `handleAddPlan` inicializa `assignedWeekdays: []`
- [x] RTL: marcar Mon+Thu e salvar; limpar todos e salvar; template sem seletor
- [x] Gate check passes: `npm test`
- [x] Test count: at least 3 tests in `src/pages/Dashboard/__tests__/PlanEditorWeekdays.test.jsx`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(wsd): add plan editor weekday selector`

---

### T4: Send assignedWeekdays from ClientDetail body

**What**: Include API string weekdays on `buildWorkoutPlanBody` in ClientDetail (export the builder for tests if it stays private).
**Where**: `src/pages/Dashboard/ClientDetail.jsx`
**Depends on**: T1, T3
**Reuses**: `mapAssignedWeekdaysToApi`
**Requirement**: WSD-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Create/update body has `assignedWeekdays` string array (empty allowed)
- [x] Unit test asserts payload for `[1,4]` and `[]`
- [x] Gate check passes: `npm test`
- [x] Test count: at least 2 tests covering this builder in `src/pages/Dashboard/__tests__/workoutPlanBody.weekdays.test.js`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(wsd): persist weekdays on client plan save`

---

### T5: Send assignedWeekdays from Independent body

**What**: Same `assignedWeekdays` field on Independent `buildWorkoutPlanBody`.
**Where**: `src/pages/Dashboard/TrainingPlansIndependent.jsx`
**Depends on**: T1
**Reuses**: `mapAssignedWeekdaysToApi` (mesmo contrato de T4)
**Requirement**: WSD-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Independent create/update body includes `assignedWeekdays`
- [x] Tests in the same weekdays body test file cover this builder (export or shared helper used here)
- [x] Gate check passes: `npm test`
- [x] Test count: at least 2 tests for the Independent builder (no silent deletions)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(wsd): persist weekdays on independent plan save`

---

### Phase 3: Dashboard consume

### T6: Gate Today card in athlete markup

**What**: Render "Exercícios Prescritos para Hoje" only when `showTodayCard` is true; list `state.exercises` as aggregated today list.
**Where**: `src/pages/Dashboard/operational-dashboard/AthleteDashboardMarkup.tsx`
**Depends on**: T1
**Reuses**: markup do card existente (sem visual redesign)
**Requirement**: WSD-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `AthleteDashboardState` inclui `showTodayCard: boolean`
- [ ] Card (heading + lista) ausente do DOM quando `showTodayCard` é false
- [ ] Card lista todos os `exercises` quando true (dois planos no teste)
- [ ] Gate check passes: `npm test && npm run lint`
- [ ] Test count: at least 2 RTL tests in `src/pages/Dashboard/operational-dashboard/__tests__/AthleteDashboardMarkup.today.test.tsx`

**Tests**: unit
**Gate**: full

**Commit**: `feat(wsd): hide today card without scheduled workout`

---

### T7: Wire AthleteView schedule and frequency

**What**: Derive today exercises from all plans; skip extra plan-by-id fetch; call `getDashboardMe(N)` only after plans load with N from the util (never literal 5, never 0).
**Where**: `src/pages/Dashboard/OperationalDashboardsShell.tsx`
**Depends on**: T1, T6
**Reuses**: `readAllPages`, `normalizePlan`, `workoutSchedule.js`, `getDashboardMe`
**Requirement**: WSD-03, WSD-04, WSD-05, WSD-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `showTodayCard` / `exercises` vêm de `plansForToday` / `exercisesForToday` sobre **todos** os planos
- [ ] Sem treino hoje: markup não recebe card; teste garante `getWorkoutPlanById` não é chamado
- [ ] `getDashboardMe` não roda no mount com `5`; espera planos
- [ ] N união / N=`plans.length` / skip se vazio / skip se fetch de planos falhou
- [ ] `NormalizedPlan` em `types.ts` aceita `assignedWeekdays` (mesmo commit se o typecheck exigir; arquivo extra só se o compilador quebrar)
- [ ] Gate check passes: `npm test && npm run lint && npm run build`
- [ ] Test count: at least 4 tests in `src/pages/Dashboard/__tests__/OperationalDashboardsShell.schedule.test.tsx`

**Tests**: unit
**Gate**: build

**Commit**: `feat(wsd): derive today card and frequency target from plans`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 -> T2
Phase 2:  T3 -> T4
          T5
Phase 3:  T6 -> T7
```

Execution is strictly sequential - there is no intra-phase parallelism. A single agent (or batch worker) works one task at a time, in order.

**How phase-based execution works:**

At Execute, the agent counts total tasks and packs phases into **task-budgeted batches** (~7 tasks per worker, whole phases). This feature is **7 tasks** (one batch). Execute inline; do not spawn batch workers.

The orchestrating agent's role during Execute:
1. Count total tasks and pack phases into ~7-task batches
2. Dispatch the next batch (to a worker, or execute inline)
3. Receive the compact batch summary
4. Update tasks.md with results
5. If the batch summary shows all tasks complete: proceed to the next batch
6. If a task failed: decide fix/escalate before dispatching the next batch

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: workoutSchedule helpers | 1 module | Done |
| T2: normalizePlan field | 1 function | Done |
| T3: PlanEditor selector | 1 component | Done |
| T4: ClientDetail body field | 1 function | Done |
| T5: Independent body field | 1 function | Done |
| T6: Markup card guard | 1 component | Granular |
| T7: AthleteView wiring | 1 cohesive shell change | Granular (same file: today + frequency) |

**Granularity check**: T7 is two related consumers in one file; splitting would duplicate `OperationalDashboardsShell.tsx` tasks (validator smell). T4 `Where` is ClientDetail again after T3; sequential same-file edits are required because T3 is UI state and T4 is the HTTP body helper.

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | no inbound arrow | Match |
| T2 | T1 | T1 -> T2 | Match |
| T3 | T2 | (cross-phase; no Phase 2 arrow from T2) | Match |
| T4 | T1, T3 | T3 -> T4 (T1 cross-phase) | Match |
| T5 | T1 | standalone in Phase 2 | Match |
| T6 | T1 | (cross-phase) | Match |
| T7 | T1, T6 | T6 -> T7 | Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Domain util | unit | unit | OK |
| T2 | Normalization | unit | unit | OK |
| T3 | PlanEditor UI | unit (RTL) | unit | OK |
| T4 | Plan body ClientDetail | unit | unit | OK |
| T5 | Plan body Independent | unit | unit | OK |
| T6 | Athlete markup | unit (RTL) | unit | OK |
| T7 | Athlete shell | unit | unit | OK |
