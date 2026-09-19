# Exercise Library Detail Polish Validation

**Date**: 2026-09-19
**Spec**: `.specs/features/exercise-library-detail-polish/spec.md`
**Diff range**: Web `c3bcb08..981292a` (includes `981292a`); API `ebff5a9`, `02c5684`, `a62e1c5`
**Verifier**: independent sub-agent, second pass after fix tasks (author ≠ verifier)

**Result**: PASS

---

## Task Completion

| Task | Status  | Notes |
| ---- | ------- | ----- |
| T1   | ✅ Done | `CreateExerciseHandlerTests` two-muscle + single-muscle |
| T2   | ✅ Done | Migration `20260919120000` + distinct CAST MuscleGroup test |
| T3   | ✅ Done | Empty/player `aspect-square`; YouTube/Vimeo wrapper class locked |
| T4   | ✅ Done | `exlib.*` keys + unknown-key fallback test |
| T5   | ✅ Done | Drawer/video/subs `t('exlib.*')` |
| T6   | ✅ Done | `ExercisesPublicMarkup` chrome via `t` |
| T7   | ✅ Done | `exlib.equipment.unknown` + toast `missingNotice` |
| T8   | ✅ Done | Agonist/synergist ranking + row join |

---

## Spec-Anchored Acceptance Criteria

### P1: Slot de vídeo estável (ELP-01)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN `videoUrl` is missing, empty, invalid, or an unknown host THEN the system SHALL render the media slot with CSS class `aspect-square` and no `<video>` or `<iframe>` | empty slot `.aspect-square`; `video`/`iframe` absent | `src/pages/Dashboard/__tests__/ExerciseDrawerVideo.test.jsx:64` - `querySelector('.aspect-square')` `toBeTruthy()`; `:65-66` `video`/`iframe` `toBeNull()`; `:81-84` whitespace same; missing/invalid/unknown share `kind === 'invalid' \|\| !url` | ✅ PASS |
| WHEN `videoUrl` is a valid file, YouTube, or Vimeo URL THEN the system SHALL render the player wrapper with CSS class `aspect-square` | player wrapper `aspect-square` for file **and** YouTube **and** Vimeo | `ExerciseDrawerVideo.test.jsx:22` file `[data-video-player]` `toHaveClass('aspect-square')`; `:36` YouTube same; `:52` Vimeo same | ✅ PASS |
| The empty media slot SHALL keep localized copy (not a zero-height box) | non-empty localized empty-state copy | `ExerciseDrawerVideo.test.jsx:63` - `toHaveTextContent('Vídeo de execução não cadastrado')` under `pt-BR` | ✅ PASS |

### P1: Biblioteca e drawer traduzíveis (ELP-02)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| The system SHALL resolve drawer and library chrome through `t('exlib.*')` keys present in en, pt-BR, and es | every listed `exlib.*` key resolves in all three locales (value ≠ key) | `src/contexts/__tests__/exlibI18nKeys.test.jsx:95-103` - `expect(en[key]).not.toBe(key)` (same for `pt`, `es`) + key-set equality | ✅ PASS |
| WHEN language is `en` THEN visible chrome SHALL NOT include the Portuguese literals `Biblioteca de Exercícios`, `Adicionar à Ficha do Aluno`, `Vídeo de execução não cadastrado`, `Diretrizes Técnicas de Execução` | those four strings absent from EN chrome | `exlibI18nKeys.test.jsx:105-107` - `expect(Object.values(en)).not.toContain(literal)` | ✅ PASS |
| WHEN language is `pt-BR` THEN the primary add button SHALL read `Adicionar à Ficha do Aluno` | exact string `Adicionar à Ficha do Aluno` | `exlibI18nKeys.test.jsx:109` - `expect(pt['exlib.drawer.add']).toBe('Adicionar à Ficha do Aluno')` | ✅ PASS |
| IF `t` receives an unknown key THEN the UI SHALL still render (fallback to the key string, existing `t()` behavior) | unknown key does not crash; rendered text is the key | `exlibI18nKeys.test.jsx:117` `t('exlib.__no_such_key__')`; `:124` `expect(...textContent).toBe('exlib.__no_such_key__')` | ✅ PASS |

### P1: Vários músculos alvo (ELP-03)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN `CreateExercise` is called with two or more `Muscles` entries THEN the API SHALL persist one `ExerciseMuscleProfile` per distinct `MuscleGroup` and return them all in `Muscles` | persist count 2; response `Muscles.Length` 2 with both groups | `CreateExerciseHandlerTests.cs:71-76` - `Assert.Equal(2, result.Value!.Muscles.Length)` + `Assert.Contains` MiddleChest/Triceps + `MuscleProfiles.Count == 2` | ✅ PASS |
| IF `CreateExercise` is called with a single muscle THEN the API SHALL persist exactly that one profile | persist count 1; one `Muscles` item | `CreateExerciseHandlerTests.cs:96-100` - `Assert.Single` + `Assert.Equal(MuscleGroup.MiddleChest, ...)` + `Count == 1` | ✅ PASS |
| WHEN a catalog compound exercise is loaded from the seeded dataset THEN `Muscles` SHALL contain at least two distinct `MuscleGroup` values for the nine named lifts | ≥2 distinct `MuscleGroup` CAST ids per named exercise in Up() SQL | `SeedExerciseCompoundMuscleProfilesTests.cs:28-35` - regex `CAST((\d+) AS bigint)` per name, `groups.Length >= 2`; `:38-39` forbid `CAST(7)` / `CAST(448)` | ✅ PASS |
| WHEN the active exercise has two or more muscle details with `activationPercent` THEN the drawer SHALL show the highest-activation name as agonist and the remaining names joined as synergists | agonist = max % name; synergist = remaining | `ExercisesShell.test.jsx:182-183` - `#drawerAgonist` `toHaveTextContent('Peitoral')`; `#drawerSynergist` `toHaveTextContent('Tríceps')` | ✅ PASS |
| WHEN the active exercise has exactly one muscle THEN the synergist value SHALL be `—` | synergist text `—` | `ExercisesShell.test.jsx:80` - `#drawerSynergist` `toHaveTextContent('—')` | ✅ PASS |
| WHEN an exercise row in the library has multiple muscle labels THEN the row SHALL show them joined, not only `muscles[0]` | row contains joined labels | `ExercisesShell.test.jsx:192` - `expect(row).toHaveTextContent('Peitoral, Tríceps')` | ✅ PASS |

**Status**: ✅ All ACs covered

Covered with matching outcomes: 13/13 ACs. Prior FAIL gaps closed: ELP-01 AC2 (YouTube/Vimeo `[data-video-player]` class), ELP-02 AC4 (`exlib.__no_such_key__`), ELP-03 AC3 (distinct CAST ids).

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | -------- |
| 1 | `src/pages/Dashboard/markup/ExerciseDrawerVideo.tsx:88` | YouTube/Vimeo wrapper `aspect-square` → `aspect-video` (file player unchanged) | ✅ Killed (`ExerciseDrawerVideo.test.jsx:36` YouTube, `:52` Vimeo) |
| 2 | `src/pages/Dashboard/markup/ExerciseDrawerVideo.tsx:66` | Empty-state `aspect-square` → `aspect-video` | ✅ Killed (`ExerciseDrawerVideo.test.jsx:64`) |
| 3 | `20260919120000_SeedExerciseCompoundMuscleProfiles.cs:20-22` | Barbell Bench Press Up() CAST ids all `1` | ✅ Killed (`SeedExerciseCompoundMuscleProfilesTests.cs:33` found 1 distinct group) |

Scratch: Web `git worktree add /tmp/elp-web-verify-AfNnjq HEAD` then `git worktree remove --force`. API `git worktree add /tmp/elp-api-verify-9S6Syx HEAD` then remove. Real porcelain hashes unchanged: Web `2cd58f1a…`; API `98995ac7…`. No `git stash`.

**Sensor depth**: lightweight
**Result**: 3/3 killed - PASS

---

## Interactive UAT Results (if performed)

| #   | Test | Result | Details |
| --- | ---- | ------ | ------- |
| 1   | Independent visual/drawer UAT | ⏭️ Skip | User unattended; interactive UAT not run |

---

## Code Quality

| Principle        | Status |
| ---------------- | ------ |
| Minimum code     | ✅     |
| Surgical changes | ✅     |
| No scope creep   | ✅     |
| Matches patterns | ✅     |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Seed test now asserts distinct CAST MuscleGroup ids in Up() SQL |
| Every test maps to a spec requirement - no unclaimed tests | ✅ `ExercisesShell.test.jsx` still includes pre-feature equivalents/overlay cases (out of this spec; not ELP regressions) |
| Documented guidelines followed: none - strong defaults applied (`package.json` / vitest; API xUnit) | ✅ |

---

## Edge Cases

- [x] Whitespace-only `videoUrl` treated as missing square placeholder (`ExerciseDrawerVideo.test.jsx:80-84`)
- [x] `muscleDetails` names prefer `muscleName` then `muscleNamePt` (`ExerciseDrawer.tsx:40`); multi-muscle AC fixture uses `muscleNamePt` with percents
- [x] Duplicate `MuscleGroup` on create: spec defers to existing unique index `(ExerciseId, MuscleGroup)`
- [x] Language `es`: keys resolve (`exlibI18nKeys.test.jsx:97-98`); ES dictionary uses Spanish literals (`LanguageContext.jsx:2505-2544`), not the listed PT chrome strings

Residual (not an AC gap): no shell fixture with empty `muscles[]` plus `muscleDetails` only.

---

## Gate Check

- **Gate command**: Web `npm test -- src/pages/Dashboard/__tests__/ExerciseDrawerVideo.test.jsx src/pages/Dashboard/__tests__/ExercisesShell.test.jsx src/contexts/__tests__/exlibI18nKeys.test.jsx`; API `dotnet test tests/UnitTests --filter 'FullyQualifiedName~CreateExerciseHandlerTests|FullyQualifiedName~SeedExerciseCompoundMuscleProfilesTests'`
- **Result**: Web 18 passed, 0 failed, 0 skipped; API 6 passed, 0 failed, 0 skipped
- **Test count before feature**: Web 14 `it(` (5 video + 9 shell); API 3 facts in `CreateExerciseHandlerTests` (no seed file)
- **Test count after feature**: Web 18 (5 video + 11 shell + 2 i18n); API 6 (5 create + 1 seed)
- **Delta**: Web +4; API +3
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans (if issues found)

None. Prior Fix 1–3 closed; residual empty-`muscles[]` fixture is optional and not blocking.

---

## Requirement Traceability Update

Verifier did not edit `spec.md` (read-only except this report). Recommended statuses:

| Requirement | Previous Status | New Status  |
| ----------- | --------------- | ----------- |
| ELP-01      | Needs Fix       | ✅ Verified |
| ELP-02      | Spec-precision  | ✅ Verified |
| ELP-03      | Spec-precision  | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 13/13 ACs matched spec outcome; 0 spec-precision gaps
**Sensor**: 3/3 mutations killed
**Gate**: 24 passed (18 web + 6 API)

**What works**: Square empty and hosted video slots; unknown i18n key falls back to the key string; EN avoids listed PT literals; create 2 vs 1 muscle profiles; seed compounds have ≥2 distinct leaf MuscleGroup ids; drawer agonist/synergist and row join.

**Issues found**: none blocking

**Next steps**: Feature complete at the automated gate. Interactive UAT remains skipped until the user is available.
