# Time-Based Exercises (Frontend) — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/time-based-exercises/design.md`
**Status**: Draft
**Scope**: ShapeUp-Web only. Assume WEV frontend (WEV-01 weight/reps gate, WEV-07 RequireRpe) is already on HEAD. **Branch by `ExerciseType`. Do not rewrite WEV.** Backend API is closed at `7f886ab`.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `package.json` (`test`, `lint`, `gate`, `build`), `vitest.config.js` (jsdom, `src/test/setup.js`), existing samples `src/utils/__tests__/workoutStatePayload.test.js`, `src/components/training` (no tests yet), `src/pages/Dashboard/__tests__/PlanEditorShell.test.jsx` (re-export only). No AGENTS.md. Strong defaults applied for domain utils; page import-rewires stay build-only to match current TrainingPlansClient coverage floor.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Domain utils (`trainingEnums` ExerciseType, `durationDistance`, `workoutPlanPayload`, `setCompletionGate`, `workoutStatePayload`, `workoutHistory`) | unit | All branches; 1:1 to TBE-02/03/05 ACs and listed edge cases | `src/utils/__tests__/*.test.js` | `npm test` |
| Editor components (`SetRow`, `ExerciseRow`) | unit | TimeBased vs WeightBased render; technique lock; mixed headers | `src/components/training/__tests__/*.test.jsx` | `npm test` |
| i18n key rows | none | Build/lint only | `src/contexts/LanguageContext.jsx` | build gate |
| Page import rewire (`ClientDetail`, `TrainingPlansIndependent`, `TrainingPlansClient` after utils exist) | none | Behavior covered in utils + SetRow/ExerciseRow | — | build gate |
| Entity/config | none | — | — | build gate |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After unit-test tasks | `npm test` |
| Full | After editor component tasks | `npm test && npm run lint` |
| Build | After i18n / import-only tasks and at phase end | `npm run gate && npm run lint && npx tsc --noEmit && npm test && npm run build` |

---

## Execution Plan

Phases run sequentially. Tasks inside a phase run in order.

### Phase 1: Foundation

```
T1 -> T2 -> T3 -> T4 -> T5 -> T6
```

### Phase 2: Editor UI

```
T7 -> T8 -> T9 -> T10 -> T11
```

### Phase 3: Execution gate, payload, summary

```
T12 -> T13 -> T14 -> T15 -> T16
```

---

## Task Breakdown

### Phase 1: Foundation

### T1: Add ExerciseType enum maps

**What**: Map/unmap API `ExerciseType` (`1` WeightBased, `2` TimeBased, names) with WeightBased default.
**Where**: `src/utils/trainingEnums.js`
**Depends on**: None
**Reuses**: `unmapTechnique` / `unmapSetType`
**Requirement**: TBE-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `unmapExerciseType(2)` and `unmapExerciseType('TimeBased')` return `timeBased`
- [x] Missing/unknown values return `weightBased`
- [x] Gate check passes: `npm test`
- [x] Test count: at least 3 new assertions (no silent deletions)

**Tests**: unit
**Gate**: quick
**Commit**: `feat(training): map ExerciseType enum on the web client`

---

### T2: Duration and distance parsers

**What**: Parse/format `mm:ss`/`hh:mm:ss` to seconds; parse optional meters; invalid duration is null; negative distance fails.
**Where**: `src/utils/durationDistance.js`
**Depends on**: T1
**Reuses**: `TrainingPlansClient.jsx` `formatTime` display rules
**Requirement**: TBE-02, TBE-03, TBE-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `parseDurationInput('05:00') === 300`; `'abc'` and `''` return `null`; `'0:00'` returns `null` or 0 treated as invalid for gates (`null` or `<= 0`)
- [x] Empty distance parses as `{ ok: true, value: null }`; `'-1'` is not ok; `'1000'` is 1000
- [x] `formatDistanceMeters(1000)` uses km; `500` stays meters
- [x] Gate check passes: `npm test`
- [x] Test count: at least 8 assertions covering AC edge cases (invalid format, negative distance)

**Tests**: unit
**Gate**: quick
**Commit**: `feat(training): parse time-based duration and distance inputs`

---

### T3: Normalize planned sets with duration fields

**What**: `normalizeSet` / `normalizeBlockExercise` keep `durationSeconds`/`distanceMeters` and `exerciseType` (default WeightBased).
**Where**: `src/utils/trainingNormalization.js`
**Depends on**: T2
**Reuses**: T1 `unmapExerciseType`
**Requirement**: TBE-02, TBE-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] API set `{ durationSeconds: 300, distanceMeters: 1000 }` normalizes to editor `duration`/`distance` strings via T2 formatters
- [x] Missing type normalizes to `weightBased`
- [x] Gate check passes: `npm test`
- [x] Test count: at least 3 assertions

**Tests**: unit
**Gate**: quick
**Commit**: `feat(training): normalize duration and exercise type on planned sets`

---

### T4: Shared workout plan payload builder

**What**: Extract TimeBased-aware `buildWorkoutPlanBody`, `createDefaultPlannedSet`, and `findTimeBasedDurationError`.
**Where**: `src/utils/workoutPlanPayload.js`
**Depends on**: T3
**Reuses**: duplicated builders in `ClientDetail.jsx` and `TrainingPlansIndependent.jsx`
**Requirement**: TBE-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] TimeBased set with `05:00` and empty distance sends `durationSeconds: 300`, `distanceMeters: null`, `load: null`, `repetitions: null`, `technique: 1`
- [x] WeightBased set still sends numeric load/reps as today
- [x] `findTimeBasedDurationError` returns a message naming duration when duration is missing
- [x] `createDefaultPlannedSet('timeBased')` is Straight + duration preset, no load/reps
- [x] Gate check passes: `npm test`
- [x] Test count: at least 4 tests (TimeBased save shape, WeightBased regression, missing duration, default set)

**Tests**: unit
**Gate**: quick
**Commit**: `feat(training): build plan payloads for time-based sets`

---

### T5: Point ClientDetail at shared plan payload

**What**: Delete local `buildWorkoutPlanBody`; import T4. Do not change WEV RequireRpe fields.
**Where**: `src/pages/Dashboard/ClientDetail.jsx`
**Depends on**: T4
**Reuses**: `src/utils/workoutPlanPayload.js`
**Requirement**: TBE-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] File has no local `buildWorkoutPlanBody` function
- [x] Save/copy paths call the shared builder
- [x] Gate check passes: `npm run gate && npm run lint && npx tsc --noEmit && npm test && npm run build`

**Tests**: none
**Gate**: build
**Commit**: `refactor(training): use shared plan payload in ClientDetail`

---

### T6: Point TrainingPlansIndependent at shared plan payload

**What**: Same import swap as T5 for the independent planner.
**Where**: `src/pages/Dashboard/TrainingPlansIndependent.jsx`
**Depends on**: T5
**Reuses**: `src/utils/workoutPlanPayload.js`
**Requirement**: TBE-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] File has no local `buildWorkoutPlanBody` function
- [x] Gate check passes: `npm run gate && npm run lint && npx tsc --noEmit && npm test && npm run build`

**Tests**: none
**Gate**: build
**Commit**: `refactor(training): use shared plan payload in independent planner`

---

### Phase 2: Editor UI

### T7: Add duration/distance i18n keys

**What**: Add en/pt/es keys for editor and execution duration/distance labels.
**Where**: `src/contexts/LanguageContext.jsx`
**Depends on**: None
**Reuses**: existing `pro.builder.set.reps` / `client.session.table.weight` neighbors
**Requirement**: TBE-02, TBE-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Keys exist in all three locale objects: `pro.builder.set.duration`, `pro.builder.set.distance`, `client.session.table.duration`, `client.session.table.distance`
- [x] Gate check passes: `npm run gate && npm run lint && npx tsc --noEmit && npm test && npm run build`

**Tests**: none
**Gate**: build
**Commit**: `feat(i18n): add duration and distance labels`

---

### T8: TimeBased SetRow inputs and Straight-only technique

**What**: For `exerciseType === 'timeBased'`, render duration + distance; technique select only Straight. WeightBased unchanged.
**Where**: `src/components/training/SetRow.jsx`
**Depends on**: T7
**Reuses**: `Input`, `TECHNIQUES`
**Requirement**: TBE-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] TimeBased: no load/reps inputs; duration required field present; distance optional; technique cannot become Drop Set
- [x] WeightBased: load/reps and full technique list still render
- [x] Gate check passes: `npm test && npm run lint`
- [x] Test count: at least 2 RTL tests (TimeBased vs WeightBased)

**Tests**: unit
**Gate**: full
**Commit**: `feat(training): swap set-row inputs for time-based exercises`

---

### T9: ExerciseRow headers follow exercise type

**What**: Pass `exercise.exerciseType` into SetRow; swap column labels; `newSet` uses `createDefaultPlannedSet`.
**Where**: `src/components/training/ExerciseRow.jsx`
**Depends on**: T8
**Reuses**: T4 `createDefaultPlannedSet`, T7 keys
**Requirement**: TBE-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] TimeBased headers show duration/distance instead of reps/load
- [x] Add-set on TimeBased uses Straight + duration default
- [x] Gate check passes: `npm test && npm run lint`
- [x] Test count: at least 2 RTL tests

**Tests**: unit
**Gate**: full
**Commit**: `feat(training): show time-based columns on exercise rows`

---

### T10: PlanEditor add-exercise defaults and save guard

**What**: Library pick copies `exerciseType`; TimeBased uses `createDefaultPlannedSet`; save calls `findTimeBasedDurationError` before API.
**Where**: `src/pages/Dashboard/ClientDetail.jsx`
**Depends on**: T9
**Reuses**: T4 helpers, existing `alertModal`
**Requirement**: TBE-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `handleSelectExercise` stores `exerciseType` from catalog (`unmapExerciseType`)
- [x] Mixed Superset add does not introduce a new error
- [x] Save with blank TimeBased duration shows the duration error and does not call create/update
- [x] Gate check passes: `npm run gate && npm run lint && npx tsc --noEmit && npm test && npm run build`

**Tests**: none
**Gate**: build
**Commit**: `feat(training): default time-based sets when adding catalog exercises`

---

### T11: Independent planner add-exercise defaults and save guard

**What**: Mirror T10 in the independent planner (pick, defaults, save guard).
**Where**: `src/pages/Dashboard/TrainingPlansIndependent.jsx`
**Depends on**: T10
**Reuses**: T4 helpers
**Requirement**: TBE-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Same defaults and save guard as T10
- [x] Gate check passes: `npm run gate && npm run lint && npx tsc --noEmit && npm test && npm run build`

**Tests**: none
**Gate**: build
**Commit**: `feat(training): default time-based sets in independent planner`

---

### Phase 3: Execution gate, payload, summary

### T12: Set completion gate with type branch

**What**: `canCompleteSet` / `shouldUncompleteSet`: WeightBased = existing WEV-01/WEV-07 predicates unchanged; TimeBased = duration `>= 1`, empty distance ok, invalid/negative distance not ok, extras included, RequireRpe still applies.
**Where**: `src/utils/setCompletionGate.js`
**Depends on**: None
**Reuses**: WEV predicates already on HEAD; T2 parsers
**Requirement**: TBE-03, TBE-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Tests cover TBE-03 AC1–AC7 (WeightBased regression, blank duration, duration without distance, bad distance, auto-uncomplete, extra set, RequireRpe)
- [x] Invalid duration format is treated as empty
- [x] Gate check passes: `npm test`
- [x] Test count: at least 7 tests, 1:1 with those ACs (no silent deletions)

**Tests**: unit
**Gate**: quick
**Commit**: `feat(training): branch set completion on ExerciseType`

---

### T13: Workout state payload TimeBased branch

**What**: Completed TimeBased sets send `durationSeconds`, optional `distanceMeters`, null load/reps; WeightBased payload unchanged.
**Where**: `src/utils/workoutStatePayload.js`
**Depends on**: T12
**Reuses**: T2 parsers; existing intensity mapping
**Requirement**: TBE-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] TimeBased completed set matches spec AC4 payload
- [x] WeightBased fallback-to-prescribed test still passes
- [x] Gate check passes: `npm test`
- [x] Test count: existing tests stay green plus at least 1 TimeBased test

**Tests**: unit
**Gate**: quick
**Commit**: `feat(training): sync duration and distance on execution state`

---

### T14: Runtime session mapping and toggleSetComplete branch

**What**: Join catalog type in `toRuntimeSets`; extend log; extra sets include duration/distance; `toggleSetComplete` calls `setCompletionGate` (WEV branch untouched).
**Where**: `src/pages/Dashboard/TrainingPlansClient.jsx`
**Depends on**: T13
**Reuses**: T12, `useExercises` catalog, WEV highlight/shake already on HEAD
**Requirement**: TBE-03, TBE-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Runtime exercise has `exerciseType`; TimeBased `target` uses duration not "reps @ load"
- [x] `addExtraSet` log includes `duration` and `distance`
- [x] Complete path does not flip `completed` when `canCompleteSet` is false; rest does not start
- [x] Clearing duration on a completed TimeBased set uncompletes it
- [x] Gate check passes: `npm run gate && npm run lint && npx tsc --noEmit && npm test && npm run build`

**Tests**: none
**Gate**: build
**Commit**: `feat(training): apply time-based completion on the session screen`

---

### T15: Execution row and summary columns

**What**: TimeBased rows replace weight/reps inputs; RPE always shown; `SessionDetailModal` shows duration/distance instead of reps/peso.
**Where**: `src/pages/Dashboard/TrainingPlansClient.jsx`
**Depends on**: T14
**Reuses**: T7 keys, `su-exec-input`
**Requirement**: TBE-04, TBE-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] TimeBased live row has duration + distance + RPE, not weight/reps
- [x] WeightBased live row still has weight/reps + RPE
- [x] Summary table branches the same way
- [x] Gate check passes: `npm run gate && npm run lint && npx tsc --noEmit && npm test && npm run build`

**Tests**: none
**Gate**: build
**Commit**: `feat(training): show duration inputs on execution and summary`

---

### T16: History mapper keeps duration and distance

**What**: `workoutHistory` copies `durationSeconds`/`distanceMeters` onto mapped sets so summary can read them from API sessions.
**Where**: `src/utils/workoutHistory.js`
**Depends on**: T15
**Reuses**: existing volume reduce (TimeBased volume 0 is correct)
**Requirement**: TBE-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Mapped TimeBased set exposes duration and distance
- [ ] Existing lbs volume test still passes
- [ ] Gate check passes: `npm test`
- [ ] Test count: existing tests plus at least 1 TimeBased mapping test

**Tests**: unit
**Gate**: quick
**Commit**: `feat(training): keep duration on workout history sets`

---

## Phase Execution Map

```
Phase 1 -> Phase 2 -> Phase 3

Phase 1:  T1 -> T2 -> T3 -> T4 -> T5 -> T6
Phase 2:  T7 -> T8 -> T9 -> T10 -> T11
Phase 3:  T12 -> T13 -> T14 -> T15 -> T16
```

Execution is strictly sequential. ~16 tasks pack into three batches (~6, ~5, ~5). Offer batch sub-agents at Execute.

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: ExerciseType maps | 1 file, enum helpers | Granular |
| T2: durationDistance | 1 file, parsers | Granular |
| T3: normalize | 1 file | Granular |
| T4: plan payload util | 1 file | Granular |
| T5: ClientDetail import | 1 file rewire | Granular |
| T6: Independent import | 1 file rewire | Granular |
| T7: i18n keys | 1 file | Granular |
| T8: SetRow | 1 component | Granular |
| T9: ExerciseRow | 1 component | Granular |
| T10: PlanEditor wiring | 1 file | Granular |
| T11: Independent wiring | 1 file | Granular |
| T12: setCompletionGate | 1 file | Granular |
| T13: state payload | 1 file | Granular |
| T14: session mapping/gate | 1 file | Granular |
| T15: execution/summary UI | 1 file | Granular |
| T16: workoutHistory | 1 file | Granular |

**Granularity check**: each `Where` is a single file.

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | Phase 1 start | Match |
| T2 | T1 | T1 -> T2 | Match |
| T3 | T2 | T2 -> T3 | Match |
| T4 | T3 | T3 -> T4 | Match |
| T5 | T4 | T4 -> T5 | Match |
| T6 | T5 | T5 -> T6 | Match |
| T7 | None | Phase 2 start | Match |
| T8 | T7 | T7 -> T8 | Match |
| T9 | T8 | T8 -> T9 | Match |
| T10 | T9 | T9 -> T10 | Match |
| T11 | T10 | T10 -> T11 | Match |
| T12 | None | Phase 3 start | Match |
| T13 | T12 | T12 -> T13 | Match |
| T14 | T13 | T13 -> T14 | Match |
| T15 | T14 | T14 -> T15 | Match |
| T16 | T15 | T15 -> T16 | Match |

T7/T12 `Depends on: None` are valid: they only need prior **phases**, which the sequential phase rule already enforces. No forward-phase deps.

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Domain utils | unit | unit | OK |
| T2 | Domain utils | unit | unit | OK |
| T3 | Domain utils | unit | unit | OK |
| T4 | Domain utils | unit | unit | OK |
| T5 | Page import rewire | none | none | OK |
| T6 | Page import rewire | none | none | OK |
| T7 | i18n key rows | none | none | OK |
| T8 | Editor components | unit | unit | OK |
| T9 | Editor components | unit | unit | OK |
| T10 | Page import rewire | none | none | OK |
| T11 | Page import rewire | none | none | OK |
| T12 | Domain utils | unit | unit | OK |
| T13 | Domain utils | unit | unit | OK |
| T14 | Page import rewire | none | none | OK |
| T15 | Page import rewire | none | none | OK |
| T16 | Domain utils | unit | unit | OK |

---

## MCPs and Skills (confirm before Execute)

Available MCPs: Cursor filesystem/shell; browser (`cursor-ide-browser`) if a manual execution pass is wanted. Available Skills: `tlc-spec-driven` (required on Execute). No Figma/Notion required for these tasks.
