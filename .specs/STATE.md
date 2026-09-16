# STATE — ShapeUp-Web

## Decisions

### AD-WEB-001
- **Decision**: CTA primário da home aponta para `/register`. Login é link de texto.
- **Date**: 2026-09-10
- **Status**: active

### AD-WEB-002
- **Decision**: Firebase Web API key é identificador público. Gate barra private keys.
- **Date**: 2026-09-10
- **Status**: active

### AD-WEB-003
- **Decision**: Canonical/sitemap usam `VITE_PUBLIC_SITE_URL` com fallback `https://shapeup.app`.
- **Date**: 2026-09-10
- **Status**: active

### AD-WEB-004
- **Decision**: Analytics Firebase só após `shapeup_cookie_consent=analytics`.
- **Date**: 2026-09-10
- **Status**: active

### AD-WEB-005
- **Decision**: Redesign Impeccable do app autenticado em 6 fatias paralelas (shell, auth, dashboards, treino, nutrição/admin, clientes/academia/settings). Tokens e direção visual permanecem jornal de academia (giz/ferro/ferrugem).
- **Date**: 2026-09-10
- **Status**: active

### AD-WEB-006
- **Decision**: ~~`src/stitch/` só reorganiza pastas, mantém o motor de template~~ — **SUPERSEDED por AD-WEB-007** (usuário mudou de decisão na mesma sessão).
- **Date**: 2026-09-14
- **Status**: superseded by AD-WEB-007

### AD-WEB-007
- **Decision**: `src/stitch/` (motor de template + telas geradas via redesign ad-hoc com Google Stitch, fora do escopo formal de `web-frontend-redesign`) é **reescrito** como componentes TypeScript/React nativos (`.tsx`), tela por tela, cada um com gate de pixel-parity (screenshot Playwright antes/depois, zero diff visual/comportamental tolerado). Motor genérico (`sourceRuntime`/`StitchTemplate`/`manifest`/`linkBinding`/`copy`/HTML de `templates/`) é removido ao final, quando a última tela converter. TypeScript é adotado como capability nova do repo (`tsconfig.json` + `typescript` devDependency, `strict: true`), coexistindo com `.jsx` existente — não é conversão do repo inteiro. Ver `.specs/features/stitch-migration/` (spec/design/tasks revisados 2026-09-14).
- **Reason**: usuário revisou a decisão original (reorganizar-só) e pediu explicitamente reescrita nativa com "OBRIGATORIEDADE DE NAO MUDAR O DESIGN E APARENCIA DE NADA" — motor genérico de HTML externo fica pra trás, mas o resultado visual tem que ser idêntico.
- **Trade-off**: escopo/esforço bem maior que a reorganização original (15 telas reescritas, não só movidas) — mitigado por conversão incremental tela-a-tela com gate próprio, nunca em lote. `stitch/Builder.jsx` continua fora desta migração até `workout-editor` fechar Verifier (mesma dependência de antes, só muda O QUE acontece com ele quando chegar a vez — reescreve em vez de mover). 5 arquivos legados órfãos em `src/pages/Dashboard/` identificados na investigação original continuam candidatos a remoção, mesma regra de confirmação task-by-task.
- **Scope**: Toda a estrutura de `src/` do ShapeUp-Web; feature `stitch-migration`; adoção de TypeScript no repo; coordenação com `workout-editor` (repo `ShapeUpApi`).
- **Date**: 2026-09-14
- **Status**: active

## Handoff

- **Feature**: stitch-migration
- **Phase / Task**: Execute T1–T18 done; **T19 UNBLOCKED** (workout-editor Verifier PASS 2026-09-15)
- **Completed**: TypeScript setup; native shells (T2–T16 + native rewrite of remaining sourceRuntime shells); T17 dead files; T18 partial engine cleanup; gates 4/4 at `bbe3859` (121 tests); report `.specs/features/stitch-migration/validation.md`
- **In-progress**: nenhum
- **Next step**: **T19** — rewrite `src/stitch/Builder.jsx` → `PlanEditorShell.tsx` (or agreed path) + remove remaining `src/stitch/` engine assets; then re-run stitch-migration Verifier for feature close
- **Blockers**: none — `ShapeUpApi/.specs/features/workout-editor/validation.md` = **PASS** (Api `280cd31`, Web PlanEditor default `stitch=false` at `95fb58c`); zero ranked WOED blockers
- **Cross-repo**: keep Builder path coordinated until T19 commit lands

---

- **Feature (anterior)**: web-frontend-redesign
- **Completed**: U1 design+landing, U2 SEO/AEO/legal, U3 cookies/HTTPS/forms/404/gates
- **Gates**: test 82/82, lint 0 errors, `npm run gate` PASS, build PASS
- **Next**: commit só com aprovação do usuário; apontar domínio real em `VITE_PUBLIC_SITE_URL`
- **Commit**: not authorized
