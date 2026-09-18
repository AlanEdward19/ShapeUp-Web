# XP Feedback Loop (frontend) — Specification

**Canonical parent**: `ShapeUpApi` / `ShapeUpV2/.specs/features/xp-feedback-loop/spec.md` (read-only). This file is the ShapeUp-Web slice: XPF-01, XPF-02, XPF-03, XPF-05, and the frontend half of XPF-06.

**Backend closed**: XPF-04 and the backend half of XPF-06 are Verified. `GET /api/gamification/me` already returns consistent `totalXp` / `level`. No API change is in scope.

## Problem Statement

Gamification already credits XP on the server. The web app still fails the two moments the user should feel it.

1. After workout feedback, `submitFeedback` enqueues `POST /api/training/workouts/{id}/finish` and opens the local overview modal. Credit happens later via `WorkoutFinished`. There is no XP celebration popup and no pending state while `totalXp` catches up.
2. The dashboard XP bar is supposed to show in-level progress (`totalXp % 500`). Backend investigation ruled out a server defect. The frontend lock for that render lives in `GamificationProgressCard.jsx`; its existing test file never asserts the bar. A zero fill with non-zero in-level XP is a product break.

## Goals

- [ ] Finishing a workout opens an XP popup in pending state, then shows the real delta or a neutral timeout state. Never "+0 XP".
- [ ] Popup image slot is a prop with a lucide placeholder. No mascot art.
- [ ] `GamificationProgressCard` fill is proportional to `totalXp % 500` when that remainder is greater than 0.
- [ ] A regression test in `src/components/gamification/__tests__/GamificationProgressCard.test.jsx` fails on a zero bar with in-level XP greater than 0, and passes after the fix.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| XPF-04 / backend `TotalXp`/`Level` write-read invariant | Already Verified on the API |
| New XP, level, streak, or ShapeScore rules | Gamification mechanics stay closed |
| Mascot artwork | Slot only |
| Platform WebSocket / push | Poll `GET /api/gamification/me` only |
| Nutrition XP in the same popup | Different event cycle |
| Native mobile | Web only |
| New gamification endpoints | Reuse `GET /api/gamification/me` |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Popup timing | Open at the same moment overview opens after feedback. Pending first. Poll `GET /api/gamification/me` every 2000 ms. Stop on delta or at 15000 ms. | Matches canonical assumption. No WebSocket. Endpoint already exists. | n |
| Snapshot of XP before credit | Prefer in-memory snapshot from the last profile fetch. If missing, one GET before the popup opens. Key per workout session so two finishes do not share a snapshot. | Delta must not mix sessions or use a stale hours-old total. | n |
| Neutral timeout copy | Portuguese: "XP em processamento". Never "+0 XP". Never name anti-cheat verdicts. | Canonical UX. Suspicious sessions credit nothing. | n |
| Image slot | Prop `mascotImageUrl` optional. Default: lucide-react icon already used in the app. | User asked for a blank slot, not art. | y |
| Progress-bar root cause | Frontend only. API already returns `totalXp`/`level`. Design investigates `GamificationProgressCard.jsx`. Live athlete `/dashboard` currently paints `AthleteScoreboard`, not this card. This spec still locks the named card and its existing test file. | Parent investigation closed backend. Canonical file name is the card. | y |
| In-level formula | `XP_PER_LEVEL = 500`. Remainder `totalXp % 500`. Empty fill is correct only when remainder is 0. | Same formula already Verified in Gamification. | y |
| Routed finish surface | Athlete finish UI is `TrainingPlansIndependent.jsx` (`src/pages/TrainingPlans.jsx`). `TrainingPlansClient.jsx` still has the same `submitFeedback` and is unrouted. Both get the popup so the duplicate cannot stay silent. | Facts from the router. Canonical text named Client. | y |
| Auth | Popup poll uses the existing authenticated `apiClient` / `useGamificationApi`. | Same as dashboard profile fetch. | y |
| Observability | No new metrics. Existing `apiClient` / mutation queue logs stay as they are. | Out of scope to add platform telemetry. | y |
| Remaining implicit dimensions (rate limits, TTL, circuit breakers, chemo/bio N/A) | N/A for this scope | UI poll + existing GET. No new persistence, no new public API. | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: XP celebration popup after workout finish ⭐ MVP

**User Story**: As an athlete, I want to see XP celebrated when I finish a workout, even if the server confirms the credit a few seconds later.

**Why P1**: Finish flow has zero XP feedback today.

**Acceptance Criteria**:

1. WHEN the user submits end-of-workout feedback (same moment `submitFeedback` opens the overview) THEN the interface SHALL show an XP celebration popup in pending state (spinner or skeleton, no XP number) without blocking the overview.
2. WHILE the popup is pending THEN the interface SHALL poll `GET /api/gamification/me` every 2000 ms until `totalXp` is greater than the pre-finish snapshot or until 15000 ms have elapsed.
3. WHEN a poll returns `totalXp` greater than the snapshot THEN the interface SHALL show the exact delta as `+{delta} XP`, stop polling, and leave pending.
4. WHEN 15000 ms elapse with no increase in `totalXp` THEN the interface SHALL replace pending with the neutral copy "XP em processamento", SHALL not show "+0 XP", and SHALL stop polling.
5. WHEN the popup renders THEN the interface SHALL accept an optional `mascotImageUrl` and SHALL render a lucide placeholder when that prop is absent.
6. WHEN the user dismisses the popup before polling resolves THEN the interface SHALL cancel in-flight polling and SHALL not reopen that session's popup.

**Independent Test**: Finish a plausible workout: popup pending, then real delta. Finish a session that will not credit: pending, then "XP em processamento", never "+0 XP".

**Maps to**: XPF-01, XPF-02, XPF-03

---

### P1: Dashboard in-level XP bar matches real remainder

**User Story**: As an athlete, I want the XP bar to fill with my progress inside the current level.

**Why P1**: Zero bar next to a real level/score breaks trust.

**Acceptance Criteria**:

1. WHEN `GamificationProgressCard` receives `totalXp` that is not a multiple of 500 (example: 750, remainder 250) THEN the progressbar SHALL expose `aria-valuenow` equal to `totalXp % 500` and SHALL set fill width to a positive percentage proportional to that remainder. Never a zero-width fill in that case.
2. WHEN `totalXp % 500 === 0` (including `totalXp === 0`) THEN the progressbar SHALL show 0% fill. This is the only correct empty fill.
3. WHEN `totalXp > 0` THEN the card SHALL not show the zeroed empty-state copy "Complete seu primeiro treino pra começar".
4. WHEN the root-cause fix lands THEN `src/components/gamification/__tests__/GamificationProgressCard.test.jsx` SHALL include a case that encodes the previously broken render (non-zero in-level XP, bar treated as empty) and SHALL pass after the fix.

**Independent Test**: Render profile `totalXp: 750`, `level: 2`. Bar is not empty. Render `totalXp: 1000`. Bar is empty. Existing nutrition-streak tests still pass.

**Maps to**: XPF-05, XPF-06 (frontend)

---

## Edge Cases

- WHEN the user leaves the workout screen before polling resolves THEN the interface SHALL stop polling and SHALL not show the popup on another route.
- WHEN the user finishes two workouts before the first popup resolves THEN each finish SHALL use its own snapshot and its own poll. The shown delta SHALL not mix the two sessions.
- IF `GET /api/gamification/me` fails during polling THEN the interface SHALL count that attempt inside the same 15000 ms budget, SHALL not reset the timer, and SHALL land on the same neutral state as a timeout if no delta arrives.
- WHEN the finish mutation is queued offline THEN the popup SHALL still open pending and SHALL use the same timeout/neutral path when credit cannot be confirmed in 15000 ms.
- WHEN `totalXp` is missing on the payload (`undefined`) THEN the card SHALL treat it as 0 for remainder math and SHALL not throw.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| XPF-01 | P1: Popup pending, poll, resolve, dismiss | Tasks | Implementing |
| XPF-02 | P1: Popup timeout / neutral / poll errors | Tasks | Implementing |
| XPF-03 | P1: Popup image slot | Tasks | Verified |
| XPF-05 | P1: Card bar fill | Tasks | Verified |
| XPF-06 | P1: Card regression test (frontend half) | Tasks | Verified |

**ID format:** `XPF-NN`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 5 total, 5 mapped to tasks, 0 unmapped. XPF-04 is backend Verified and not in this spec's task list.

---

## Success Criteria

- [ ] Finish workout shows pending XP popup that resolves to the credited delta or to "XP em processamento".
- [ ] Image slot exists with lucide default. No mascot asset shipped.
- [ ] `GamificationProgressCard` bar is empty only when `totalXp % 500 === 0`.
- [ ] `GamificationProgressCard.test.jsx` locks that render. Nutrition-streak cases remain.
- [ ] No new gamification formula and no new API.
