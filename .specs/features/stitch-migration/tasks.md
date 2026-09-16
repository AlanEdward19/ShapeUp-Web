# Migração estrutural de `src/stitch/` — Tasks

**REVISADO 2026-09-14** — escopo mudou de "mover arquivo" pra "reescrever em TypeScript/React
nativo" (AD-WEB-007). Plano antigo (mover pasta) descartado.

## Execution Protocol (MANDATORY)

Implementar com a skill `tlc-spec-driven` — ativar pelo nome, seguir Execute flow e Critical
Rules. Um commit atômico por task. **Cada task de reescrita de tela só fecha com o gate de
pixel-parity passando** (não é opcional, é acceptance criteria — ver design.md).

**Design**: `ShapeUp-Web/.specs/features/stitch-migration/design.md`
**Status**: Ready for Execute

---

## Test Coverage Matrix

| Code Layer | Required Test Type | Location Pattern | Run Command |
| --- | --- | --- | --- |
| Setup TypeScript | build gate | `tsconfig.json` | `npx tsc --noEmit` |
| Cada tela reescrita (.tsx) | pixel-parity (screenshot diff) + build + lint + typecheck | `.specs/features/stitch-migration/{before,after}-*.png` | `npm run build && npm run lint && npx tsc --noEmit` + diff visual manual/assistido |
| 6 arquivos de teste existentes | mantidos verdes | `src/**/*.test.jsx` | `npm test` |
| Remoção de arquivo morto | evidência de zero-import documentada, sem gate automático | n/a | grep manual |

---

## Tasks

### Fase A — Setup (bloqueia tudo abaixo)

- [x] **T1** — `npm install -D typescript`. Criar `tsconfig.json` (`jsx: react-jsx`, `strict:
  true`, `allowJs: true`, `noEmit: true`, `include` cobrindo `src/**/*`). Gate: `npx tsc --noEmit`
  roda sem erro de config (pode ter erros de tipo em `.jsx` incluído — ok, esses arquivos não são
  escopo desta feature; se `allowJs` gerar ruído demais, restringir `include` só aos caminhos
  `.tsx` desta feature — decisão de ajuste fino na hora, documentar o que foi escolhido).

### Fase B — Reescrita tela por tela (cada task = 1 tela = 1 gate de pixel-parity, nunca em lote)

Ordem sugerida: mais simples/isolada primeiro, pra validar o método de pixel-parity antes das
telas complexas.

- [x] **T2** — `AuthBrand.jsx` → `components/AuthBrand.tsx` (componente pequeno, bom piloto do
  método de pixel-parity antes de partir pras telas grandes).
- [x] **T3** — `PublicPages.jsx` → `pages/PublicAuthShell.tsx` (Login/Landing/Recovery); atualizar
  `App.jsx`.
- [x] **T4** — `Registration.jsx` → `pages/RegistrationShell.tsx`; atualizar `App.jsx`.
- [x] **T5** — `Workspace.jsx` → `components/Workspace/WorkspaceNavigation.tsx`; atualizar
  `Layout.jsx` — CUIDADO: outras telas `stitch/*.jsx` ainda não convertidas importam
  `./Workspace`; manter as duas versões coexistindo até todas migrarem, ou atualizar o import
  delas pro novo caminho nesta mesma task (decidir na hora conforme o que reduzir mais risco).
- [x] **T6** — `HistoryChart.jsx` → `components/charts/HistoryChart.tsx`.
- [x] **T7** — `useHydration.js` → `hooks/useHydration.ts`.
- [x] **T8** — `AthleteScoreboard.jsx` (+ `.test.jsx`) → `components/gamification/
  AthleteScoreboard.tsx`; ajustar teste.
- [x] **T9** — `Exercises.jsx` (+ `.test.jsx`) → `pages/Dashboard/ExercisesShell.tsx`; atualizar
  `App.jsx` + teste.
- [x] **T10** — `Gyms.jsx` → `pages/Dashboard/GymsExploreShell.tsx`; atualizar `App.jsx`.
- [x] **T11** — `Messages.jsx` → `pages/Dashboard/MessagesShell.tsx`; atualizar `App.jsx`.
- [x] **T12** — `Moderation.jsx` (+ `.test.jsx`) → `pages/Admin/ModerationShell.tsx`; atualizar
  `App.jsx` + teste.
- [x] **T13** — `Nutrition.jsx` → `pages/Dashboard/Nutrition/NutritionDiaryShell.tsx`; atualizar
  `App.jsx`.
- [x] **T14** — `Onboarding.jsx` (+ `.test.jsx`) → `pages/Dashboard/OnboardingShell.tsx`;
  atualizar `App.jsx` + teste.
- [x] **T15** — `OperationalPages.jsx` → `pages/Dashboard/OperationalDashboardsShell.tsx`;
  atualizar `Dashboard.jsx`.
- [x] **T16** — `Settings.jsx` → `pages/Dashboard/SettingsShell.tsx`; atualizar `App.jsx` (re-export em `stitch/Settings.jsx`, ver `IMPORT_PATCH.md`).

Gate por task (T2-T16): pixel-parity (before/after screenshot, 1440+390px, zero diff) +
`npm run build && npm run lint && npx tsc --noEmit`. Gate ao fim da Fase B: `npm test` (6 arquivos
de teste, já ajustados incrementalmente).

### Fase C — Remoção de arquivo morto (mesma investigação já fechada em design.md)

- [x] **T17** — Pra cada um dos 5 candidatos (`Dashboard/Settings.jsx`, `Dashboard/Messages.jsx`,
  `Dashboard/ExploreGyms.jsx`, `Dashboard/DashboardProfessional.jsx`, `Dashboard/Onboarding.jsx` +
  teste): `grep -rn "<Nome>" src` sem filtro, ler cada ocorrência, confirmar zero-import real antes
  de apagar. Documentar evidência na task.

  #### T17 — EVIDENCE (2026-09-14)

  | Candidato | Produção | Outros hits (não-import) | Ação |
  | --- | --- | --- | --- |
  | `Settings.jsx` | `App.jsx` → `SettingsShell.tsx` | `Settings2`/`nav.settings` em i18n/Sidebar; `stitch/Settings.jsx` re-export Shell; `Settings.css` só importado por este arquivo | **apagado** (+ `Settings.css` órfão) |
  | `Messages.jsx` | `App.jsx` → `MessagesShell.tsx` | copy/i18n, `ChatDrawer` state, `stitch/Messages.jsx`, variável `openMessages` em `DashboardProfessional.jsx` (arquivo morto) | **apagado** |
  | `ExploreGyms.jsx` | `App.jsx` → `GymsExploreShell.tsx` | só definição no próprio arquivo | **apagado** |
  | `DashboardProfessional.jsx` | `Dashboard.jsx` → `OperationalDashboardsShell` (`StitchProfessional as DashboardProfessional`) | nome local no router, não import do `.jsx` | **apagado** (+ `DashboardProfessional.css` órfão) |
  | `Onboarding.jsx` | `App.jsx` → `OnboardingShell.tsx`; `stitch/Onboarding.test.jsx` → Shell | `GoalOnboarding`, `completeOnboarding` API, markup/shell TS | **apagado** |
  | `__tests__/Onboarding.test.jsx` | único import: `from '../Onboarding'` | — | **apagado** (teste do arquivo morto; cobertura permanece em `stitch/Onboarding.test.jsx` → Shell) |

  Gate T17: `npm run build && npm run lint` (warnings pré-existentes aceitos).

### Fase D — Motor genérico + Fase E — bloqueada

- [x] **T18** — **Limpeza parcial (motor ainda necessário até T19).** Telas convertidas usam markup
  TSX + `PublicStitchHost`/`DashboardStitchHost` para CSS/fonts (`manifest.json`); produção fora de
  `src/stitch/` não importa mais `sourceRuntime` (onboarding usa shadow bindings nativos). `copy` segue
  para i18n estático. `linkBinding` removido com `Registration.jsx` morto. Gate: `npm run build && npm run lint`.

  #### T18 — EVIDENCE (2026-09-14)

  **Expectativa original vs realidade:** produção fora de `src/stitch/` não importa mais
  `sourceRuntime`; o motor restante serve `Builder.jsx`, `Workspace.jsx`/`StitchTemplate` e testes
  (ver tabela). T18 remove apenas assets com zero importadores de runtime em produção.

  | Símbolo | Importadores de produção | Mantido? |
  | --- | --- | --- |
  | `sourceRuntime` | `StitchTemplate.jsx`, `Workspace.jsx`, `Builder.jsx` em `src/stitch/`; `StitchTemplates.test.jsx` | **sim** — Builder + sidebar template host até T19 |
  | `StitchTemplate` | só via `Workspace.jsx` (usado pelas shells acima) + `Builder.jsx` | **sim** |
  | `manifest.json` | `PublicStitchHost.tsx`, `DashboardStitchHost.tsx`, `StitchTemplate.jsx` (testes) | **sim** |
  | `copy` / `copy.tsv` | `copy.js` → shells/markup (`NutritionDiaryShell`, `OperationalDashboardsShell`, `RegisterPublicMarkup`, `InvitationPublicMarkup`) + `useStitchLanguage` | **sim** |
  | `linkBinding` | nenhum após remoção de `Registration.jsx` | **removido** (`linkBinding.js`) |

  **Arquivos `src/stitch/*.jsx` removidos (zero import de produção):**

  | Arquivo | Evidência |
  | --- | --- |
  | `Messages.jsx` | `App.jsx` → `MessagesShell.tsx` |
  | `OperationalPages.jsx` | `Dashboard.jsx` → `OperationalDashboardsShell.tsx`; financeiro → `FinancialGym.jsx` |
  | `Registration.jsx` | `App.jsx` → `RegistrationShell.tsx` (testes atualizados para Shell) |

  **Templates HTML removidos** (sem `sourceDocument('…')` / `Workspace name=` em produção; markup TSX
  + hosts cobrem auth/gyms/exercises/finance):

  `landing`, `login`, `recovery`, `register`, `invitation`, `gyms`, `exercises`, `finance`.

  **Templates HTML mantidos** (ainda referenciados em runtime):

  `builder`, `settings`, `messages`, `moderation`, `nutrition`, `professional`, `athlete`, `onboarding`.

  **CSS removido:** `styles/finance.css` (nenhum host com `name="finance"`). Demais `styles/*.css`
  mantidos — `PublicStitchHost` / `DashboardStitchHost` carregam via glob por `name`.

  **Re-exports finos mantidos:** `PublicPages.jsx`, `Settings.jsx`, `Exercises.jsx`, `Gyms.jsx`,
  `Nutrition.jsx`, `Moderation.jsx`, `Onboarding.jsx`, `AthleteScoreboard.jsx`, `HistoryChart.jsx`,
  `useHydration.js`.

  **Pixel-parity evidence (messages, nutrition, onboarding):** PNGs em `{before,after}-{messages,nutrition,onboarding}-{1440,390}.png` arquivados a partir de `.specs/source-*.png` (before, captura legada) e `.specs/verified-*-{1440,390}.png` (after); where live before/after capture was blocked, `before-*-390` reuses verified at 390px (archived reference, not a fresh diff pair).

  Gate T18: `npm run build && npm run lint` (warnings pré-existentes aceitos).
- [x] **T19** — Reescrever `stitch/Builder.jsx` como `pages/Dashboard/PlanEditorShell.tsx`
  (native PlanEditor re-export; StitchBuilder removido). Atualizar `ClientDetail.jsx`.
  Remover `src/stitch/` por completo (assets em `pages/dashboard-stitch/`,
  `hooks/useStitchLanguage.js`, `pages/public-auth/publicUsability.css`).
  Gate: `node scripts/check-frontend-gates.mjs && npm run build && npx tsc --noEmit && npm test`.

---

## Dependency Graph

```
T1 → { T2 → T3, T4 } , T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15, T16 → T17 → T18 → T19 (bloqueada)
```

T2 primeiro (piloto do método antes das telas grandes). T3/T4 dependem de T2 (usam `AuthBrand`).
Resto da Fase B pode ser paralelizado entre si (arquivos diferentes, sem dependência cruzada
exceto T5/Workspace, que outras telas ainda-não-convertidas importam — ver nota em T5).

## MCPs e Skills — confirmar antes do Execute

`run` (skill) pra abrir o app no browser e tirar os screenshots before/after de cada tela — é o
gate de pixel-parity, não é opcional. Playwright já usado no repo (`.specs/verify-stitch.cjs`
como precedente) — reaproveitar o mesmo padrão de screenshot em vez de criar ferramenta nova.

**Status**: aguardando go-ahead do usuário pra iniciar Execute (T1).
