# Telas originais do Stitch

Os 16 arquivos HTML desta pasta são cópias da exportação fornecida pelo Alan. O `DESIGN.md` também foi preservado. Eles substituem a abordagem anterior de adaptar os componentes antigos para um visual semelhante.

## Implementação

- `src/stitch/templates`: marcação dos HTMLs, com os scripts de demonstração removidos.
- `src/stitch/styles`: CSS compilado com a configuração Tailwind de cada HTML. Não depende do CDN Tailwind em produção.
- `src/stitch/sourceRuntime.jsx`: converte os elementos originais em elementos React, preservando hierarquia, classes, SVGs e estilos inline.
- `src/stitch/StitchTemplate.jsx`: isola cada tela em Shadow DOM para impedir interferência dos CSS antigos.
- Os componentes em `src/stitch` conectam eventos e dados aos elementos da exportação. As integrações existentes de autenticação, cadastro, nutrição, mensagens e salvamento de treino continuam nos seus controladores.
- `Workspace.jsx`: única sidebar para as telas importadas e para as páginas adicionais do projeto. Normaliza a largura em 256 px e disponibiliza navegação móvel.

## Correspondência

| Exportação | Tela no projeto |
| --- | --- |
| landing | `/` |
| login | `/login` |
| recovery | `/forgot-password` |
| register | `/register` |
| invitation | `/register?payload=…` |
| onboarding | `/dashboard/onboarding` |
| professional | `/dashboard` — treinador |
| athlete | `/dashboard` — aluno/independente |
| builder | Editor de plano aberto pela biblioteca de treinos ou pela ficha do aluno |
| exercises | `/dashboard/exercises` |
| nutrition | `/dashboard/nutrition/diary` |
| finance | `/dashboard/financial` |
| messages | `/dashboard/messages` |
| settings | `/dashboard/settings` |
| gyms | `/dashboard/gyms` |
| moderation | `/dashboard/admin/food-moderation` |

## Exceções e limites

A sidebar, os deslocamentos laterais e adaptações móveis são compartilhados para corrigir inconsistências da exportação. Identidade, registros e quantidades disponíveis no sistema substituem exemplos do HTML sem definir um novo layout. Estados de cadastro posteriores ao primeiro passo usam os campos de credenciais da tela de convite.

Os HTMLs incluem funcionalidades simuladas que o backend não oferece, como passkeys, configuração TOTP, telemetria de ocupação e métricas operacionais de exemplo. A importação das telas não implementa esses serviços. Passkeys e reconfiguração de segurança informam a indisponibilidade; componentes ilustrativos restantes da exportação não constituem dados novos do backend. O financeiro já utilizava dados de demonstração antes desta mudança.

## Usabilidade e integrações

- Login e cadastro compartilham a marca com link para a home. O cadastro conserva os três passos e os valores durante mudanças de idioma.
- A landing usa entrada por deslizamento ao rolar, com respeito a movimento reduzido; a navegação fica disponível também no celular.
- A tradução usa o contexto global PT/EN/ES, os dicionários existentes e o catálogo de textos exatos em `src/stitch/copy.tsv`. Conteúdo sem correspondência, como nomes e mensagens, é preservado.
- Painel do treinador carrega alunos pela API; painel do atleta carrega planos, histórico e métricas pelas APIs de treinamento. Os gráficos de volume e calorias têm seleção de período e detalhes interativos.
- Onboarding envia dados ao serviço nutricional e só apresenta conclusão após confirmação. Níveis de atividade antigos são normalizados para o contrato aceito pelo backend.
- O mapa é navegável, acompanha a academia selecionada e permite abrir uma rota. Pinos e métricas de ocupação fictícios foram retirados.
- O financeiro continua uma demonstração identificada: não existe serviço financeiro neste backend. O gráfico demonstrativo permite inspeção; nenhuma cobrança é executada.
- As verificações de navegador usam serviços simulados, sem criar contas, sessões de treino, cobranças ou decisões de moderação reais.

```powershell
node scripts/import-stitch.mjs "C:\caminho\da\exportacao\stitch"
node node_modules/vitest/vitest.mjs run
node scripts/check-frontend-gates.mjs
node node_modules/vite/bin/vite.js build
```

`StitchTemplates.test.jsx` compara a hierarquia e as classes da renderização com cada HTML e verifica o cadastro integrado, incluindo rejeição de senhas diferentes.


