# Exercise Library Detail Polish Specification

## Problem Statement

O painel de detalhe da Biblioteca de Exercícios (drawer em `ExercisesPublicMarkup` / `ExerciseDrawer`) quebra o layout quando não há vídeo: o slot de mídia some ou encolhe. Os rótulos do drawer e da própria biblioteca estão hardcoded em português, mesmo com idioma EN/ES. Na prática todos os exercícios aparecem com um único músculo alvo: a API já persiste `MuscleProfiles[]`, mas o seed inicial grava quase só um grupo (muitas vezes um flag composto) e a UI trata sinergistas como o restante de um array que quase nunca tem 2+ itens.

## Goals

- [ ] Sem vídeo, o slot de mídia permanece um quadrado grande na largura do drawer
- [ ] Chrome da biblioteca e do drawer usa `LanguageContext` (en, pt-BR, es)
- [ ] Exercícios compostos do seed têm agonista + sinergistas distintos; o drawer lista todos

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Upload / transcode de vídeo | Só o placeholder de ausência |
| Player novo / lib de vídeo | Reusa `ExerciseDrawerVideo` |
| Equivalências / swap em treino | Já coberto por `exercise-variations` |
| Redesign da listagem além de i18n e músculos visíveis | Fora do pedido |
| Retema de paleta | `design-system-retheme` |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Forma do placeholder sem vídeo | `aspect-square` na largura do conteúdo do drawer; player válido usa a mesma classe | Usuário pediu quadrado grande para não quebrar layout; 16:9 vs vazio era o desalinhamento | n — usuário fora; default do agente |
| Escopo de i18n | Drawer + chrome da biblioteca na mesma tela (`ExercisesPublicMarkup`, `ExerciseDrawer*`, fallback de equipamento no shell) | Pedido: "nesta mesma modal" + strings fixas em PT na tela da biblioteca | n |
| Idiomas | en, pt-BR, es via `LanguageContext` | Padrão do repo | y |
| Limite de 1 músculo | Não é contrato da API. `CreateExercise` já aceita array. Corrigir seed + UI | Unique key é `(ExerciseId, MuscleGroup)`, não um único perfil | y — código |
| Seed de sinergistas | Nova migration idempotente: compostos ganham ≥2 `MuscleGroup` folha (não flag composto `Chest=7`) | Migration `20260919030000` já rodou; não reescrever | n |
| Isolamentos (rosca, elevação lateral) | Podem permanecer com 1 músculo | Pedido é alvo realista, não forçar sinergista inventado | n |
| Repos | API em `ShapeUpV2`; UI em `ShapeUp-Web`. Commit+push nos dois, sem trailer Co-authored-by | Pedido explícito | y |
| Worktree sujo no Web | Não incluir arquivos fora desta feature | Há diffs de outras features | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Slot de vídeo estável ⭐ MVP

**User Story**: Como treinador, quero o painel de detalhe com o mesmo bloco quadrado grande mesmo sem vídeo, para a hierarquia do drawer não colapsar.

**Why P1**: Layout quebrado é o primeiro item citado.

**Acceptance Criteria**:

1. WHEN `videoUrl` is missing, empty, invalid, or an unknown host THEN the system SHALL render the media slot with CSS class `aspect-square` and no `<video>` or `<iframe>`
2. WHEN `videoUrl` is a valid file, YouTube, or Vimeo URL THEN the system SHALL render the player wrapper with CSS class `aspect-square`
3. The empty media slot SHALL keep localized copy (not a zero-height box)

**Independent Test**: Open an exercise without video; slot is a large square; open one with video; slot stays square.

---

### P1: Biblioteca e drawer traduzíveis ⭐ MVP

**User Story**: Como usuário em EN ou ES, quero os rótulos da biblioteca e do detalhe no meu idioma.

**Why P1**: Strings fixas em PT na mesma tela.

**Acceptance Criteria**:

1. The system SHALL resolve drawer and library chrome through `t('exlib.*')` keys present in en, pt-BR, and es
2. WHEN language is `en` THEN visible chrome SHALL NOT include the Portuguese literals `Biblioteca de Exercícios`, `Adicionar à Ficha do Aluno`, `Vídeo de execução não cadastrado`, `Diretrizes Técnicas de Execução`
3. WHEN language is `pt-BR` THEN the primary add button SHALL read `Adicionar à Ficha do Aluno`
4. IF `t` receives an unknown key THEN the UI SHALL still render (fallback to the key string, existing `t()` behavior)

**Independent Test**: Switch language to en and open the library drawer; chrome is English.

---

### P1: Vários músculos alvo ⭐ MVP

**User Story**: Como treinador, quero ver agonista e sinergistas reais (ex.: peito + tríceps no supino), não um único grupo.

**Why P1**: Limitação percebida de produto; causa raiz é seed + apresentação.

**Acceptance Criteria**:

1. WHEN `CreateExercise` is called with two or more `Muscles` entries THEN the API SHALL persist one `ExerciseMuscleProfile` per distinct `MuscleGroup` and return them all in `Muscles`
2. IF `CreateExercise` is called with a single muscle THEN the API SHALL persist exactly that one profile
3. WHEN a catalog compound exercise is loaded from the seeded dataset THEN `Muscles` SHALL contain at least two distinct `MuscleGroup` values for: Barbell Bench Press, Barbell Back Squat, Barbell Row, Pull-Up, Lat Pulldown, Barbell Overhead Press, Barbell Romanian Deadlift, Barbell Hip Thrust, Close-Grip Bench Press
4. WHEN the active exercise has two or more muscle details with `activationPercent` THEN the drawer SHALL show the highest-activation name as agonist and the remaining names joined as synergists
5. WHEN the active exercise has exactly one muscle THEN the synergist value SHALL be `—`
6. WHEN an exercise row in the library has multiple muscle labels THEN the row SHALL show them joined, not only `muscles[0]`

**Independent Test**: GET a seeded bench press returns ≥2 muscles; drawer shows agonist + synergist; curl still shows one muscle.

---

## Edge Cases

- IF `videoUrl` is whitespace-only THEN the system SHALL treat it as missing and keep the square placeholder
- IF `muscleDetails` has percents but `muscles[]` is empty THEN agonist/synergist SHALL fall back to `muscleName` / `muscleNamePt`
- IF two profiles share the same `MuscleGroup` on create THEN the API SHALL keep the unique `(ExerciseId, MuscleGroup)` invariant (last-write or validation failure already in DB unique index; create path inserts the list as given and unique index rejects duplicates)
- WHEN language is `es` THEN chrome SHALL use Spanish keys, not Portuguese fallbacks copied as-is unless the Spanish string is intentionally the same word

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| ELP-01 | P1: Slot de vídeo estável | Tasks | Verified |
| ELP-02 | P1: Biblioteca e drawer traduzíveis | Tasks | Verified |
| ELP-03 | P1: Vários músculos alvo | Tasks | Verified |

**ID format:** `ELP-NN`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 3 total, 3 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] Exercise without video keeps a large square media slot
- [ ] Library/drawer chrome switches with en / pt-BR / es
- [ ] Seeded compound lifts expose ≥2 target muscles in API and drawer
