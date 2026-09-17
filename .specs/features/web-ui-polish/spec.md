# Web UI Polish — Specification

## Problem Statement

Uma rodada de revisão visual do frontend (React/Vite) encontrou uma série de defeitos de UI/UX que já afetam usuário real, em telas que já estão em produção — não é trabalho de uma feature nova, é dívida de qualidade acumulada em telas existentes. Os defeitos caem em duas categorias bem diferentes:

1. **Bugs de CSS/layout localizados** (texto encolhido em Privacy/Terms; tela de recuperação de senha sem logo consistente, com fundo em gradiente fora do design system, e botões com cores divergentes entre si; botões desalinhados no cardápio de nutrição). Isolados, pequenos, corrigíveis sem redesenho.
2. **Um problema de modelo de navegação** em Nutrição: a investigação de código confirmou que existem HOJE DUAS implementações de tela concorrentes para o mesmo domínio. `/dashboard/nutrition/diary` é servido por `NutritionDiaryShell.tsx` (shell novo, `WorkspaceShellPage`, Tailwind, header próprio) — que **não** renderiza o submenu de abas. Já `/dashboard/nutrition/foods`, `/dashboard/nutrition/meal-plans` e `/dashboard/nutrition/goal` são servidos por `FoodSearch.jsx`, `MealPlanManager.jsx` e `GoalOnboarding.jsx` — que **renderizam** `<NutritionNav />` (diário/alimentos/cardápio/meta) internamente. Como o botão "Registrar Refeição" de `NutritionDiaryShell.tsx` (`addFood`) navega para `/dashboard/nutrition/foods`, o usuário entra numa tela com abas e, ao clicar em "diário", é levado de volta para a tela sem abas — perdendo o menu que acabou de usar. Isso não é um bug de CSS, é uma inconsistência de arquitetura de tela (duas implementações de shell para a mesma área) que precisa de uma decisão de IA (informação/navegação), não de um ajuste pontual.
3. **Ausência de qualquer estado de carregamento** em toda a aplicação: conteúdo aparece de forma abrupta ("pop-in") assim que a chamada de API/lazy load termina, sem nenhum placeholder intermediário — problema transversal a todas as telas, não isolado a uma tela específica.

Esta spec cobre os três problemas como stories separadas, dimensionadas pelo escopo real de cada uma (ver Goals e a divisão P1/P2/P3 abaixo).

## Goals

- [ ] Páginas `/privacy` e `/terms` (`LegalDocument.jsx`) renderizam texto no tamanho e line-height normais da aplicação, em todos os breakpoints
- [ ] Tela de recuperação de senha (`/forgot-password`, servida por `RecoveryShell`/`RecoveryPublicMarkup.tsx`) tem logo consistente com as demais telas de autenticação, fundo sólido do design system (sem gradiente), e todos os botões da tela usando o mesmo par de tokens de cor
- [ ] Botões da tela de cardápio de nutrição (`MealPlanManager.jsx`) alinham ao mesmo grid/espaçamento usado no resto do app
- [ ] Nutrição passa a ter uma única seção coesa com submenu/tab bar persistente (diário/alimentos/cardápio/meta) visível nas 4 sub-telas, com transição suave entre elas — eliminando a existência de duas implementações de shell concorrentes para a mesma área
- [ ] Existe um primitivo de loading (componente `Skeleton` reutilizável + convenção documentada de onde/quando ele é aplicado) que qualquer rota com fetch de dados ou lazy-load de componente pode usar no lugar de um "pop-in" abrupto

## Out of Scope

| Item | Motivo |
|---|---|
| Retrofit de skeleton em CADA tela existente, uma por uma | O problema é transversal a literalmente todas as telas do app — enumerar tela por tela é trabalho de Tasks/Execute, não de Specify. Esta spec entrega o primitivo + a convenção + critério de aceite testável por rota; a lista de rotas migradas é tarefa de implementação |
| Redesenho visual completo da tela de recuperação de senha (novo layout, nova copy, nova ilustração) | Usuário pediu correção de 3 defeitos pontuais (logo, fundo, cor de botão) — não um redesign; a estrutura de `RecoveryPublicMarkup.tsx` permanece, só os 3 pontos citados mudam |
| Unificação de TODAS as duplicidades de shell do app (`*PublicMarkup.tsx` vs. páginas antigas em `src/pages/*.jsx`, ex. `Login.jsx` vs. `LoginPublicMarkup.tsx`) | O investigação encontrou esse padrão de duplicidade (shell novo Tailwind + página antiga) se repetindo em várias áreas (auth, nutrition), mas o usuário só reportou o sintoma em Nutrição (quebra de navegação visível). Resolver Nutrição agora; as demais duplicidades ficam como GAP a avaliar em spec própria se um sintoma equivalente for reportado |
| Skeleton com animação/shimmer sofisticada, biblioteca de terceiro para loading state | Reaproveita CSS/tokens já existentes no design system (cor de superfície + opacidade/pulse simples) — sem dependência nova |
| Correção de outros bugs visuais não listados nesta spec (ex. eventuais outras telas com desalinhamento não reportado) | Fora do escopo do pedido original — nenhuma investigação de UI completa e exaustiva de todas as telas foi pedida, só as reportadas |
| Mudança de fluxo/URL de "Registrar Refeição" (`addFood`) para abrir modal em vez de navegar de página | A correção da story de navegação (P1) resolve o problema mantendo navegação por página (com tab bar persistente) — trocar para modal seria uma mudança de UX maior, não pedida |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|---|---|---|---|
| Causa raiz do "gradiente" reportado na tela de recuperação de senha | O código atual (`src/pages/shell-assets/manifest.json`, chave `recovery`) usa o token `bg-surface` como `bodyClass`, enquanto `login`/`register`/`professional` usam `bg-brand-bg` — são tokens DIFERENTES do mesmo design system Tailwind (`shell-assets/styles/*.css`), não um gradiente CSS literal encontrado no código hoje. Tratamos isso como a mesma classe de bug relatada pelo usuário (fundo visualmente destoante das outras telas de auth) e a correção é trocar `recovery` para o MESMO token usado por `login` (`bg-brand-bg`), eliminando a divergência — se ao implementar for encontrado também um gradiente literal (inline style ou classe Tailwind `bg-gradient-to-*` não capturada nesta varredura), a mesma correção (token sólido único) resolve ambos os casos | Investigação de código (`manifest.json`, `RecoveryPublicMarkup.tsx`, `recovery.css`) não encontrou regra `linear-gradient`/`bg-gradient-*` ativa hoje, mas encontrou a divergência de token de fundo entre `recovery` e as demais telas de auth, que é a explicação mais provável do sintoma visual relatado | n — assumption, log apenas, revisitar no Design se o gradiente for confirmado como uma classe Tailwind aplicada só em runtime/estado específico não coberto pela leitura estática |
| Qual logo/asset usar na tela de recuperação de senha | `RecoveryPublicMarkup.tsx` hoje renderiza um `<img>` cru apontando pra uma URL externa (`lh3.googleusercontent.com/aida/...`, asset de ferramenta de design de IA, não um asset do próprio app) em vez do componente `<AuthBrand />` que `LoginPublicMarkup.tsx` já usa. A correção padrão é a tela de recuperação passar a usar o MESMO componente `AuthBrand` (`src/components/AuthBrand`) que a tela de login já usa, garantindo consistência automática (mesmo asset, mesmo tamanho, sem link externo) | `AuthBrand` já é o padrão estabelecido nas outras telas de auth (login) — reaproveitar em vez de trocar só a URL da imagem evita o mesmo tipo de inconsistência se o asset mudar de novo no futuro | y (decorre diretamente do padrão já usado em `LoginPublicMarkup.tsx`, é a leitura mais direta do pedido "logo igual às outras telas") |
| Quais botões da tela de recuperação de senha precisam ficar consistentes | `RecoveryPublicMarkup.tsx` hoje tem o botão principal "Enviar Link de Redefinição" usando tokens de cor de destaque (`bg-primary-container`/`hover:bg-primary`) e o botão secundário "Tentar outro e-mail" (exibido só no estado de sucesso) usando tokens neutros (`bg-surface-container`/`hover:bg-surface-container-high`). Tratamos isso como INTENCIONAL na distinção clássica ação primária vs. ação secundária (mesmo padrão usado em outras telas do app, ex. `su-btn-primary` vs. `su-btn-secondary` em `Button.jsx`/`NutritionNav.jsx`) — o requisito "todos os botões com a mesma cor" é interpretado como "todos os botões PRIMÁRIOS da tela usam o MESMO par de tokens entre si" (não que o botão secundário precise virar primário), já que uma tela com um único botão de cor diferenciando ação primária de secundária é o padrão consistente do resto do app, não um bug | y (correção de escopo: o pedido original citava "cores inconsistentes entre os botões da tela"; a leitura mais consistente com o padrão já estabelecido no app — que distingue primário/secundário por cor de propósito — é garantir que QUALQUER botão do mesmo papel na tela usa os MESMOS tokens, não forçar todos os botões da tela para uma cor única) |
| Definição de "grid/espaçamento usado no resto do app" para os botões do cardápio | Os tokens de espaçamento já existentes em `src/styles/design-system.css` (`--space-page`, `--space-section`, e os `gap`/`padding` já usados em componentes irmãos como `NutritionNav.jsx`, que usa classes `su-btn`) são a referência — os botões de `MealPlanManager.jsx` devem alinhar ao mesmo grid de 8px/tokens de espaçamento (não um novo grid inventado para esta tela) | Evita inventar um novo sistema de espaçamento só para uma tela — reaproveita o que já existe | n — assumption, log apenas, revisitar no Design com um diff visual antes/depois |
| Escopo do "shell novo" de Nutrição na correção da navegação | A correção NÃO exige eliminar `WorkspaceShellPage`/estilo visual novo de `NutritionDiaryShell.tsx` (a Diretoria pode preferir manter esse visual) — exige que TODAS as 4 sub-telas (diário/alimentos/cardápio/meta) fiquem sob o MESMO shell/wrapper, com a MESMA tab bar persistente renderizada uma única vez (não duplicada por página), e que a implementação escolhida (unificar as 4 no shell antigo com `NutritionNav`, OU migrar as 4 para o shell novo com uma tab bar equivalente) seja decidida no Design — o requisito de produto é comportamental (tabs sempre visíveis, transição suave), a escolha de QUAL shell vira o padrão é decisão técnica adiada | Fixar a solução técnica agora (qual dos dois shells "vence") seria decisão de Design, não de Specify — o que importa para o usuário final é o comportamento, não qual árvore de componentes React entrega | y (segue o mesmo princípio já usado no spec de referência de Nutrição — decisão técnica pura adiada para Design) |
| Definição de "transição suave" entre as abas do submenu de Nutrição | Troca de conteúdo entre diário/alimentos/cardápio/meta ocorre sem reload de página inteira (é troca de rota client-side via React Router, já é o caso hoje) e sem "flash" de conteúdo vazio/branco entre uma sub-tela e outra — a MESMA convenção de Skeleton desta spec (ver story de loading) é usada aqui: ao trocar de aba, se a sub-tela precisa buscar dado novo, mostra o skeleton daquela sub-tela em vez de tela em branco, e a tab bar em si nunca desaparece ou remonta durante a troca | Conecta a story de navegação com a story de loading (ambas do mesmo P1) em vez de definir "suave" como uma animação CSS nova e desconectada — é a interpretação mais barata e testável | n — assumption, log apenas |
| Onde aplicar o Skeleton primeiro (prova de conceito mínima) | O critério de aceite desta story é por CONTRATO ("toda rota que busca dado ou faz lazy-load usa a variante de Skeleton correspondente"), testável rota a rota, mas a ENTREGA desta spec inclui o componente `Skeleton` (`src/components/Skeleton.jsx` ou local equivalente) mais sua aplicação nas 4 sub-telas de Nutrição (que já estão sendo tocadas pela story de navegação) como prova de conceito — não em todas as telas do app (ver Out of Scope) | Sem uma prova de conceito mínima aplicada, a story de Skeleton vira só um componente nunca usado — aplicar nas telas já em edição (Nutrição) é o menor incremento que valida o padrão de ponta a ponta | y (decorre do princípio ponytail/YAGNI: entregar o primitivo + 1 aplicação real, não component-sem-uso) |

**Open questions:** nenhuma sem resposta — tudo acima está resolvido ou registrado como assumption, com plano de revisitar no Design onde marcado.

---

## User Stories

### P1: Navegação unificada de Nutrição — submenu persistente entre diário/alimentos/cardápio/meta ⭐

**User Story**: Como usuário, quero que o menu de diário/alimentos/cardápio/meta continue visível e utilizável independente de qual dessas 4 sub-telas eu estou vendo, pra não ficar preso numa tela sem saber como voltar pro que eu estava fazendo.

**Why P1**: É quebra de modelo de navegação, não um ajuste cosmético — o usuário fica genuinamente preso/confuso ao clicar em "diário" a partir do submenu e perder o próprio submenu. Duas implementações de shell concorrentes (`NutritionDiaryShell.tsx` vs. `FoodSearch.jsx`/`MealPlanManager.jsx`/`GoalOnboarding.jsx`) para a mesma área é uma inconsistência arquitetural que só cresce se não for corrigida agora.

**Acceptance Criteria**:

1. WHEN o usuário está em qualquer uma das 4 sub-telas de Nutrição (`/dashboard/nutrition/diary`, `/dashboard/nutrition/foods`, `/dashboard/nutrition/meal-plans`, `/dashboard/nutrition/goal`) THEN sistema SHALL renderizar o mesmo submenu/tab bar (diário/alimentos/cardápio/meta) sempre visível, com a aba correspondente à rota atual destacada como ativa
2. WHEN o usuário clica em "Registrar Refeição"/"Adicionar alimento" a partir do diário THEN sistema SHALL navegar para a tela de alimentos MANTENDO o submenu visível (nenhuma das 4 sub-telas pode renderizar sem o submenu)
3. WHEN o usuário clica em qualquer aba do submenu (diário/alimentos/cardápio/meta) a partir de QUALQUER uma das outras 3 THEN sistema SHALL trocar de sub-tela sem remontar ou fazer desaparecer o submenu (a tab bar nunca "pisca" ou some durante a transição)
4. WHEN a troca de sub-tela exige buscar dado novo (ex.: trocar de "alimentos" para "diário" busca o diário do dia) THEN sistema SHALL mostrar o Skeleton da sub-tela de destino em vez de tela em branco ou conteúdo da aba anterior persistindo incorretamente (ver story de Skeleton)
5. WHEN o usuário navega diretamente por URL para qualquer uma das 4 rotas (ex. digitando a URL, ou vindo de um link externo) THEN sistema SHALL renderizar a sub-tela correspondente já com o submenu visível desde o primeiro render (não só após uma navegação client-side subsequente)

**Independent Test**: A partir do diário, clicar em "Registrar Refeição" — chega em alimentos com o submenu visível; clicar em "diário" no submenu — volta ao diário AINDA com o submenu visível (regressão do bug original corrigida); repetir o ciclo diário → alimentos → cardápio → meta → diário sem o submenu desaparecer em nenhum passo.

---

### P1: Skeleton — primitivo de loading state reutilizável

**User Story**: Como usuário, quero ver um placeholder com o formato do conteúdo que está carregando, em vez de tela em branco seguida de um "pop-in" abrupto, pra ter uma percepção de carregamento previsível em qualquer tela do app.

**Why P1**: Ausência de qualquer loading state é um problema transversal a todas as telas — não é um detalhe cosmético isolado, é a percepção de qualidade/responsividade de toda a aplicação, e a story de navegação de Nutrição acima já depende dele (critério 4).

**Acceptance Criteria**:

1. WHEN uma rota busca dado assíncrono (chamada de API) e o dado ainda não chegou THEN a rota SHALL renderizar sua variante de `Skeleton` (placeholder com o formato/dimensões aproximadas do conteúdo final: linhas de texto, cards, tabelas) em vez de renderizar vazio ou com valores zerados/undefined visíveis
2. WHEN um componente é carregado via lazy-load (`React.lazy`/`import()` dinâmico) THEN o `Suspense` correspondente SHALL usar uma variante de `Skeleton` como `fallback`, nunca um spinner genérico sem forma nem tela em branco
3. WHEN o dado termina de carregar THEN sistema SHALL substituir o `Skeleton` pelo conteúdo real sem re-flow abrupto perceptível (o placeholder ocupa aproximadamente o mesmo espaço do conteúdo final)
4. WHEN a busca de dado falha (erro de rede/API) THEN sistema SHALL substituir o `Skeleton` por um estado de erro explícito (mensagem + ação de retry quando aplicável), nunca deixar o `Skeleton` "preso" indefinidamente sem timeout/fallback
5. WHEN as 4 sub-telas de Nutrição (prova de conceito desta story, ver Assumptions) buscam seus dados THEN cada uma SHALL usar sua própria variante de `Skeleton` (formato de lista/diário para o diário, formato de grade/cards para busca de alimentos, etc. — não um placeholder genérico único para todas)

**Independent Test**: Simular uma resposta de API lenta (throttle de rede) ao abrir o diário de nutrição — aparece um placeholder no formato de refeições/cards antes do conteúdo real, sem tela em branco; ao terminar de carregar, o conteúdo real substitui o placeholder sem salto de layout perceptível.

---

### P2: Correções de CSS/layout localizadas (Privacy/Terms, recuperação de senha, cardápio)

**User Story**: Como usuário, quero que as páginas de Privacidade/Termos, a tela de recuperação de senha, e a tela de cardápio de nutrição sigam a mesma tipografia, cores e alinhamento do resto do app, pra não ter a impressão de estar numa tela quebrada ou de um app diferente.

**Why P2**: São bugs visuais reais e visíveis, mas nenhum deles bloqueia uma tarefa funcional do usuário (texto pequeno ainda é legível clicando/dando zoom; a tela de recuperação de senha ainda envia o e-mail; os botões do cardápio ainda funcionam, só estão desalinhados) — diferente da story de navegação (P1), que efetivamente trava o usuário.

**Acceptance Criteria**:

1. WHEN o usuário abre `/privacy` ou `/terms` (`LegalDocument.jsx`) em qualquer breakpoint (mobile/tablet/desktop) THEN sistema SHALL renderizar título, kicker e parágrafos no mesmo tamanho de fonte e line-height já usados pelos tokens tipográficos do design system (`--font-display`, escala de `font-size`/`line-height` já aplicada em outras páginas de conteúdo do app), sem nenhum fator de escala/transform reduzindo o texto visualmente
2. WHEN o usuário abre a tela de recuperação de senha (`/forgot-password`) THEN sistema SHALL exibir o mesmo componente de logo (`AuthBrand`) já usado na tela de login, no lugar do `<img>` apontando para URL externa hoje presente em `RecoveryPublicMarkup.tsx`
3. WHEN o usuário abre a tela de recuperação de senha THEN sistema SHALL usar o mesmo token de fundo sólido (`bg-brand-bg`) já usado pelas demais telas de autenticação (login, registro), sem gradiente
4. WHEN o usuário vê qualquer botão PRIMÁRIO na tela de recuperação de senha THEN sistema SHALL usar o mesmo par de tokens de cor em TODOS os botões primários da tela (consistente entre si); o botão secundário ("Tentar outro e-mail") mantém a distinção intencional de papel secundário (ver Assumptions)
5. WHEN o usuário abre a tela de cardápio (`MealPlanManager.jsx`) THEN sistema SHALL exibir os botões da tela alinhados ao mesmo grid/espaçamento (tokens de `--space-*`, mesmo padding/gap) já usado em outras telas do app, sem desalinhamento vertical/horizontal perceptível entre botões do mesmo grupo

**Independent Test**: Abrir `/privacy` — texto no mesmo tamanho visual de qualquer outra página de conteúdo do app; abrir `/forgot-password` — logo idêntico ao de `/login`, fundo sólido igual ao de `/login`, botão principal e qualquer outro botão primário da tela com a mesma cor; abrir a tela de cardápio — botões alinhados em grade uniforme, sem nenhum deslocado visualmente dos demais.

---

## Edge Cases

- WHEN o usuário está no meio de preencher um formulário numa das 4 sub-telas de Nutrição (ex. digitando quantidade no diário) e clica numa aba do submenu THEN sistema SHALL navegar normalmente (mesmo comportamento de qualquer link de navegação do app hoje) — nenhuma confirmação de "descartar alterações" nova é introduzida por esta spec (fora de escopo, não reportado como problema)
- WHEN a chamada de API de uma sub-tela de Nutrição falha exatamente durante uma transição de aba (ver P1 Skeleton, critério 4) THEN sistema SHALL mostrar o estado de erro daquela sub-tela especificamente, sem afetar o submenu (que continua clicável) nem travar a navegação para as outras abas
- WHEN o navegador tem `prefers-reduced-motion: reduce` ativo THEN qualquer transição visual entre sub-telas de Nutrição ou entre Skeleton→conteúdo SHALL respeitar a preferência (sem animação forçada), consistente com o que `PublicShellHost.tsx` já faz para outras transições (`window.matchMedia('(prefers-reduced-motion: reduce)')`)
- WHEN o `Skeleton` é usado numa tela cujo conteúdo real varia MUITO de tamanho conforme o dado (ex. diário vazio vs. diário com 6 refeições) THEN sistema SHALL usar um formato de Skeleton aproximado/genérico pra aquele tipo de conteúdo (não precisa prever o tamanho exato) — pequeno re-flow residual ao trocar pro conteúdo real é aceitável, o requisito é evitar tela em branco, não eliminar 100% do reflow
- WHEN o usuário já tem os 4 dados de sub-tela de Nutrição em cache (ex. voltou para uma aba visitada recentemente na mesma sessão) THEN sistema SHALL exibir o conteúdo imediatamente sem mostrar Skeleton novamente (Skeleton é para espera real de dado, não uma animação obrigatória a cada troca de aba)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| POL-01 | P1: Navegação unificada de Nutrição — submenu persistente | Design | Pending |
| POL-02 | P1: Skeleton — primitivo de loading state reutilizável | Design | Pending |
| POL-03 | P2: Correções de CSS/layout localizadas (Privacy/Terms, recuperação de senha, cardápio) | Design | Pending |

**ID format:** `POL-NN`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 3 total, 0 mapped to tasks, 3 unmapped ⚠️ (Tasks phase ainda não rodou)

---

## Success Criteria

- [ ] Usuário navega entre diário/alimentos/cardápio/meta de Nutrição, em qualquer ordem, sem NUNCA perder o submenu de abas
- [ ] Qualquer rota do app que busca dado ou faz lazy-load mostra um Skeleton no formato do conteúdo final em vez de tela em branco ou pop-in abrupto (validado nas 4 sub-telas de Nutrição como prova de conceito)
- [ ] `/privacy` e `/terms` renderizam texto no tamanho tipográfico normal do design system, em qualquer breakpoint
- [ ] `/forgot-password` tem o mesmo logo (`AuthBrand`), o mesmo fundo sólido (`bg-brand-bg`) e a mesma cor de botão primário das demais telas de autenticação
- [ ] Botões da tela de cardápio de nutrição alinham ao mesmo grid/espaçamento do resto do app
