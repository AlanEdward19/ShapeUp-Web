# Retema do design system (Warm Oxide Athletic, app todo) — Specification

## Problem Statement

O app hoje tem DUAS linguagens visuais crescendo em paralelo, sem que nenhuma decisão formal tenha
unificado as duas. `src/styles/design-system.css` é o token set nomeado pela AD-WEB-005 como
"jornal de academia (giz/ferro/ferrugem)" — mas uma inspeção linha a linha nesta sessão mostra que
o modo escuro desse arquivo **já não é** giz/ferro/ferrugem puro: o commit `c58c4d3` (2026-09-12,
"aplica telas Stitch") já sobrescreveu `--primary` pra `#e06c43`, `--warning` pra `#d4a359` e
`--accent` pra `#9bb888` — os mesmos 3 hex (ou família muito próxima) do primary/tertiary/secondary
de "Warm Oxide Athletic". O modo claro (`:root`), por outro lado, ficou pra trás: usa OKLCH com o
mesmo matiz de família (hue ~38, zona terracota/rust), mas nunca recebeu os tokens de superfície,
elevação e contêiner que o modo escuro ganhou. Paralelamente, as páginas profissionais/coach geradas
pelo pipeline de migração Stitch (`src/pages/shell-assets/styles/*.css`, ex. `exercises.css`,
`professional.css`, `register.css`) já usam Warm Oxide Athletic **de forma correta e completa**, mas
como CSS utilitário Tailwind gerado por página, com os mesmos hex **hardcoded** (`rgb(224 108 67)`
repetido em cada arquivo), nunca como custom property. Ou seja: o app não está migrando DE uma
paleta PRA outra — está com um pé em cada uma, com o modo escuro do shell já convergido em espírito,
o modo claro do shell defasado, e o motor de página que gera as telas profissionais como a fonte de
verdade de fato mais completa e correta hoje.

O usuário revisou duas telas de referência (`Criação de treinos/DESIGN.md` e
`Biblioteca de exercicios/DESIGN.md`, conteúdo idêntico) já na paleta Warm Oxide Athletic e decidiu
explicitamente: **"Eu gostaria de usar a paleta da referência (no app todo)"** — adotar esse token
set como o ÚNICO design system do produto, substituindo o que resta de giz/ferro/ferrugem em
qualquer tela (Dashboard, Nutrição, auth, settings), não só nas páginas que o pipeline Stitch já
tocou.

## Goals

- [ ] `src/styles/design-system.css` passa a expor o token set completo de Warm Oxide Athletic (cores
      de superfície/contêiner/elevação, tipografia Barlow Condensed + Source Sans 3, raio, espaçamento)
      como custom properties reutilizáveis — não só os 3 tokens que o commit Stitch já alinhou
- [ ] Modo claro ganha um complemento coerente da mesma família de matiz (não fica "dark-only"),
      validado por contraste, sem regressão do toggle de tema hoje funcional
- [ ] Toda tela que hoje consome `design-system.css` (Dashboard, Nutrição, auth, settings, etc.)
      reflete a nova paleta sem depender de hex hardcoded fora do token set
- [ ] Páginas profissionais/coach (`shell-assets/styles/*.css`) continuam sendo a referência de
      valores corretos — o token set global é extraído/alinhado A PARTIR delas, sem duplicar decisão
      de cor em dois lugares divergentes
- [ ] Nenhuma tela quebra o toggle claro/escuro existente como resultado desta retema (regressão zero
      no que já funciona)

## Out of Scope

| Feature | Reason |
|---|---|
| Execução da migração visual tela a tela (aplicar os novos tokens em cada página, trocar classe por classe) | Isso é Tasks/Execute, uma chamada futura depois que este par Specify+Design for aprovado — aqui só se define O QUÊ e COMO, não se toca CSS de tela |
| Mascote / popup de XP e qualquer artwork de gamificação | Feature não relacionada, mencionada explicitamente pelo usuário como fora de escopo |
| Mudança de lógica ou comportamento de qualquer componente | Esta é uma retema de estilo/token — nenhuma prop, handler, rota ou fluxo muda |
| Construir uma suíte de regressão visual automatizada nova (Playwright + pixelmatch como dependência) | Investigado nesta sessão: `scripts/check-frontend-gates.mjs` faz só checagem de texto/string, não há Playwright no `package.json`; o precedente de `stitch-migration` (`AD-WEB-007`) foi screenshot manual assistido por browser tool, não um script versionado. Adotar esse MESMO método (ver Design) evita introduzir dependência nova só para esta feature |
| Regenerar/reescrever o pipeline que gera `shell-assets/styles/*.css` a partir do Stitch | Fora do domínio desta spec — o pipeline gera CSS Tailwind por página e já está correto; a retema consome os MESMOS valores como fonte, não reinventa o gerador |
| Migrar as 14 telas já convertidas de hex pra token na Fase 1 pra um token set diferente do que existe hoje só por estética | Já foram migradas pra usar `var(--...)` — a retema aqui é trocar o VALOR por trás dos tokens existentes, não reabrir a arquitetura de token-vs-hex já fechada |
| Autofonte self-hosted / troca de estratégia de carregamento de fonte | Investigado: Barlow Condensed + Source Sans 3 **já são** carregadas hoje via `@import` do Google Fonts CDN dentro do próprio `design-system.css` (linha 2) — a paleta de referência pede exatamente essas 2 famílias, então a estratégia atual já resolve isso sem mudança nenhuma (ver Assumptions) |

---

## Assumptions & Open Questions

Toda ambiguidade é resolvida ou registrada aqui — nada fica sem tratamento.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|---|---|---|---|
| Modo claro sem especificação na referência (DESIGN.md só dá valores de modo escuro) | Derivar um complemento de modo claro algoritmicamente: mesma família de matiz (terracota/rust para primary, oliva para secondary, âmbar para tertiary), invertendo a escala de luminosidade (superfícies claras/cremosas, texto escuro), validado por checagem de contraste (WCAG AA, 4.5:1 texto normal / 3:1 texto grande) antes de fechar o Design. NÃO se entrega "dark-only" — o app já tem toggle funcional e isso seria regressão | O `:root` atual já usa OKLCH num hue de família compatível (~38, zona terracota) — a derivação é continuação de uma direção que já existe, não invenção do zero; abandonar o modo claro quebraria uma capability já entregue (AD-WEB, toggle claro/escuro) | n — assumption, log apenas; valores finais de contraste ficam para a fase de Design |
| Estratégia de migração: big-bang vs. incremental por tela | **Híbrida, com viés incremental**: os TOKENS (custom properties em `design-system.css`) são trocados em um commit único e atômico — é um arquivo pequeno, a troca em si é barata e não há razão pra fatiar a definição do token. Mas a VERIFICAÇÃO por tela é incremental, tela por tela, com gate de screenshot antes/depois (mesmo método do `stitch-migration`), porque a auditoria completa de "hex hardcoded fora dos 14 arquivos já corrigidos na Fase 1" foi deixada como gap não-bloqueante — ninguém garante hoje que toda tela consome só tokens. Big-bang no arquivo de tokens SEM o gate por tela arrisca telas com hex hardcoded ficarem visualmente inconsistentes (cor antiga sobrevivendo ao lado da nova) sem ninguém perceber até o usuário reportar | Reaproveita o precedente já validado no repo (`stitch-migration`/AD-WEB-007: gate de pixel-parity por tela) em vez de inventar processo novo; e responde diretamente ao gap conhecido (auditoria de hex fora dos 14 arquivos nunca fechada) sem tentar resolvê-lo por decreto — o gate por tela DETECTA os casos que a auditoria nunca cobriu | y — decisão de escopo tomada nesta sessão, não fica pra o usuário confirmar depois |
| Fonte de verdade dos valores de token: `shell-assets/styles/*.css` (Tailwind gerado) vs. reescrever do zero a partir do `DESIGN.md` | `shell-assets/styles/*.css` é a fonte — esses arquivos já têm os hex corretos e testados visualmente (pixel-parity verificado no `stitch-migration`, AD-WEB-007). O token set novo em `design-system.css` é uma CONSOLIDAÇÃO desses valores como custom properties, não uma reescrita paralela a partir do YAML do `DESIGN.md` (que serve só de checagem cruzada/nomenclatura). Duplicar a decisão de cor em dois lugares (gerar de novo a partir do YAML E already ter os arquivos Tailwind corretos) é o risco de divergência que a spec quer evitar | O ladder de menor esforço/menor risco: os valores já existem, já foram verificados visualmente uma vez — reusar é mais barato e mais seguro que redigitar; o pipeline Stitch continua gerando essas páginas do jeito que gera hoje, sem mudança | y (recomendação desta sessão) |
| Duplicação entre pipeline gerado (per-page Tailwind) e token set global (CSS custom properties) coexistindo | Aceitar a duplicação por ora (dois sistemas simultâneos: Tailwind utilitário gerado por página + tokens CSS globais), documentando como Risco/débito com fast-follow — NÃO reescrever o pipeline nesta feature (fora de escopo, ver Out of Scope). A consolidação de fato (páginas profissionais passarem a consumir os MESMOS custom properties do resto do app) é candidata a uma feature própria futura, uma vez que o token set global esteja estável e provado nas telas não-profissionais primeiro | Ladder: já funciona, já foi verificado — mexer no gerador Stitch por cima de uma retema é escopo maior que o pedido ("usar a paleta no app todo" é sobre AS OUTRAS telas alcançarem o que as profissionais já têm, não sobre unificar os dois mecanismos de entrega de CSS) | y (recomendação desta sessão) |
| Fonte de carregamento (Barlow Condensed / Source Sans 3) | Mantém a estratégia já em uso: `@import url(fonts.googleapis.com/...)` dentro de `design-system.css` (linha 2) — já carrega exatamente as 2 famílias pedidas pela referência. Nenhuma mudança de mecanismo necessária | Grep confirmou: não existe `@font-face` self-hosted em nenhum lugar do repo hoje — a única estratégia de fonte já em uso é CDN do Google Fonts via `@import`. Seguir o padrão já estabelecido é mais barato que introduzir self-host sem precedente | y (fato observado, não preferência) |
| Ferramenta de verificação visual por tela | Reusar o MESMO método ad hoc do `stitch-migration` (screenshot via browser tool nos viewports 1440px/390px, antes/depois, comparação visual assistida) — NÃO introduzir Playwright/pixelmatch como dependência nova de `package.json`. Adicionalmente, estender `scripts/check-frontend-gates.mjs` com 1 checagem de higiene de token: nenhum hex literal das cores antigas de giz/ferro/ferrugem remanescente fora de `shell-assets/` (grep-based, mesmo estilo das checagens já existentes no arquivo) | Investigado: não há Playwright no `package.json`, `check-frontend-gates.mjs` só faz asserções de string/existência de arquivo — não existe suíte de diff de pixel automatizada para reaproveitar de fato, só o HÁBITO/processo manual do `stitch-migration`. Inventar uma suíte nova é escopo maior que o pedido; o gate de string é barato e já é o padrão do repo pra "não regredir isto de novo" | y (decisão desta sessão, baseada em investigação de ferramentas real) |
| Ordem de rollout entre telas (qual tela primeiro) | Fica para a fase de Tasks (fora do escopo deste par Specify+Design) — aqui só se define o MÉTODO do gate, não a ordem de execução tela a tela | N/A — decisão de sequenciamento de tarefas, não uma zona cinzenta de produto | y |
| Onde documentar contraste/paridade WCAG do modo claro derivado | Registrado na fase de Design (seção própria com os pares fg/bg calculados e a razão de contraste) — não é uma decisão de produto em aberto, é um cálculo técnico que pertence ao Design | N/A — decisão técnica pura | y |

**Open questions:** nenhuma sem resposta — tudo acima está resolvido ou registrado como assumption.

---

## User Stories

### P1: Token set global consolidado (Warm Oxide Athletic, modo escuro) ⭐ MVP

**User Story**: Como usuário do app (qualquer tela), quero que o modo escuro use consistentemente a
paleta Warm Oxide Athletic completa (superfícies, contêineres, elevação — não só primary/secondary/
tertiary), pra que o app pareça um produto único, não dois estilos colados.

**Why P1**: É a base de tudo — sem o token set completo, nenhuma tela consegue migrar de verdade
(ficaria só com os 3 tokens que o commit Stitch já mexeu, sem superfícies/contêineres coerentes).

**Acceptance Criteria**:

1. WHEN `design-system.css` é atualizado THEN `[data-theme='dark']` SHALL expor, como custom
   properties, o equivalente a TODA a família de cor do YAML de referência (surface, surface-dim,
   surface-bright, surface-container-lowest/low/high/highest, on-surface, on-surface-variant,
   outline/outline-variant, primary/on-primary/primary-container/on-primary-container, secondary/
   tertiary equivalentes, error/on-error/error-container) — não apenas `--primary`/`--accent`/
   `--warning` como hoje
2. WHEN qualquer tela hoje usa um token existente (`--bg-main`, `--bg-card`, `--text-main`, etc.)
   THEN o valor por trás do token SHALL mudar pra família Warm Oxide Athletic, mas o NOME do token
   SHALL ser preservado sempre que possível (evita quebrar consumidores existentes só por causa do
   rename)
3. WHEN um token novo é necessário (ex. níveis de superfície-contêiner que não existem hoje) THEN
   SHALL ser adicionado com nome descritivo consistente com a convenção já em uso (`--bg-*`,
   `--text-*`, prefixo existente), documentado no Design
4. WHEN o `check-frontend-gates.mjs` roda após a troca THEN a checagem de "design-system ainda usa
   Inter"/"design-system tem oklch" (já existente) SHALL continuar passando, e uma nova checagem de
   higiene (nenhum hex de giz/ferro/ferrugem remanescente) SHALL ser adicionada e passar

**Independent Test**: Abrir qualquer tela em modo escuro depois da troca — cor de fundo, texto,
bordas e cor primária batem visualmente com as páginas profissionais que já usam Warm Oxide
Athletic hoje.

---

### P1: Modo claro derivado e validado por contraste ⭐ MVP

**User Story**: Como usuário que prefere modo claro, quero continuar tendo um modo claro que
funciona (legível, sem regressão), agora na mesma família visual Warm Oxide Athletic do modo
escuro.

**Why P1**: A referência só especifica modo escuro — sem essa story o modo claro fica quebrado ou
esquecido, o que é regressão explícita (o app já tem essa capability hoje).

**Acceptance Criteria**:

1. WHEN o modo claro é definido THEN `:root` SHALL usar a MESMA família de matiz de primary/
   secondary/tertiary do modo escuro (terracota/oliva/âmbar), com luminosidade invertida (superfícies
   claras, texto escuro) — nunca uma paleta de matiz diferente
2. WHEN qualquer par texto/fundo padrão do modo claro é medido THEN a razão de contraste SHALL ser
   ≥ 4.5:1 para texto normal e ≥ 3:1 para texto grande/ícone (WCAG AA), documentado no Design com os
   pares calculados
3. WHEN o usuário alterna o toggle de tema já existente THEN a troca SHALL continuar funcionando
   exatamente como hoje (nenhuma prop/handler de tema muda) — só o valor por trás dos tokens muda

**Independent Test**: Alternar claro/escuro em qualquer tela pós-retema — ambos os modos são
legíveis, nenhum texto fica sobre fundo da mesma luminosidade, toggle não quebra.

---

### P1: Método de verificação por tela (reuso do precedente `stitch-migration`) ⭐ MVP

**User Story**: Como dev que vai executar a retema tela por tela (Tasks/Execute, fora desta spec),
quero um método de verificação já definido, pra não precisar reinventar processo quando chegar lá.

**Why P1**: Sem método definido agora, a fase de Tasks teria que descobrir isso na hora — indo
contra o histórico do repo, que já tem um precedente direto (`stitch-migration`) pronto pra
reaproveitar.

**Acceptance Criteria**:

1. WHEN uma tela é migrada (Tasks/Execute futuro) THEN o gate de verificação SHALL ser: screenshot
   antes/depois via browser tool, viewports 1440px e 390px (mesmo padrão de `stitch-migration`),
   mais checagem de console sem novo erro/warning
2. WHEN `scripts/check-frontend-gates.mjs` roda THEN SHALL incluir uma checagem nova de "nenhum hex
   das cores antigas de giz/ferro/ferrugem sobrevive fora de `shell-assets/`" (grep-based, mesmo
   estilo das checagens de string já existentes no arquivo)
3. WHEN nenhuma dependência nova (Playwright, pixelmatch) é adicionada a `package.json` THEN esta
   story SHALL ser considerada satisfeita — o método reusa só o que já existe (browser tool +
   grep/string check)

**Independent Test**: Rodar `npm run gate` depois da troca de tokens — passa, incluindo a nova
checagem de hex remanescente.

---

### P2: Consolidação de fonte de verdade — páginas profissionais como referência

**User Story**: Como dev mantendo o design system, quero que os valores do token set global sejam
extraídos DAS páginas profissionais já corretas (`shell-assets/styles/*.css`), não redigitados do
zero a partir do YAML de referência, pra evitar duas fontes de verdade divergentes.

**Why P2**: Não bloqueia o P1 (o token set pode ser escrito comparando os dois), mas evita retrabalho
futuro se alguém tentasse "resolver direto do YAML" sem checar contra o que já está provado
visualmente.

**Acceptance Criteria**:

1. WHEN um valor de cor é definido no token set global THEN SHALL ser conferido contra o hex
   correspondente já usado em `shell-assets/styles/*.css` (quando existir), preferindo esse valor
   sobre uma nova leitura do YAML em caso de divergência
2. WHEN não existe equivalente em `shell-assets/` para um token (ex. níveis de superfície-contêiner
   mais granulares) THEN o YAML de referência SHALL ser a fonte

**Independent Test**: Comparar lado a lado 3 tokens de cor do novo `design-system.css` com os hex
correspondentes em `exercises.css`/`professional.css` — batem exatamente.

---

## Edge Cases

- WHEN uma tela consome um hex hardcoded (não um token) que por acaso já é idêntico ao valor antigo
  de giz/ferro/ferrugem THEN o gate de higiene de hex (P1, story 3) SHALL detectar e listar essa
  tela como pendente de migração pra token, mesmo que o CSS "funcione" visualmente por coincidência
- WHEN o toggle de tema é acionado numa tela que ainda não migrou pra token (usa hex direto) THEN o
  comportamento SHALL ser o mesmo de hoje (a tela simplesmente não muda de cor com o tema, que já é
  o comportamento atual pra hex hardcoded — não é regressão nova introduzida por esta feature)
- WHEN o modo claro derivado apresenta um par fg/bg abaixo do contraste mínimo em algum componente
  específico (não coberto pelos tokens base) THEN o Design SHALL registrar esse componente como
  exceção com um ajuste pontual documentado, nunca abaixar o critério de contraste geral pra
  acomodar um caso

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| DSRT-01 | P1: Token set global consolidado (modo escuro) | Tasks | Implementing |
| DSRT-02 | P1: Modo claro derivado e validado por contraste | Tasks | Implementing |
| DSRT-03 | P1: Método de verificação por tela | Tasks | Implementing |
| DSRT-04 | P2: Consolidação de fonte de verdade (shell-assets) | Tasks | Implementing |

**ID format:** `DSRT-NN`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 4 total, 4 mapped to tasks (T1: DSRT-01/02/04; T2–T8: DSRT-03; T3/T5 also DSRT-01; T4/T7 also DSRT-02)

---

## Success Criteria

- [ ] `design-system.css` expõe o token set completo de Warm Oxide Athletic em modo escuro
      (superfícies/contêineres/elevação), não só os 3 tokens já parcialmente alinhados
- [ ] Modo claro existe, é derivado da mesma família de matiz, e passa em contraste WCAG AA nos
      pares fg/bg documentados
- [ ] Toggle claro/escuro continua funcionando sem regressão
- [ ] `npm run gate` passa incluindo a nova checagem de higiene de hex remanescente
- [ ] Nenhuma dependência nova adicionada a `package.json` só para viabilizar esta feature
- [ ] Método de verificação por tela documentado e pronto para a fase de Tasks/Execute (fora desta
      spec)
