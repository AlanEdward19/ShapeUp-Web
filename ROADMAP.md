# ROADMAP — ShapeUp Platform (Frontend / ShapeUp-Web)

> Fonte das fases 0–3.5: `PRD — ShapeUp Platform.md` v1.1 (06/09/2026), seção 102 e correlatas. Essas fases seguem concluídas; o texto delas permanece como histórico.
> Sequência depois da 3.5: decisão de produto de 29 set 2026, [ShapeUp — jornada, lançamento e preço](https://linear.app/arqontech/document/shapeup-jornada-lancamento-e-preco-c64703e5f9ba). Sem data-alvo. Fases não são paralelas: cada uma assume a anterior pronta.
> Este é o roadmap do **frontend** (`ShapeUp-Web`). O roadmap do backend vive em `ShapeUpApi/ROADMAP.md`. Fases são as mesmas nos dois arquivos (sequência de produto é única); os itens de cada fase é que foram filtrados por repo. Itens marcados **[Cross-repo]** aparecem nos dois arquivos porque exigem trabalho dos dois lados — a spec correspondente (quando existe) indica onde cada metade vive, e via de regra o backend é feito primeiro (a UI consome o contrato já pronto).

**North Star:** WAPU (Weekly Active Progress Users) — usuário conta quando realiza ação relevante de progresso na semana. Gente que registra progresso de verdade na semana, não gente que só abre o app.
**Para quem é agora:** quem já paga academia ou Wellhub/TotalPass no Brasil, treina força 3 a 5 vezes por semana e hoje anota no papel, no Hevy, no Strong ou no WhatsApp com o treinador.
**Princípio:** hábito do aluno → catálogo que muda o pedido de amanhã → progresso semanal visível → lançamento grátis do aluno → monetização leve → clubes (placar do log) → profissional (teto de alunos ativos) → academia → chat e presença ao vivo → IA → ecossistema.

---

## Fase 0 — Current State Assessment (gate obrigatório) — concluída

Nenhuma expansão funcional começa sem mapear o estado real da plataforma.

- Feature inventory por status: ✅ funcional / 🟡 parcial / 🔵 frontend-mock / 🟣 backend-sem-front / 🔴 quebrado / ⚫ legado / ⚪ ausente **[Cross-repo]**
- Auditoria frontend (componentes, design system, responsividade, estado, cache, a11y, offline, performance, testes, código morto)
- Auditoria de arquitetura (o que escala, o que não escala, o que custa caro, o que está acoplado demais) **[Cross-repo]**
- Dívida técnica, custos atuais, segurança **[Cross-repo]**

## Fase 1 — Foundation — concluída

Base de identidade e autorização que toda feature seguinte assume.

- Limpeza da stack (`ShapeUp-Web`) — **DONE** para o que foi encontrado: `npm audit fix` zerou as 17 vulnerabilidades (2 low/4 moderate/9 high/2 critical, todas em deps transitivas, sem bump breaking); ESLint foi de 68 erros + 15 warnings para 0 erros + 6 warnings (as 6 restantes são efeitos de tour rodando só-no-mount, omissão intencional de deps pra não reabrir o tour a cada render — deixadas de propósito). 7 bugs reais de `no-undef` corrigidos (imports faltando, variável errada em notificação, hook morto referenciando função nunca importada, função inexistente chamada). Falta: nada identificado — auditoria de deps desatualizadas (majors) não foi feita, só o audit de segurança
- Observabilidade day one **[Cross-repo]** (SLIs: availability, p95/p99, error rate, payment success, sync success, queue delay, crash-free sessions) — **fundação pronta, testada ponta a ponta**: backend (`ShapeUpApi`) exporta traces/metrics/logs via OpenTelemetry (OTLP/HTTP) pro Seq self-hosted (`docker-compose.yml`, sem conta SaaS), `/health/live` + `/health/ready` cobrem availability, p95/p99 e error rate vêm do histograma padrão do ASP.NET Core instrumentation. Frontend (`ShapeUp-Web`) tem `ErrorBoundary` + `telemetry.js` (crash-free sessions, local) e `mutationQueue.js` emite eventos de sync success/queue delay. Payment success: sem feature de billing ainda (Fase 8), nada pra instrumentar
- Analytics, CI/CD (lint→typecheck→unit→integration→build→security scan→preview→E2E→prod) **[Cross-repo]** — pipeline do frontend própria; backend tem a dela em `ShapeUpApi/ROADMAP.md`
- Design system, i18n (pt-BR/en/es), light/dark — **DONE** para os 3 idiomas: `design-system.css` (tokens + light/dark via `[data-theme]`) e `LanguageContext` (`t()`, EN+PT-BR+ES, 865/865 chaves com paridade verificada). `LandingPage.jsx` migrada pra `t()`, 14 arquivos CSS tiveram hex hardcoded trocado por tokens, seletor de idioma em Settings agora oferece Español, auto-detecção de locale do browser reconhece `es-*`. Falta: auditoria completa de adoção de tokens fora dos 14 arquivos já corrigidos (não bloqueante) — ver `design-system-retheme` na Fase 3.5 pro próximo passo
- Offline foundation (mutation queue: local→pending→syncing→synced→conflict→failed) — **DONE**: `ShapeUp-Web/src/services/mutationQueue.js` (engine + retry/backoff + dedupe + persistência em localStorage), `useMutationQueue`/`useOnlineStatus` (hooks), `OfflineQueueIndicator` (UI, fila inteira visível — pendente/syncing/falha/conflito — com cancelar e rótulo amigável por tipo de operação). `apiClient.js` tem cache de leitura (GET, last-known-good) pra telas continuarem visíveis offline. 401 tenta de novo sozinho; 403 falha direto com mensagem explícita. Todo write call site do app auditado: cada um passa pela fila, ou tinha razão documentada pra não passar (era código morto). `startWorkout`/`createWorkoutPlan` usam id gerado no cliente (`utils/objectId.js`, formato Mongo ObjectId) que o backend aceita como id real — mesmo id online ou offline, sem reconciliação (contraparte backend em `ShapeUpApi/ROADMAP.md`). `copyWorkoutPlan`/`copyWorkoutTemplate` viraram duplicação local + CREATE enfileirado. Self-check em `mutationQueue.selfcheck.mjs` (10/10). Falta (GAPS.md): eviction no cache de leitura (cresce sem limite, ok no uso atual)

## Fase 2 — Core Fitness — concluída

O motivo de abrir o app todo dia. Sem isso nada de profissional/social tem o que orbitar. **[Cross-repo]** — cada item tem contraparte de API + UI; a decomposição por repo acontece quando a feature entra em Specify (specs canônicas hoje vivem em `ShapeUpApi/.specs/features/` — ver `ShapeUpApi/ROADMAP.md`).

- Editor de treino (séries, reps, carga, RPE/RIR, técnicas avançadas: superset, drop set, rest-pause, AMRAP, EMOM...)
- Execução de treino (fluxo: selecionar→iniciar→registrar→descanso→finalizar→resumo→XP→ShapeCoins)
- Nutrição (alimentos, refeições, macros, micronutrientes)
- Métricas (básicas: séries/reps/peso/duração; intermediárias: volume/PRs; avançadas: densidade/RPE/RIR/aderência)

## Fase 3 — Gamification — concluída

⚠️ Anti-cheating é pré-requisito, não segue-junto. **[Cross-repo]** — spec canônica: `ShapeUpApi/.specs/features/gamification`.

- XP, níveis, streak, achievements, badges
- ShapeCoins (moeda virtual — ganho por treino/meta/streak/desafio)
- ShapeScore & rankings (consistência + evolução + metas + atividades verificadas + desafios — não é volume bruto)
- **Anti-cheating obrigatório antes do lançamento**: detecção de atividade impossível, duplicação, GPS incompatível, volumes anormais (estados: Verified/Likely Valid/Suspicious/Invalid)

## Fase 3.5 — Polish pós-Gamificação (gate antes de Monetização) — concluída

Achados de uso real da Fase 2/3 (execução de treino, dashboard, nutrição) levantados após `Gamification`/`nutrition` fecharem Verifier. Não é feature nova — é fechar lacunas de UX/consistência antes de abrir superfície de cobrança.

- Telas de Privacy/Terms com texto encolhido (bug de layout) — spec: `.specs/features/web-ui-polish`
- Tela de forgot-password sem logo, com gradiente fora do design system, botões com cores inconsistentes — spec: `.specs/features/web-ui-polish`
- Execução de treino **[Cross-repo]**: permite check de série sem peso/reps preenchidos; RPE deveria ser opcional por padrão mas configurável como obrigatório na montagem do treino (por exercício + botão "aplicar a todos"); RPE aceita qualquer valor (deve limitar 1–10); tipo de descanso e tipo de treino não respeitam idioma selecionado (sempre em inglês) — spec canônica (backend-first): `ShapeUpApi/.specs/features/workout-execution-validation`
- Ganho de XP **[Cross-repo]**: animação customizada de ganho de XP ao finalizar treino (popup, placeholder de imagem até mascote existir); dashboard: barra de progresso de XP sempre zerada após treino (XP não reflete no nível/ShapeScore exibido) — spec canônica (backend-first): `ShapeUpApi/.specs/features/xp-feedback-loop`
- Dashboard **[Cross-repo]**: card "Exercícios Prescritos para Hoje" só deve aparecer quando o plano de treino tiver dias da semana específicos atribuídos (feature nova: atribuir dia da semana a um treino na montagem do plano, opcional); card de frequência deve refletir a quantidade real de treinos do plano do usuário, não um valor fixo — spec canônica (backend-first): `ShapeUpApi/.specs/features/workout-schedule-dashboard`
- Nutrição: botões desalinhados na tela de cardápio; navegação alimentos/cardápio/meta quebra ao entrar em "diário" (precisa virar submenu/transição suave, não duas telas concorrentes) — spec: `.specs/features/web-ui-polish`
- Lazy loading com skeleton em todas as telas (hoje carregamento abrupto, sem estado intermediário) — spec: `.specs/features/web-ui-polish`
- Exercícios com variações/equivalentes **[Cross-repo]**: ao cadastrar um exercício, marcar quais exercícios são equivalentes (API); aparece na biblioteca (detalhe do exercício) e na execução do treino (botão de troca rápida quando o aparelho está ocupado) — API/autoria canônica (backend-first): `ShapeUpApi/.specs/features/exercise-variations`; apresentação do drawer aqui: `.specs/features/exercise-detail-drawer`
- Retema visual: paleta "Warm Oxide Athletic" (terracota/oliva, Barlow Condensed — já usada nas páginas profissionais via `shell-assets`) adotada em todo o app, substituindo o tema giz/ferro/ferrugem atual — spec: `.specs/features/design-system-retheme`
- Bar de detalhe do exercício na biblioteca reescrito 1:1 com a referência (vídeo, lista de equivalentes, diretrizes técnicas) — spec: `.specs/features/exercise-detail-drawer` (consome a API de `exercise-variations`)
- Treino baseado em tempo **[Cross-repo]** (corrida, resistência, alongamento) além de carga/reps — hoje a execução assume peso+reps sempre; sem isso a Fase 2 (Core Fitness) fica incompleta. Inclui PR equivalente por ritmo/pace para exercícios com distância (corrida); alongamento e afins não geram PR — spec canônica (backend-first): `ShapeUpApi/.specs/features/time-based-exercises`

## Fase 4 — Hábito do aluno

A fila reabre aqui. O motivo de abrir o app amanhã: a sessão de hoje já está na primeira tela, com os exercícios na ordem. Quem usa é o aluno da academia, no meio do treino. Se o sinal da academia cair, o que ele marcou não some — isso já está na mutation queue da Fase 1 e não volta para a fila. **[Cross-repo]** — sessão, última carga e timer na API (`ShapeUpApi/ROADMAP.md`); aqui é a superfície web.

- A sessão de hoje abre pronta. A primeira tela é o treino do dia, não um feed e não um catálogo para montar do zero
- Cada série já vem com a última carga e as últimas repetições. O aluno confirma ou corrige
- Ao marcar a série, o timer de descanso começa sozinho
- No fim da sessão, uma frase: quantas séries foram cumpridas e se a carga subiu em relação à última vez naquele exercício
- Card de progresso da sessão, no formato de story, no fim do treino — parte do hábito. Na web a tela renderiza e pré-visualiza esse card. Quem posta usa a folha de compartilhamento do celular (Instagram e o resto). É motivação e ego, o motivo pelo qual a atividade compartilhável da Strava funcionou. Dentro do app não há feed, kudos, seguidor nem chat. O card da sessão é grátis
- Ao fechar a sessão de hoje, a de amanhã já existe. No plano grátis ela repete a ficha com a última carga registrada. O motivo de abrir o app amanhã não depende de assinatura

## Fase 5 — Catálogo que muda o pedido de amanhã

Depois do hábito. O catálogo é o que muda a ficha de amanhã e o que o aluno come ou suplementa no dia seguinte. Comida e treino seguem no mesmo app. **[Cross-repo]** — ver `ShapeUpApi/ROADMAP.md`.

- Alimento e suplemento. A web passa a enviar e mostrar a categoria (`Food` ou `Supplement`); o contrato da API já aceita a categoria e o envio pela web ficou de seguimento
- O pedido de amanhã muda a partir desse catálogo: a ficha muda porque hoje foi pesado demais, ou porque a nutrição pede outro dia, e a comida ou o suplemento do dia seguinte entra no mesmo app. Repetir a última carga continua no grátis; cobrar essa mudança é a Fase 8
- Health gating, ainda antes do lançamento público: a web esconde o que não estiver saudável, lendo o estado por funcionalidade no health da API

## Fase 6 — Progresso semanal visível

A leitura de WAPU para o próprio aluno, na tela, antes de haver cobrança. **[Cross-repo]**

- Em quantos dias da semana ele registrou trabalho de verdade
- Tendência de carga junto dessa leitura
- A nutrição que altera o pedido do dia seguinte aparece na mesma leitura, no mesmo app
- Essa leitura é o que o plano Progresso cobre na Fase 8. Até lá o lançamento público ainda não cobra. XP, streak e ShapeScore das fases 2 e 3 seguem fora de paywall

## Fase 7 — Lançamento grátis do aluno

Um grupo pequeno de alunos de força que já treinam em academia no Brasil e aceitam trocar o papel ou o Hevy pelo logger. Um box ou uma academia basta. Sem data-alvo. Ainda sem cobrança.

Para a web pública do aluno, isto precisa ser verdade:

- A sessão de hoje abre pronta, com a última carga (Fase 4)
- Dá para registrar a série e usar o timer sem montar a ficha na hora
- Fechar a sessão deixa a de amanhã pronta, ainda que seja só a repetição da última carga
- O card da sessão renderiza na web e dá para pré-visualizar (Fase 4). O card é grátis
- Conta, treino e o que as fases 0–3.5 já entregaram continuam de pé
- Catálogo e health gating (Fase 5) e o progresso semanal (Fase 6) já estão na frente
- Clube e chat não aparecem neste lançamento

Sequência, sem calendário:

1. Beta fechado. Convite. Só o logger na web: sessão de hoje, última carga, timer, frase de fim de sessão, card para pré-visualizar, amanhã repetindo a última carga.
2. Logger público e grátis, para quem já treina em academia. Ainda sem cobrança.
3. A cobrança é a fase seguinte.

## Fase 8 — Monetização leve

Só depois do logger público. O logger fica grátis para sempre: ele é o hábito, não a receita. Preço abaixo é recomendação, não preço testado com usuário. **[Cross-repo]** — assinatura e Pix na API (`ShapeUpApi/ROADMAP.md`); aqui é a oferta, o estado do plano e o que a tela libera. Regras comerciais centralizadas, não espalhadas pela UI.

Grátis para sempre:

- Sessão de hoje, última carga, timer, histórico do próprio treino
- Frase curta do fim da sessão e o card dessa sessão
- A sessão de amanhã repetindo a última carga
- Execução, nutrição básica e gamificação (XP, streak, ShapeScore) que as fases 2 e 3 já entregaram

Um plano pago do aluno, nome de trabalho Progresso:

- R$ 27,90 por mês, ou R$ 149,90 por ano no Pix

O que é pago, no mesmo app (comida e treino não viram dois produtos):

- A progressão que muda a ficha de amanhã, em vez de só repetir a última carga
- A leitura semanal de progresso do próprio aluno
- A nutrição que muda o que ele vai comer ou suplementar no dia seguinte

## Fase 9 — Clubes

Só quando o placar nasce do log: treino que o aluno registrou, não lista de exemplo. Antes disso a superfície de clube fica fora da web do aluno. **[Cross-repo]** — ver `ShapeUpApi/ROADMAP.md`.

- Placar do clube a partir do log de treino
- Check-in ligado a esse mesmo dado real
- Dentro do clube não há feed, kudos nem seguidor. Clube aqui é placar

## Fase 10 — Profissional

Depois dos clubes. O personal da mesma academia, e só quando o hábito do aluno já existe. O aluno não paga o app por causa do treinador. Não há alunos ilimitados. Preço abaixo é recomendação, não preço testado — o mesmo aviso da Fase 8. Os 30 e o R$ 1,90 são teto de risco, não um custo medido por aluno. **[Cross-repo]**

- R$ 39,90 por mês inclui até 30 alunos ativos. Aluno ativo é quem registrou treino naquele mês. Acima de 30, R$ 1,90 por aluno ativo
- Um personal com 30 fica em R$ 39,90. Um com 100 ativos paga R$ 172,90 (39,90 + 70 × 1,90). Um com 200 paga R$ 362,90
- Na web: carteira, convite e acompanhamento contam só quem treinou no mês. Carteira parada não entra no teto

## Fase 11 — Academia

Depois do profissional. A academia em que o aluno já treina. **[Cross-repo]**

- Equipe e papéis (Owner/Manager/Receptionist/Finance/Staff) na superfície web
- Planos da academia
- Check-in de recepção (QR code, código temporário ou confirmação manual)

## Fase 12 — Chat e presença ao vivo

Por último entre as superfícies do produto, antes da IA e do ecossistema. Presença ao vivo chega junto com o chat: só faz sentido quando um treinador ou a academia está olhando a série. **[Cross-repo]** — ver `ShapeUpApi/ROADMAP.md`.

- Chat entre treinador e aluno
- Presença ao vivo ("treinando agora")
- Vídeo de execução para o treinador revisar
- No lançamento do aluno (Fase 7) a web não mostra clube nem chat. Chat, presença e a revisão de vídeo entram nesta fase

## Fase 13 — IA

Depois do chat e da presença ao vivo. Assistente: a decisão final continua humana. **[Cross-repo]**

- Copiloto do aluno (explicar a leitura de progresso, resumir evolução, identificar tendência de carga)
- Copiloto do profissional (histórico do que o aluno registrou + métricas → resumo, pontos relevantes, perguntas sugeridas)
- Multimodal (fotos — exige consentimento, proteção de dados, acesso restrito, exclusão, retenção configurável)

## Fase 14 — Ecossistema

Só depois que as fases 0–13 seguram peso de produção.

- APIs públicas **[Cross-repo]**
- Wearables adicionais (Garmin, Fitbit, Polar, Whoop, Oura) na conta do aluno
- Parceiros
- Internacionalização plena, enterprise

---

## Riscos transversais (mitigação por fase)

| Risco | Mitigação | Onde mitigar |
|---|---|---|
| Escopo excessivo | Construir jornadas completas por etapa, não fatias horizontais | Todas |
| Sistema de permissões complexo | Separar Identity / Credentials / Relationships / Memberships / Entitlements | Fase 1 |
| Card da sessão atrás de paywall | O card da sessão é grátis. Dentro do app não há feed, kudos, seguidor nem chat | Fase 4 |
| Plano profissional sem teto | R$ 39,90/mês cobre até 30 alunos que registraram treino no mês; acima disso, R$ 1,90 por aluno ativo | Fase 10 |
| Gamificação manipulável | Anti-fraud antes do lançamento | Fase 3 |
| Custo de IA | Quotas e limites (`aiUsageQuota`) | Fase 8 / 13 |

## Definition of Done (aplicável a toda feature, todas as fases)

UX · Responsivo · Light/Dark · i18n · Autorização · Validação · API · Testes · Analytics · Logs · Error handling · Offline behavior · Loading/Empty/Error states · Acessibilidade (WCAG 2.2 AA) · Documentação

---

## Próximos passos sugeridos

1. Fases 0–3.5 estão concluídas. A próxima execução é a Fase 4 (hábito do aluno na web).
2. Para cada fase, ao entrar em execução: usar `tlc-spec-driven` (via `agentic-delivery`) para especificar feature a feature — este roadmap é o mapa, não a spec.
3. Em features cross-repo, o backend é especificado e implementado primeiro (contrato de API/domínio estável antes da UI consumir); a spec do frontend referencia a spec do backend, nunca o contrário.
4. Harness (`harness-engineering`) uma vez por repo, atualizado incrementalmente por fase.
