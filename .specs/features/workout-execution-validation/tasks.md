# Validação de Execução de Treino (Frontend) — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/workout-execution-validation/design.md`  
**Spec**: `.specs/features/workout-execution-validation/spec.md`  
**Canonical API**: `ShapeUpV2/.specs/features/workout-execution-validation/` (do not implement backend)  
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec. Guidelines found: `package.json` (`test` = vitest run, `lint`, `gate`), `vitest.config.js` (jsdom + `src/test/setup.js`), existing colocated tests (`src/utils/__tests__/*.test.js`, `src/pages/Dashboard/__tests__/*.test.jsx`, `src/components/**/*.test.jsx`). No `AGENTS.md`. No coverage threshold in vitest config. Strong defaults applied on domain helpers.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domain helpers (`setExecutionValidation`, `translateKnown`, `applyRequireRpeToAll` / normalize) | unit | All branches; 1:1 to WEV-01/03/04/07/08 ACs and listed edge cases (failure=RPE10, extra set, empty optional RPE, unknown phase) | `src/utils/__tests__/*.test.js` | `npm test -- src/utils/__tests__/setExecutionValidation.test.js src/utils/__tests__/translateKnown.test.js src/utils/__tests__/trainingNormalization.test.js` |
| `ExerciseRow` toggle | unit (RTL) | Toggle flips `onChange('requireRpe', ...)`; default off | `src/components/training/__tests__/ExerciseRow.test.jsx` | `npm test -- src/components/training/__tests__/ExerciseRow.test.jsx` |
| i18n dictionary | unit | New keys present in `en`, `pt-BR`, `es` with equal key sets | `src/contexts/__tests__/wevI18nKeys.test.jsx` | `npm test -- src/contexts/__tests__/wevI18nKeys.test.jsx` |
| Page wiring (`TrainingPlansClient` / `Independent` / `ClientDetail` mappers) | unit | Helpers already 1:1; page tasks assert gate function is called via extracting logic OR a focused RTL click if mocks stay cheap. No weaker assertions than `workoutStatePayload.test.js` | colocated `__tests__` or utils tests | `npm test` |
| CSS / PlanEditorShell reexport | none | build/lint only | — | `npm run lint` |

## Gate Check Commands

> Generated from `package.json` / `vitest.config.js` / `scripts/check-frontend-gates.mjs`.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After unit-only tasks | `npm test -- <files of the task>` |
| Full | After RTL / page wiring | `npm test` |
| Build | After i18n, CSS, mapper-only, or phase end | `node scripts/check-frontend-gates.mjs && npm run lint && npm test && npx tsc --noEmit` |

---

## Execution Plan

Phases run in order. Tasks inside a phase run in listed order.

### Phase 1: Helpers and copy

```
T1
T2 → T3
```

### Phase 2: Authoring model and toggle

```
T4 → T5
```

### Phase 3: Persist requireRpe

```
T6
T7
T8
```

### Phase 4: Client execution + listing i18n

```
T9 → T10 → T11
T12
```

### Phase 5: Independent execution

```
T13
```

---

## Task Breakdown

### Phase 1: Helpers and copy

### T1: Create set completion and RPE helpers

**What**: Pure module with parse/valid/canComplete/clamp per design.  
**Where**: `src/utils/setExecutionValidation.js`  
**Depends on**: None  
**Reuses**: Limiares canônicos (peso `>= 0`, reps inteiro `>= 1`, RPE 1–10)  
**Requirement**: WEV-01, WEV-07, WEV-08

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `canCompleteLoggedSet` recusa peso vazio/negativo/NaN, reps vazio/`0`/não inteiro
- [x] Aceita peso `0` + reps `>= 1`
- [x] Com `requireRpe` true, recusa RPE vazio; com false, aceita vazio
- [x] `failure` + rpe `'10'` passa o gate de RPE
- [x] `clampRpeLog('') === ''`; `'15'` → `'10'`; `'8.5'` → `'9'`
- [x] Test count: at least 10 tests pass (no silent deletions)

**Tests**: unit  
**Gate**: quick (`npm test -- src/utils/__tests__/setExecutionValidation.test.js`)

**Commit**: `feat(training): add set completion validation helpers`

---

### T2: Create translateKnown helper

**What**: Fallback when `t(key) === key`; phase and difficulty label helpers.  
**Where**: `src/utils/translateKnown.js`  
**Depends on**: None  
**Reuses**: Slug em minúsculas de `ClientDetail.jsx` linha 521  
**Requirement**: WEV-03, WEV-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `translateKnown` devolve fallback se `t` ecoa a chave
- [x] `phaseLabel` usa `pro.builder.phase.*`
- [x] `difficultyLabel` usa `client.training.difficulty.*`
- [x] Fase/dificuldade desconhecida devolve o cru
- [x] Test count: at least 5 tests pass

**Tests**: unit  
**Gate**: quick (`npm test -- src/utils/__tests__/translateKnown.test.js`)

**Commit**: `feat(i18n): add known-key translation fallback`

---

### T3: Add WEV i18n keys in three languages

**What**: Keys `client.session.timer.rest_label`, `client.training.difficulty.{beginner,intermediate,advanced,easy,hard}`, `pro.builder.require_rpe`, `pro.builder.require_rpe.all`, `client.session.validation.{weight_required,reps_required,rpe_required}` in en, pt-BR, es.  
**Where**: `src/contexts/LanguageContext.jsx`  
**Depends on**: T2  
**Reuses**: Blocos `client.session.table.rpe` e `pro.builder.diff.*`  
**Requirement**: WEV-03, WEV-04, WEV-05, WEV-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Cada chave nova existe nos 3 idiomas
- [x] pt-BR Rest = `Descanso`; es = `Descanso`; en = `Rest`
- [x] Teste de paridade das chaves novas passa
- [x] Test count: at least 1 test pass (parity)

**Tests**: unit  
**Gate**: quick (`npm test -- src/contexts/__tests__/wevI18nKeys.test.jsx`)

**Commit**: `feat(i18n): add workout execution validation copy`

---

### Phase 2: Authoring model and toggle

### T4: Normalize requireRpe and bulk helper

**What**: `normalizeBlockExercise` lê `requireRpe`; exporta `applyRequireRpeToAll(blocks)`.  
**Where**: `src/utils/trainingNormalization.js`  
**Depends on**: None  
**Reuses**: `normalizeBlockExercise`  
**Requirement**: WEV-05, WEV-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Ausente na API → `requireRpe === false`
- [x] `true` na API → `true` no modelo do editor
- [x] `applyRequireRpeToAll` marca todos os exercícios de todos os blocos `true` e sobrescreve mix
- [x] Test count: at least 3 tests pass

**Tests**: unit  
**Gate**: quick (`npm test -- src/utils/__tests__/trainingNormalization.test.js`)

**Commit**: `feat(training): normalize requireRpe on plan exercises`

---

### T5: Add per-exercise Require RPE toggle

**What**: Toggle "RPE obrigatório" no header do exercício, default visual off.  
**Where**: `src/components/training/ExerciseRow.jsx`  
**Depends on**: T4  
**Reuses**: `onChange`, `su-ex-toggles`, `t('pro.builder.require_rpe')`  
**Requirement**: WEV-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Clique chama `onChange('requireRpe', nextBoolean)`
- [x] `exercise.requireRpe === true` renderiza ligado
- [x] RTL cobre on/off
- [x] Test count: at least 2 tests pass

**Tests**: unit  
**Gate**: quick (`npm test -- src/components/training/__tests__/ExerciseRow.test.jsx`)

**Commit**: `feat(training): add require-RPE toggle on exercise row`

---

### Phase 3: Persist requireRpe

### T6: Persist requireRpe on plan save and bulk in PlanEditor

**What**: `buildWorkoutPlanBody` envia `requireRpe`; `newExercise.requireRpe = false`; botão bulk chama `applyRequireRpeToAll`; disabled se zero exercícios.  
**Where**: `src/pages/Dashboard/ClientDetail.jsx`  
**Depends on**: T4  
**Reuses**: `PlanEditor`, `Button`, `applyRequireRpeToAll`  
**Requirement**: WEV-05, WEV-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Body de save inclui `requireRpe` por exercício
- [x] Bulk só muta estado local
- [x] Botão `disabled` quando `allExercises.length === 0`
- [x] Toggle individual depois do bulk vence
- [x] Gate check passes: `npm test`

**Tests**: unit  
**Gate**: full

**Commit**: `feat(training): persist requireRpe and bulk-apply in plan editor`

---

### T7: Persist requireRpe on template save

**What**: `buildTemplateBody` inclui `requireRpe` por exercício.  
**Where**: `src/pages/Dashboard/TrainingPlansProfessional.jsx`  
**Depends on**: T4  
**Reuses**: Mapper espelhado de `buildWorkoutPlanBody`  
**Requirement**: WEV-05, WEV-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Template PUT/POST carrega `requireRpe: Boolean(ex.requireRpe)`
- [ ] Gate check passes: `npm test`

**Tests**: unit  
**Gate**: full

**Commit**: `feat(training): persist requireRpe on workout templates`

---

### T8: Persist requireRpe on independent plan save

**What**: `buildWorkoutPlanBody` Independent inclui `requireRpe`.  
**Where**: `src/pages/Dashboard/TrainingPlansIndependent.jsx`  
**Depends on**: T4  
**Reuses**: Mesmo campo do T6  
**Requirement**: WEV-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Body Independent inclui `requireRpe`
- [ ] Gate check passes: `npm test`

**Tests**: unit  
**Gate**: full

**Commit**: `feat(training): persist requireRpe on independent plans`

---

### Phase 4: Client execution + listing i18n

### T9: Invalid log input style

**What**: Classe `.su-exec-input--invalid` no CSS da execução.  
**Where**: `src/pages/Dashboard/TrainingPlansClient.css`  
**Depends on**: None  
**Reuses**: Token `--error` / `su-error-text`  
**Requirement**: WEV-01, WEV-07

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Classe existe e usa cor de erro do design system
- [ ] `npm run lint` passes

**Tests**: none  
**Gate**: build (`node scripts/check-frontend-gates.mjs && npm run lint`)

**Commit**: `style(training): add invalid state for execution log inputs`

---

### T10: Gate set complete on weight and reps

**What**: `toRuntimeSets` inalterado neste task; `toggleSetComplete` e `updateSetLog` usam `canCompleteLoggedSet`; recusa sem rest timer; classe inválida 800ms; uncomplete se log fica inválido.  
**Where**: `src/pages/Dashboard/TrainingPlansClient.jsx`  
**Depends on**: T1, T9  
**Reuses**: `doneClickGuardRef`, `startRest`  
**Requirement**: WEV-01

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Sem peso/reps válidos não seta `completed` e não chama `startRest`
- [ ] Peso `0` + reps `>= 1` conclui
- [ ] Editar log para inválido desmarca `completed`
- [ ] Extra set usa o mesmo gate
- [ ] Gate check passes: `npm test`

**Tests**: unit  
**Gate**: full

**Commit**: `feat(training): block completing empty workout sets`

---

### T11: RequireRpe gate and RPE clamp in client execution

**What**: `toRuntimeSets` copia `requireRpe`; resume prefere snapshot; clamp no `onChange` de RPE; gate WEV-07.  
**Where**: `src/pages/Dashboard/TrainingPlansClient.jsx`  
**Depends on**: T10  
**Reuses**: T1 helpers  
**Requirement**: WEV-07, WEV-08

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `requireRpe` true + RPE vazio recusa conclusão
- [ ] `requireRpe` false permite RPE vazio
- [ ] Failure RPE 10 passa
- [ ] Input RPE clampa 1–10 e arredonda não inteiro; vazio opcional permanece vazio
- [ ] Resume lê `requireRpe` da sessão quando existir
- [ ] Gate check passes: `npm test`

**Tests**: unit  
**Gate**: full

**Commit**: `feat(training): enforce required RPE and clamp log values`

---

### T12: Translate Rest, phase, and difficulty on client surface

**What**: Kicker do timer via `t('client.session.timer.rest_label')`; card usa `phaseLabel` / `difficultyLabel`.  
**Where**: `src/pages/Dashboard/TrainingPlansClient.jsx`  
**Depends on**: T2, T3  
**Reuses**: `translateKnown`  
**Requirement**: WEV-03, WEV-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Nenhuma string literal `"Rest"` no kicker
- [ ] Tag de fase/dificuldade não renderiza chave crua
- [ ] Gate check passes: `npm test`

**Tests**: unit  
**Gate**: full

**Commit**: `fix(i18n): translate rest timer and plan tags`

---

### Phase 5: Independent execution

### T13: Mirror execution gates and Rest label for independent

**What**: Mesmo gate, clamp, `requireRpe` no `toRuntimeSets`, e kicker Rest traduzido.  
**Where**: `src/pages/Dashboard/TrainingPlansIndependent.jsx`  
**Depends on**: T1, T2, T3, T9  
**Reuses**: Helpers T1/T2; CSS T9 (já importado)  
**Requirement**: WEV-01, WEV-03, WEV-07, WEV-08

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Check-circle Independent recusa set vazio / RPE faltando quando exigido
- [ ] Clamp RPE igual ao Client
- [ ] Kicker não é `"Rest"` literal
- [ ] Gate check passes: `node scripts/check-frontend-gates.mjs && npm run lint && npm test && npx tsc --noEmit`

**Tests**: unit  
**Gate**: build

**Commit**: `feat(training): apply execution validation on independent workouts`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

Phase 1:  T1
          T2 ------→ T3
Phase 2:  T4 ------→ T5
Phase 3:  T6
          T7
          T8
Phase 4:  T9 ------→ T10 ------→ T11
          T12
Phase 5:  T13
```

Execution is strictly sequential. Packing: ~13 tasks → two batches (~7 + ~6) at Execute if the user accepts sub-agents. Suggested cut: Phases 1–3 (T1–T8) then Phases 4–5 (T9–T13).

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 setExecutionValidation | 1 module | Granular |
| T2 translateKnown | 1 module | Granular |
| T3 LanguageContext keys | 1 file | Granular |
| T4 trainingNormalization | 1 file | Granular |
| T5 ExerciseRow toggle | 1 component | Granular |
| T6 ClientDetail persist+bulk | 1 file, related | OK cohesive |
| T7 Professional mapper | 1 file | Granular |
| T8 Independent mapper | 1 file | Granular |
| T9 CSS invalid | 1 file | Granular |
| T10 Client gate | 1 file | Granular |
| T11 Client RPE | 1 file (same as T10, sequential) | OK cohesive |
| T12 Client i18n | 1 file | Granular |
| T13 Independent execution | 1 file, related gates | OK cohesive |

**Granularity check**: no task names two source files in `Where`.

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | no intra-phase arrow | Match |
| T2 | None | no incoming | Match |
| T3 | T2 | T2 → T3 | Match |
| T4 | None | no incoming | Match |
| T5 | T4 | T4 → T5 | Match |
| T6 | T4 | cross-phase, no intra arrow | Match |
| T7 | T4 | cross-phase | Match |
| T8 | T4 | cross-phase | Match |
| T9 | None | no incoming | Match |
| T10 | T1, T9 | T9 → T10 (T1 cross-phase) | Match |
| T11 | T10 | T10 → T11 | Match |
| T12 | T2, T3 | no intra-phase arrow (deps are phase 1) | Match |
| T13 | T1, T2, T3, T9 | cross-phase only | Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Domain helper | unit | unit | OK |
| T2 | Domain helper | unit | unit | OK |
| T3 | i18n dictionary | unit (parity) | unit | OK |
| T4 | Domain helper | unit | unit | OK |
| T5 | ExerciseRow | unit RTL | unit | OK |
| T6 | Page wiring | unit | unit | OK |
| T7 | Page wiring | unit | unit | OK |
| T8 | Page wiring | unit | unit | OK |
| T9 | CSS | none | none | OK |
| T10 | Page wiring | unit | unit | OK |
| T11 | Page wiring | unit | unit | OK |
| T12 | Page wiring | unit | unit | OK |
| T13 | Page wiring | unit | unit | OK |

T6–T8, T10–T13: se o harness não montar a página, o task extrai a fatia testável (mapper / wrapper do click) no mesmo commit. "Tested later" is not allowed.

---

## Tools question (before Execute)

For each task, which tools should Execute use?

**Available MCPs**: Cursor filesystem/shell, `cursor-ide-browser` (UAT later).  
**Available Skills**: `tlc-spec-driven` (mandatory), `ponytail` (optional).
