# ShapeUp — Especificação de Redesign (Google Stitch)

App fitness B2B2C: personal trainers, academias e clientes. Web app (React), estilo atual "warm oxide" (laranja terracota + tipografia condensada). Este doc serve de prompt-base pra gerar um layout novo e mais moderno, mantendo os fluxos e papéis de usuário existentes.

---

## 1. Identidade visual

### Conceito atual
"Warm oxide" — terracota queimado sobre fundo bege quente, tipografia condensada de destaque (títulos) + sans neutra (corpo). Não é um design "clínico" tipo SaaS genérico: tem calor, textura, personalidade de academia/atlética.

### Paleta — Light mode
| Token | Valor (OKLCH) | Uso |
|---|---|---|
| `--primary` | oklch(55% 0.14 38) — terracota | CTAs, links, ícones ativos |
| `--primary-hover` | oklch(48% 0.13 38) | hover de primary |
| `--accent` | oklch(46% 0.08 145) — verde oliva | badges secundários, sucesso sutil |
| `--bg-main` | oklch(98.4% 0.006 80) — bege quase branco | fundo de página |
| `--bg-card` | oklch(99.6% 0.002 80) | cards, painéis |
| `--bg-input` | oklch(100% 0.001 80) | inputs |
| `--text-main` | oklch(24% 0.018 50) — marrom escuro | texto principal |
| `--text-muted` | oklch(46% 0.016 50) | texto secundário |
| `--text-inverse` | oklch(98.4% 0.006 80) | texto sobre fundo escuro |
| `--text-on-primary` | oklch(99% 0.01 80) | texto sobre botão primary |
| `--border-color` | oklch(92% 0.008 75) | bordas sutis |
| `--border-input` | oklch(84% 0.014 60) | bordas de input |
| `--border-input-focus` | oklch(55% 0.14 38) | foco (= primary) |
| `--success` | oklch(48% 0.1 145) |
| `--warning` | oklch(66% 0.13 70) |
| `--error` / `--danger` | oklch(52% 0.16 28) |

### Paleta — Dark mode
| Token | Valor (OKLCH) |
|---|---|
| `--primary` | oklch(74% 0.12 42) |
| `--primary-hover` | oklch(80% 0.11 42) |
| `--accent` | oklch(72% 0.09 145) |
| `--text-on-primary` | oklch(18% 0.03 42) |
| `--bg-main` | oklch(22% 0.032 42) |
| `--bg-card` | oklch(28% 0.034 42) |
| `--bg-input` | oklch(25% 0.03 42) |
| `--text-main` | oklch(95% 0.022 75) |
| `--text-muted` | oklch(74% 0.03 58) |
| `--text-inverse` | oklch(22% 0.032 42) |
| `--border-color` | oklch(36% 0.03 42) |
| `--border-input` | oklch(40% 0.032 42) |
| `--border-input-focus` | oklch(74% 0.12 42) |
| `--success` | oklch(76% 0.1 145) |
| `--warning` | oklch(80% 0.12 70) |
| `--error` | oklch(72% 0.14 28) |

Regra geral dark mode: não é preto puro — é marrom-carvão quente (`oklch(22% 0.032 42)`), mantendo o mesmo matiz do terracota, só invertendo luminância. Evitar cinza neutro/azulado — quebra a identidade.

### Tipografia
- **Display / títulos**: `Barlow Condensed` (600/700/800) — condensada, forte, usada em headers, títulos de página, nomes de plano. Sem uppercase forçado (`text-transform: none`), leve tracking negativo (`-0.02em`).
- **Corpo**: `Source Sans 3` (400/600/700, itálico 400) — legibilidade em textos longos, formulários, tabelas.
- Fallbacks: `Arial Narrow/Impact` pro display, `Segoe UI` pro corpo.

### Forma e sombra
- Cantos: `--radius-sm 0.55rem`, `--radius-md 0.85rem`, `--radius-lg 1.15rem` — arredondado mas não "pill" exagerado.
- Sombras suaves e quentes (tom da própria paleta, não cinza): `--shadow-soft` (cards em repouso), `--shadow-md` (modais, dropdowns, hover elevado).
- Transições: 140ms (micro, hover) / 220ms (normal, abrir painel) com easing `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo-like).
- Respeitar `prefers-reduced-motion`.

### O que "modernizar" deve preservar
- A paleta terracota/oliva — não trocar para azul/roxo SaaS genérico.
- Contraste do dark mode quente, não frio.
- Tipografia condensada nos títulos (é a assinatura visual do produto).
Pode modernizar: densidade de informação, hierarquia, uso de espaço em branco, componentes (cards, tabelas, gráficos), micro-interações, iconografia.

---

## 2. Papéis de usuário (afeta o que cada tela mostra)

- **client** (aluno/cliente final)
- **professional** (personal trainer autônomo com carteira de clientes)
- **independent** (profissional solo, sem vínculo a academia)
- **gym** (dono/admin de academia — gestão de staff, catraca, financeiro)
- **admin** (moderação de conteúdo e feature flags — nível plataforma)

O Dashboard raiz (`/dashboard`) roteia por papel para um dos 4 dashboards (client/professional/independent/gym).

---

## 3. Inventário de telas

### 3.1 Públicas (sem login)

**Landing Page** (`/`)
- Hero com proposta de valor, CTA duplo (Cadastrar / Já sou cliente)
- Seções de features (treino, nutrição, gestão de academia)
- Prova social / depoimentos
- Footer com links legais

**Login** (`/login`)
- Form: e-mail, senha, "esqueci senha", CTA cadastro
- Estado de erro de autenticação

**Cadastro** (`/register`)
- Form multi-step ou único: dados pessoais, tipo de conta (client/professional/gym), senha
- Aceite de termos

**Esqueci senha** (`/forgot-password`)
- Form de e-mail, mensagem de confirmação de envio

**Redefinir senha** (`/reset-password`, `/__/auth/action`)
- Form nova senha + confirmação, feedback de sucesso/token inválido

**Documento legal** (`/privacy`, `/terms`)
- Texto corrido longo, tipografia de leitura, sumário lateral opcional

**404** (`*`)
- Estado vazio ilustrado, CTA voltar ao início

**Cookie Consent** (banner global, não é rota)
- Banner fixo inferior, aceitar/rejeitar/preferências

---

### 3.2 Shell autenticado (`/dashboard/*`)

**Layout** (sidebar + header, envolve todas as telas abaixo)
- Sidebar: logo, navegação por papel, avatar/usuário no rodapé, toggle dark/light
- Header: breadcrumb ou título da página, notificações (sino), busca (se aplicável)
- Área de conteúdo com padding consistente (`--space-page`)
- Componentes globais: `NotificationsPanel`, `ChatDrawer`, `OfflineQueueIndicator`

**Dashboard — Client** (`DashboardClient`)
- Resumo do plano de treino atual, próximos treinos
- Progresso/gamificação (`GamificationProgressCard`, `RankingList`)
- Atalho para diário alimentar (nutrition)
- Objetivos ativos

**Dashboard — Professional** (`DashboardProfessional`)
- Visão geral da carteira de clientes (ativos, pendências)
- Feedbacks recentes recebidos
- Atalhos: criar plano de treino, ver agenda/clientes

**Dashboard — Independent** (`DashboardIndependent`)
- Similar ao professional mas sem contexto de staff/academia — visão solo

**Dashboard — Gym** (`DashboardGym`)
- KPIs da academia (alunos ativos, catraca/acessos, financeiro resumido)
- Atalhos: staff, catraca, financeiro

**Planos de treino** (`/dashboard/training`, `TrainingPlans`)
- Lista de planos (cliente vê o seu; profissional vê os que criou)
- Nome do plano, exercícios, séries/reps, exibição por dia da semana
- CRUD de plano (para professional/independent)

**Clientes** (`/dashboard/clients`, `Clients` / `ClientsGym`)
- Tabela/lista de clientes vinculados, status, busca/filtro
- Convite de cliente (`InviteClientModal`)

**Detalhe do cliente** (`/dashboard/clients/:id`, `ClientDetail`)
- Perfil, histórico de treinos, avaliações físicas, plano ativo, feedbacks, cobrança (`ClientBillingModal`)

**Exercícios** (`/dashboard/exercises`, `Exercises`)
- Biblioteca de exercícios (`ExerciseLibraryModal`), busca por grupo muscular
- Mapa corporal anatômico (`WorkoutBodyMap`) — seleção visual de músculo/exercício
- Sugestão de novo exercício (`SuggestExerciseModal`), modal de detalhe (`ExerciseModal`)

**Feedback** (`/dashboard/feedback`, `Feedback`)
- Lista de feedbacks de treino enviados/recebidos, avaliação (nota/comentário)

**Analytics** (`/dashboard/analytics`, `Analytics`)
- Gráficos de evolução (carga, frequência, adesão), filtros de período

**Relatórios** (`/dashboard/reports`, `Reports`)
- Geração/exportação de relatórios (PDF/CSV), lista de relatórios gerados

**Configurações** (`/dashboard/settings`, `Settings`)
- Perfil, preferências (tema claro/escuro), notificações, segurança/senha, billing pessoal

**Objetivos** (`/dashboard/objectives`, `ObjectivesClient`)
- Metas do cliente (peso, força, hábito), progresso, edição de meta

**Staff** (`/dashboard/staff`, `StaffGym`)
- Gestão de equipe da academia: lista de funcionários, papéis, convite/remoção

**Catraca** (`/dashboard/turnstile`, `TurnstileGym`)
- Log de acessos/entradas, status de integração com catraca física

**Financeiro** (`/dashboard/financial`, `FinancialGym`)
- Receita, inadimplência, mensalidades, gráfico de fluxo de caixa
- Cartão de crédito / cobrança (`CreditCardUI`)

**Mensagens** (`/dashboard/messages`)
- Placeholder atual — projetar como lista de conversas + thread (chat), reaproveitando `ChatDrawer`

#### Nutrição (`/dashboard/nutrition/*`)
**Diário do dia** (`nutrition/diary`, `DiaryDay`)
- Refeições do dia, macros consumidos vs meta, adicionar item rápido

**Busca de alimentos** (`nutrition/foods`, `FoodSearch`)
- Busca com filtro, resultado com macros por porção, adicionar ao diário/plano

**Formulário de alimento** (`FoodForm`, modal/rota interna)
- Cadastro/edição de alimento custom (nome, macros, porção)

**Gerenciador de planos alimentares** (`nutrition/meal-plans`, `MealPlanManager`)
- Lista de planos alimentares, refeições por plano, atribuição a cliente

**Onboarding de meta nutricional** (`nutrition/goal`, `GoalOnboarding`)
- Wizard: objetivo (emagrecer/manter/ganhar), calcula macros-alvo

**Substituição de item** (`SubstituteItemModal`)
- Modal: sugestões de substituição de alimento equivalente em macro

**Navegação de nutrição** (`NutritionNav`)
- Sub-nav/tabs entre diário, busca, planos

#### Admin (`/dashboard/admin/*`)
**Moderação de alimentos** (`admin/food-moderation`, `FoodModerationQueue`)
- Fila de alimentos cadastrados por usuários pendentes de aprovação, aprovar/rejeitar

**Feature Flags** (`admin/feature-flags`, `FeatureFlagsPanel`)
- Lista de flags, toggle on/off, escopo (global/por conta)

---

## 4. Componentes globais reutilizáveis
- `Button` — variantes primary/secondary/danger/ghost, tamanhos, loading state
- `Card` — container padrão com `--shadow-soft`, `--radius-md`
- `Input` — com label, erro, ícone, foco com `--border-input-focus`
- `Header` / `Sidebar` — shell de navegação
- `NotificationsPanel` — dropdown/painel de notificações
- `ChatDrawer` — painel lateral de chat
- `CookieConsent` — banner LGPD
- `ErrorBoundary` — estado de erro genérico full-page
- `OfflineQueueIndicator` — indicador de ações pendentes de sync (PWA-like)
- `CreditCardUI` — visual de cartão para cobrança
- Modais: `ClientBillingModal`, `ExerciseLibraryModal`, `ExerciseModal`, `InviteClientModal`, `SuggestExerciseModal`, `SubstituteItemModal`
- Gamificação: `GamificationProgressCard`, `RankingList`

---

## 5. Diretrizes para o Google Stitch

1. Gerar telas em **light e dark mode** usando exatamente os tokens de cor acima (converter OKLCH pra hex se a ferramenta não aceitar OKLCH direto).
2. Manter tipografia condensada nos títulos e sans neutra no corpo — não usar fonte "SaaS padrão" (Inter genérico) sem diferenciação de título.
3. Sidebar + header persistentes no shell autenticado; conteúdo muda por rota.
4. Adaptar navegação da sidebar por papel (client vê nutrição/objetivos/treino; gym vê staff/catraca/financeiro; professional/independent veem clientes/planos).
5. Priorizar mobile-first ou ao menos responsivo — app é usado em academia (celular) e em escritório/recepção (desktop, no caso gym).
6. Cards de dashboard devem comunicar dado numérico rápido (KPI) + tendência (gráfico pequeno/sparkline), não só texto.
7. Estados vazios (sem clientes, sem planos, sem treinos) precisam de ilustração leve + CTA — não deixar tela em branco.
8. Fluxos com formulário longo (cadastro, onboarding nutricional) devem considerar wizard/multi-step em vez de form único gigante.
