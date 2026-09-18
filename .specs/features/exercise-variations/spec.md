# Variações de Exercício (frontend) — Specification

**Canonical (read-only, backend CLOSED `1b82672`)**: `ShapeUpV2/.specs/features/exercise-variations/`
**Sibling (presentation)**: `.specs/features/exercise-detail-drawer/`
**This repo**: ShapeUp-Web only. No API/schema work.

## Problem Statement

O backend já persiste equivalências simétricas e troca de exercício na sessão (`GET/POST/DELETE .../equivalents`, `POST .../swap-exercise` com `retainedSetsForOriginal`). No web, a Biblioteca ainda mostra texto estático em `#drawerSubs`, e a execução (`TrainingPlansClient.jsx`) não oferece escolher um equivalente e confirmar a troca. O aluno no chão da academia não consegue substituir o aparelho ocupado sem perder o fluxo da sessão. Esta spec cobre só o consumo frontend: popular o drawer irmão com o GET, e o fluxo escolher → confirmar → swap (local + fila offline).

## Goals

- [ ] Drawer da Biblioteca lista equivalentes reais do GET, sem texto estático `drawerSubs` e sem `%` fabricado
- [ ] Clique num equivalente abre o detalhe daquele exercício no mesmo drawer
- [ ] Na execução ativa, o aluno escolhe um equivalente e só então a sessão muta (sets concluídos do original ficam; incompletos saem; substituto entra vazio)
- [ ] A mutação de swap entra em `enqueueMutation` (`mutationQueue.js`), com `dedupeKey` por sessão + exercício original
- [ ] O plano prescrito não muda; a troca vale só para aquela sessão

## Out of Scope

| Item | Reason |
| ---- | ------ |
| Player de vídeo, backdrop, largura 460px, barras de ativação, numeração de passos, extração `ExerciseDrawerVideo` | Dono: `exercise-detail-drawer`. Esta feature só preenche a lista de substituições |
| Autoria de equivalências em `ExerciseRow` (POST/DELETE no editor de treino) | EXVAR-01 canônico de autor; este ciclo é picker choose→swap na execução |
| Backend, schema, simetria, aviso de músculo, handlers | CLOSED em `1b82672` |
| `%` de similaridade / ranking algorítmico | Fora do canônico; `matchLabel` permanece vazio |
| Recalcular carga/reps ao trocar | Canônico: substituto começa sem sets prescritos herdados |
| Troca em sessão finalizada / reescrita do `WorkoutPlanDocument` | Swap é session-only |
| Busca livre no catálogo durante a execução | Picker `mode=swap` lista só equivalentes já registrados |
| Limite artificial de equivalentes | Lista com scroll |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Contrato do drawer | Popular `ExerciseRecord.equivalents` no shape de `ExerciseEquivalent` do sibling (`exerciseId`, `matchLabel?`, `note?`). Nome/equipamento vêm do GET (`ExerciseResponse`) mesclado no lookup de `inspect`, não de um segundo player | Sibling já define a lista; GET do backend CLOSED devolve `ExerciseResponse[]` | y |
| Navegação EXVAR-05 vs toast EDD-07 | Clique usa o registro devolvido pelo GET (ou `getExerciseById` se faltar no array da biblioteca) e chama o mesmo `inspect`. Toast "não encontrado" só se o id não resolver depois disso | Canônico exige abrir o detalhe do equivalente; o toast do sibling cobre só id órfão | y |
| Fluxo de swap | Escolher → confirmar. O botão só abre o picker. `POST swap-exercise` / fila só no confirm | Canônico confirmado 2026-09-17; backend espera `retainedSetsForOriginal` | y |
| Sets retidos | Cliente envia só sets com `completed === true` no original, no mesmo mapeamento de `buildWorkoutStatePayload` | Documento de sessão não tem flag `Completed` no servidor | y |
| Offline | Estado local aplica na hora; `enqueueMutation` entrega o POST. Sem `apiClient` direto no confirm | EXVAR-08; mesmo padrão de `state`/`cancel` em `TrainingPlansClient.jsx` | y |
| `dedupeKey` | `workout-swap-${sessionId}-${originalExerciseId}` | Evita POST duplicado em retry; distinto de `workout-state-${sessionId}` | y |
| GET vazio / erro | Botão de troca desabilitado (ou com indicação de “sem alternativa”). Drawer mostra vazio do sibling, nunca `drawerSubs` genérico. Falha de GET não quebra o drawer | Canônico EXVAR-06 AC2 + EDD estado vazio | y |
| Duplicata na sessão | Recusar no cliente antes de enfileirar (equivalente já está em `exercises`) e mostrar aviso; backend 400 reforça | Canônico EXVAR-06 AC4 | y |
| i18n | Novas chaves EN/PT-BR/ES via `LanguageContext`/`t()`, paridade Fase 1 | AD-WEB-008 não muda copy keys | y |
| `POST/DELETE .../equivalents` no hook | Não neste ciclo | Autoria fora de escopo | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Drawer lista equivalentes do GET ⭐ MVP

**User Story**: Como usuário da Biblioteca, quero ver os equivalentes reais do exercício aberto e abrir o detalhe de um deles, para explorar substituições sem texto estático.

**Why P1**: EXVAR-04/05; o sibling só desenha a lista, este ciclo preenche o dado.

**Acceptance Criteria**:

1. WHEN o usuário abre o drawer de um exercício THEN o sistema SHALL buscar `GET /api/training/exercises/{id}/equivalents` sem bloquear a abertura do painel
2. WHEN o GET devolve 1+ `ExerciseResponse` THEN o sistema SHALL preencher `active.equivalents` (contrato `ExerciseEquivalent`) e a lista do sibling SHALL mostrar nome, grupo muscular principal e equipamento de cada item, sem `matchLabel` fabricado
3. WHEN o GET devolve lista vazia ou o exercício não tem equivalentes THEN o drawer SHALL mostrar o estado vazio do sibling ("Nenhuma substituição cadastrada para este exercício."), nunca a string `drawerSubs` ("Consulte a biblioteca…")
4. WHEN o GET falha THEN o drawer SHALL permanecer aberto, com estado vazio de substituições, sem erro não tratado em tela
5. WHEN o usuário clica num equivalente THEN o sistema SHALL abrir o drawer daquele exercício via `inspect` (registro do GET ou `getExerciseById` se não estiver na lista carregada)
6. IF o id clicado não resolver após GET/`getExerciseById` THEN o sistema SHALL notificar via toast e manter o exercício atual

**Independent Test**: Abrir um exercício com 2 equivalentes no API mock; a lista mostra os 2 nomes; clicar no segundo troca o título do drawer; mock 404 no GET mostra vazio, não o parágrafo estático antigo.

---

### P1: Escolher equivalente e trocar na execução ⭐ MVP

**User Story**: Como aluno em sessão ativa, quero escolher um equivalente cadastrado e confirmar a troca, para continuar o treino com o aparelho livre sem perder sets já feitos.

**Why P1**: Caso de uso de chão de academia; UI de EXVAR-01/06 (choose→swap) + EXVAR-07 no cliente.

**Acceptance Criteria**:

1. WHEN o exercício da sessão ativa tem 1+ equivalentes THEN a interface SHALL mostrar um controle de "trocar/variações" no cabeçalho, na mesma área de `client.session.card.details`
2. WHEN o exercício não tem equivalentes (GET vazio ou ainda não carregado vazio) THEN o sistema SHALL desabilitar o controle ou indicar que não há alternativa, e SHALL NOT abrir um picker vazio sem explicação
3. WHEN o aluno aciona o controle THEN o sistema SHALL abrir um picker em seleção única listando só os equivalentes do GET, e SHALL NOT mutar a sessão nesse toque
4. WHEN o aluno confirma um equivalente THEN o sistema SHALL: (a) manter sets `completed` do original; (b) remover sets não concluídos do original na UI; (c) inserir o substituto na sessão com `sets: []`
5. IF o equivalente escolhido já existe na mesma sessão THEN o sistema SHALL recusar a troca, avisar o aluno, e SHALL NOT enfileirar mutação
6. WHEN a troca é confirmada THEN o sistema SHALL deixar o `WorkoutPlanDocument` intacto (próxima sessão do plano volta ao exercício prescrito)
7. WHILE a sessão não está ativa (não iniciada / já finalizada na UI) o sistema SHALL NOT mostrar o controle de troca como ação disponível

**Independent Test**: Sessão com exercício X (2 sets done, 1 pending) e equivalente Y; abrir picker, cancelar: X inalterado; confirmar Y: X com 2 sets, Y vazio na lista; tentar Y de novo: aviso, sem segundo Y.

---

### P1: Swap offline pela mutation queue ⭐ MVP

**User Story**: Como aluno offline na academia, quero que a troca fique na fila existente e sincronize depois, sem um canal paralelo.

**Why P1**: EXVAR-08; Fase 1 já exige `enqueueMutation` em escritas de execução.

**Acceptance Criteria**:

1. WHEN o aluno confirma a troca THEN o sistema SHALL chamar `enqueueMutation` com `method: 'POST'`, `endpoint: /api/training/workouts/{sessionId}/swap-exercise`, e `body` contendo `originalExerciseId`, `newExerciseId` e `retainedSetsForOriginal` (só sets concluídos, mesmo mapeamento de `buildWorkoutStatePayload`)
2. WHEN a mutação é enfileirada THEN o sistema SHALL usar `dedupeKey: workout-swap-{sessionId}-{originalExerciseId}`
3. WHEN não há rede no confirm THEN a UI SHALL já refletir a troca local e SHALL permanecer consistente com o indicador de fila existente (`OfflineQueueIndicator`)
4. The sistema SHALL NOT chamar `apiClient` direto no caminho de confirm do swap (só a fila)

**Independent Test**: Mock `enqueueMutation`; confirmar troca; asserir endpoint/body/`dedupeKey`; `apiClient` do swap não é chamado no confirm.

---

## Edge Cases

- WHEN o GET de equivalentes devolve array nu **ou** `{ items: [...] }` THEN o mapper SHALL aceitar os dois shapes (mesmo unwrap de `useExercises`)
- WHEN a lista de equivalentes é longa THEN picker e drawer SHALL permitir scroll, sem truncar o dado
- WHEN o aluno abre o picker e fecha sem confirmar THEN a sessão SHALL permanecer igual
- WHEN um `state` PUT e um `swap-exercise` estão na fila THEN as `dedupeKey` distintas SHALL coexistir (não colapsar swap em `workout-state-*`)
- IF o POST sincronizado volta 400 (já na sessão / não equivalente / sessão encerrada) THEN a fila SHALL marcar failed no mecanismo já existente; esta feature não inventa UI de conflito nova

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| EXVAR-04 | P1: Drawer lista do GET | Tasks | Done |
| EXVAR-05 | P1: Navegação no drawer | Tasks | Done |
| EXVAR-01 | P1: Picker choose (execução) | Tasks | Done |
| EXVAR-06 | P1: Botão + swap na execução | Tasks | Done |
| EXVAR-07 | P1: Sets concluídos retidos no cliente | Tasks | Done |
| EXVAR-08 | P1: enqueueMutation swap | Tasks | Done |

**ID format:** `EXVAR-NN` (mesmos IDs do canônico; metade UI)

**Coverage:** 6 total neste spec frontend, 6 mapped to tasks, 0 unmapped. EXVAR-02/03/09 e POST/DELETE de autoria ficam no backend / fora deste ciclo.

---

## Success Criteria

- [ ] Drawer nunca mostra `Consulte a biblioteca para selecionar uma substituição.`
- [ ] Lista do drawer reflete o GET e navega via `inspect`
- [ ] Execução: toque no botão não troca; confirm troca só a sessão
- [ ] Confirm enfileira `swap-exercise` com `retainedSetsForOriginal` e `dedupeKey` estável
- [ ] Zero trabalho de player de vídeo neste feature folder
