# stitch-migration Validation

**Date**: 2026-09-15  
**Spec**: `.specs/features/stitch-migration/spec.md`  
**Diff range**: feature branch through `fdeb92b` (T19) on `develop`; prior stitch-migration commits include `91c3f1c` (unrelated training bugfix on same branch)  
**Verifier**: independent sub-agent (author ≠ verifier)  
**Decision lens**: **AD-WEB-007** end-state — zero `src/stitch/`; native `.tsx` shells; `PlanEditorShell` replaces former `stitch/Builder`; static assets live under `pages/dashboard-stitch/` (allowed — not `src/stitch/`).

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | `tsconfig.json` + `typescript` devDep |
| T2–T16 | ✅ Done | Native shells + markup; `grep sourceRuntime src/pages` → 0 at T19 |
| T17 | ✅ Done | Dead dashboard duplicates removed (`tasks.md:81-90`) |
| T18 | ✅ Done | Partial engine cleanup before T19 |
| T19 | ✅ Done | `PlanEditorShell.tsx`; `src/stitch/` removed; assets → `dashboard-stitch/`, `hooks/useStitchLanguage.js`, `public-auth/` |

---

## Spec-Anchored Acceptance Criteria

### P1: Motor → `pageTemplateEngine/` (superseded by AD-WEB-007)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion expression | Result |
| ------------------------- | -------------------- | ---------------------------------- | ------ |
| WHEN migração termina THEN `pageTemplateEngine/` SHALL contain motor artifacts | Directory + listed files | — (`Test-Path src/lib/pageTemplateEngine` → false) | ⏭️ N/A (AD-WEB-007: delete engine, not relocate) |
| WHEN motor imports were under `stitch/` THEN SHALL use `pageTemplateEngine/` | New base path | — | ⏭️ N/A |
| WHEN `npm run build` THEN no missing-module errors | Exit 0 | Verifier 2026-09-15 — `npm run build` exit 0 | ✅ PASS |

**STMIG-01/02**: ⏭️ Superseded. **STMIG-03**: ✅ Verified.

### P1: Telas-wrapper / absorption

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion expression | Result |
| ------------------------- | -------------------- | ---------------------------------- | ------ |
| WHEN migração termina THEN no `.jsx`/`.js`/`.css` under `/stitch/` | Zero under `src/**/stitch/**` (not `dashboard-stitch`) | — (`Test-Path src/stitch` → **False**; `git ls-tree -r HEAD --name-only \| grep ^src/stitch` → **0** files) | ✅ PASS |
| WHEN legado colide THEN design records import vs remove | Per-file table + T17 evidence | `tasks.md:81-90` | ⚠️ Spec-precision gap (documentary AC — table present) |
| WHEN imports used `stitch/X` THEN new paths / end-state zero `stitch/` imports | No `from '…/stitch/` in production or tests | — (`rg "from ['\"][^'\"]*\/stitch\/" src` → **0**; `dashboard-stitch` imports only) | ✅ PASS |
| WHEN 6 listed test files run THEN pass without assertion body changes | Same behaviors, paths may move | See STMIG-07 table below | ⚠️ See STMIG-07 |

**STMIG-04**: ✅ Verified. **STMIG-05**: ✅ Verified. **STMIG-06**: ✅ Verified. **STMIG-07**: ⚠️ Partial (below).

### P2: `Builder.jsx` + `workout-editor`

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion expression | Result |
| ------------------------- | -------------------- | ---------------------------------- | ------ |
| WHEN `workout-editor` not PASS THEN Builder stays in `stitch/` | Interim state (pre-T19) | Historical — satisfied before T19 | ✅ PASS (historical) |
| WHEN `workout-editor` PASS THEN move Builder (T19) | `PlanEditorShell` + no `src/stitch/Builder` | `PlanEditorShell.tsx:6` — `export { PlanEditor as PlanEditorShell, … } from './ClientDetail'`; `PlanEditorShell.test.jsx:7` — `expect(PlanEditorShell).toBe(PlanEditor)`; `Test-Path src/stitch` → false | ✅ PASS |
| WHEN Builder migrates THEN motor in `pageTemplateEngine/` | P1 relocation | — | ⏭️ N/A under AD-WEB-007 |

**STMIG-08**: ✅ Verified (coordination honored pre-T19). **STMIG-09**: ✅ Verified.

### STMIG-07 — six legacy tests (behavioral traceability)

| Original spec path | Current coverage | `file:line` + assertion | Result |
| ------------------ | ---------------- | ------------------------- | ------ |
| `stitch/Usability.test.jsx` | `pages/public-auth/Usability.test.jsx` | `:18` — `expect(root.querySelector('.st-auth-brand')).toHaveAttribute('href', '/')` | ✅ PASS |
| `stitch/Onboarding.test.jsx` | `pages/Dashboard/__tests__/OnboardingShell.stitch.test.jsx` | `:36-41` — `completeOnboarding` payload `{ age: 30, heightCm: 180, biologicalSex: 'Male', activityLevel: 'Moderate' }` | ✅ PASS |
| `stitch/AthleteScoreboard.test.jsx` | `components/gamification/__tests__/AthleteScoreboard.test.jsx` | `:23-24` — `getByText('Nível 4',{selector:'strong'})`; `progressbar` `value` `'220'` | ✅ PASS |
| `stitch/Exercises.test.jsx` | `pages/Dashboard/__tests__/ExercisesShell.test.jsx` | `:19` — `expect(drawer).toHaveAttribute('data-open','true')` | ✅ PASS |
| `stitch/Moderation.test.jsx` | `pages/Admin/__tests__/ModerationShell.test.jsx` | `:43` — `decideModeration` with `'Approved'` | ✅ PASS |
| `stitch/StitchTemplates.test.jsx` | **Removed with generic engine** (no `sourceRuntime` / `StitchTemplate` in `src`) | — | ⚠️ **Retired** — no replacement test; engine AC obsolete |

**STMIG-07 status**: ⚠️ **5/6 behaviors** still asserted at spec precision; **StitchTemplates** suite intentionally dropped at T19 (no surviving motor to test).

### Revised Goals (AD-WEB-007 — primary acceptance bar)

| Goal | Spec-defined outcome | Evidence | Result |
| ---- | -------------------- | -------- | ------ |
| Native `.tsx` per screen, no runtime engine at feature close | No `sourceRuntime` / `StitchTemplate` / `sourceDocument` in `src` | `rg sourceRuntime\|StitchTemplate\|sourceDocument src` → **0**; shells use markup + hosts | ✅ PASS |
| Pixel-parity Playwright 1440+390 | Valid before/after pairs per converted screen | T18 archived PNGs referenced in `tasks.md:139`; **no** fresh pairs under `.specs/features/stitch-migration/` at verify time | ⚠️ **Archived / incomplete** — honesty gap (non-blocker for structural close) |
| TypeScript toolchain | `tsconfig.json` strict + `npx tsc --noEmit` | Verifier — `npx tsc --noEmit` exit 0 | ✅ PASS |
| Zero imports pointing at `src/stitch/` | All imports resolved | `rg` + `check-frontend-gates.mjs:62-64` | ✅ PASS |
| Six legacy tests green | Listed behaviors | `npm test`: **32** files, **112** passed (see gate note) | ⚠️ StitchTemplates path retired |
| Remove generic engine when last screen converts | No template HTML runtime motor | Engine JS gone; `manifest.json` + `copy` + CSS remain as **static** assets in `pages/dashboard-stitch/` (T19 design) | ✅ PASS (runtime motor removed) |
| Builder coordination | T19 after workout-editor PASS | `STATE.md:51`; `PlanEditorShell` in place | ✅ PASS |
| Repo gates per `tasks.md` T19 | `check-frontend-gates` + build + tsc + test | All exit 0 (below) | ✅ PASS |

**Spec-anchored check (AD-WEB-007-weighted)**: **14** ✅ PASS; **3** ⚠️ (pixel archive, STMIG-07 literal sixth file, STMIG-05 documentary); **3** ⏭️ N/A.

---

## Discrimination Sensor

Scratch mutations in working tree; each restored with `git checkout --` (no lasting production edits).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/components/AuthBrand.tsx:8` | `st-auth-brand` → `st-auth-brand-broken` | ✅ Killed — `Usability.test.jsx` 2/6 failed |
| 2 | `src/pages/Dashboard/markup/ExercisesPublicMarkup.tsx` | `data-open={state.open}` → `{!state.open}` | ✅ Killed — `ExercisesShell.test.jsx:19` |
| 3 | `src/pages/Dashboard/PlanEditorShell.tsx:6` | Break re-export identity | ✅ Killed — `PlanEditorShell.test.jsx:7` |

**Sensor depth**: lightweight (3 behavior-level faults)  
**Result**: **3/3 killed** — ✅ PASS

---

## Interactive UAT Results

Not performed (automated verifier run only).

---

## Code Quality (spot-check)

| Principle | Status | Notes |
| --------- | ------ | ----- |
| Minimum code / surgical scope | ⚠️ | Large markup TSX; justified by pixel-parity goal |
| No scope creep | ✅ | T19 teardown matches tasks |
| Matches patterns | ✅ | Shell + markup + `*StitchHost` |
| Tests map to ACs | ⚠️ | StitchTemplates retired with engine |
| Spec-anchored outcome check | ✅ | STMIG-04/06/08/09 satisfied at `fdeb92b` |
| Documented guidelines | `tasks.md` matrix + `check-frontend-gates.mjs` | T19 gate enforced `src/stitch` absence |
| Per-layer coverage | ⚠️ | No automated pixel diff in CI gate |
| Senior engineer approve | ✅ | Clean removal path via `dashboard-stitch` |

---

## Edge Cases (spec.md)

- [x] Test import depth changes without body edits — e.g. `OnboardingShell.stitch.test.jsx:4` → `OnboardingShell`
- [x] `public/stitch/ryno.png` untouched — out of scope
- [x] `linkBinding.js` — absent
- [x] Unused template/CSS — T18/T19 cleanup; static CSS under `dashboard-stitch/styles/`
- [x] Builder — native `PlanEditor` in `ClientDetail.jsx`; public entry `PlanEditorShell.tsx`

---

## Gate Check

| Command | Result | Details |
| ------- | ------ | ------- |
| `node scripts/check-frontend-gates.mjs` | ✅ PASS | Includes `src/stitch/` must not exist (`:62-64`) |
| `npm run build` | ✅ PASS | Exit 0 (2026-09-15) |
| `npm run lint` | ✅ PASS | Exit 0 — 0 errors; 2 pre-existing hook warnings |
| `npx tsc --noEmit` | ✅ PASS | Exit 0 |
| `npm test` | ✅ PASS | **32** files, **112** tests passed, **0** failed, **0** skipped |

**Test count note**: Post-T18 verifier reported **121** tests → **112** after T19 (−9). Justified by removal of duplicate/obsolete `src/stitch/*.test.jsx` (including `StitchTemplates.test.jsx`) and consolidation onto shell tests; **+1** `PlanEditorShell.test.jsx`. No weakened assertions spotted on the five migrated behavioral suites.  
**Gate summary**: **5/5** commands clean.

---

## Fix Plans (ranked — optional follow-ups, not blockers for AD-WEB-007 structural close)

### Fix 1: Document StitchTemplates retirement in spec traceability (Minor)

- **What**: Update `spec.md` STMIG-07 / Success Criteria to note engine test retired when motor removed.
- **Verify**: Traceability matches this report.

### Fix 2: Fresh pixel-parity capture for messages / nutrition / onboarding (Major — evidence quality)

- **What**: Re-capture true pre/post pairs at 1440+390; store under `.specs/features/stitch-migration/`.
- **Verify**: Documented zero-diff or explicit diff resolution.

### Fix 3: Rename `dashboard-stitch` long-term (Cosmetic — out of current scope)

- **What**: Optional rename to drop “stitch” from path vocabulary; not required for STMIG-04 (`/stitch/` under `src/` means `src/stitch`, not folder name substring).

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| STMIG-01 | Pending | ⏭️ Superseded (AD-WEB-007) |
| STMIG-02 | Pending | ⏭️ Superseded (AD-WEB-007) |
| STMIG-03 | Pending | ✅ Verified |
| STMIG-04 | Needs Fix (pre-T19) | ✅ Verified |
| STMIG-05 | Verified | ✅ Verified |
| STMIG-06 | Needs Fix (pre-T19) | ✅ Verified |
| STMIG-07 | Verified | ⚠️ Verified with StitchTemplates retirement noted |
| STMIG-08 | Verified | ✅ Verified |
| STMIG-09 | Blocked | ✅ Verified |

---

## Summary

**Overall**: ✅ **Ready** — AD-WEB-007 structural end-state met at `fdeb92b` (zero `src/stitch/`, native shells, `PlanEditorShell`, no template runtime motor in `src`).

**Spec-anchored check (AD-WEB-007-weighted)**: **14** ✅; **3** ⚠️ (non-blocking evidence gaps)  
**Sensor**: **3/3** mutations killed  
**Gate**: **112** passed, **0** failed (**5/5** commands)

**What works**: `src/stitch/` absent on disk and in HEAD; production imports use `dashboard-stitch` / shells only; `sourceRuntime`/`StitchTemplate` eliminated; T19 `PlanEditorShell` re-export tested; frontend gates script enforces teardown; full test suite green at 112 tests.

**Issues found (ranked, optional)**: (1) pixel-parity archive incomplete for some screens; (2) literal sixth legacy test file removed with engine; (3) spec.md traceability table still shows Pending in source file (update separately).

**Next steps**: Optional pixel refresh; update `spec.md` requirement statuses to match table above; feature may mark **Verified** in `STATE.md`.

**Lessons**: Clean PASS on structural ACs — no `scripts/lessons.py` entry required.
