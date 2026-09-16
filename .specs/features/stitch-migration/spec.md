# Migração estrutural de `src/stitch/` — Specification

## Problem Statement

`ShapeUp-Web/src/stitch/` (~35 arquivos) é código vivo — motor de template (`sourceRuntime.jsx`,
`StitchTemplate.jsx`, `manifest.json`, `linkBinding.js`, `copy.js`/`copy.tsv`) que renderiza HTML
exportado do Google Stitch (`templates/*.html`) e o liga a componentes React reais via
`sourceDocument`/`renderSource`/`nodeText`. É importado direto por `App.jsx`, `Layout.jsx`,
`Dashboard.jsx`, `ClientDetail.jsx` e cobre praticamente todo o app autenticado (login, registro,
recovery, exercícios, mensagens, moderação, nutrição (diário), onboarding, configurações,
dashboards por perfil, sidebar/workspace, e o editor de treino via `Builder.jsx`/`StitchBuilder`).

Foi produzido por uma refatoração de design ad-hoc (fora do escopo formal da feature
`web-frontend-redesign`, cujo `spec.md` explicitamente excluiu "redesign tela a tela do dashboard
autenticado") e nunca foi absorvido na estrutura normal do repo (`src/components`, `src/pages`,
`src/hooks`) — ficou como camada paralela isolada numa pasta com nome de ferramenta externa, não
de domínio. Confirmado com o usuário nesta sessão: a intenção original era essa absorção acontecer
e não aconteceu.

## Goals — REVISADO 2026-09-14 (ver AD-WEB-007, supersede AD-WEB-006)

Decisão do usuário mudou depois do Specify/Design/Tasks originais (que assumiam só reorganizar
pastas). Novo objetivo: **reescrever** cada tela hoje renderizada pelo motor genérico
(`sourceRuntime`/`StitchTemplate`/HTML de `templates/`) como componente **TypeScript/React nativo
(.tsx)**, com **obrigatoriedade dura de zero mudança visual/de comportamento** — pixel-parity, não
"parecido".

- [ ] Cada tela hoje em `src/stitch/*.jsx` vira um ou mais componentes `.tsx` nativos, tipados, sem
      depender de `sourceRuntime`/`StitchTemplate`/`manifest.json`/HTML externo em runtime.
- [ ] DOM renderizado (estrutura, classes CSS, texto, comportamento interativo) é **idêntico** ao
      estado atual — verificado por screenshot-diff automatizado (Playwright, já disponível no
      ambiente — ver `.specs/verify-stitch.cjs` como precedente), não só "revisão visual".
- [ ] TypeScript é adotado no projeto (`tsconfig.json`, `typescript` como devDependency — os
      `@types/react`/`@types/react-dom` já existem em `package.json` mas não usados) — escopo
      mínimo: habilita `.tsx` coexistindo com `.jsx` existente (não converte o repo inteiro).
- [ ] Todo import (interno ao repo, inclusive testes) resolve pro novo caminho — zero import morto
      apontando pra `stitch/`.
- [ ] Os 6 arquivos de teste existentes (`AthleteScoreboard.test.jsx`, `Exercises.test.jsx`,
      `Moderation.test.jsx`, `Onboarding.test.jsx`, `StitchTemplates.test.jsx`,
      `Usability.test.jsx`) continuam passando após a reescrita, sem alterar o que testam.
- [ ] Arquivos legados pré-Stitch com nome colidente (ex.: `src/pages/Login.jsx` vs.
      `stitch/PublicPages.jsx`'s `StitchLogin`) são investigados: mantidos (se ainda referenciados
      por import real) ou removidos (se confirmados mortos) — nunca sobrescritos às cegas. Ver
      tabela de investigação já fechada em `design.md` — continua válida, reescrita não muda quem
      é o dono da lógica de negócio (`Login.jsx`, `Register.jsx` etc. continuam sendo a lógica real
      que o novo `.tsx` vai envolver, só que sem o runtime genérico no meio).
- [ ] Motor genérico (`sourceRuntime.jsx`, `StitchTemplate.jsx`, `manifest.json`, `linkBinding.js`,
      `copy.js`/`.tsv`, `templates/*.html`, `styles/*.css`) é **removido** ao final — só existe
      enquanto alguma tela ainda não foi convertida (migração incremental, tela por tela).

## Out of Scope

| Item | Motivo |
| --- | --- |
| ~~Reescrever telas como JSX nativo~~ | **REVOGADO 2026-09-14** — usuário pediu explicitamente reescrita em TypeScript/React nativo. Ver Goals revisado e AD-WEB-007. |
| Mudar UX/visual/comportamento de qualquer tela, por menor que seja | Requisito duro e explícito do usuário: "NAO MUDAR O DESIGN E APARENCIA DE NADA" — pixel-parity é acceptance criteria, não guideline |
| Converter o repo inteiro pra TypeScript | Escopo é habilitar `.tsx` pras telas desta migração; arquivos `.jsx` existentes fora do escopo continuam `.jsx` — conversão ampla é decisão separada |
| Mexer em `ShapeUpApi` (backend) | Fora do domínio desta spec |
| `stitch/Builder.jsx` mudar de LOCAL antes da feature `workout-editor` fechar | Ver AD-1 abaixo — ordem coordenada com a Frente 1 (fechamento da Fase 2) desta sessão |
| `.png`/screenshots de verificação em `ShapeUp-Web/.specs/` (ex.: `verified-*.png`, `source-*.png`) e scripts `.cjs` de verificação visual na raiz de `.specs/` | Artefatos da feature `web-frontend-redesign` já entregue — não pertencem ao escopo desta spec, que é só sobre `src/stitch/` |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Nome da nova pasta pro motor de template | `src/lib/pageTemplateEngine/` (`sourceRuntime.jsx`, `StitchTemplate.jsx`, `manifest.json`, `linkBinding.js`, `copy.js`, `copy.tsv`, `useStitchLanguage.js`) | Repo não tem `src/lib/` ainda, mas é o padrão comum pra "motor compartilhado sem dono de domínio" (paralelo a `src/services/`, `src/utils/` já existentes) — nome descreve o QUE FAZ, não a ferramenta que gerou | y |
| Onde cada tela-wrapper migra | Ver tabela de mapeamento na Design phase (arquivo por arquivo) — princípio: ao lado do domínio real (`src/pages/<domínio>/`), nunca uma pasta "stitch" nova | Consistente com goal 1 | y |
| `templates/*.html` e `styles/*.css` | Movem junto com o motor (`src/lib/pageTemplateEngine/templates/`, `.../styles/`) — são o formato de entrada do motor, não pertencem a uma tela específica | São consumidos genericamente por `sourceDocument`/`StitchTemplate`, não importados por tela individual | y |
| Arquivos sem nenhum importer real confirmado (após investigação de colisão) | Removidos nesta feature, registrados individualmente no `validation.md` do Verifier | Consistente com "código morto não é preservado por hábito" — mas só após confirmação real de import (não apenas grep de string), ver Goal 4 | y |
| Coordenação com `workout-editor` (Frente 1 desta sessão) | `Builder.jsx`/`StitchBuilder` só migra de local DEPOIS que `workout-editor` roda seu Verifier e fecha — registrado em `STATE.md` de ambos os specs | Evita os dois trabalhos colidirem no mesmo arquivo ao mesmo tempo; `workout-editor` referencia o caminho atual (`../../stitch/Builder`) até lá | y |
| `public/stitch/ryno.png` (referenciado em `Onboarding.jsx` como `/stitch/ryno.png`, path público servido pelo Vite, não import JS) | Fora de escopo — é asset estático em `public/`, não faz parte da pasta `src/stitch/` sendo migrada; só o `<img src>` é ajustado se o asset for renomeado, o que esta spec NÃO faz | Path público não tem relação com a estrutura de `src/`; renomear ativo estático é decisão separada, sem necessidade aqui | y |

| `tsconfig.json` strictness | `"strict": true` (padrão recomendado pra código novo) | Repo greenfield em TS — começar estrito evita dívida; arquivos `.jsx` não migrados ficam fora do `include` do TS, sem impacto | y |
| Método de verificação de pixel-parity | Screenshot Playwright (viewport 1440 + 390, mesmo padrão de `verified-*-1440.png`/`-390.png` já em `.specs/`) tela-antes (branch atual) vs. tela-depois (`.tsx`), diff visual (`pixelmatch` ou comparação manual assistida por zoom) — zero diff tolerado fora de anti-aliasing | Já é o padrão usado nesse repo pra verificar redesign (`web-frontend-redesign`); reaproveita ferramenta já disponível (Playwright), sem nova dependência | y |
| Ordem de conversão das 15 telas | Uma por vez (task por tela), cada uma com seu próprio gate de pixel-parity antes de seguir pra próxima — nunca converter várias em lote | Reduz blast radius de regressão visual; mais fácil isolar qual conversão quebrou o quê | y |

**Open questions:** none — todas resolvidas ou registradas acima.

---

## User Stories

### P1: Motor de template vira módulo nomeado por função ⭐ MVP

**User Story**: Como dev do repo, quero que o motor de renderização de template viva em
`src/lib/pageTemplateEngine/` (não `src/stitch/`), pra qualquer pessoa entender o que o código FAZ
sem saber a história da ferramenta que o gerou.

**Why P1**: É a peça mais compartilhada — todo o resto depende dela; sem mover primeiro, nada mais
pode migrar.

**Acceptance Criteria**:

1. WHEN a migração termina THEN `src/lib/pageTemplateEngine/` SHALL conter `sourceRuntime.jsx`,
   `StitchTemplate.jsx`, `manifest.json`, `linkBinding.js`, `copy.js`, `copy.tsv`,
   `useStitchLanguage.js`, `templates/*.html`, `styles/*.css`
2. WHEN qualquer arquivo do repo importava de `./sourceRuntime`, `./StitchTemplate`,
   `./manifest.json`, `./linkBinding`, `./copy`, `./useStitchLanguage` relativo a `stitch/` THEN o
   import SHALL apontar pro novo caminho em `src/lib/pageTemplateEngine/`
3. WHEN `npm run build` roda após a migração THEN SHALL completar sem erro de módulo não encontrado

**Independent Test**: `npm run build` limpo + `npm run lint` 0 erros depois de mover só o motor
(antes de mover as telas).

---

### P1: Telas-wrapper migram pra pasta do domínio real ⭐ MVP

**User Story**: Como dev, quero que cada tela hoje em `stitch/` (`Exercises.jsx`, `Nutrition.jsx`,
`Settings.jsx`, `Gyms.jsx`, `Messages.jsx`, `Moderation.jsx`, `Onboarding.jsx`,
`OperationalPages.jsx`, `PublicPages.jsx`, `Registration.jsx`, `Workspace.jsx`,
`AthleteScoreboard.jsx`, `AuthBrand.jsx`, `HistoryChart.jsx`, `useHydration.js`) esteja ao lado do
resto do seu domínio (`src/pages/...` ou `src/components/...`), não numa pasta separada por
ferramenta.

**Why P1**: É o objetivo central da spec — sem isso a "absorção" não aconteceu de fato.

**Acceptance Criteria**:

1. WHEN a migração termina THEN nenhum arquivo `.jsx`/`.js`/`.css` SHALL existir sob um caminho
   contendo `/stitch/`
2. WHEN um arquivo pré-existente em `src/pages/` ou `src/pages/Dashboard/` tem o MESMO nome de
   domínio de uma tela-wrapper (ex. `Login.jsx`, `Register.jsx`, `Dashboard/Exercises.jsx`,
   `Dashboard/Settings.jsx`, `Dashboard/Messages.jsx`, `Dashboard/DashboardClient.jsx`) THEN a
   Design phase SHALL registrar, arquivo por arquivo, se o legado é: (a) ainda importado de
   verdade por statement `import` (não por string de tradução/rota) — nesse caso o
   nome/caminho final é decidido caso a caso pra não colidir — ou (b) confirmado sem nenhum
   `import` real — nesse caso é removido
3. WHEN qualquer arquivo do repo (produção ou teste) importava uma tela-wrapper por caminho
   `stitch/X` THEN o import SHALL apontar pro novo caminho
4. WHEN os 6 arquivos de teste existentes rodam (`npm test` ou equivalente) THEN SHALL passar sem
   alteração de asserção — só ajuste de import path se necessário

**Independent Test**: `npm run build && npm run lint` limpos, suíte de teste do frontend 100%
verde, navegação manual (via `run` skill) confirma que Login/Register/Dashboard/Exercícios/
Nutrição/Configurações/Mensagens/Moderação/Onboarding/Gyms carregam sem erro de console.

---

### P2: `Builder.jsx` migra em coordenação com `workout-editor`

**User Story**: Como dev, quero que `Builder.jsx` (PlanEditor real do editor de treino) só mude de
local depois que a feature `workout-editor` (Frente 1, Fase 2 do `ROADMAP.md`) fechar seu Verifier,
pra não competir por cima do mesmo arquivo em paralelo.

**Why P2**: Não bloqueia o resto da migração (P1 cobre tudo o mais), mas é dependência explícita
entre as duas frentes desta sessão.

**Acceptance Criteria**:

1. WHEN `workout-editor` ainda não fechou Verifier THEN `Builder.jsx` SHALL permanecer em
   `src/stitch/Builder.jsx` (import em `ClientDetail.jsx` inalterado)
2. WHEN `workout-editor` fecha Verifier (PASS) THEN esta spec SHALL ter uma task final pra mover
   `Builder.jsx` pro destino decidido na Design phase e atualizar o import em `ClientDetail.jsx`
3. WHEN `Builder.jsx` migra THEN `sourceRuntime` que ele usa já SHALL estar em
   `src/lib/pageTemplateEngine/` (P1 já fechado)

**Independent Test**: Checar `STATE.md` de `workout-editor` — status `Verified`/PASS — antes de
rodar a task de mover `Builder.jsx`.

---

## Edge Cases

- WHEN um arquivo `templates/*.html` ou `styles/*.css` não é referenciado por nenhum `.jsx` do
  motor (checar `manifest.json` e imports `?inline`) THEN SHALL ser listado como candidato a
  remoção na Design phase, com evidência de zero-referência antes de apagar
- WHEN `public/stitch/ryno.png` for o único artefato do nome "stitch" fora de `src/` THEN
  permanece — fora de escopo (ver Assumptions)
- WHEN um teste (`*.test.jsx`) importa um caminho relativo que muda de profundidade após a
  migração THEN o import SHALL ser ajustado sem alterar o corpo do teste

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| STMIG-01 | P1: Motor de template | Design | Pending |
| STMIG-02 | P1: Motor de template | Design | Pending |
| STMIG-03 | P1: Motor de template | Design | Pending |
| STMIG-04 | P1: Telas-wrapper | Design | Pending |
| STMIG-05 | P1: Telas-wrapper (colisão de nome legado) | Design | Pending |
| STMIG-06 | P1: Telas-wrapper | Design | Pending |
| STMIG-07 | P1: Telas-wrapper (testes) | Design | Pending |
| STMIG-08 | P2: Builder.jsx coordenado | Design | Pending |
| STMIG-09 | P2: Builder.jsx coordenado | Design | Pending |

**Coverage:** 9 total, 0 mapped to tasks yet, 9 unmapped ⚠️ (Design/Tasks phase seguinte)

---

## Success Criteria

- [ ] Zero caminho contendo `/stitch/` sob `src/` (exceto o histórico do git)
- [ ] `npm run build`, `npm run lint`, suíte de testes — todos limpos após a migração
- [ ] `workout-editor` e `stitch-migration` não colidem: `Builder.jsx` migra só depois do Verifier
      de `workout-editor` (coordenado via `STATE.md` dos dois repos)
- [ ] Nenhum arquivo removido sem evidência de zero-import real documentada no `validation.md`
