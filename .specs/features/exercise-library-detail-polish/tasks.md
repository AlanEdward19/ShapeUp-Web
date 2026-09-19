# Exercise Library Detail Polish Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

Do not commit unrelated dirty files in ShapeUp-Web. Do not add `Co-authored-by` trailers.

---

**Design**: `.specs/features/exercise-library-detail-polish/design.md`
**Status**: Approved

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec. Guidelines found: `package.json` scripts; `vitest.config.js`; no coverage thresholds. API: xUnit in `ShapeUpV2/tests/UnitTests`. Strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| CreateExercise domain | unit | 1:1 ELP-03 AC1–AC2 (2+ muscles persist; single muscle stays 1) | `ShapeUpV2/tests/UnitTests/Domains/Training/Exercises/CreateExerciseHandlerTests.cs` | `dotnet test tests/UnitTests --filter FullyQualifiedName~CreateExerciseHandlerTests` |
| Seed SQL | unit (string/SQL assertions in the migration test or handler-adjacent fixture) | ELP-03 AC3: named compounds appear ≥2 times as distinct MuscleGroup values in the new migration SQL | `ShapeUpV2/tests/UnitTests/Domains/Training/Exercises/SeedExerciseCompoundMuscleProfilesTests.cs` | `dotnet test tests/UnitTests --filter FullyQualifiedName~SeedExerciseCompoundMuscleProfilesTests` |
| Video slot UI | unit | ELP-01 all ACs; whitespace URL edge | `src/pages/Dashboard/__tests__/ExerciseDrawerVideo.test.jsx` | `npm test -- src/pages/Dashboard/__tests__/ExerciseDrawerVideo.test.jsx` |
| i18n keys | unit | ELP-02: keys exist in en, pt-BR, es; EN excludes listed PT literals | `src/contexts/__tests__/exlibI18nKeys.test.jsx` | `npm test -- src/contexts/__tests__/exlibI18nKeys.test.jsx` |
| Drawer / library chrome | unit | ELP-02 chrome via t(); ELP-03 agonist/synergist and row join | `src/pages/Dashboard/__tests__/ExercisesShell.test.jsx` | `npm test -- src/pages/Dashboard/__tests__/ExercisesShell.test.jsx` |
| Entity / migration metadata | none | Build gate | migration `.cs` | `dotnet build` |

## Gate Check Commands

> API gates run in `/Users/aoliveira/Desktop/ArqonTech/ShapeUp/ShapeUpV2`. Web gates run in `/Users/aoliveira/Desktop/ArqonTech/ShapeUp/ShapeUp-Web`.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | API unit tasks | `dotnet test tests/UnitTests --filter FullyQualifiedName~CreateExerciseHandlerTests\|FullyQualifiedName~SeedExerciseCompoundMuscleProfilesTests` |
| Full | Web unit tasks | `npm test -- src/pages/Dashboard/__tests__/ExerciseDrawerVideo.test.jsx src/pages/Dashboard/__tests__/ExercisesShell.test.jsx src/contexts/__tests__/exlibI18nKeys.test.jsx` |
| Build | Phase complete | API: `dotnet test tests/UnitTests --filter FullyQualifiedName~Exercises`; Web: `npm test -- src/pages/Dashboard/__tests__/ExerciseDrawerVideo.test.jsx src/pages/Dashboard/__tests__/ExercisesShell.test.jsx src/contexts/__tests__/exlibI18nKeys.test.jsx && npx eslint src/pages/Dashboard/markup/ExerciseDrawer.tsx src/pages/Dashboard/markup/ExerciseDrawerVideo.tsx src/pages/Dashboard/markup/ExerciseDrawerSubstitutions.tsx src/pages/Dashboard/markup/ExercisesPublicMarkup.tsx src/pages/Dashboard/ExercisesShell.tsx src/contexts/LanguageContext.jsx` |

---

## Execution Plan

Phases are ordered and run sequentially.

### Phase 1: API muscles

```
T1 → T2
```

### Phase 2: Video slot

```
T3
```

### Phase 3: i18n

```
T4 → T5 → T6 → T7
```

### Phase 4: Muscle presentation

```
T8
```

---

## Task Breakdown

### T1: Persist multiple muscles on create

**What**: Cover CreateExercise with two muscle DTOs and with one muscle DTO.
**Where**: `ShapeUpV2/tests/UnitTests/Domains/Training/Exercises/CreateExerciseHandlerTests.cs`
**Depends on**: None
**Reuses**: `NewSut` in the same file
**Requirement**: ELP-03

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven Execute

**Done when**:

- [x] Test asserts AddAsync MuscleProfiles count 2 and MapResponse.Muscles length 2
- [x] Test asserts single-muscle create yields count 1
- [x] Gate passes

**Tests**: unit
**Gate**: quick

**Commit**: `test(training): cover creating exercises with multiple muscle profiles`

---

### T2: Seed compound synergist profiles

**What**: Add idempotent EF migration plus a unit test that reads the migration SQL and asserts each named compound has ≥2 distinct MuscleGroup values.
**Where**: `ShapeUpV2/src/Features/Training/Infrastructure/Data/Migrations/20260919120000_SeedExerciseCompoundMuscleProfiles.cs`
**Depends on**: T1
**Reuses**: `20260919030000_SeedExerciseMuscleProfiles.cs` INSERT/`WHERE NOT EXISTS` pattern
**Requirement**: ELP-03

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven Execute

**Done when**:

- [x] Migration inserts leaf flags (not only composite `Chest=7`) for the nine named compounds
- [x] `SeedExerciseCompoundMuscleProfilesTests` fails if a listed name has fewer than two MuscleGroup literals in the VALUES list
- [x] Designer/snapshot updated if the project requires it for new migrations
- [x] Gate passes

**Tests**: unit
**Gate**: quick

**Commit**: `feat(training): seed synergist muscles for compound catalog lifts`

---

### T3: Keep a square media slot without video

**What**: Use `aspect-square` for empty and playing wrappers; treat whitespace URL as empty.
**Where**: `src/pages/Dashboard/markup/ExerciseDrawerVideo.tsx`
**Depends on**: T2
**Reuses**: `detectVideoKind`
**Requirement**: ELP-01

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven Execute

**Done when**:

- [ ] Empty/invalid/unknown/whitespace cases have `aspect-square` and no video/iframe
- [ ] Valid file/YouTube/Vimeo wrappers have `aspect-square`
- [ ] `ExerciseDrawerVideo.test.jsx` updated to those classes and edges
- [ ] Gate passes

**Tests**: unit
**Gate**: full

**Commit**: `fix(exlib): keep a square media slot when exercise video is missing`

---

### T4: Add exlib i18n keys

**What**: Add `exlib.*` strings in en, pt-BR, and es for every chrome literal currently hardcoded in the library/drawer.
**Where**: `src/contexts/LanguageContext.jsx`
**Depends on**: T3
**Reuses**: existing translation object shape; `wevI18nKeys.test.jsx` probe
**Requirement**: ELP-02

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven Execute

**Done when**:

- [ ] Keys cover title, search, filters, sort, counts, drawer sections, video empty, substitutions, buttons, close
- [ ] `exlibI18nKeys.test.jsx` asserts keys resolve in three languages and EN values are not the listed Portuguese literals
- [ ] Gate passes

**Tests**: unit
**Gate**: full

**Commit**: `feat(exlib): add exercise library translation keys`

---

### T5: Wire drawer copy to t()

**What**: Replace hardcoded Portuguese in drawer, video, and substitutions with `t('exlib.*')`.
**Where**: `src/pages/Dashboard/markup/ExerciseDrawer.tsx`
**Depends on**: T4
**Reuses**: `useLanguage`
**Requirement**: ELP-02

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven Execute

**Done when**:

- [ ] `ExerciseDrawer.tsx`, `ExerciseDrawerVideo.tsx`, `ExerciseDrawerSubstitutions.tsx` have no user-visible Portuguese literals
- [ ] `ExercisesShell.test.jsx` still passes with `pt-BR`
- [ ] Gate passes

**Tests**: unit
**Gate**: full

**Commit**: `feat(exlib): localize exercise detail drawer chrome`

---

### T6: Wire library markup copy to t()

**What**: Replace hardcoded Portuguese in `ExercisesPublicMarkup.tsx`.
**Where**: `src/pages/Dashboard/markup/ExercisesPublicMarkup.tsx`
**Depends on**: T5
**Reuses**: `useLanguage`
**Requirement**: ELP-02

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven Execute

**Done when**:

- [ ] Header, search placeholder, filters, sort options, column headers, row titles use `t`
- [ ] Markup still types `ExercisesShellState` unchanged except passing `t` or calling the hook inside
- [ ] Gate passes

**Tests**: unit
**Gate**: full

**Commit**: `feat(exlib): localize exercise library chrome`

---

### T7: Localize shell equipment fallback

**What**: Replace `Não informado` in `ExercisesShell` with a translated key.
**Where**: `src/pages/Dashboard/ExercisesShell.tsx`
**Depends on**: T6
**Reuses**: `useLanguage` already imported
**Requirement**: ELP-02

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven Execute

**Done when**:

- [ ] Fallback uses `t('exlib.equipment.unknown')`
- [ ] Gate passes

**Tests**: unit
**Gate**: full

**Commit**: `feat(exlib): localize unknown equipment fallback`

---

### T8: Show agonist plus synergists in the drawer

**What**: Rank muscles by activation; list remaining as synergists; keep library row join of all labels.
**Where**: `src/pages/Dashboard/markup/ExerciseDrawer.tsx`
**Depends on**: T7
**Reuses**: `ExerciseDrawerActivation`
**Requirement**: ELP-03

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven Execute

**Done when**:

- [ ] Shell test with two `muscleDetails` shows both names (agonist highest %, synergist the other)
- [ ] Single-muscle fixture still shows synergist `—`
- [ ] Row with `muscles: ['Peitoral', 'Tríceps']` displays both
- [ ] Gate passes

**Tests**: unit
**Gate**: build

**Commit**: `feat(exlib): show all target muscles in exercise detail`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 ------→ T2
Phase 2:              T2 ------→ T3
Phase 3:                         T3 ------→ T4 ------→ T5 ------→ T6 ------→ T7
Phase 4:                                                                   T7 ------→ T8
```

Execution is strictly sequential.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | 1 test file | Granular |
| T2 | 1 migration (+ its SQL test file) | OK cohesive |
| T3 | 1 component | Granular |
| T4 | 1 context file + 1 test | Granular |
| T5 | drawer family, same concern | OK cohesive |
| T6 | 1 markup file | Granular |
| T7 | 1 shell fallback | Granular |
| T8 | activation block + tests | Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | (start) | Match |
| T2 | T1 | T1 → T2 | Match |
| T3 | None | (start phase 2) | Match |
| T4 | T3 | T3 is prior phase; T4 → T5 in phase 3 | Match |
| T5 | T4 | T4 → T5 | Match |
| T6 | T5 | T5 → T6 | Match |
| T7 | T6 | T6 → T7 | Match |
| T8 | T7 | T7 prior phase | Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | CreateExercise domain | unit | unit | OK |
| T2 | Seed SQL | unit | unit | OK |
| T3 | Video slot UI | unit | unit | OK |
| T4 | i18n keys | unit | unit | OK |
| T5 | Drawer chrome | unit | unit | OK |
| T6 | Library chrome | unit | unit | OK |
| T7 | Shell fallback | unit | unit | OK |
| T8 | Muscle presentation | unit | unit | OK |
