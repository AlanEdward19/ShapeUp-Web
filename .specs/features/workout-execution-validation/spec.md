# Validação de Execução de Treino (Frontend) — Specification

> **Canonical API spec (do not edit, do not re-specify):** `ShapeUpV2/.specs/features/workout-execution-validation/spec.md`  
> Also: `design.md` and `validation.md` in that same folder. Backend ACs are **CLOSED** (`RequireRpe` live). This file covers **only** the Frontend ACs: **WEV-01, WEV-03, WEV-04**, and the UI halves of **WEV-05, WEV-06, WEV-07, WEV-08**.

## Problem Statement

Na execução (`TrainingPlansClient.jsx`, `toggleSetComplete`), o aluno marca um set concluído sem peso e reps. O histórico e o ShapeScore passam a confiar em séries vazias. O profissional ainda não consegue exigir RPE por exercício no editor (`PlanEditor` em `ClientDetail.jsx` / `PlanEditorShell.tsx`), embora a API já persista `requireRpe`. RPE no log de execução aceita valores fora de 1–10. Dois rótulos da superfície do aluno ignoram `t()`: o kicker `"Rest"` do timer e a tag crua `{plan.phase}` / `{plan.difficulty}` no card de plano.

## Goals

- [ ] Set só conclui na UI com peso válido (`>= 0`, preenchido) e reps inteiro `>= 1`
- [ ] Exercício com `requireRpe === true` no runtime da sessão só conclui set com RPE 1–10 preenchido
- [ ] Profissional liga `requireRpe` por exercício e aplica em massa no plano/template aberto; o save existente envia o campo
- [ ] Campo de RPE da execução nunca guarda valor fora de 1–10 (inteiro); vazio continua permitido quando RPE é opcional
- [ ] Timer "Rest" e tags de fase/dificuldade do aluno usam `t()` nas 3 línguas, com fallback para o valor cru (nunca a chave literal)

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| WEV-02 e qualquer AC **[Backend]** (validators, handlers, schema Mongo, 400) | API já CLOSED. Ver spec/design/validation canônicos |
| Novo endpoint de bulk `RequireRpe` | Bulk é estado local + save de plano/template já existente |
| Reconciliar RPE de execução com `IntensityType.Rir` da autoria | Gap pré-existente; `requireRpe` exige o campo de log `set.log.rpe` já existente |
| Backfill de sets históricos vazios ou RPE fora da faixa | Só escritas novas |
| Capability/role nova para marcar `requireRpe` | Reusa quem já edita o plano |
| Notificar o aluno quando o plano muda `requireRpe` no meio de uma sessão | Snapshot no start (AD-007 no domínio Training) |
| Reescrever `buildWorkoutStatePayload` para deixar de cair na prescrição | Fora dos ACs de UI; o gate impede concluir vazio |
| Trocar a escala de RPE (RIR, CR-10, decimais) | Canônico: inteiro 1–10 |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Superfície Independent | Os mesmos gates de conclusão, clamp de RPE e rótulo `Rest` aplicam em `TrainingPlansIndependent.jsx` | Mesmo motor de execução duplicado (`toRuntimeSets`, check-circle, timer `"Rest"`). Omitir deixaria o atleta independent fora do MVP de integridade | n |
| Limiar peso/reps | Peso numérico `>= 0` (0 = bodyweight). Reps inteiro `>= 1`. String vazia, só espaços, `NaN` = ausente | Cópia da assumption canônica | y (canônico) |
| RPE fora da faixa na UI | Clamp para o inteiro mais próximo em `1..10`. `8.5` vira `9` (`Math.round`). String vazia permanece vazia até concluir | Canônico permite rejeitar ou clamp; clamp evita estado ilegal sem bloquear digitação | n |
| Indicador visual do gate | Classe `su-exec-input--invalid` no input que falta, por 800ms; não dispara timer de descanso | Canônico pede highlight/shake; uma classe existente-pattern (input) é mensurável | n |
| `t()` e chave ausente | Helper `translateKnown(t, key, fallback)`: se `t(key) === key`, renderiza `fallback` | `t()` hoje devolve a própria chave (truthy). `t(key) \|\| raw` **não** cumpre o AC de nunca mostrar `pro.builder.phase.undefined` | n |
| Dificuldade no card do aluno | Chaves novas `client.training.difficulty.beginner` / `.intermediate` / `.advanced` (e `.easy` / `.hard` se o valor cru for Easy/Hard) | Canônico WEV-04 AC3 pede essas chaves, não reuso de `pro.builder.diff.*` | y (canônico) |
| Fase no card do aluno | Reusa `pro.builder.phase.{hypertrophy,strength,endurance,deload}` | Canônico WEV-04 AC1 | y (canônico) |
| JSON do campo | `requireRpe` camelCase no body de plan/template, default `false` | DTO da API já expõe `RequireRpe` com default false | y (API closed) |
| Start vs resume | Start copia `requireRpe` do plano normalizado no momento do start. Resume prefere `exercises[].requireRpe` do `getActiveWorkout` quando presente; senão o plano | Canônico: execução lê o snapshot. O client hoje achata o plano de novo no resume; corrigir isso é parte de WEV-07 UI | n |
| Bulk | Só marca `true` em todos os exercícios de todos os blocos do editor aberto. Não persiste até Save. Toggle individual posterior vence. Zero exercícios: botão disabled | Canônico WEV-06 | y |
| Failure | `set.failure === true` define `log.rpe = '10'` (já existe). Gate de RPE obrigatório trata `'10'` como preenchido | Canônico edge case | y |
| Dimensões restantes | Auth, rate limit, TTL, métricas, circuit breaker: N/A neste corte de UI. Concorrência = snapshot no start. Retry do save de execução = fila já existente, sem mudança | Escopo frontend de gates/i18n/toggle | n |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Bloqueio de conclusão sem peso e reps ⭐ MVP

**User Story**: Como aluno em execução, quero concluir um set só depois de preencher peso e reps, para o histórico refletir o que eu fiz.

**Why P1**: Bug de integridade ativo (`toggleSetComplete` não valida `set.log`).

**Acceptance Criteria**:

1. WHEN o aluno clica em concluir (`su-check-circle`) e peso ou reps está vazio, não numérico, ou reps `< 1` THEN o sistema SHALL recusar a conclusão (não alterna `set.completed`), SHALL não iniciar o timer de descanso, e SHALL aplicar `su-exec-input--invalid` por 800ms no campo que falta
2. WHEN peso é exatamente `0` e reps é inteiro `>= 1` THEN o sistema SHALL permitir a conclusão
3. WHEN peso é negativo THEN o sistema SHALL recusar a conclusão e SHALL marcar o input de peso inválido
4. WHEN peso e reps são válidos e o aluno conclui THEN o sistema SHALL marcar `set.completed = true` e SHALL iniciar o descanso se `prescribedRest > 0` (sem regressão)
5. WHEN o aluno apaga peso ou reps de um set já concluído THEN o sistema SHALL desmarcar `completed` nesse set
6. WHEN o set é extra (`isExtra`) THEN o sistema SHALL aplicar o mesmo gate de peso e reps

**Independent Test**: Sessão aberta, concluir sem logs: set permanece aberto e o input vazio ganha a classe inválida. Peso `0` + reps `12`: conclui. Apagar reps de set concluído: volta a aberto.

---

### P1: Rótulo Rest do timer ⭐ MVP

**User Story**: Como aluno em pt-BR ou es, quero o kicker do timer no meu idioma.

**Why P1**: String fixa `"Rest"` em `TrainingPlansClient.jsx` (e a cópia Independent).

**Acceptance Criteria**:

1. WHEN o timer de descanso está visível THEN o sistema SHALL renderizar o kicker via `t('client.session.timer.rest_label')`, nunca a string literal `"Rest"`
2. WHEN o idioma é `pt-BR` THEN o kicker SHALL ser `Descanso`; WHEN é `es` THEN SHALL ser `Descanso`; WHEN é `en` THEN SHALL ser `Rest`
3. WHEN o aluno troca o idioma via `LanguageContext` com a sessão ativa THEN o kicker SHALL atualizar na hora, sem reload

**Independent Test**: Concluir set com rest, mudar idioma para pt-BR: kicker vira "Descanso".

---

### P1: Fase e dificuldade traduzidas no card do aluno ⭐ MVP

**User Story**: Como aluno, quero ver fase e dificuldade do plano no meu idioma na listagem.

**Why P1**: `{plan.phase}` e `{plan.difficulty}` crus no card (`TrainingPlansClient.jsx`).

**Acceptance Criteria**:

1. WHEN o card do aluno mostra a tag de fase THEN o sistema SHALL usar `translateKnown` com chave `pro.builder.phase.` + `plan.phase` em minúsculas
2. IF `plan.phase` não tem chave conhecida THEN o sistema SHALL mostrar o valor cru, nunca a chave literal
3. WHEN o card mostra dificuldade THEN o sistema SHALL traduzir `Beginner` / `Intermediate` / `Advanced` (e `Easy` / `Hard` se presentes) via `client.training.difficulty.{slug}` com o mesmo fallback
4. WHEN as chaves novas existem THEN `en`, `pt-BR` e `es` SHALL ter as três entradas (paridade 100% das chaves desta feature)

**Independent Test**: Locale pt-BR, card mostra "Hipertrofia" / "Força", não "Hypertrophy" / "Strength".

---

### P1: Toggle Require RPE no editor ⭐ MVP

**User Story**: Como profissional (ou independent editando o próprio plano), quero marcar RPE obrigatório por exercício no editor.

**Why P1**: Metade UI de WEV-05. Sem toggle, `requireRpe` da API não é autorável.

**Acceptance Criteria**:

1. WHEN o editor mostra um exercício no bloco THEN a UI SHALL exibir um toggle "RPE obrigatório" ligado a `exercise.requireRpe` (default `false`)
2. WHEN o profissional reabre um plano/template cujo exercício veio da API com `requireRpe: true` THEN o toggle SHALL aparecer ligado
3. WHEN o plano é salvo THEN o body existente (`buildWorkoutPlanBody` / `buildTemplateBody`) SHALL incluir `requireRpe` por exercício (boolean), sem endpoint novo

**Independent Test**: Ligar o toggle, salvar, recarregar: o mesmo exercício continua ligado; os outros não.

---

### P1: Bulk exigir RPE em todos ⭐ MVP

**User Story**: Como profissional, quero uma ação única que marque RPE obrigatório em todos os exercícios do plano aberto.

**Why P1**: Metade UI de WEV-06.

**Acceptance Criteria**:

1. WHEN o profissional aciona "Exigir RPE em todos" THEN o sistema SHALL setar `requireRpe = true` em todos os exercícios de todos os blocos do estado local, sem persistir sozinho
2. WHEN depois disso o profissional desliga o toggle de um exercício THEN o sistema SHALL deixar só aquele exercício `false`
3. IF o plano não tem exercícios THEN o sistema SHALL desabilitar a ação (não é no-op silencioso clicável)
4. WHEN a ação roda sobre um mix true/false THEN o sistema SHALL sobrescrever todos para `true`

**Independent Test**: 5 exercícios em 2 blocos, bulk, salvar, recarregar: os 5 true. Desligar 1 e salvar: 1 false, 4 true.

---

### P1: Execução bloqueia set sem RPE quando exigido ⭐ MVP

**User Story**: Como aluno num exercício com RPE obrigatório, quero ser impedido de concluir o set sem RPE.

**Why P1**: Metade UI de WEV-07.

**Acceptance Criteria**:

1. WHEN `exercise.requireRpe === true` e `set.log.rpe` está vazio/não numérico e o aluno tenta concluir THEN o sistema SHALL recusar, SHALL não iniciar descanso, e SHALL marcar o input de RPE inválido (mesmo padrão de WEV-01)
2. WHEN `requireRpe` é false ou ausente THEN o sistema SHALL permitir concluir com RPE vazio, desde que peso e reps passem no gate
3. WHEN `set.failure` trava RPE em `10` e o exercício exige RPE THEN o sistema SHALL tratar RPE como preenchido e SHALL permitir concluir se peso/reps forem válidos

**Independent Test**: Exercício exigido, concluir sem RPE: bloqueado. Preencher 8: conclui. Exercício não exigido, concluir sem RPE: permitido.

---

### P2: Faixa 1–10 do RPE na UI

**User Story**: Como aluno, quero que o log de RPE aceite só 1–10 inteiro.

**Why P2**: Metade UI de WEV-08. Não bloqueia o loop de concluir set com dados válidos.

**Acceptance Criteria**:

1. WHEN o aluno informa RPE `< 1` ou `> 10` no log THEN o sistema SHALL gravar o limite mais próximo (1 ou 10), nunca um valor fora da faixa no estado
2. WHEN o aluno informa um não inteiro (ex. `8.5`) THEN o sistema SHALL arredondar para inteiro em `1..10`
3. WHEN o campo está vazio e RPE é opcional THEN o sistema SHALL manter vazio (clamp não inventa um RPE)

**Independent Test**: Digitar 15: estado vira 10. Digitar 8.5: estado vira 9. Deixar vazio num exercício opcional: permanece vazio.

---

## Edge Cases

- IF o aluno está no meio do set (peso ok, reps vazio) e troca de exercício THEN o sistema SHALL preservar o rascunho; o gate só barra a ação de concluir
- WHEN uma sessão já começou e o plano é editado depois THEN o runtime da sessão SHALL continuar com o `requireRpe` copiado no start/resume (não relê o plano a cada clique)
- WHEN `plan.difficulty` legado está fora do enum THEN o sistema SHALL mostrar o cru
- WHEN o aluno desmarca conclusão (clique no check já marcado) THEN o sistema SHALL permitir, sem revalidar peso/reps

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| WEV-01 | P1: Gate peso/reps | Execute | Implementing |
| WEV-03 | P1: i18n Rest | Execute | Implementing |
| WEV-04 | P1: i18n fase/dificuldade | Execute | Implementing |
| WEV-05 | P1: Toggle requireRpe (UI) | Execute | Implementing |
| WEV-06 | P1: Bulk requireRpe (UI) | Execute | Implementing |
| WEV-07 | P1: Gate RPE na execução (UI) | Tasks | Pending |
| WEV-08 | P2: Clamp RPE 1–10 (UI) | Tasks | Pending |

**ID format:** `WEV-NN` (mesmos IDs do spec canônico; WEV-02 não entra neste repo)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 7 frontend IDs, 0 mapped until Execute, 7 unmapped

---

## Success Criteria

- [ ] Nenhum set fica `completed` na UI sem peso e reps válidos
- [ ] Toggle e bulk `requireRpe` no editor; save envia o boolean; reopen restaura
- [ ] Exercício exigido: sem RPE não conclui; exercício default: RPE opcional
- [ ] Log de RPE só guarda inteiro 1–10 ou vazio
- [ ] "Rest" e fase/dificuldade do aluno traduzidos em pt-BR/en/es, sem chave literal
