# Intermittent Fasting Timer (Web) Validation

**Date**: 2026-09-19
**Spec**: `.specs/features/intermittent-fasting-timer/spec.md`
**Diff range**: `adb50ef^..HEAD` (T1–T8 `adb50ef`…`731a4db` plus docs `fb256c5`; F1–F5 `bff1ef9`, `279f837`, `05e71ed`, `69677f0`, `eab7ed5`)
**Verifier**: independent sub-agent (author ≠ F1–F5 implementer)
**Sensor scratch**: `/tmp/shapeup-iftw-sensor` (removed after run; real worktree porcelain unchanged)

---

## Validation

**Result**: PASS

---

## Task Completion

| Task | Status  | Notes |
| ---- | ------- | ----- |
| T1   | ✅ Done | `formatFastingCountdown` + unit tests |
| T2   | ✅ Done | `apiClient` error.code + `useFastingApi` |
| T3   | ✅ Done | Jejum tab, route, Layout bypass, i18n |
| T4   | ✅ Done | FastingPage P1 + F1–F3 assertions |
| T5   | ✅ Done | Recommendation / custom / history cap |
| T6   | ✅ Done | Diary warning; cancel and end-early not called |
| T7   | ✅ Done | Notification granted / denied / default |
| T8   | ✅ Done | Lint/gate/build; fasting-scoped tests green |
| F1   | ✅ Done | Presets + 30-minute grid |
| F2   | ✅ Done | Off-grid / empty protocol / custom hours refuse PUT |
| F3   | ✅ Done | Eating tick, boundary GET, Override/Agenda attrs |
| F4   | ✅ Done | Disclaimer copy, recommendation PUT, diary, history 14 |
| F5   | ✅ Done | Notification permission default + no error toast |

---

## Spec-Anchored Acceptance Criteria

### P1: Jejum tab and agenda form (IFTW-01)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN athlete opens `/dashboard/nutrition/fasting` and GET clock succeeds THEN show presets `14:10`, `16:8`, `18:6`, `20:4`, eating start on a 30-minute grid, and Save | All four named presets; 30-min start options; Save | `FastingPage.test.jsx:175-187` - `expect(getByLabelText(/14:10/)).toBeInTheDocument()` (same for `16:8`, `18:6`, `20:4`); option values `'12:00'` and `'12:30'`; `getByTestId('fasting-save')` | ✅ PASS |
| WHEN athlete saves `16:8` and `12:00` THEN PUT agenda with `eatingStartMinutes` `720` and IANA timezone | PUT body `eatingStartMinutes === 720` and IANA `timeZone` | `FastingPage.test.jsx:254-259` - `expect(mockPutAgenda).toHaveBeenCalledWith(expect.objectContaining({ protocol: '16:8', eatingStartMinutes: 720, timeZone: expect.any(String) }))`; `useFastingApi.test.js:36-40` - `expect(body).toEqual({ protocol: '16:8', eatingStartMinutes: 720, timeZone: 'America/Sao_Paulo' })` | ✅ PASS |
| IF Save with no protocol or off-grid time THEN refuse PUT and name the field | No PUT; named protocol / eating-start validation | `FastingPage.test.jsx:200-201` - `expect(mockPutAgenda).not.toHaveBeenCalled()` + `/30-minute grid|intervalos de 30 minutos/`; `:220-221` - not called + `/Choose a protocol|Escolha um protocolo/` | ✅ PASS |
| WHERE GET returns 404 `nutrition.fasting.disabled` THEN omit Jejum tab and do not show the form | Tab absent; form not usable | `NutritionNav.test.jsx:51` - `expect(queryByRole('link', { name: /fasting\|jejum/i })).not.toBeInTheDocument()`; `FastingPage.test.jsx:404` - `expect(getByTestId('diary-redirect')).toBeInTheDocument()`; `apiClient.test.js:24-26` - `rejects.toMatchObject({ status: 404, code: 'nutrition.fasting.disabled' })` | ✅ PASS |

### P1: Agenda-driven countdown (IFTW-02)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHILE `clock.status` is `Fasting` and `clock.source` is `Agenda` SHALL show remaining until `boundaryAt` as `hh:mm:ss` | Countdown text `hh:mm:ss` | `FastingPage.test.jsx:274` - `expect(getByTestId('fasting-countdown')).toHaveTextContent(/^01:00:0[0-1]$/)` (fixture `agendaSnapshot` source Agenda); `fastingCountdown.test.js:9` - `expect(formatFastingCountdown(boundary, now)).toBe('01:01:01')` | ✅ PASS |
| WHILE `clock.status` is `Eating` SHALL show remaining until `boundaryAt` | Eating snapshot renders countdown | `FastingPage.test.jsx:290-291` - `expect(countdown).toHaveTextContent(/^01:00:0[0-1]$/)`; `expect(countdown).toHaveAttribute('data-clock-status', 'Eating')` | ✅ PASS |
| WHEN `now` reaches `boundaryAt` THEN GET clock again (or recompute until next GET) and display new `clock.status` without a tap | Auto GET; new status shown | `FastingPage.test.jsx:318-319` - `expect(mockGetClock.mock.calls.length).toBeGreaterThanOrEqual(2)`; `expect(getByTestId('fasting-countdown')).toHaveAttribute('data-clock-status', 'Eating')` | ✅ PASS |
| IF GET returns `Idle` with null agenda THEN empty state and no countdown | Empty visible; countdown absent | `FastingPage.test.jsx:266-267` - `expect(getByTestId('fasting-empty')).toBeInTheDocument()`; `expect(queryByTestId('fasting-countdown')).not.toBeInTheDocument()` | ✅ PASS |
| WHEN remaining time is under 1 hour THEN still format `hh:mm:ss` with hours `00` | `00:mm:ss` | `fastingCountdown.test.js:15` - `expect(formatFastingCountdown(boundary, now)).toBe('00:00:59')` | ✅ PASS |

### P1: Override controls (IFTW-03)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN athlete taps Start with a saved agenda THEN POST override start AND render GET `clock.source` `Override` | POST start; UI source Override | `FastingPage.test.jsx:327` - `expect(mockStartOverride).toHaveBeenCalled()`; `:346` - `expect(getByTestId('fasting-countdown')).toHaveAttribute('data-clock-source', 'Override')` | ✅ PASS |
| WHEN athlete taps End early during override Fasting THEN POST end-early | `endOverrideEarly` called | `FastingPage.test.jsx:478` - `expect(mockEndOverrideEarly).toHaveBeenCalled()` | ✅ PASS |
| WHEN athlete taps Cancel THEN POST cancel AND show agenda clock after the next GET | POST cancel; agenda countdown | `FastingPage.test.jsx:480` - `expect(mockCancelOverride).toHaveBeenCalled()`; `:366` - `expect(getByTestId('fasting-countdown')).toHaveAttribute('data-clock-source', 'Agenda')` | ✅ PASS |
| IF Start is tapped with no agenda THEN refuse POST | `startOverride` not called; named error | `FastingPage.test.jsx:384-385` - `expect(mockStartOverride).not.toHaveBeenCalled()`; `expect(getByText(/Save an agenda\|Salve uma agenda/i)).toBeInTheDocument()` | ✅ PASS |
| WHILE `clock.source` is `Override` SHALL not POST a second Start (disabled or 409) | Start control disabled | `FastingPage.test.jsx:376` - `expect(getByTestId('fasting-start')).toBeDisabled()` | ✅ PASS |

### P1: Reload (IFTW-04)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN athlete reloads Jejum THEN GET `/api/nutrition/fasting` and show that snapshot | GET snapshot endpoint; UI from GET | `useFastingApi.test.js:26` - `expect(apiClient).toHaveBeenCalledWith('/api/nutrition/fasting')`; FastingPage mount waits on GET-backed UI (`FastingPage.test.jsx:266`, `:274`) | ✅ PASS |
| IF GET fails (network/500) THEN nutrition error pattern and SHALL not invent agenda or override | Error text; no countdown/snapshot | `FastingPage.test.jsx:393-395` - `expect(getByTestId('fasting-error')).toHaveTextContent('Server exploded')`; `expect(queryByTestId('fasting-countdown')).not.toBeInTheDocument()` | ✅ PASS |

### P1: Disclaimer (IFTW-05)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHILE fasting tab is visible SHALL show i18n disclaimer (not medical advice; pregnant, under 18, or eating disorder → clinician) | Visible copy covering those points | `FastingPage.test.jsx:166-167` - `expect(disclaimer).toHaveTextContent(/not medical advice/i)`; `expect(disclaimer).toHaveTextContent(/pregnant\|under 18\|eating disorder\|clinician/i)`. Keys also present in `appSurface.js` en/pt/es (`:23-24`, `:223`, `:423`) | ✅ PASS |
| WHEN athlete saves or Starts THEN SHALL not require a blocking confirm modal | Save usable without extra modal | `FastingPage.test.jsx:164-168` - disclaimer present and `expect(getByTestId('fasting-save')).toBeEnabled()` | ✅ PASS |

### P2: Recommendation preselect (IFTW-06)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN GET includes `recommendation.protocol` and agenda is null THEN form preselects that protocol | Radio for that protocol checked | `FastingPage.test.jsx:413` - `expect(getByLabelText(/18:6/)).toBeChecked()` | ✅ PASS |
| WHEN athlete saves a different protocol THEN PUT that agenda | PUT body protocol differs from recommendation | `FastingPage.test.jsx:426-428` - `expect(mockPutAgenda).toHaveBeenCalledWith(expect.objectContaining({ protocol: '16:8' }))` after recommendation `18:6` | ✅ PASS |

### P2: Diary warning (IFTW-07)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHILE last GET `clock.status` is `Fasting`, WHEN athlete adds a diary entry THEN persist as today AND show non-blocking warning | Entry persisted; warning shown | `DiaryDay.test.jsx:111-114` - `expect(mockAddDiaryEntry).toHaveBeenCalledWith(expect.objectContaining({ date: '2026-09-10' }))`; `expect(document.querySelector('[data-testid="fasting-diary-warning"]')).toBeTruthy()`. Persist date is the viewed diary day fixture, not calendar-today | ⚠️ Spec-precision gap |
| WHEN that warning is shown THEN client SHALL not POST cancel or end-early | Neither override write | `DiaryDay.test.jsx:116-117` - `expect(mockCancelOverride).not.toHaveBeenCalled()`; `expect(mockEndOverrideEarly).not.toHaveBeenCalled()` | ✅ PASS |

### P2: Custom hours UI (IFTW-08)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN custom fast hours are an integer 12–23 THEN Save SHALL PUT `fastHours` as specified | PUT `protocol: 'custom'` and `fastHours` | `FastingPage.test.jsx:455-456` - `expect(mockPutAgenda).toHaveBeenCalledWith(expect.objectContaining({ protocol: 'custom', fastHours: 15 }))` | ✅ PASS |
| IF hours are outside 12–23 THEN refuse PUT and name the field | No PUT; customHours validation message | `FastingPage.test.jsx:236-237` - `expect(mockPutAgenda).not.toHaveBeenCalled()`; `expect(getByText(/between 12 and 23\|entre 12 e 23/i)).toBeInTheDocument()` | ✅ PASS |

### P3: History list (IFTW-09)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN Jejum loads THEN GET history and list up to 14 items | History GET; list length cap 14 | `FastingPage.test.jsx:441-443` - `expect(mockGetHistory).toHaveBeenCalled()`; `expect(getByTestId('fasting-history').querySelectorAll('li')).toHaveLength(14)` (15 items stubbed); `useFastingApi.test.js:73` - `expect(apiClient).toHaveBeenCalledWith('/api/nutrition/fasting/history')` | ✅ PASS |
| IF the list is empty THEN empty state, not a zero table | Empty copy; no `0` | `FastingPage.test.jsx:465-467` - `toHaveTextContent(/No completed fasts\|Nenhum jejum/i)`; `not.toHaveTextContent('0')` | ✅ PASS |

### P3: Browser notification (IFTW-10)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHERE Notification permission is granted, WHEN `clock.status` becomes `Eating` THEN one browser notification | Single Notification with i18n title/body | `FastingPage.test.jsx:77-79` - `expect(calls).toEqual([['nutrition.fasting.notifyTitle', { body: 'nutrition.fasting.notifyBody' }]])` | ✅ PASS |
| IF permission is denied or default THEN keep on-screen clock with no notification error toast | No Notification; no error toast | `FastingPage.test.jsx:93` / `:107` - `expect(calls).toHaveLength(0)` (denied and default); `:140-142` - `data-clock-status` Eating and `expect(queryByTestId('fasting-error')).not.toBeInTheDocument()` | ✅ PASS |

**Status**: ⚠️ Spec-precision gaps flagged (IFTW-07 AC1 persist date). All P1–P3 ACs have `file:line` evidence; no remaining coverage gaps.

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `FastingPage.jsx:104` | History `.slice(0, 14)` → `.slice(0, 15)` | ✅ Killed (`FastingPage.test.jsx:443` expected 14 `li`) |
| 2 | `FastingPage.jsx:155-157` | Custom hours range check replaced with `if (false)` | ✅ Killed (`FastingPage.test.jsx:236` expected `mockPutAgenda` not called; PUT fired with `fastHours: 8`) |
| 3 | `FastingPage.jsx:245` | Removed `data-clock-source` attribute | ✅ Killed (`FastingPage.test.jsx:346` / `:366` expected Override / Agenda source; received `null`) |

**Sensor depth**: lightweight (3 behavior-level faults in isolated `git worktree`; `.env` copied into scratch so Vitest could boot)
**Result**: 3/3 killed - PASS
**Isolation**: `git status --porcelain` on the real worktree matched the pre-sensor baseline after `git worktree remove --force`.

---

## Interactive UAT Results

| # | Test | Result | Details |
| - | ---- | ------ | ------- |
| 1 | Browser UAT | ⏭️ Skip | Orchestrator owns interactive UAT |

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Small helpers (`fastingFormUtils`, `diaryFastingPersist`, `fastingPageNotify`) exist to unit-test seams |
| Surgical changes | ✅ Fasting/nav/diary/apiClient surface only; `FoodSearch.jsx` warning path covered in `FoodSearch.test.jsx` |
| No scope creep | ✅ Bound to IFTW UI/client |
| Matches patterns | ✅ Nutrition nav/page/apiClient style |
| Spec-anchored outcome check (asserted values match spec) | ⚠️ IFTW-07 AC1 asserts viewed diary date `2026-09-10`, not calendar-today |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Countdown helper 1:1; page ACs for form, tick, override, history, notify covered |
| Every test maps to a spec requirement - no unclaimed tests | ✅ Fasting-scoped new tests map to IFTW ACs or Done-when |
| Documented guidelines followed: none - strong defaults applied (`tasks.md` coverage matrix) | ✅ |

---

## Edge Cases

- [ ] IF professional or gym user opens Jejum THEN P1 SHALL work on their own account: no role-specific test (same GET/client; not evidenced). Edge-case not covered; does not overturn P1–P3 AC evidence.
- [ ] IF GET returns override with `eatEndsAt` in the past THEN UI SHALL trust GET after IFTA lazy-complete: no dedicated snapshot test; client has no fake-session branch. Edge-case not covered; does not overturn P1–P3 AC evidence.

---

## Gate Check

- **Gate command (Build, tasks.md)**: `npm test && npm run lint && npm run gate && npm run build`
- **Feature gate (fasting-scoped Vitest from tasks.md)**: **68 passed, 0 failed, 0 skipped** (`fastingCountdown`, `useFastingApi`, `apiClient`, `FastingPage`, `NutritionNav`, `DiaryDay`, `FoodSearch`, `Layout.nutrition`, `NutritionWorkspaceShell`)
- **Full `npm test`**: first run **445 passed, 15 failed** (one extra Fasting countdown `waitFor` flake at `FastingPage.test.jsx:274`); rerun **446 passed, 14 failed, 0 skipped** (460 tests). The 14 remaining failures are only `ExerciseDrawer.test.jsx` (6), `ExerciseDrawerSubstitutions.test.jsx` (4), `ExercisesPublicMarkup.test.jsx` (4): `TypeError: Cannot destructure property 't' of 'useLanguage(...)' as it is undefined`. Not in the IFTW diff surface (`adb50ef^..HEAD`). Combined Build `&&` chain is non-zero because of those 14. Feature is not failed solely for that out-of-diff suite.
- **Lint**: 0 errors, 2 pre-existing `react-hooks/exhaustive-deps` warnings (`Exercises.jsx`, `Feedback.jsx`)
- **Test count before feature** (`it(` / `it.each(` under `src` at `adb50ef^`): 415
- **Test count after** (same heuristic at HEAD): 457 (**+42**). Vitest reports 460 cases after expansion.
- **Skipped tests**: none in fasting-scoped files
- **Failures in IFTW scope**: none on fasting-scoped command

---

## Fix Plans

None. Remaining notes are non-blocking:

- IFTW-07 AC1: spec says persist as “today”; tests lock viewed diary day `2026-09-10`. Narrow the spec or assert calendar-today if that is required.
- Edge cases (professional/gym, past `eatEndsAt`): add dedicated tests only if product wants role/lazy-complete UI lock.
- Fasting countdown regex `^01:00:0[0-1]$` can flake if the 1s tick fires before `waitFor` resolves under a loaded full suite.

---

## Requirement Traceability Update

Verifier does not edit `spec.md` (write-only `validation.md`). Recommended statuses:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| IFTW-01 | Design Complete / Needs Fix | ✅ Verified |
| IFTW-02 | Design Complete / Needs Fix | ✅ Verified |
| IFTW-03 | Design Complete / Needs Fix | ✅ Verified |
| IFTW-04 | Design Complete | ✅ Verified |
| IFTW-05 | Design Complete / Needs Fix | ✅ Verified |
| IFTW-06 | Design Complete / Needs Fix | ✅ Verified |
| IFTW-07 | Design Complete / Needs Fix | ⚠️ Verified with spec-precision (persist date = viewed day) |
| IFTW-08 | Design Complete / Needs Fix | ✅ Verified |
| IFTW-09 | Design Complete / Needs Fix | ✅ Verified |
| IFTW-10 | Spec-precision | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready (⚠️ one spec-precision flag)

**Spec-anchored check**: 27/28 ACs matched spec outcome; 1 spec-precision gap (IFTW-07 AC1 “today”)
**Sensor**: 3/3 mutations killed
**Gate**: fasting-scoped 68 passed; full suite 446 passed / 14 failed (unrelated ExerciseDrawer `useLanguage`); lint 0 errors

**What works**: Presets + 30-min grid; 16:8/12:00 PUT 720; Save refuse off-grid / empty protocol / custom hours; 404 tab hide; Fasting and Eating `hh:mm:ss`; boundary refetch GET; Idle empty; Start→Override via `data-clock-source`; Cancel→Agenda; Start refused without agenda; Start disabled on Override; GET failure without invented clock; disclaimer copy; recommendation preselect and PUT different protocol; custom `fastHours: 15`; history GET cap 14; empty history; diary persist + warning without cancel/end-early; granted / denied / default notification.

**Issues found**: IFTW-07 persist date is viewed diary day, not calendar-today. Professional/gym and past `eatEndsAt` lack dedicated tests.

**Next steps**: No implementer fix tasks for uncovered P1–P3 ACs. Interactive UAT remains with the orchestrator. No new lesson: remaining precision is already recorded as L-021.
