# Migração estrutural de `src/stitch/` — Design

**Spec**: `ShapeUp-Web/.specs/features/stitch-migration/spec.md`

## Architecture — REVISADO 2026-09-14 (ver AD-WEB-007)

Substituído: era "mover arquivo, manter motor" (AD-WEB-006, superseded). Agora é **reescrita**:
cada tela hoje renderizada por `sourceRuntime`+HTML externo vira componente `.tsx` nativo que
produz o MESMO DOM final (mesmas classes CSS de `styles/*.css` — esses CSS module/arquivo
permanecem, só passam a ser importados direto pelo `.tsx` em vez de injetados pelo runtime —
mesmo texto, mesma estrutura, mesmo comportamento).

### Setup TypeScript (uma vez, antes da primeira tela)

- `npm install -D typescript` (repo já tem `@types/react`/`@types/react-dom` em `package.json`,
  não usados até agora)
- `tsconfig.json` novo: `"jsx": "react-jsx"`, `"strict": true`, `"allowJs": true` (coexistência
  com `.jsx` existente), `"noEmit": true` (Vite/esbuild continua fazendo o transpile, TS só
  type-checa)
- `vite.config.js` não precisa mudar — `@vitejs/plugin-react` já suporta `.tsx` nativamente
- Gate novo: `npx tsc --noEmit` adicionado ao fluxo de verificação de cada task (além de
  `npm run build`/`npm run lint`)

### Método de pixel-parity (gate por tela, antes de marcar task pronta)

1. Antes de tocar na tela: screenshot Playwright da rota atual, 1440px e 390px
   (`.specs/features/stitch-migration/before-<tela>-<viewport>.png`)
2. Reescrever a tela como `.tsx`
3. Depois: mesmo screenshot (`after-<tela>-<viewport>.png`)
4. Diff visual — zero diferença fora de anti-aliasing/timing (loading states dinâmicos). Qualquer
   diff real = task não fecha até corrigir.
5. Console do browser sem novo erro/warning introduzido (`read_console_messages` via `run`/browser
   tool)

### Categorias de arquivo

1. **Componentes de tela reescritos** — um `.tsx` por tela, ao lado do domínio real em
   `src/pages/`/`src/components/` (mesmos destinos já mapeados abaixo, só que agora é arquivo novo
   escrito à mão, não arquivo movido)
2. **Motor genérico** — permanece em `src/stitch/` **só enquanto alguma tela ainda não converteu**;
   removido por completo na última task da Fase B (T18 no novo plano)

## Investigação de colisão — resultado (import real, não string match)

Confirmado via `grep "^import .*from"` (não contagem de string solta em i18n/rota):

| Arquivo legado `src/pages/...` | Tem importer de produção real? | Decisão |
| --- | --- | --- |
| `Login.jsx` | Sim — `stitch/PublicPages.jsx:5` (`import Login from '../pages/Login'`) | Mantém local e nome; é o componente de lógica real, `stitch/PublicPages` só o envolve visualmente |
| `Register.jsx` | Sim — `stitch/Registration.jsx:5` | Mantém |
| `ForgotPassword.jsx` | Sim — `stitch/PublicPages.jsx:6` | Mantém |
| `Dashboard/DashboardClient.jsx` | Sim — `stitch/OperationalPages.jsx:9` | Mantém |
| `Dashboard/Feedback.jsx` | Sim — `stitch/Messages.jsx:4` | Mantém |
| `Dashboard/Nutrition/DiaryDay.jsx` | Sim — `stitch/Nutrition.jsx:7` | Mantém |
| `Dashboard/Settings.jsx` | **Não** — `App.jsx`/`Sidebar.jsx` só referenciam `stitch/Settings.jsx` (mesmo nome local, arquivo diferente) | Candidato a remoção — task de confirmação final antes de apagar |
| `Dashboard/Messages.jsx` | **Não** — mesma situação (`App.jsx` usa `stitch/Messages.jsx`) | Candidato a remoção — confirmar antes |
| `Dashboard/ExploreGyms.jsx` | **Não** — `App.jsx` usa `stitch/Gyms.jsx` aliado a `ExploreGyms` | Candidato a remoção — confirmar antes |
| `Dashboard/DashboardProfessional.jsx` | **Não** — `Dashboard.jsx` usa `StitchProfessional as DashboardProfessional` de `stitch/OperationalPages.jsx` | Candidato a remoção — confirmar antes |
| `Dashboard/Onboarding.jsx` | **Não** em produção — só importado pelo próprio `Dashboard/__tests__/Onboarding.test.jsx`. Rota real usa `stitch/Onboarding.jsx` | Candidato a remoção (arquivo + teste correspondente) — confirmar antes |

**Regra pra task de confirmação**: antes de apagar qualquer um dos 5 candidatos acima, rodar
`grep -rn "<nome>" src` sem filtro e ler cada ocorrência manualmente (cobre `React.lazy`, string
dinâmica de rota, etc. que grep de `import` não pega) — só apagar se toda ocorrência for
autoimport do próprio arquivo/teste.

## Motor genérico — status durante a migração

Não migra pra lugar nenhum — fica em `src/stitch/{sourceRuntime.jsx,StitchTemplate.jsx,
manifest.json,linkBinding.js,copy.js,copy.tsv,templates/,styles/}` até a ÚLTIMA tela converter,
depois é apagado por inteiro (pasta some). Cada tela que já converteu para de importar dele; as
que faltam continuam usando normalmente enquanto isso — app fica sempre funcional durante a
migração incremental (mistura de telas `.tsx` novas e `stitch/*.jsx` antigas coexistindo).

## Mapeamento de destino — telas reescritas (.tsx)

Mesmos destinos de domínio já decididos (endereço final não mudou com AD-WEB-007 — só o CONTEÚDO
de cada arquivo vira reescrita nativa em vez de mover), agora com extensão `.tsx`:

| Origem (`src/stitch/`) | Destino (`.tsx` novo, escrito à mão) | Domínio |
| --- | --- | --- |
| `PublicPages.jsx` | `pages/PublicAuthShell.tsx` | Auth/público |
| `Registration.jsx` | `pages/RegistrationShell.tsx` | Auth/público |
| `AuthBrand.jsx` | `components/AuthBrand.tsx` | Auth/público (componente compartilhado) |
| `Exercises.jsx` | `pages/Dashboard/ExercisesShell.tsx` | Dashboard (evita colisão com `Dashboard/Exercises.jsx` legado) |
| `Gyms.jsx` | `pages/Dashboard/GymsExploreShell.tsx` | Dashboard |
| `Messages.jsx` | `pages/Dashboard/MessagesShell.tsx` | Dashboard |
| `Moderation.jsx` | `pages/Admin/ModerationShell.tsx` | Admin |
| `Nutrition.jsx` | `pages/Dashboard/Nutrition/NutritionDiaryShell.tsx` | Nutrition |
| `Onboarding.jsx` | `pages/Dashboard/OnboardingShell.tsx` | Dashboard |
| `OperationalPages.jsx` | `pages/Dashboard/OperationalDashboardsShell.tsx` | Dashboard |
| `Settings.jsx` | `pages/Dashboard/SettingsShell.tsx` | Dashboard |
| `Workspace.jsx` | `components/Workspace/WorkspaceNavigation.tsx` | Shell/layout |
| `AthleteScoreboard.jsx` | `components/gamification/AthleteScoreboard.tsx` | Gamification |
| `HistoryChart.jsx` | `components/charts/HistoryChart.tsx` | Compartilhado |
| `useHydration.js` | `hooks/useHydration.ts` | Compartilhado |
| `Builder.jsx` | **Não converte nesta feature** — permanece `src/stitch/Builder.jsx` (motor genérico não é removido enquanto ele existir) até `workout-editor` fechar Verifier; task final (bloqueada) reescreve pra `pages/Dashboard/PlanEditorShell.tsx` |

CSS de cada tela (`stitch/styles/<tela>.css`) migra junto, importado direto pelo `.tsx`
(`import './<tela>.css'`) no mesmo destino de pasta do componente — sem alterar uma regra sequer,
é o CSS que já produz a aparência atual.

**Nota sobre sufixo `Shell`**: mantido do plano anterior — identifica telas que eram "casca
visual" gerada externamente, agora nativas mas nome já em uso pelo app (evita colisão E documenta
a origem pra quem ler o código depois).

## Impacto em imports — arquivos a atualizar

Mesma lista de antes: `App.jsx`, `Layout.jsx`, `Dashboard.jsx`, `ClientDetail.jsx` (só o import,
`Builder` não converte ainda), e os 6 arquivos de teste — um import por task, no momento em que
aquela tela específica é reescrita (não em lote).

## Requirement Traceability (atualizado)

| Requirement ID | Cobertura |
| --- | --- |
| STMIG-01/02/03 | Setup TypeScript (tsconfig + devDependency) — uma vez, antes da primeira tela |
| STMIG-04 | Task de reescrever cada tela como `.tsx` nativo + gate de pixel-parity |
| STMIG-05 | Task de investigação/remoção dos 5 candidatos a arquivo morto |
| STMIG-06 | Coberto pelas tasks de reescrita (import atualizado junto) |
| STMIG-07 | Task de rodar suíte de teste + ajustar paths dos 6 arquivos de teste |
| STMIG-08/09 | Task final, bloqueada até `workout-editor` Verifier PASS |
| STMIG-10 (novo) | Pixel-parity: screenshot antes/depois por tela, zero diff — ver spec.md Assumptions |
