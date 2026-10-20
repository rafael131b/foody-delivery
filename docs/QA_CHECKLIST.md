# QA Checklist — Mini Rastreador de Pedidos

**Produto:** Mini Rastreador de Pedidos de delivery  
**Prazo do desafio:** 21/10/2026 às 23:59 (America/Sao_Paulo)  
**Escopo:** API REST Java/Spring Boot, autenticação, persistência SQLite (ou similar) e aplicação React.

## Como usar

- Marque cada caso como `Pendente`, `Passou` ou `Falhou` durante a execução.
- Para cada falha, registre ambiente, passos para reproduzir, resposta esperada/obtida e evidência.
- Os IDs abaixo devem ser usados em issues, commits ou comentários de revisão.
- Rotas implementadas: `/api/auth/register`, `/api/auth/login`, `/api/orders` e `/api/orders/{id}/status`.

## Critérios de aceite

- Usuários conseguem se cadastrar e fazer login com credenciais válidas.
- Endpoints protegidos rejeitam requisições sem autenticação e não permitem acesso entre usuários sem autorização explícita.
- Pedidos podem ser criados, listados, consultados por ID e ter status atualizado.
- Apenas transições de status válidas são aceitas; dados inválidos retornam erro 4xx claro.
- Dados permanecem disponíveis após reinicialização da aplicação.
- A interface React permite login, visualização dos pedidos e criação de pedido, tratando carregamento e erros.
- Layout permanece utilizável em telas móveis e desktop, mantendo a identidade visual inspirada em Foody Delivery.
- Backend e frontend integrados em ambiente limpo, sem depender de dados manuais não documentados.

## Matriz de testes

| ID | Área | Cenário / passos resumidos | Resultado esperado | Prioridade | Status |
|---|---|---|---|---|---|
| AUTH-01 | Autenticação | Cadastrar usuário com nome, e-mail e senha válidos | Cadastro criado; resposta não expõe senha/hash | P0 | Passou |
| AUTH-02 | Autenticação | Cadastrar e-mail já existente | `409`, sem criar duplicata | P0 | Passou |
| AUTH-03 | Autenticação | Enviar nome, e-mail ou senha ausentes | `400` com mensagem de validação; nenhum usuário criado | P0 | Passou |
| AUTH-04 | Autenticação | Enviar e-mail em formato inválido e senha abaixo do mínimo | `400`; regras documentadas e consistentes | P1 | Passou |
| AUTH-05 | Autenticação | Login com credenciais válidas | Token retornado; usuário consegue acessar rota protegida | P0 | Passou |
| AUTH-06 | Autenticação | Login com senha incorreta | `401`; mensagem não revela qual campo está incorreto | P0 | Passou |
| AUTH-07 | Autenticação | Usar token ausente, inválido, expirado ou malformado | `401`; nenhum dado protegido retornado | P0 | Passou |
| AUTH-08 | Autenticação | Repetir login e usar logout/expiração, se suportado | Sessão anterior deixa de autorizar operações protegidas | P1 | Pendente |
| AUTHZ-01 | Autorização | Acessar listar, buscar, criar e atualizar pedido sem autenticação | Todas as rotas protegidas bloqueadas com `401 Unauthorized` | P0 | Passou |
| AUTHZ-02 | Autorização | Usuário A consultar/alterar pedido de usuário B | `404` sem vazar existência | P0 | Passou |
| AUTHZ-03 | Autorização | Alterar usuário/ID no token ou enviar token de outro usuário | Servidor valida identidade no token; não há impersonação | P0 | Pendente |
| ORDER-01 | Pedidos | Criar pedido válido com complemento opcional | `201`; ID, status inicial `RECEBIDO`, complemento devolvido na consulta | P0 | Passou |
| ORDER-02 | Pedidos | Criar pedido com múltiplos itens e quantidades válidas | Todos os itens são mantidos sem perda/duplicação | P0 | Pendente |
| ORDER-03 | Pedidos | Listar pedidos autenticado | `200`; lista contém o pedido da conta autenticada | P0 | Passou |
| ORDER-04 | Pedidos | Buscar pedido existente por ID | `200`; representação corresponde ao pedido salvo | P0 | Passou |
| ORDER-05 | Pedidos | Buscar ID inexistente, inválido ou negativo | `404` para ausente ou `400` para formato inválido; sem stack trace | P1 | Pendente |
| ORDER-06 | Pedidos | Criar pedido sem cliente, itens vazios, endereço ou JSON válido | `400`; mensagens por campo e sem persistência parcial | P0 | Pendente |
| ORDER-07 | Pedidos | Quantidade zero/negativa, nome de item vazio ou payload excessivo | `400`/`413` conforme regra; servidor permanece estável | P1 | Pendente |
| ORDER-08 | Pedidos | Reenviar a mesma requisição de criação | Comportamento documentado: duplicação controlada ou idempotência; sem corrupção | P1 | Pendente |
| STATUS-01 | Status | Atualizar `RECEBIDO` → `EM_PREPARO` | Atualização aceita e retornada | P0 | Passou |
| STATUS-02 | Status | Atualizar `EM_PREPARO` → `SAIU_PARA_ENTREGA` | Atualização aceita | P0 | Passou |
| STATUS-03 | Status | Atualizar `SAIU_PARA_ENTREGA` → `ENTREGUE` | Atualização aceita | P0 | Passou |
| STATUS-04 | Status | Cancelar pedido recebido | Resultado consistente com regra de negócio | P0 | Passou |
| STATUS-05 | Status | Tentar saltar etapas ou alterar pedido `ENTREGUE`/`CANCELADO` | `409`; status permanece inalterado | P0 | Passou |
| STATUS-06 | Status | Enviar status ausente, desconhecido, com caixa diferente ou payload inválido | `400`; apenas enum oficial é aceito | P1 | Pendente |
| STATUS-07 | Status | Duas atualizações concorrentes no mesmo pedido | Resultado determinístico; sem status impossível ou perda silenciosa | P1 | Pendente |
| DATA-01 | Persistência | Criar pedido, reiniciar aplicação e consultar novamente | Pedido permanece disponível | P0 | Pendente |
| DATA-02 | Persistência | Criar vários usuários/pedidos e consultar lista | Isolamento e integridade entre registros | P0 | Passou |
| DATA-03 | Persistência | Falha durante gravação/transação | Nenhum registro parcial inconsistente; erro controlado | P1 | Pendente |
| API-01 | API | Verificar códigos HTTP, `Content-Type` e formato de erro | Contrato consistente em sucesso e falha | P1 | Pendente |
| API-02 | API | Enviar campos desconhecidos e valores SQL/HTML/script | Campos ignorados/rejeitados; sem SQL injection/XSS refletido | P0 | Pendente |
| API-03 | API | Requisição sem `Content-Type`, método não suportado e rota inexistente | `400`/`405`/`404` apropriados | P1 | Pendente |
| UI-01 | Integração | Abrir app sem sessão | Usuário vê login/cadastro; áreas protegidas não são exibidas como autenticadas | P0 | Passou |
| UI-02 | Integração | Fazer login pela UI | Token/sessão armazenado com segurança; usuário chega à lista | P0 | Passou |
| UI-03 | Integração | Listar pedidos pela UI | Dados e status exibidos corretamente; loading e lista vazia tratados | P0 | Passou |
| UI-04 | Integração | Criar pedido pela UI com campos válidos | Feedback de sucesso; novo pedido aparece com `RECEBIDO` | P0 | Passou |
| UI-05 | Integração | Submeter formulário inválido ou API indisponível | Validação inline; erro compreensível; botão não duplica requisições | P0 | Pendente |
| UI-06 | Integração | Token expira durante uso | Redireciona para login e preserva mensagem útil | P1 | Pendente |
| UI-07 | Integração | Recarregar página e navegar diretamente para rota protegida | Estado de autenticação e proteção de rota funcionam conforme contrato | P1 | Passou |
| UI-08 | Integração | Verificar CORS/base URL em ambiente local e produção | Requisições funcionam sem workaround manual inseguro | P0 | Pendente |
| UI-09 | Integração | Selecionar novamente o filtro de status já ativo | Nova consulta termina, lista reaparece e loading não fica preso | P1 | Passou |
| RWD-01 | Responsividade | Testar 320×568, 375×812, 768×1024, 1280×720 e 1440×900 | Sem overflow horizontal; conteúdo e ações acessíveis | P0 | Pendente |
| RWD-02 | Responsividade | Formulário de pedido em viewport móvel | Campos, labels e botão permanecem legíveis e utilizáveis | P0 | Pendente |
| RWD-03 | Responsividade | Lista/status em viewport móvel | Cards/tabela adaptam sem cortar endereço, item ou status | P0 | Pendente |
| RWD-04 | Responsividade | Teclado, foco e contraste | Fluxo operável por teclado; foco visível; contraste suficiente | P1 | Pendente |
| RWD-05 | Responsividade | Desktop e mobile com identidade visual Foody | Cores, espaçamento, tipografia e hierarquia são coerentes, sem sacrificar legibilidade | P1 | Pendente |

## Testes automatizados e CI

Os testes de integração do backend usam um SQLite em memória (`backend/src/test/resources/application.properties`) e não alteram o banco persistido do Docker. O Playwright E2E cobre cadastro, criação/atualização e persistência do pedido, filtro/paginação server-side e consulta ao visualizador SQLite. O GitHub Actions executa testes backend, build frontend, build do Compose e E2E em pull requests e pushes à `main`. Isso é CI; publicação e deploy (CD) ainda não estão configurados.

## Limites conhecidos

- A suíte ainda não cobre concorrência, reinicialização do container com dados, XSS/SQL injection ou testes visuais/responsivos automatizados.
- O token do frontend é mantido somente em memória React, não em `localStorage` nem `sessionStorage`; para produção, avaliar cookie `HttpOnly` e revisar XSS/CSRF.
- O SQLite mantém dados de pedido em texto claro; não há criptografia em repouso.
- Segredos de desenvolvimento são aceitos somente no perfil local; produção deve definir `SPRING_PROFILES_ACTIVE=prod` e `JWT_SECRET` exclusivo.
- Não há CD/deploy nem análise de dependências/segurança no workflow atual.

## Registro de execução

Cobertura automatizada atual: 22 testes de backend. Os resultados não representam aprovação de todos os casos da matriz; os itens marcados como pendentes ainda precisam de validação.

| Data | Ambiente | Comando/caso | Resultado | Evidência |
|---|---|---|---|---|
| 17/10/2026 | Local | `backend/.mvnw.cmd -B test` | Passou (18 testes) | Testes de autenticação, segredo por perfil, paginação e regras de pedidos; SQLite de teste em memória |
| 17/10/2026 | Local | `frontend/npm ci && npm run build` | Passou | Build Vite |
| 17/10/2026 | Local | Playwright E2E via Compose isolado | Passou | Cadastro, pedido, transição, paginação/filtro da API e visualizador SQLite |
| 17/10/2026 | CI | GitHub Actions em PR #7 | Passou | Backend, frontend, build Docker Compose e E2E |
| 19/10/2026 | Local | `cd backend && .\mvnw.cmd -B spotless:check test` | Passou (22 testes) | Spotless e suíte backend; SQLite em memória/temporário |
| 19/10/2026 | Local | `cd frontend && npm ci && npm run lint && npm run format:check && npm run build` | Passou | Instalação limpa, lint, Prettier e build Vite |
| 19/10/2026 | Local | `docker compose -f infra/docker-compose.yml build` | Bloqueado | Docker CLI instalado, mas Docker Engine/Desktop não estava ativo/disponível |
| 19/10/2026 | Local | Playwright E2E | Não executado | Requer Docker Compose; Docker Engine indisponível nesta máquina |
| 20/10/2026 | Local | `docker compose -f infra/docker-compose.yml build` | Passou | Três imagens construídas: backend, frontend e visualizador SQLite |
| 20/10/2026 | Local | Playwright E2E via Compose isolado | Passou (3 testes) | Swagger, fluxo de pedido/persistência e isolamento entre usuários; portas alternativas por conflito local em 8080 |
| 20/10/2026 | Windows, revisão dos requisitos | `.\mvnw.cmd -B spotless:check test` na pasta backend | Passou (22 testes) | Após normalização LF com Spotless; sem falhas, erros ou testes ignorados |
| 20/10/2026 | Windows, revisão dos requisitos | `npm run lint`, `npm run format:check`, `npm run build` na pasta frontend | Passou | Política LF via `.gitattributes` e Prettier; build de produção concluído |
| 20/10/2026 | Compose `foody-quality-check` | Build dos três serviços e `npm run test:e2e` | Passou (3 testes) | Portas 13000/18080/18081; regressão UI-09 incluída; Playwright fixado no lockfile |
