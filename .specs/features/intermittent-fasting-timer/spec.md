# Intermittent Fasting Timer (Web) — Specification

> **Scope**: ShapeUp-Web only. Canonical persist, validation, auth, flag, and clock snapshot: `ShapeUpV2/.specs/features/intermittent-fasting-timer/` (`IFTA-*`). This spec owns **UI, client mapping, countdown tick, disclaimer, diary banner**. Do not invent a localStorage product. **API lands first**; Web binds to `GET /api/nutrition/fasting`.

> Nutrition workspace already exists (`/dashboard/nutrition/{diary,foods,meal-plans,goal}`). No `nutritionist` role — `professional` is P2. Foodvisor is an indirect competitor; do not copy schedule-locked windows without Start.

## Problem Statement

The API will store agenda + override. The athlete still needs a Jejum screen: pick protocol and eating start, see a live countdown, Start/End/Cancel, survive reload via GET, and a non-medical disclaimer. Without this slice, the API has no consumer.

## Goals

- [ ] Fifth nutrition tab Jejum at `/dashboard/nutrition/fasting` talks to IFTA endpoints
- [ ] Countdown is `boundaryAt - now` from the last successful GET; tab hide/sleep recomputes on next paint
- [ ] Flag off (API 404 `nutrition.fasting.disabled`) hides the tab
- [ ] Disclaimer visible; diary is not blocked (P2 warning only)

## Out of Scope

| Feature | Reason |
| --- | --- |
| Persist, 400/409 rules, DST, lazy expiry, seed flag | IFTA / ShapeUpV2 |
| Medical advice, multi-day fasts, Foodvisor clone, native apps, wearables | Same as product cut |
| Recalculating macros for fasting days | Goal onboarding owns targets |
| Implementing `/api/nutrition/fasting*` in this repo | Sister spec |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Product model | Athlete P1; agenda auto + Start override current cycle; pro recommendation P2. | User 2026-09-19. | y |
| Contract | Web uses IFTA snapshot fields: `agenda`, `override`, `recommendation`, `clock.status`, `clock.boundaryAt`, `clock.source`. Tick is client-only. | API is source of truth. | y |
| Where it lives | Tab `Jejum` + `NutritionNav` + nested route under `NutritionWorkspaceShell`. | Nutrition home. | n |
| Flag UX | WHERE GET fasting returns 404 `nutrition.fasting.disabled` THEN omit tab and do not render a usable fasting screen. | IFTA-05. | y |
| Client validation | Mirror P1 presets and 30-min grid before PUT so the athlete sees a named field without a round trip; API 400 is still shown. | Same as nutrition forms. | y |
| Failure | Keep last successful GET; show `err.message`. No optimistic Start. | Nutrition pattern. | y |
| Duplicate Start | Disable Start while `clock.source` is Override; if API 409, keep showing current GET. | IFTA-03. | y |
| Auth / observability / expiry | N/A because Web adds no new auth server or telemetry. Remaining dimensions are IFTA. | Frontend slice. | y |
| Diary P1 | Add meal does not call fasting write APIs. | IFTA diary assumption. | n |
| Disclaimer | One-liner i18n, no blocking modal. | Not challenged. | y |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Jejum tab and agenda form ⭐ MVP

**User Story**: As an athlete, I want to save 16:8 and when I eat so the agenda exists on the server.

**Why P1**: IFTA-01 consumer.

**Acceptance Criteria**:

1. WHEN the athlete opens `/dashboard/nutrition/fasting` and GET clock succeeds THEN the system SHALL show presets `14:10`, `16:8`, `18:6`, `20:4`, eating start on a 30-minute grid, and Save
2. WHEN the athlete saves `16:8` and `12:00` THEN the client SHALL PUT IFTA agenda with `eatingStartMinutes` `720` and the browser IANA timezone
3. IF Save is tapped with no protocol or an off-grid time THEN the client SHALL refuse PUT and SHALL name the field
4. WHERE GET returns 404 `nutrition.fasting.disabled` THEN the system SHALL omit the Jejum tab and SHALL not show the form

**Independent Test**: Flag on → save 16:8 12:00 → GET shows that agenda. Flag off → no tab.

---

### P1: Agenda-driven countdown ⭐ MVP

**User Story**: As an athlete, I want the clock to follow `clock` from GET without tapping Start.

**Why P1**: IFTA-02 consumer.

**Acceptance Criteria**:

1. WHILE `clock.status` is `Fasting` and `clock.source` is `Agenda` the system SHALL show remaining time until `clock.boundaryAt` as `hh:mm:ss`
2. WHILE `clock.status` is `Eating` the system SHALL show remaining time until `clock.boundaryAt`
3. WHEN `now` reaches `boundaryAt` THEN the system SHALL GET clock again (or recompute only until the next GET) and SHALL display the new `clock.status` without requiring a tap
4. IF GET returns `Idle` with null agenda THEN the system SHALL show empty state and SHALL not show a countdown
5. WHEN remaining time is under 1 hour THEN the system SHALL still format `hh:mm:ss` with hours `00`

**Independent Test**: Mock GET Fasting `boundaryAt` +1h → UI ~01:00:00.

---

### P1: Override controls ⭐ MVP

**User Story**: As an athlete, I want Start / End early / Cancel mapped to IFTA-03/04.

**Why P1**: Foodvisor gap.

**Acceptance Criteria**:

1. WHEN the athlete taps Start with a saved agenda THEN the client SHALL POST override start and SHALL render GET `clock.source` `Override`
2. WHEN the athlete taps End early during override Fasting THEN the client SHALL POST end-early
3. WHEN the athlete taps Cancel THEN the client SHALL POST cancel and SHALL show agenda clock after the next GET
4. IF Start is tapped with no agenda THEN the client SHALL refuse POST
5. WHILE `clock.source` is `Override` the system SHALL not POST a second Start (control disabled or 409 surfaced without a second session)

**Independent Test**: Start → override countdown; Cancel → agenda countdown.

---

### P1: Reload ⭐ MVP

**User Story**: As an athlete, I want refresh to call GET, not a new Start.

**Why P1**: IFTA persist.

**Acceptance Criteria**:

1. WHEN the athlete reloads Jejum THEN the system SHALL GET `/api/nutrition/fasting` and SHALL show that snapshot
2. IF GET fails (network/500) THEN the system SHALL show the nutrition error pattern and SHALL not invent agenda or override

**Independent Test**: Start → refresh → same override remaining time within 2s.

---

### P1: Disclaimer ⭐ MVP

**User Story**: As ShapeUp, I want fasting not presented as treatment.

**Why P1**: Health-adjacent UI.

**Acceptance Criteria**:

1. WHILE the fasting tab is visible the system SHALL show i18n disclaimer (not medical advice; pregnant, under 18, or eating disorder → clinician)
2. WHEN the athlete saves or Starts THEN the system SHALL not require a blocking confirm modal

**Independent Test**: Disclaimer visible; Save works in one extra click after fields.

---

### P2: Recommendation preselect

**User Story**: As an athlete, I want the professional's protocol preselected when I have no agenda.

**Why P2**: IFTA-06 consumer.

**Acceptance Criteria**:

1. WHEN GET includes `recommendation.protocol` and agenda is null THEN the form SHALL preselect that protocol
2. WHEN the athlete saves a different protocol THEN the client SHALL PUT that agenda (IFTA allows differ)

---

### P2: Diary warning

**User Story**: As an athlete, I want a warning if I log food while Fasting.

**Why P2**: No API change to diary.

**Acceptance Criteria**:

1. WHILE last GET `clock.status` is `Fasting`, WHEN the athlete adds a diary entry THEN the diary SHALL persist as today and SHALL show a non-blocking warning
2. WHEN that warning is shown THEN the client SHALL not POST cancel or end-early

---

### P2: Custom hours UI

**User Story**: As an athlete, I want to enter fast hours 12–23.

**Why P2**: IFTA-07.

**Acceptance Criteria**:

1. WHEN custom fast hours are an integer 12–23 THEN Save SHALL PUT `fastHours` as specified by IFTA-07
2. IF hours are outside 12–23 THEN the client SHALL refuse PUT and SHALL name the field

---

### P3: History list

**User Story**: As an athlete, I want recent overrides listed.

**Why P3**: IFTA-08.

**Acceptance Criteria**:

1. WHEN Jejum loads THEN the system SHALL GET history and SHALL list up to 14 items
2. IF the list is empty THEN the system SHALL show empty state, not a zero table

---

### P3: Browser notification

**User Story**: As an athlete, I want an optional notification when status becomes Eating.

**Why P3**: On-screen clock is enough for P1.

**Acceptance Criteria**:

1. WHERE Notification permission is granted, WHEN `clock.status` becomes `Eating` THEN the system SHALL show one browser notification
2. IF permission is denied or default THEN the system SHALL keep the on-screen clock with no notification error toast

---

## Edge Cases

- IF the professional or gym user opens Jejum THEN P1 SHALL work on their own account
- IF GET returns override with `eatEndsAt` in the past THEN UI SHALL trust GET after IFTA lazy-complete (no client-side fake session)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| IFTW-01 | P1: Jejum tab and agenda form | Execute | ✅ Verified |
| IFTW-02 | P1: Agenda-driven countdown | Execute | ✅ Verified |
| IFTW-03 | P1: Override controls | Execute | ✅ Verified |
| IFTW-04 | P1: Reload | Execute | ✅ Verified |
| IFTW-05 | P1: Disclaimer | Execute | ✅ Verified |
| IFTW-06 | P2: Recommendation preselect | Execute | ✅ Verified |
| IFTW-07 | P2: Diary warning | Execute | ✅ Verified (persist date = viewed diary day) |
| IFTW-08 | P2: Custom hours UI | Execute | ✅ Verified |
| IFTW-09 | P3: History list | Execute | ✅ Verified |
| IFTW-10 | P3: Browser notification | Execute | ✅ Verified |

**ID format:** `IFTW-NN`. Backend: `IFTA-NN`.

**Coverage:** 10 total, 0 mapped to tasks, 10 unmapped

---

## Success Criteria

- [x] Save agenda → GET → countdown without Start
- [x] Start → refresh → override; Cancel → agenda
- [x] GET fail → no invented state
- [x] Disclaimer in pt-BR, en, es
- [x] 404 disabled → no Jejum tab
