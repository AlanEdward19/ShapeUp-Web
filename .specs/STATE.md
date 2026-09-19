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
- **Decision**: Redesign Impeccable do app autenticado em 6 fatias paralelas (shell, auth, dashboards, treino, nutrição/admin, clientes/academia/settings). ~~Tokens e direção visual permanecem jornal de academia (giz/ferro/ferrugem)~~ — **SUPERSEDED por AD-WEB-008** (usuário pediu explicitamente a paleta Warm Oxide Athletic no app todo).
- **Date**: 2026-09-10
- **Status**: superseded by AD-WEB-008

### AD-WEB-008
- **Decision**: Direção visual do app todo (não só páginas profissionais) passa a ser **Warm Oxide Athletic** (primary terracota `#e06c43`, secondary oliva `#7d9b68`, tertiary âmbar `#d4a359`, Barlow Condensed + Source Sans 3), substituindo o restante do token set "giz/ferro/ferrugem" de `AD-WEB-005`. `src/styles/design-system.css` (modo claro E escuro) é a única fonte de tokens; `src/pages/shell-assets/styles/*.css` (páginas profissionais, já corretas) serve de fonte de VALOR pros tokens, sem reescrever o pipeline que as gera. Modo claro é derivado algoritmicamente (mesma família de matiz, luminosidade invertida, validado por contraste WCAG AA) — não fica dark-only. Ver `.specs/features/design-system-retheme/spec.md` + `design.md`.
- **Reason**: usuário revisou 2 telas de referência (`DESIGN.md`, Warm Oxide Athletic) e decidiu explicitamente "usar a paleta da referência no app todo" — supersede o trecho de `AD-WEB-005` que fixava giz/ferro/ferrugem como direção permanente.
- **Trade-off**: modo escuro já estava parcialmente convergido (commit `c58c4d3` já usa os 3 hex de brand); modo claro e as telas fora do pipeline Stitch ainda não — rollout é feito com o token file trocado em bloco (barato, atômico) mas verificação por tela incremental com gate (reusa precedente de `stitch-migration`), pra não deixar hex hardcoded remanescente passar despercebido. Duplicação entre `shell-assets` (Tailwind gerado) e `design-system.css` (tokens) é aceita por ora, com consolidação futura como fast-follow não-bloqueante.
- **Scope**: `src/styles/design-system.css` (tokens de cor/tipografia/raio/espaçamento, ambos os temas); `scripts/check-frontend-gates.mjs` (1 checagem nova de higiene de hex); feature `design-system-retheme`. Execução tela a tela fica para uma fase de Tasks futura, ainda não iniciada.
- **Date**: 2026-09-16
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

- **Feature**: exercise-library-detail-polish
- **Phase / Task**: Closed — Verified (PASS, second verifier pass)
- **Completed**: T1–T8 + test-strengthening; API seed synergists in ShapeUpV2
- **In-progress**: none
- **Next step**: none for this feature
- **Blockers**: none
- **Uncommitted files**: none for ELP (validation.md to be committed)
- **Branch**: develop
- **Validation report**: `.specs/features/exercise-library-detail-polish/validation.md`
- **Cross-repo**: ShapeUpV2 `ebff5a9`, `02c5684`, `a62e1c5`

- **Feature**: intermittent-fasting-timer (Web slice)
- **Phase / Task**: Closed — Verified (PASS, second verifier pass)
- **Completed**: T1–T8 + F1–F5 test evidence; fasting-scoped 68/68
- **In-progress**: none
- **Next step**: none for this feature (no push; browser UAT needs a logged-in session)
- **Blockers**: none
- **Validation report**: `.specs/features/intermittent-fasting-timer/validation.md`
- **Cross-repo**: ShapeUpV2 fasting API already Verified PASS
- **Precision**: IFTW-07 diary persist date is the viewed day, not calendar-today (L-021)

---

- **Feature (anterior)**: web-frontend-redesign
- **Completed**: U1 design+landing, U2 SEO/AEO/legal, U3 cookies/HTTPS/forms/404/gates
- **Gates**: test 82/82, lint 0 errors, `npm run gate` PASS, build PASS
- **Next**: commit só com aprovação do usuário; apontar domínio real em `VITE_PUBLIC_SITE_URL`
- **Commit**: not authorized
