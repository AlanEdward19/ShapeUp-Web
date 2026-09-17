# Drawer de Detalhe do Exercício — Specification

## Problem Statement

O drawer que abre ao clicar num exercício na Biblioteca de Exercícios (`src/pages/Dashboard/markup/ExercisesPublicMarkup.tsx`, `<aside id="exerciseDrawer">`) foi construído durante a migração `stitch-migration` (AD-WEB-007) reaproveitando a estrutura de dados disponível, mas nunca foi comparado seção a seção contra a tela de referência (`Biblioteca de exercicios/code.html` + `screen.png`, pasta de Downloads). O usuário aponta isso explicitamente: falta vídeo, falta a lista de substituições como lista de verdade, "e outras coisas". Um diff estrutural completo (feito nesta spec, ver abaixo) confirma que o gap é maior do que os dois itens citados: o vídeo hoje é um link de texto (não um player embutido), a seção de substituições é um parágrafo estático (não uma lista clicável e orientada a dado), e várias seções menores (barras de ativação muscular, numeração das diretrizes técnicas, backdrop de fechamento, largura do painel, destaque visual do código) divergem da referência. Esta spec fecha esse gap 1:1, mantendo os tokens visuais atuais (`exercises.css`) e sem tocar no modelo de dados de equivalências (que é escopo de uma spec irmã, `exercise-variations`, em paralelo no repo `ShapeUpApi`).

## Diff Seção-a-Seção (Referência vs. Implementação Atual)

Comparação feita linha a linha entre `code.html` (linhas 462–630, `<aside id="exerciseDrawer">`) e `ExercisesPublicMarkup.tsx` (linhas 314–443, mesmo elemento):

| # | Seção | Referência (`code.html`) | Implementação atual | Gap |
|---|-------|---------------------------|----------------------|-----|
| 1 | Player de vídeo | Bloco `aspect-video` completo: poster/imagem, gradiente de vinheta, badge "Vídeo Biomecânico 4K" com dot pulsante, badge de ângulo/fps, botão de play central, overlay de ângulo articular, barra de progresso com marcadores de range, controles inferiores (replay, timestamp, slow-mo 0.5x, fullscreen) | `{active?.videoUrl && <a href=... target=_blank>Vídeo do exercício</a>}` — link de texto simples, só aparece se a URL casar `^https?://` | **Maior gap nomeado pelo usuário.** Nenhum player embutido; nenhum poster; nenhum controle |
| 2 | Bloco Séries/Repetições/Descanso | `border-y` com 3 colunas divididas por `divide-x`, sem fundo próprio, logo abaixo do vídeo | Envolvido numa caixa própria `border rounded bg-surface-muted` — mesmo conteúdo, moldura diferente | Divergência visual (moldura vs. hairline) |
| 3 | Ativação Primária & Sinergistas | Cada linha (agonista/sinergista) tem barra de progresso (`width: 95%` / `75%`) com cor terracotta/cinza + percentual numérico ao lado do rótulo | Só texto (`drawerAgonist`/`drawerSynergist`), sem barra, sem percentual visível na linha | Falta a representação visual de proporção |
| 4 | Diretrizes Técnicas de Execução | Sempre numerado (`01.`/`02.`/`03.`) com numeral estilizado em terracotta ao lado de cada parágrafo | Só numera quando `active.steps` existe (lista `<ol>` com contador CSS padrão, sem numeral estilizado); quando só há `descriptionPt`/`description`, cai num `<p>` solto sem numeração nenhuma | Fallback (caminho mais comum hoje, já que a API normalmente não popula `steps`) diverge visualmente da referência |
| 5 | Vídeo — ausente | — | — | (já coberto no item 1) |
| 6 | Ponto Crítico & Compensações | `p-3 rounded-md` | `p-2.5 rounded` | Diferença fina de espaçamento/raio (parity de classe) |
| 7 | Substituições Mecânicas Equivalentes | Cabeçalho com ícone `sync_alt` em terracotta + badge de contagem ("N opções"); lista de cards clicáveis, cada um com nome, chip de equipamento, percentual de similaridade (oliva), nota, chevron; clique carrega o exercício substituto no drawer | Um único `<p id="drawerSubs">` com texto estático fixo ("Consulte a biblioteca para selecionar uma substituição.") | **Segundo maior gap nomeado pelo usuário.** Não é uma lista, não é interativo, não usa dado nenhum |
| 8 | Seções extras sem equivalente na referência | — (não existem) | Parágrafo solto de `active.description`, seção "Músculos" com todos os músculos, e um dump de `muscleDetails` com percentuais soltos fora da seção de ativação | Conteúdo duplicado/deslocado — a referência já cobre isso dentro da seção de Ativação (item 3); manter as 3 seções extras junto com a nova versão da seção 3 geraria repetição de informação |
| 9 | Cabeçalho — código do exercício | `drawerCode` em `text-brand-terracotta font-semibold` (cor de destaque) | `drawerCode` em `text-text-muted` (sem destaque) | Peso visual do badge de código diverge |
| 10 | Fechamento do painel | `<div id="drawerBackdrop">` fixo, escurece o fundo (`bg-black/60 backdrop-blur-xs`) e fecha ao clicar fora, junto com o botão "×" | Só o botão "×" e a tecla Escape (já implementados) — nenhum backdrop, nenhum clique-fora-fecha, conteúdo por trás do painel não escurece | Falta o backdrop dimming + click-outside-to-close |
| 11 | Largura do painel | `w-[460px] max-w-full` fixo | `w-[390px] xl:w-[440px]` | Painel mais estreito que a referência em qualquer breakpoint |
| 12 | Rótulo do botão de ação primário | "Adicionar à Ficha" | "Adicionar à Ficha do Aluno" | Divergência de copy (ver Assumptions — decisão de manter o texto atual) |

## Goals

- [ ] Drawer exibe um player de vídeo de execução embutido (não mais um link), com poster, play/pause e branching correto entre vídeo hospedado (YouTube/Vimeo) e arquivo direto
- [ ] Seção "Substituições Mecânicas Equivalentes" vira uma lista real, clicável, orientada a dado — com estado vazio/pendente explícito enquanto o campo de equivalências não existe no modelo de dados (`exercise-variations`)
- [ ] Todas as demais divergências estruturais listadas no diff acima (barras de ativação, numeração de passos, backdrop, largura, destaque do código, seções duplicadas) são fechadas, atingindo paridade 1:1 de estrutura/conteúdo com a referência
- [ ] Nenhuma mudança de paleta/tema é introduzida — os tokens já usados hoje (`bg-brand-terracotta` `#e06c43`, `bg-brand-olive` `#7d9b68` etc., `exercises.css`) são reaproveitados como estão

## Out of Scope

Explicitamente excluído. Documentado para prevenir scope creep.

| Feature | Motivo |
|---|---|
| Modelo de dados / API de equivalências (`equivalents`, relação simétrica, quais exercícios podem ser equivalentes, botão de troca rápida em execução de treino) | Escopo da spec irmã `exercise-variations` (`ShapeUpApi/.specs/features/exercise-variations/`), em paralelo. Esta spec só define a APRESENTAÇÃO da lista no drawer (layout, estado vazio, interação de clique) — não o dado por trás. Na data de escrita desta spec, `exercise-variations/spec.md` ainda não existe no repo irmão; ver Assumptions/dependência registrada abaixo |
| Retema visual "Warm Oxide Athletic" (paleta, tokens de cor) do app inteiro | Escopo da spec paralela `design-system-retheme`. O drawer já usa exatamente essa paleta hoje (`exercises.css` confirma `#e06c43`/`#7d9b68` batendo com a referência) — nada de cor muda aqui, só estrutura/conteúdo |
| Alterações na tela de listagem da Biblioteca (busca, filtros, tabela, cards) | Fora do "bar" mencionado pelo usuário — só o drawer de detalhe é tocado |
| Nova biblioteca de player de vídeo (video.js, plyr, etc.) | O player customizado da referência (poster + play + scrub) é implementável com `<video>` nativo; embeds de YouTube/Vimeo usam `<iframe>` nativo — nenhuma dependência nova é necessária (ver Design) |
| Lookup/transcodificação de vídeo, upload de vídeo, geração de poster automática no backend | Fora do escopo de front-end desta spec; assume-se que `videoUrl` já é uma URL utilizável (existente no campo `ExerciseRecord.videoUrl`) |
| Escrita de `tasks.md` ou qualquer execução/implementação | Este ciclo cobre apenas Specify + Design, por pedido explícito do usuário — uma tentativa anterior já começou a implementar direto e foi interrompida por isso |

---

## Assumptions & Open Questions

Toda ambiguidade foi resolvida ou registrada aqui — nada fica silenciosamente pouco claro.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|---|---|---|---|
| Branching do embed de vídeo (YouTube/Vimeo vs. arquivo direto) | Detectar por padrão de URL (`youtube.com`/`youtu.be` → embed YouTube; `vimeo.com` → embed Vimeo; extensão `.mp4`/`.webm`/`.mov`/`.ogg` ou outro host → `<video>` nativo). Hospedados usam um "lite-embed": poster + botão de play que troca para `<iframe>` só no clique (evita carregar o iframe de terceiro antes do usuário pedir). Arquivo direto usa `<video>` nativo com os controles customizados da referência (play/pause, scrub, slow-mo, fullscreen), construídos com a API nativa do elemento, sem lib nova | Cobre os dois formatos mais prováveis de `videoUrl` sem inventar suporte a um terceiro não visto no código; lite-embed é o padrão de mercado pra não pagar o custo de um iframe de terceiro sem necessidade | n — assumption, log apenas |
| Fonte do poster/thumbnail do vídeo | `ExerciseRecord` não tem campo de poster hoje. Pra `<video>` nativo: usa o próprio primeiro frame do arquivo (atributo `preload="metadata"`, sem poster explícito, ou `#t=0.1` no fragmento da URL) — sem exigir campo novo no backend. Pra YouTube: usa a URL pública de thumbnail do provedor (`https://img.youtube.com/vi/{id}/hqdefault.jpg`). Pra Vimeo: sem thumbnail pública sem chamada de API — usa um bloco de placeholder com ícone (sem imagem), mesmo espírito visual do frame escurecido da referência | Evita exigir um campo novo (`videoPoster`) no modelo de dados só para esta feature de apresentação; graceful degradation quando o provedor não oferece thumbnail sem API key | n — assumption, log apenas |
| Estado do dado de equivalências até `exercise-variations` existir | `ExerciseRecord` ganha um campo opcional `equivalents?: ExerciseEquivalent[]` (contrato definido — mas não preenchido/consumido de verdade — por esta spec; o dono real do campo é `exercise-variations`). Quando ausente ou vazio, a lista mostra o mesmo estado vazio que a própria referência já implementa (`renderDrawerSubstitutions`: "Nenhuma substituição cadastrada para este exercício.") — nunca dado fabricado/mockado | Espelha o comportamento que a própria referência já prevê para o caso de zero substituições — não é invenção, é o branch que o HTML de referência já define | y (decorre diretamente do próprio comportamento já implementado na referência) |
| Clique num item da lista de equivalentes | Reabre o drawer para o exercício clicado (procura por `id` na lista já carregada em memória, `state.exercises`; mesmo padrão de `inspect`). Se o exercício não estiver na lista atualmente carregada/filtrada, mostra um toast "Exercício não encontrado na lista atual" e não navega — esta spec não adiciona uma nova chamada de fetch-por-id | "Browse related exercises" é o comportamento natural esperado (like da referência, `loadExerciseByCode`); reaproveita a lista já em memória em vez de abrir escopo de rede novo não pedido | n — decisão do agente, registrada para confirmação futura |
| Percentual nas barras de Ativação Primária & Sinergistas | Usa `active.muscleDetails[].activationPercent` quando existir (primeiro item mapeado como agonista, os demais agregados como sinergista); quando `muscleDetails` estiver ausente, mostra a barra sem percentual textual e com largura proporcional apenas se algum dado existir — nunca com um número inventado (ex.: os "95%"/"75%" fixos da referência não são copiados como constante) | A referência usa dado mockado fixo; esta implementação real deve usar o dado real disponível (`muscleDetails`) sem fabricar percentuais quando ele não existir | n — assumption, log apenas |
| Numeração das Diretrizes Técnicas quando `steps` não existe | Fallback (`descriptionPt`/`description`) passa a ser renderizado como um único passo "01." com o mesmo numeral estilizado da referência, em vez do `<p>` solto sem numeração de hoje | Mantém a paridade visual pedida (numeral sempre presente) sem inventar múltiplos passos que não existem no dado | n — assumption, log apenas |
| Seções hoje existentes sem equivalente na referência (parágrafo solto de `description`, seção "Músculos", dump de `muscleDetails`) | Removidas/consolidadas: `description` deixa de ter parágrafo próprio (o texto de execução já cobre isso via `steps`/fallback); a lista de todos os músculos e os percentuais crus de `muscleDetails` são absorvidos pela nova seção de Ativação com barras (assumption anterior) — evita repetir a mesma informação em 3 lugares diferentes do painel | Paridade 1:1 pedida pelo usuário significa também remover o que a referência não tem, não só adicionar o que falta | n — assumption, log apenas |
| Rótulo do botão de ação primário ("Adicionar à Ficha" vs. "Adicionar à Ficha do Aluno") | Mantém o texto atual do produto ("Adicionar à Ficha do Aluno") — não retrocede para o texto genérico da referência | É uma decisão de copy de produto (contexto "Coach Pro", ficha é sempre de um aluno), fora do escopo de paridade estrutural/visual desta spec | n — assumption, log apenas |
| Largura do painel | Adota os 460px fixos da referência (`w-[460px] max-w-full`), substituindo os 390/440px atuais | É uma dimensão estrutural de layout, parte explícita do pedido de paridade 1:1 | y (decorre diretamente do pedido "quero 1:1 com a tela de referência") |
| Backdrop de fechamento | Adiciona um elemento de backdrop fixo (dim + blur, mesmo tratamento visual do `drawerBackdrop` da referência) que fecha o drawer ao ser clicado; o fechamento por tecla Escape já existente é mantido sem alteração | Parte explícita da paridade estrutural/comportamental pedida | y (decorre do pedido de paridade 1:1) |
| Dependência cruzada com `exercise-variations` | Na data desta spec, `ShapeUpApi/.specs/features/exercise-variations/spec.md` ainda não existe (escrita em paralelo por outro agente). Esta spec registra a dependência explicitamente: o campo `equivalents` e seu formato final devem ser reconciliados com o que `exercise-variations` fechar; nada aqui bloqueia essa spec irmã, e nada nela deveria exigir redesenho desta apresentação (só o preenchimento do dado) | Evita duplicar/antecipar decisão de modelo de dados que pertence à outra spec, mantendo o desacoplamento apresentação/dado | n — dependência registrada, não uma confirmação de escopo |

**Open questions:** nenhuma sem resposta — tudo acima está resolvido ou registrado como assumption.

---

## User Stories

### P1: Player de vídeo de execução embutido ⭐ MVP

**User Story**: Como treinador consultando a Biblioteca de Exercícios, quero assistir ao vídeo de execução do exercício direto no painel de detalhe, sem precisar abrir uma aba nova, pra avaliar a técnica rapidamente durante a prescrição.

**Why P1**: É o maior gap citado explicitamente pelo usuário ("tá faltando vídeo") — sem isso, o painel não cumpre a promessa central da referência (guia biomecânico com vídeo 4K).

**Acceptance Criteria**:

1. WHEN o exercício ativo tem `videoUrl` preenchido e aponta para um arquivo de vídeo direto (`.mp4`/`.webm`/`.mov`/`.ogg`) THEN o drawer SHALL renderizar um player `<video>` nativo em proporção 16:9, com poster (primeiro frame), botão de play/pause central, barra de progresso e controles equivalentes aos da referência (replay, timestamp, fullscreen)
2. WHEN o exercício ativo tem `videoUrl` de YouTube ou Vimeo THEN o drawer SHALL renderizar um lite-embed (poster + botão de play) que troca para o `<iframe>` do provedor somente após o clique
3. WHEN o exercício ativo não tem `videoUrl` THEN o drawer SHALL exibir um estado vazio explícito no lugar do player (ex.: "Vídeo de execução não cadastrado"), nunca um player quebrado ou um espaço em branco sem explicação
4. WHEN o usuário troca de exercício ativo (clica noutra linha, ou navega via substituição) THEN o player SHALL resetar para o estado pausado/início do novo vídeo, nunca continuar tocando o vídeo do exercício anterior
5. WHEN a `videoUrl` não é uma URL válida (ex.: string malformada) THEN o drawer SHALL cair no mesmo estado vazio do item 3, sem lançar erro em tela

**Independent Test**: Selecionar um exercício com `videoUrl` de arquivo direto — player nativo toca dentro do painel; selecionar um com `videoUrl` do YouTube — poster aparece, clique carrega o iframe; selecionar um sem `videoUrl` — estado vazio aparece, sem erro no console.

---

### P1: Lista interativa de Substituições Mecânicas Equivalentes ⭐ MVP

**User Story**: Como treinador, quero ver e navegar por uma lista real de exercícios equivalentes ao que estou inspecionando, pra rapidamente considerar uma alternativa sem sair do painel.

**Why P1**: É o segundo gap citado explicitamente pelo usuário ("lista embaixo") — hoje é um parágrafo estático sem função nenhuma.

**Acceptance Criteria**:

1. WHEN o exercício ativo tem `equivalents` preenchido (contrato definido nesta spec, dado real vem de `exercise-variations`) THEN o drawer SHALL renderizar cada equivalente como um item de lista clicável (nome, equipamento, indicador de similaridade quando disponível, ícone de navegação), com um badge de contagem no cabeçalho da seção
2. WHEN o exercício ativo não tem `equivalents` (campo ausente ou array vazio) THEN o drawer SHALL exibir o estado vazio explícito ("Nenhuma substituição cadastrada para este exercício.") — nunca dado fabricado ou texto genérico de instrução como hoje
3. WHEN o usuário clica num item da lista de equivalentes THEN o drawer SHALL reabrir/atualizar o painel para exibir o exercício clicado, desde que ele exista na lista de exercícios já carregada em memória
4. WHEN o exercício clicado na lista de equivalentes não é encontrado na lista já carregada THEN sistema SHALL notificar via toast ("Exercício não encontrado na lista atual") e manter o painel no exercício original, sem navegação quebrada

**Independent Test**: Com um exercício mockado tendo 2+ equivalentes, abrir o drawer — lista aparece com nome/equipamento/similaridade de cada um; clicar num item existente na lista carregada — painel atualiza para esse exercício; simular equivalente inexistente na lista atual — toast de aviso aparece, painel não quebra.

---

### P1: Paridade estrutural e visual das demais seções do drawer ⭐ MVP

**User Story**: Como usuário da Biblioteca de Exercícios, quero que o painel de detalhe seja visualmente e estruturalmente idêntico à tela de referência aprovada, pra ter uma experiência coerente com o resto do redesenho já entregue (`stitch-migration`, AD-WEB-007).

**Why P1**: O pedido do usuário é explicitamente "1:1 com a tela de referência" — os itens 2, 3, 4, 6, 9, 10, 11, 12 do diff seção-a-seção (acima) não são cosméticos isolados, mas parte do mesmo pedido de paridade.

**Acceptance Criteria**:

1. WHEN o drawer está aberto THEN um backdrop fixo SHALL escurecer o restante da tela e SHALL fechar o drawer ao ser clicado, além do botão "×" e da tecla Escape já existentes
2. WHEN o drawer renderiza a seção "Ativação Primária & Sinergistas" THEN cada linha (agonista/sinergista) SHALL exibir uma barra de progresso proporcional ao percentual disponível em `muscleDetails`, seguindo a assumption de percentual acima
3. WHEN o drawer renderiza "Diretrizes Técnicas de Execução" a partir do fallback de descrição (sem `steps`) THEN o passo único SHALL exibir o numeral estilizado "01." (mesmo tratamento visual do caminho com `steps`), nunca um parágrafo sem numeração
4. WHEN o drawer é renderizado em qualquer breakpoint THEN a largura do painel SHALL ser `460px` (`max-w-full` em telas menores), substituindo os valores atuais de `390px`/`440px`
5. WHEN o cabeçalho do drawer é renderizado THEN o badge do código do exercício (`drawerCode`) SHALL usar a cor de destaque terracotta, igual à referência
6. WHEN o drawer renderiza o bloco Séries/Repetições/Descanso THEN ele SHALL usar bordas horizontais (`border-y`) sem moldura própria, igual à referência, substituindo a caixa atual
7. WHEN o drawer é renderizado THEN as seções sem equivalente na referência (parágrafo solto de `description`, seção "Músculos" avulsa, dump cru de `muscleDetails`) SHALL deixar de existir como blocos separados — a informação relevante SHALL estar contida nas seções de Ativação e Diretrizes Técnicas, sem duplicação

**Independent Test**: Abrir o drawer, clicar fora dele (na área escurecida) — fecha; abrir um exercício com `muscleDetails` — barras de ativação aparecem proporcionais; abrir um exercício sem `steps` — passo único aparece numerado "01."; medir a largura do painel renderizado — 460px.

---

## Edge Cases

- WHEN o usuário abre o drawer em uma tela estreita (mobile/tablet) THEN o painel SHALL respeitar `max-w-full`, nunca ultrapassar a viewport horizontalmente
- WHEN o usuário pressiona Escape com o drawer aberto THEN o comportamento de fechamento já existente SHALL continuar funcionando sem regressão, coexistindo com o novo backdrop
- WHEN `videoUrl` aponta para um provedor não reconhecido (nem arquivo direto, nem YouTube/Vimeo) THEN o drawer SHALL tratar como o estado vazio (item 3 da primeira story), nunca tentar renderizar um iframe genérico não testado
- WHEN o usuário navega entre exercícios rapidamente (clique em vários itens da lista em sequência) THEN o player de vídeo e a lista de equivalentes SHALL sempre refletir o exercício ativo mais recente, sem estado do exercício anterior vazando (vídeo tocando, lista antiga)
- WHEN `equivalents` existe mas com um item cujo `id` não corresponde a nenhum exercício carregado THEN o clique nesse item específico SHALL cair no branch de "não encontrado" (ver story de Substituições, AC 4), sem afetar os demais itens da mesma lista

---

## Requirement Traceability

Cada requisito recebe um ID único para rastreamento entre design, tasks e validação.

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| EDD-01 | P1: Player de vídeo embutido (arquivo direto) | Design | Pending |
| EDD-02 | P1: Player de vídeo embutido (lite-embed YouTube/Vimeo) | Design | Pending |
| EDD-03 | P1: Estado vazio do vídeo (ausente/inválido) | Design | Pending |
| EDD-04 | P1: Reset de estado do player ao trocar de exercício | Design | Pending |
| EDD-05 | P1: Lista de substituições — item estruturado + contagem | Design | Pending |
| EDD-06 | P1: Estado vazio das substituições (sem dado fabricado) | Design | Pending |
| EDD-07 | P1: Navegação ao clicar num equivalente | Design | Pending |
| EDD-08 | P1: Backdrop dimming + click-outside-to-close | Design | Pending |
| EDD-09 | P1: Barras de ativação primária & sinergista | Design | Pending |
| EDD-10 | P1: Numeração consistente das Diretrizes Técnicas | Design | Pending |
| EDD-11 | P1: Largura do painel (460px) + destaque visual do código | Design | Pending |
| EDD-12 | P1: Remoção de seções duplicadas sem equivalente na referência | Design | Pending |

**ID format:** `EDD-NN`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 12 total, 0 mapped to tasks, 12 unmapped ⚠️ (fase Tasks não roda neste ciclo — só Specify + Design, por pedido explícito do usuário)

---

## Success Criteria

Como saberemos que a feature é bem-sucedida:

- [ ] Um exercício com `videoUrl` de arquivo direto reproduz o vídeo embutido no painel, sem abrir aba nova
- [ ] Um exercício com `videoUrl` de YouTube/Vimeo mostra poster + carrega o embed só no clique
- [ ] A seção de substituições exibe uma lista real e clicável quando há dado, e um estado vazio explícito quando não há (nunca texto fabricado)
- [ ] O painel mede 460px de largura, tem backdrop dimming com clique-fora-fecha, barras de ativação proporcionais e numeração consistente nas Diretrizes Técnicas
- [ ] Nenhuma seção duplicada (Músculos avulso, dump de `muscleDetails`, parágrafo solto de `description`) permanece no painel
- [ ] Diff visual seção-a-seção contra `code.html`/`screen.png` não aponta mais nenhuma divergência estrutural não registrada como assumption
