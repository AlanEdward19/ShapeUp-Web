# Revisão de integração — Web / backend

Revisão: 12/09/2026. Escopo: rotas de `src/App.jsx`, telas Stitch ativas, controllers e DTOs do backend local `ShapeUpApi`. Nenhum arquivo do backend foi alterado. Chamadas de escrita foram verificadas com mocks; não foram criados usuários, matrículas ou pagamentos reais durante a validação.

## Alterações desta revisão

- Perfil compartilhado: `GET /api/users/me` (`userId`, `displayName`, `email`) e `photoURL` da identidade Firebase. Sidebar, cabeçalho e imagens do próprio usuário usam essa origem. Sem foto, usam iniciais. Não há leitura de perfis de terceiros por endpoint administrativo para tentar completar o ranking.
- Dashboard do aluno: progresso de nível/XP, ShapeScore, ShapeCoins, sequência e ranking paginado de `/api/gamification/me` e `/api/gamification/ranking`. A regra de 500 XP por nível foi conferida em `LevelCalculator.cs`. Erros não viram perfil fictício com zero XP.
- Métricas de treinamento: frequência, variação e volume da resposta `TrainingDashboardResponse`; histórico de sessões executadas e conversão de libras para kg. Indicadores de recuperação, meta de volume, credenciais de treinador e aprovação do exercício que vinham do design foram removidos.
- Dashboard profissional: alunos e sessões provenientes dos endpoints do treinador e de execuções. Percentuais fixos de crescimento removidos.
- Gestão de alunos: remoção e ativação do plano chamam os endpoints correspondentes. Convite aguarda a resposta real; foi removida a simulação que ativava o aluno depois de três segundos.
- Academia: visão geral, equipe, planos, matrícula e atribuição de treinador conectados aos endpoints de gestão; seleção entre academias do proprietário; cadastro de academia quando não existe nenhuma. Os IDs de matrícula/equipe foram conferidos nos handlers, pois são diferentes dos IDs de usuário.
- Financeiro da academia: apresenta cadastro/edição de planos reais; o extrato de recebimentos fictícios foi retirado da rota ativa.
- Análises: carteira e planos do treinador vindos da API; matrículas mensais calculadas pela data real, sem curva inventada de crescimento/churn; exportação CSV.
- Relatórios: carteira, planos e histórico de execuções provenientes da API; biblioteca real para distribuição muscular; geração bloqueada enquanto os dados necessários carregam ou falham.
- Detalhe do aluno e treinos: histórico associado aos planos a partir das sessões da API; gráficos de exemplo e biblioteca anatômica mock removidos dos componentes ativos.
- Objetivos/peso: leitura de `{ items, targetWeight }`, datas `DateOnly` e envio em kg, inclusive quando a interface usa libras.
- Biblioteca de exercícios: carregamento das páginas disponíveis e preservação dos percentuais de ativação reais para os consumidores.

## Cobertura das rotas

| Tela | Situação / origem |
|---|---|
| Landing, termos, privacidade, 404 | Conteúdo público; não representa a identidade do usuário nem exige endpoints privados. |
| Login, cadastro, recuperação e redefinição | Firebase e sincronização de permissões existentes; aceite do convite usa endpoint existente. |
| Onboarding | Perfil nutricional/objetivo por endpoint existente. |
| Dashboard aluno/independente | Gamificação, ranking, sessões, planos, nutrição e identidade conectados. Água permanece registro local identificado. |
| Dashboard treinador | Alunos e execuções conectados. Agenda e mensagens não têm serviço de agenda/chat no backend. |
| Dashboard academia | Academias do proprietário, equipe, matrículas e planos reais. |
| Meus treinos / criador | Planos/templates e execução integrados; atletas acompanhados também criam planos próprios. Separação por `createdByUserId`/`trainerUserId`, edição/exclusão somente de planos próprios; histórico das sessões. Fila offline existente preservada. |
| Alunos / detalhe | Carteira, remoção, status do plano, convite, planos e histórico conectados. |
| Equipe / alunos da academia | Listagem, inclusão, remoção de equipe, matrícula e atribuição conectadas. |
| Exercícios | Catálogo, passos, equipamentos e ativação reais; detalhes sob demanda. |
| Nutrição: diário, alimentos, planos e objetivo | APIs de diary, foods, meal-plans e profile presentes; calendário compartilhado e data preservada na URL. |
| Objetivos do aluno | WeightTracking; contrato de resposta e unidades corrigidos. |
| Análises / relatórios | Dados reais de clientes, planos e sessões; exportação no navegador. |
| Configurações | Identidade real, troca entre os papéis retornados por `user-roles/me`, foto via Firebase Storage/Auth e preferências de idioma/unidade. CREF somente no perfil personal. Nome/e-mail somente leitura: não existe PUT de perfil no backend. |
| Mensagens / feedback | Armazenamento local existente; não existe endpoint de conversa/entrega. Foto fictícia, presença online e atalhos de agenda sem serviço removidos. |
| Academias / mapa | Lista/endereço de gyms e mapa interativo; fotos/amenidades do exemplo removidas dos cards. |
| Financeiro | Planos de academia reais. Sem extrato de recebimentos inventado. |
| Catracas | Estado indisponível explícito; dispositivos, pessoas e acessos fictícios removidos. |
| Moderação / feature flags | Integrações administrativas existentes preservadas. |

## Limites reais do backend

- Ranking retorna IDs e métricas, não nomes/fotos de terceiros. O usuário autenticado é identificado pelo próprio perfil; os demais aparecem com seu ID.
- GymStaff/GymClients retornam referências de usuário e matrícula, sem nomes ou fotos. A tela não inventa nomes nem usa `GET /api/users/{id}`, restrito a administrador da plataforma.
- Foto usa `uploadBytes` no bucket configurado e `updateProfile(photoURL)` no Firebase Auth; não há upload na API C#. O bucket deve permitir o envio autenticado em `users/{uid}/profile/*`; não foram alteradas regras nem enviados arquivos reais na validação.
- Não há endpoint para editar dados profissionais/CREF, pagamentos liquidados, cobrança recorrente, catracas, presença online, agenda ou conversas. Preferências profissionais locais existentes não equivalem a gravação no servidor.
- Gestão de academias seleciona estabelecimentos do proprietário. O backend não expõe uma listagem de academias vinculadas ao funcionário para construir um seletor equivalente nessa modalidade.
- Notificações disponíveis no backend são envio de email; não existe caixa de notificações recebidas para substituir diretamente o painel local.
- Billing de aluno/treinador ainda não tem endpoint para trocar a associação de plano existente. O cadastro de planos não é confirmação de pagamento.
- Endpoints administrativos de auditoria/permissões sem tela correspondente não foram transformados em fluxos novos de produto nesta revisão.

## Validação

Testes de contrato: perfil real, XP/placar, paginação, conversão do histórico e IDs de matrícula/equipe. Inspeção de 16 rotas com API/Firebase simulados e zero erros de JavaScript. Build e gates do frontend executados. A validação contra uma conta/servidor real depende das permissões e dados disponíveis no ambiente.
