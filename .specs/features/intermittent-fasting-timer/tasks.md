# Intermittent Fasting Timer (Web) Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path.

**Design**: `.specs/features/intermittent-fasting-timer/design.md`
**Status**: Complete
**Scope**: ShapeUp-Web `IFTW-01`–`10`. API already shipped.

---

## Test Coverage Matrix

> Guidelines found: none (no coverage thresholds). Floor: `src/pages/Dashboard/Nutrition/__tests__/*.test.jsx`. Strong defaults for domain helpers 1:1 ACs.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| `formatFastingCountdown` | unit | IFTW-02: `hh:mm:ss` including `00:` under 1h; clamp 0 | `src/utils/__tests__/fastingCountdown.test.js` | `npm test` |
| `apiClient` error JSON | unit | failed response sets `error.code` from body | `src/services/__tests__/apiClient.test.js` | `npm test` |
| `useFastingApi` | unit | endpoints + bodies (protocol, eatingStartMinutes 720, timeZone) | `src/hooks/api/__tests__/useFastingApi.test.js` | `npm test` |
| FastingPage / Nav | unit | IFTW-01..06,08,09 ACs: form, save PUT, 404 hides tab, countdown, start/cancel, disclaimer, preselect, custom, history empty | `src/pages/Dashboard/Nutrition/__tests__/FastingPage.test.jsx` and NutritionWorkspaceShell / NutritionNav | `npm test` |
| Diary warning | unit | IFTW-07 | DiaryDay or NutritionDiaryShell test | `npm test` |
| Notifications | unit | IFTW-10 mock Notification | FastingPage test | `npm test` |
| Route wiring | unit | App/Layout fasting path | Layout.nutrition.test.jsx | `npm test` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After unit tasks | `npm test` |
| Full | After page/nav | `npm test && npm run lint` |
| Build | Phase end | `npm test && npm run lint && npm run gate && npm run build` |

---

## Execution Plan

### Phase 1: Foundation

```
T1 → T2 → T3
```

### Phase 2: Jejum screen

```
T4 → T5
```

### Phase 3: Tab extras + diary

```
T6 → T7 → T8
```

---

## Task Breakdown

### Phase 1: Foundation

### T1: formatFastingCountdown

**What**: `hh:mm:ss` from boundary vs now; pad hours; clamp 0.
**Where**: `src/utils/fastingCountdown.js`
**Depends on**: None
**Requirement**: IFTW-02
**Tools**: Skill tlc-spec-driven Execute
**Done when**:
- [x] 3661s remaining → `01:01:01`; 59s → `00:00:59`; past boundary → `00:00:00`
**Tests**: unit
**Gate**: quick
**Commit**: `feat(nutrition): format fasting countdown as hh:mm:ss`

---

### T2: apiClient error code + useFastingApi

**What**: Parse `{ code, message }` on HTTP error. Hook: getClock, putAgenda, start/end-early/cancel, getHistory.
**Where**: `src/hooks/api/useFastingApi.js`
**Depends on**: T1
**Reuses**: `apiClient`, `useNutritionApi` style
**Requirement**: IFTW-01, IFTW-03, IFTW-04
**Tools**: Skill tlc-spec-driven Execute
**Done when**:
- [x] 404 JSON `nutrition.fasting.disabled` → thrown error.code matches
- [x] putAgenda sends `eatingStartMinutes` 720 and IANA `timeZone` for 16:8 / 12:00
**Tests**: unit
**Gate**: quick
**Commit**: `feat(nutrition): add fasting API client hook`

---

### T3: Jejum tab, route, i18n

**What**: Nav tab (hidden on disabled), `App.jsx` child route, en/pt/es keys, Layout.nutrition fasting path, shell test route stub.
**Where**: `src/pages/Dashboard/Nutrition/NutritionNav.jsx`
**Depends on**: T2
**Reuses**: NutritionNav tabs array, App nutrition nested routes
**Requirement**: IFTW-01
**Tools**: Skill tlc-spec-driven Execute
**Done when**:
- [x] GET success shows Jejum link to `/dashboard/nutrition/fasting`
- [x] GET 404 disabled omits the link
- [x] Layout bypass includes fasting URL
**Tests**: unit
**Gate**: quick
**Commit**: `feat(nutrition): add jejum tab and fasting route`

---

### Phase 2: Jejum screen

### T4: FastingPage form, countdown, override, disclaimer, reload GET

**What**: Page loads GET; Idle empty (no countdown); form presets + 30-min start; Save PUT; client validation names fields; countdown from clock; Start/End early/Cancel; Start disabled on Override; Start without agenda refused; GET fail shows error no invented snapshot; disclaimer i18n no modal.
**Where**: `src/pages/Dashboard/Nutrition/FastingPage.jsx`
**Depends on**: T3
**Reuses**: GoalOnboarding chrome, Skeleton
**Requirement**: IFTW-01, IFTW-02, IFTW-03, IFTW-04, IFTW-05
**Tools**: Skill tlc-spec-driven Execute
**Done when**:
- [x] ACs for those IDs covered in FastingPage.test.jsx with mocked useFastingApi
- [x] Gate quick passes
**Tests**: unit
**Gate**: quick
**Commit**: `feat(nutrition): build intermittent fasting jejum page`

---

### T5: Recommendation, custom hours, history

**What**: Preselect recommendation.protocol when agenda null; custom 12–23 PUT `protocol custom` + fastHours; invalid hours named; history GET list or empty state not zeros.
**Where**: `src/pages/Dashboard/Nutrition/FastingPage.jsx`
**Depends on**: T4
**Requirement**: IFTW-06, IFTW-08, IFTW-09
**Tools**: Skill tlc-spec-driven Execute
**Done when**:
- [x] Tests for preselect, custom PUT body, empty history
**Tests**: unit
**Gate**: quick
**Commit**: `feat(nutrition): add fasting recommendation custom hours and history`

---

### Phase 3: Tab extras + diary

### T6: Diary fasting warning

**What**: On diary add while clock.status Fasting, persist entry and show non-blocking warning; do not cancel/end-early.
**Where**: `src/pages/Dashboard/Nutrition/DiaryDay.jsx`
**Depends on**: T5
**Requirement**: IFTW-07
**Tools**: Skill tlc-spec-driven Execute
**Done when**:
- [x] Test add meal + fasting GET Fasting → warning; no cancel POST
**Tests**: unit
**Gate**: quick
**Commit**: `feat(nutrition): warn when logging food during a fast`

---

### T7: Browser notification on Eating

**What**: If Notification.permission granted, one notification when status becomes Eating; denied: no error toast.
**Where**: `src/pages/Dashboard/Nutrition/FastingPage.jsx`
**Depends on**: T6
**Requirement**: IFTW-10
**Tools**: Skill tlc-spec-driven Execute
**Done when**:
- [x] Test with mocked Notification; denied path no toast
**Tests**: unit
**Gate**: quick
**Commit**: `feat(nutrition): notify when fasting eating window starts`

---

### T8: Fasting page gate + i18n completeness

**What**: Lint/gate/build; pt-BR en es disclaimer keys present.
**Where**: `src/i18n/appSurface.js`
**Depends on**: T7
**Requirement**: IFTW-05
**Tools**: Skill tlc-spec-driven Execute
**Done when**:
- [x] `npm run lint && npm run gate && npm run build` pass; fasting slice tests green (see gate notes in orchestrator report)
**Tests**: none
**Gate**: build
**Commit**: `chore(nutrition): gate intermittent fasting web slice`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 → T2 → T3
Phase 2:  T4 → T5
Phase 3:  T6 → T7 → T8
```

Batches: **Batch 1 = T1–T3**. **Batch 2 = T4–T5**. **Batch 3 = T6–T8** (fold 3 into batch 2 if worker capacity allows: T4–T8 after T1–T3).

---

## Task Granularity Check

| Task | Status |
| --- | --- |
| T1 helper | ✅ |
| T2 hook | ⚠️ apiClient+hook cohesive |
| T3 nav/route | ⚠️ related wiring |
| T4 page P1 | ⚠️ one screen |
| T5 extras | ✅ |
| T6 diary | ✅ |
| T7 notify | ✅ |
| T8 gate | ✅ |

---

## Diagram-Definition Cross-Check

| Task | Depends On | Diagram | Status |
| --- | --- | --- | --- |
| T1 | None | start | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T2 | T2 → T3 | ✅ |
| T4 | T3 | T3 → T4 | ✅ |
| T5 | T4 | T4 → T5 | ✅ |
| T6 | T5 | T5 → T6 | ✅ |
| T7 | T6 | T6 → T7 | ✅ |
| T8 | T7 | T7 → T8 | ✅ |

---

## Test Co-location Validation

| Task | Matrix | Task Says | Status |
| --- | --- | --- | --- |
| T1 | unit | unit | ✅ |
| T2 | unit | unit | ✅ |
| T3 | unit | unit | ✅ |
| T4 | unit | unit | ✅ |
| T5 | unit | unit | ✅ |
| T6 | unit | unit | ✅ |
| T7 | unit | unit | ✅ |
| T8 | none | none | ✅ |

---

## Fix Tasks (Verifier gaps)

- [x] **F1** — IFTW-01 AC1: assert all presets and 30-minute grid options
- [x] **F2** — IFTW-01 AC3 + IFTW-08 AC2: invalid agenda save tests
- [x] **F3** — IFTW-02 AC2–AC3, IFTW-03 AC1/AC3: Eating tick, override snapshots + clock data attrs
- [ ] **F4** — IFTW-05/06/07/09: disclaimer, recommendation PUT, diary, history cap
- [ ] **F5** — IFTW-10 AC2: default Notification permission path
