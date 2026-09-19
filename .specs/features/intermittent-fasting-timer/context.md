# Intermittent Fasting Timer Context

**Gathered:** 2026-09-19
**Spec:** `.specs/features/intermittent-fasting-timer/spec.md` (`IFTW-*`)
**Sister (canonical persist):** `ShapeUpV2/.specs/features/intermittent-fasting-timer/` (`IFTA-*`)
**Status:** Ready for design after spec confirmation

---

## Feature Boundary

Web Jejum tab consumes `GET /api/nutrition/fasting`. Agenda + Start override semantics are owned by the API spec. This context is UI-only: tab, countdown, disclaimer, diary banner. No new `nutritionist` role. P2 recommendation is display/preselect only.

---

## Implementation Decisions

### Audience

- P1 is athlete self-serve (`client` and `independent`; professional/gym may use it on their own account).
- Professional (nutricionista usando o role existente) assigns a **recommendation** in P2, never a live session on the coach account.

### Clock model

- Both in P1: agenda + session.
- Agenda advances Fasting ↔ Eating without a tap.
- Start creates an override; End early / Cancel apply only to that override.
- When the override completes or is cancelled, the next boundary is agenda-derived again.
- Agenda change during an override does not mutate that override.

### Agenda shape

- Presets `14:10`, `16:8`, `18:6`, `20:4`.
- Athlete picks eating-window start on a 30-minute grid; eat duration from protocol; fast is the remainder of 24h.

### Agent's Discretion

- Exact layout of the Jejum tab (hierarchy, density, empty state chrome) within existing nutrition shells.
- Redirect vs not-found when the feature flag is off (tab must be omitted either way).
- Production default of `nutrition.intermittent-fasting` (API decision).

### Declined / Undiscussed Gray Areas → Assumptions

- UI home: fifth nutrition tab `/dashboard/nutrition/fasting` (default in spec, not confirmed).
- Diary does not end a fast in P1 (default in spec, not confirmed).
- Disclaimer is a persistent one-liner, not a blocking modal (stated; not challenged).

---

## Specific References

- Foodvisor: Premium fasting programmes + iOS journal fasting toggle; App Store reviews that a fixed daily window does not move when start/end times change — ShapeUp must not copy that failure.
- ShapeUp today: nutrition is athlete diary/foods/plans/goal; no nutritionist role; professionals are `professional`.

---

## Deferred Ideas

- Weekday vs weekend agendas.
- Auto-end fast when a diary meal is logged (P2 is warn-only).
- Native mobile, wearables, push, history, custom hours, browser notifications (P2/P3 or out of scope as in spec).
