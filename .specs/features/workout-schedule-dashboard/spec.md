# Agenda Semanal do Treino no Dashboard (Frontend) — Specification

**Canonical backend**: `ShapeUpV2/.specs/features/workout-schedule-dashboard/spec.md` (WSD-01, WSD-07 Verified).
**This document**: ShapeUp-Web only — WSD-02..WSD-06.

## Problem Statement

O backend já persiste `AssignedWeekdays` em cada `WorkoutPlanDocument` e devolve `assignedWeekdays` em `getWorkoutPlansByUser`. O web ainda não consome esse campo.

1. `PlanEditor` (`ClientDetail.jsx`, reexportado por `PlanEditorShell.tsx`) não oferece seletor de dias e `buildWorkoutPlanBody` não envia `assignedWeekdays` no create/update.
2. O card "Exercícios Prescritos para Hoje" (`AthleteDashboardMarkup.tsx`) sempre renderiza exercícios de `plans[0]`, sem critério de dia corrente.
3. `AthleteView` em `OperationalDashboardsShell.tsx` chama `getDashboardMe(5)` com literal `5`, ignorando o plano real.

## Goals

- [ ] Autor de plano (profissional em ficha de aluno ou usuário independente) seleciona 0..N dias da semana por treino, persiste e vê o estado ao reabrir
- [ ] Card "Exercícios Prescritos para Hoje" só aparece quando algum treino do usuário tem o weekday local de hoje; nesse caso agrega exercícios de todos esses treinos
- [ ] Sem treino de hoje, o dashboard não dispara request extra só para alimentar esse card
- [ ] Widget Frequência usa `getDashboardMe(N)` com N derivado do plano (união de dias, ou contagem de treinos, ou sem chamada se plano vazio)

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Persistência / contrato `AssignedWeekdays` na API | WSD-01 e WSD-07 fechados no backend |
| Calendário, notificações, ciclos multi-semana | Canonical Out of Scope |
| Redesenhar "plano ativo" além do conjunto retornado por `getWorkoutPlansByUser` | Canonical Out of Scope |
| CTA "Iniciar Treino de Hoje" no header do athlete dashboard | Não está em WSD-02..WSD-06 |
| Seletor de weekday em templates (`TrainingPlansProfessional` / `normalizeTemplate`) | Templates não têm o campo; Assign nasce com `[]` |
| Dashboard profissional, numerador `sessionsCompletedThisWeek`, janela UTC do handler | Sem mudança de contrato; numerador já existe |
| Extrair `buildWorkoutPlanBody` para um módulo compartilhado | Fora do pedido; os dois builders duplicados recebem o mesmo campo |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Fetch do card "hoje" | Não existe endpoint dedicado de "exercícios de hoje". O card lê blocos já carregados por `getWorkoutPlansByUser` (`readAllPages`). WSD-04 = não chamar `getWorkoutPlanById`, catálogo de exercícios, nem qualquer outro endpoint cujo único propósito seja o card, quando `plansForToday` é vazio. `getWorkoutPlansByUser` e `getWorkoutsByUser` continuam (histórico + denominador) | Scan do código: `AthleteView` já tem os exercícios no documento do plano | n |
| Dia corrente | `Date#getDay()` no fuso do browser (0 = Sunday … 6 = Saturday), alinhado a `System.DayOfWeek` e a `AthleteDashboardMarkup` (`new Date()` local) | Canonical edge case de TZ; numerador UTC no backend permanece desalinhado por design | y (canonical) |
| Forma interna vs API | Interno: `number[]` 0–6 sem duplicata, ordem estável. Payload JSON: strings `"Sunday"`…`"Saturday"`. Leitura aceita string ou número | Backend serializa enum string; ASP.NET pode emitir número se a config mudar | n |
| Plano vazio e `getDashboardMe` | Se `plans.length === 0` após load com sucesso, não chamar `getDashboardMe` (N=0 é 400). Widget mostra "—" como hoje quando `dashboard` é null | Canonical WSD-06 AC4; `useTrainingApi` também trata `0` como falsy na query | y (canonical) |
| Mistura com/sem weekday | Se **algum** plano tem `assignedWeekdays.length > 0`, N = tamanho da união de todos os dias (planos sem dias não entram na união). Senão N = `plans.length` | Canonical WSD-05 / WSD-06 | y |
| Templates | `PlanEditor` esconde o seletor quando `plan._templateId` está definido | Evita mandar campo inexistente no body de template | n |
| Superfícies do editor | Mesmo `PlanEditor` em `ClientDetail` (aluno) e `TrainingPlansIndependent`. `PlanEditorShell` só reexporta; sem lógica nova | Um seletor cobre as duas escritas de plano | n |
| Dimensões restantes (auth, retry, observabilidade, concorrência, TTL) | N/A neste corte | Write path e auth já existem; feature só adiciona campo opcional e ramifica UI/fetch já autenticados | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Seletor de dias no editor de plano ⭐ MVP

**User Story**: Como autor de um treino, quero marcar um ou mais dias da semana (ou nenhum) nesse treino, para o dashboard saber quando ele é esperado.

**Why P1**: Sem o campo no save/load, WSD-03..WSD-06 não têm dado.

**Acceptance Criteria**:

1. WHEN o autor abre o editor de um plano de treino (não template) THEN the system SHALL mostrar um seletor multi-dia (Dom–Sáb) cujo estado inicial é `assignedWeekdays` normalizado do plano (lista vazia se ausente)
2. WHEN o autor salva com um ou mais dias marcados THEN the system SHALL incluir `assignedWeekdays` no body de create/update como array de nomes `"Sunday"`…`"Saturday"` sem duplicata
3. WHEN o autor desmarca todos os dias e salva THEN the system SHALL persistir `assignedWeekdays` como `[]` (agendamento opcional; não é erro)
4. WHEN o autor reabre o mesmo plano THEN the system SHALL mostrar os mesmos dias selecionados que a API devolveu
5. WHERE o editor está em um template (`plan._templateId` definido) the system SHALL não renderizar o seletor de weekdays

**Independent Test**: Criar plano, marcar Monday e Thursday, salvar, recarregar — ambos marcados; limpar e salvar — nenhum marcado, save 2xx.

---

### P1: Card "hoje" só com treino do dia ⭐ MVP

**User Story**: Como atleta no dashboard, quero ver "Exercícios Prescritos para Hoje" só quando há treino no dia local de hoje.

**Why P1**: Hoje o card mente: sempre usa `plans[0]`.

**Acceptance Criteria**:

1. WHEN pelo menos um plano do usuário tem o weekday local corrente em `assignedWeekdays` THEN the system SHALL renderizar o card "Exercícios Prescritos para Hoje" com os exercícios de **todos** esses planos, na ordem em que os planos vieram de `readAllPages`, exercícios na ordem dos blocks
2. WHEN nenhum plano contém o weekday local corrente (incluindo todos com `[]`) THEN the system SHALL não renderizar o card "Exercícios Prescritos para Hoje"
3. WHEN a condição do critério 2 vale THEN the system SHALL não disparar nenhum request HTTP extra cujo único propósito seja popular esse card (`getWorkoutPlanById` ou equivalente)
4. The system SHALL derivar a lista do card só dos planos já carregados por `getWorkoutPlansByUser`, nunca só de `plans[0]`

**Independent Test**: Plano atribuído a hoje — card visível com os exercícios certos, sem GET extra de plan-by-id. Sem atribuição a hoje — card ausente no DOM, Network sem GET de plan-by-id para o card.

---

### P1: Denominador real de frequência ⭐ MVP

**User Story**: Como atleta, quero ver frequência `completadas / alvo` com alvo igual ao meu plano, não `5` fixo.

**Why P1**: `getDashboardMe(5)` é o bug restante no web.

**Acceptance Criteria**:

1. WHEN `getWorkoutPlansByUser` já resolveu e pelo menos um plano tem `assignedWeekdays` não vazio THEN the system SHALL chamar `getDashboardMe(N)` com N = quantidade de weekdays distintos na união de todos os planos (exemplo: A Seg+Qui, B Ter → N=3)
2. WHEN a lista de planos não é vazia e nenhum plano tem `assignedWeekdays` preenchido THEN the system SHALL chamar `getDashboardMe(N)` com N = `plans.length`
3. WHEN a lista de planos é vazia (zero treinos) THEN the system SHALL não chamar `getDashboardMe`
4. WHEN a lista de planos é vazia THEN the widget Frequência SHALL mostrar "—" no alvo e na taxa
5. The system SHALL não passar o literal `5` como `sessionsTargetPerWeek` em nenhum caminho deste dashboard

**Independent Test**: 2 planos sem dias → `sessionsTargetPerWeek=2`. 2 planos (Seg+Qui) e (Ter) → N=3. 0 planos → nenhuma chamada `/api/training/dashboard/me`, UI "—".

---

## Edge Cases

- WHEN um plano é excluído THEN the system SHALL deixar de contá-lo no card e em N no próximo load do dashboard
- WHEN dois planos caem no mesmo dia THEN the system SHALL mostrar exercícios dos dois no card e contar esse dia uma vez em N
- WHEN a API omite `assignedWeekdays` (legado) THEN the system SHALL tratar como `[]`
- IF `getWorkoutPlansByUser` falha THEN the system SHALL não chamar `getDashboardMe` com fallback `5`; Frequência permanece "—"
- WHEN planos ainda não carregaram THEN the system SHALL não chamar `getDashboardMe(5)` no mount

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| WSD-02 | P1: Seletor de dias no editor | Tasks | Done |
| WSD-03 | P1: Card hoje — render condicional + agregação | Tasks | Done |
| WSD-04 | P1: Card hoje — sem fetch extra | Tasks | Done |
| WSD-05 | P1: Frequência — união de dias | Tasks | Done |
| WSD-06 | P1: Frequência — fallback contagem / sem N=0 | Tasks | Done |

**ID format:** `WSD-NN` (mesmos IDs do canônico)

**Coverage:** 5 total, 5 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] Round-trip no editor: 0, 1 ou N dias persistem e reabrem
- [ ] Card "hoje" ausente (e sem GET extra) quando não há treino no weekday local
- [ ] Card "hoje" agrega todos os treinos do dia quando há mais de um
- [ ] Frequência nunca usa denominador literal `5`; vazio mostra "—" sem chamar a API com 0
