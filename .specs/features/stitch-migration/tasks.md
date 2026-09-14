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
- [ ] **T8** — `AthleteScoreboard.jsx` (+ `.test.jsx`) → `components/gamification/
  AthleteScoreboard.tsx`; ajustar teste.
- [x] **T9** — `Exercises.jsx` (+ `.test.jsx`) → `pages/Dashboard/ExercisesShell.tsx`; atualizar
  `App.jsx` + teste.
- [x] **T10** — `Gyms.jsx` → `pages/Dashboard/GymsExploreShell.tsx`; atualizar `App.jsx`.
- [ ] **T11** — `Messages.jsx` → `pages/Dashboard/MessagesShell.tsx`; atualizar `App.jsx`.
- [ ] **T12** — `Moderation.jsx` (+ `.test.jsx`) → `pages/Admin/ModerationShell.tsx`; atualizar
  `App.jsx` + teste.
- [ ] **T13** — `Nutrition.jsx` → `pages/Dashboard/Nutrition/NutritionDiaryShell.tsx`; atualizar
  `App.jsx`.
- [ ] **T14** — `Onboarding.jsx` (+ `.test.jsx`) → `pages/Dashboard/OnboardingShell.tsx`;
  atualizar `App.jsx` + teste.
- [ ] **T15** — `OperationalPages.jsx` → `pages/Dashboard/OperationalDashboardsShell.tsx`;
  atualizar `Dashboard.jsx`.
- [ ] **T16** — `Settings.jsx` → `pages/Dashboard/SettingsShell.tsx`; atualizar `App.jsx`.

Gate por task (T2-T16): pixel-parity (before/after screenshot, 1440+390px, zero diff) +
`npm run build && npm run lint && npx tsc --noEmit`. Gate ao fim da Fase B: `npm test` (6 arquivos
de teste, já ajustados incrementalmente).

### Fase C — Remoção de arquivo morto (mesma investigação já fechada em design.md)

- [ ] **T17** — Pra cada um dos 5 candidatos (`Dashboard/Settings.jsx`, `Dashboard/Messages.jsx`,
  `Dashboard/ExploreGyms.jsx`, `Dashboard/DashboardProfessional.jsx`, `Dashboard/Onboarding.jsx` +
  teste): `grep -rn "<Nome>" src` sem filtro, ler cada ocorrência, confirmar zero-import real antes
  de apagar. Documentar evidência na task.

### Fase D — Motor genérico + Fase E — bloqueada

- [ ] **T18** — Confirmar que nenhuma tela ainda importa `sourceRuntime`/`StitchTemplate`/
  `manifest.json`/`linkBinding`/`copy` (só `Builder.jsx` deveria restar, e ele é bloqueado — ver
  T19). Se limpo, remover `templates/*.html`, `styles/*.css` órfãos, `manifest.json`, `copy.tsv`
  (manter só o que `Builder.jsx` ainda usa). Gate: `npm run build && npm run lint`.
- [ ] **T19** — **BLOQUEADA até `workout-editor` (Fase 2, `ShapeUpApi/.specs/features/
  workout-editor/`) fechar Verifier PASS.** Reescrever `stitch/Builder.jsx` como
  `pages/Dashboard/PlanEditorShell.tsx` (mesmo método: pixel-parity antes/depois). Atualizar
  `ClientDetail.jsx`. Remover `src/stitch/` por completo (pasta vazia).

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
