# QA Checklist — Mini Rastreador de Pedidos

**Produto:** Mini Rastreador de Pedidos de delivery  
**Prazo do desafio:** 21/10/2026 às 23:59 (America/Sao_Paulo)  
**Escopo:** API REST Java/Spring Boot, autenticação, persistência SQLite (ou similar) e aplicação React.

## Como usar

- Marque cada caso como `Pendente`, `Passou` ou `Falhou` durante a execução.
- Para cada falha, registre ambiente, passos para reproduzir, resposta esperada/obtida e evidência.
- Os IDs abaixo devem ser usados em issues, commits ou comentários de revisão.
- A matriz assume que a API expõe rotas equivalentes a `/auth/register`, `/auth/login` e `/orders`; ajuste os caminhos aos contratos reais sem alterar o objetivo dos testes.

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
| AUTH-01 | Autenticação | Cadastrar usuário com nome, e-mail e senha válidos | Cadastro criado; senha não aparece em texto puro; resposta não expõe segredo | P0 | Pendente |
| AUTH-02 | Autenticação | Cadastrar e-mail já existente | `409` ou `400` consistente, sem criar duplicata | P0 | Pendente |
| AUTH-03 | Autenticação | Enviar nome, e-mail ou senha ausentes | `400` com mensagem de validação; nenhum usuário criado | P0 | Pendente |
| AUTH-04 | Autenticação | Enviar e-mail em formato inválido e senha abaixo do mínimo | `400`; regras documentadas e consistentes | P1 | Pendente |
| AUTH-05 | Autenticação | Login com credenciais válidas | Token/sessão retornado; usuário consegue acessar rota protegida | P0 | Pendente |
| AUTH-06 | Autenticação | Login com senha errada ou e-mail inexistente | `401`; resposta não revela qual campo está incorreto | P0 | Pendente |
| AUTH-07 | Autenticação | Usar token ausente, inválido, expirado ou malformado | `401`; nenhum dado protegido retornado | P0 | Pendente |
| AUTH-08 | Autenticação | Repetir login e usar logout/expiração, se suportado | Sessão anterior deixa de autorizar operações protegidas | P1 | Pendente |
| AUTHZ-01 | Autorização | Acessar listar, buscar, criar e atualizar pedido sem autenticação | Todas as rotas protegidas retornam `401` | P0 | Pendente |
| AUTHZ-02 | Autorização | Usuário A consultar/alterar pedido de usuário B, se pedidos forem privados | Acesso negado (`403` ou `404` sem vazamento de existência) | P0 | Pendente |
| AUTHZ-03 | Autorização | Alterar usuário/ID no token ou enviar token de outro usuário | Servidor valida identidade no token; não há impersonação | P0 | Pendente |
| ORDER-01 | Pedidos | Criar pedido com cliente, itens e endereço válidos | `201`; ID, status inicial `RECEBIDO` e dados persistidos | P0 | Pendente |
| ORDER-02 | Pedidos | Criar pedido com múltiplos itens e quantidades válidas | Todos os itens são mantidos sem perda/duplicação | P0 | Pendente |
| ORDER-03 | Pedidos | Listar pedidos autenticado | `200`; lista paginada ou completa conforme contrato, sem dados indevidos | P0 | Pendente |
| ORDER-04 | Pedidos | Buscar pedido existente por ID | `200`; representação corresponde ao pedido salvo | P0 | Pendente |
| ORDER-05 | Pedidos | Buscar ID inexistente, inválido ou negativo | `404` para ausente ou `400` para formato inválido; sem stack trace | P1 | Pendente |
| ORDER-06 | Pedidos | Criar pedido sem cliente, itens vazios, endereço ou JSON válido | `400`; mensagens por campo e sem persistência parcial | P0 | Pendente |
| ORDER-07 | Pedidos | Quantidade zero/negativa, nome de item vazio ou payload excessivo | `400`/`413` conforme regra; servidor permanece estável | P1 | Pendente |
| ORDER-08 | Pedidos | Reenviar a mesma requisição de criação | Comportamento documentado: duplicação controlada ou idempotência; sem corrupção | P1 | Pendente |
| STATUS-01 | Status | Atualizar `RECEBIDO` → `EM_PREPARO` | Atualização aceita e retornada | P0 | Pendente |
| STATUS-02 | Status | Atualizar `EM_PREPARO` → `SAIU_PARA_ENTREGA` | Atualização aceita | P0 | Pendente |
| STATUS-03 | Status | Atualizar `SAIU_PARA_ENTREGA` → `ENTREGUE` | Atualização aceita | P0 | Pendente |
| STATUS-04 | Status | Atualizar qualquer status permitido → `CANCELADO`, conforme regra definida | Resultado consistente com regra de negócio | P0 | Pendente |
| STATUS-05 | Status | Tentar retroceder status ou alterar pedido `ENTREGUE`/`CANCELADO` | `400`/`409`; status permanece inalterado | P0 | Pendente |
| STATUS-06 | Status | Enviar status ausente, desconhecido, com caixa diferente ou payload inválido | `400`; apenas enum oficial é aceito | P1 | Pendente |
| STATUS-07 | Status | Duas atualizações concorrentes no mesmo pedido | Resultado determinístico; sem status impossível ou perda silenciosa | P1 | Pendente |
| DATA-01 | Persistência | Criar pedido, reiniciar aplicação e consultar novamente | Pedido permanece disponível | P0 | Pendente |
| DATA-02 | Persistência | Criar vários usuários/pedidos e consultar lista | Isolamento e integridade entre registros | P0 | Pendente |
| DATA-03 | Persistência | Falha durante gravação/transação | Nenhum registro parcial inconsistente; erro controlado | P1 | Pendente |
| API-01 | API | Verificar códigos HTTP, `Content-Type` e formato de erro | Contrato consistente em sucesso e falha | P1 | Pendente |
| API-02 | API | Enviar campos desconhecidos e valores SQL/HTML/script | Campos ignorados/rejeitados; sem SQL injection/XSS refletido | P0 | Pendente |
| API-03 | API | Requisição sem `Content-Type`, método não suportado e rota inexistente | `400`/`405`/`404` apropriados | P1 | Pendente |
| UI-01 | Integração | Abrir app sem sessão | Usuário vê login/cadastro; áreas protegidas não são exibidas como autenticadas | P0 | Pendente |
| UI-02 | Integração | Fazer login pela UI | Token/sessão armazenado com segurança; usuário chega à lista | P0 | Pendente |
| UI-03 | Integração | Listar pedidos pela UI | Dados e status exibidos corretamente; loading e lista vazia tratados | P0 | Pendente |
| UI-04 | Integração | Criar pedido pela UI com campos válidos | Feedback de sucesso; novo pedido aparece com `RECEBIDO` | P0 | Pendente |
| UI-05 | Integração | Submeter formulário inválido ou API indisponível | Validação inline; erro compreensível; botão não duplica requisições | P0 | Pendente |
| UI-06 | Integração | Token expira durante uso | Redireciona para login e preserva mensagem útil | P1 | Pendente |
| UI-07 | Integração | Recarregar página e navegar diretamente para rota protegida | Estado de autenticação e proteção de rota funcionam conforme contrato | P1 | Pendente |
| UI-08 | Integração | Verificar CORS/base URL em ambiente local e produção | Requisições funcionam sem workaround manual inseguro | P0 | Pendente |
| RWD-01 | Responsividade | Testar 320×568, 375×812, 768×1024, 1280×720 e 1440×900 | Sem overflow horizontal; conteúdo e ações acessíveis | P0 | Pendente |
| RWD-02 | Responsividade | Formulário de pedido em viewport móvel | Campos, labels e botão permanecem legíveis e utilizáveis | P0 | Pendente |
| RWD-03 | Responsividade | Lista/status em viewport móvel | Cards/tabela adaptam sem cortar endereço, item ou status | P0 | Pendente |
| RWD-04 | Responsividade | Teclado, foco e contraste | Fluxo operável por teclado; foco visível; contraste suficiente | P1 | Pendente |
| RWD-05 | Responsividade | Desktop e mobile com identidade visual Foody | Cores, espaçamento, tipografia e hierarquia são coerentes, sem sacrificar legibilidade | P1 | Pendente |

## Testes automatizados recomendados

Quando o código existir, adicionar testes sem modificar a implementação:

- `qa/api/`: testes de contrato/integrados contra a API (registro, login, autorização, pedidos e transições).
- `qa/e2e/`: fluxo UI login → listagem → criação, erro de API e viewport móvel.
- `qa/fixtures/`: payloads válidos e inválidos, sem segredos reais.

Prioridade mínima para o prazo: AUTH-01/05/07, AUTHZ-01, ORDER-01/03/04/06, STATUS-01/03/05, DATA-01, UI-02/03/04/05 e RWD-01/02.

## Comandos de execução

Nenhum comando de build, teste ou execução pôde ser realizado neste workspace: o repositório está vazio e não contém `pom.xml`, `build.gradle`, `package.json`, código-fonte ou scripts.

Comandos esperados quando a implementação estiver disponível (ajustar aos scripts reais):

```powershell
# Backend
./mvnw test
./mvnw spring-boot:run

# Frontend
npm ci
npm test -- --run
npm run build
npm run dev

# E2E, se configurado
npx playwright test
```

## Riscos e pendências

- Contrato exato de endpoints, payloads, autenticação e códigos de erro ainda não foi definido.
- A regra de autorização (pedidos visíveis para todos os usuários ou somente para o criador) precisa ser confirmada.
- A política de transição para `CANCELADO` precisa ser explicitada.
- Não há implementação para validar persistência SQLite, migrações, CORS, tratamento de exceções ou segurança de senha.
- Não há ambiente de execução, dados de teste, testes automatizados ou pipeline CI configurados.
- A referência visual do site Foody Delivery deve ser usada como inspiração; validar acessibilidade e legibilidade antes de considerar a identidade visual aprovada.
- Não adicionar segredos, tokens, banco local ou artefatos de build ao Git. Confirmar histórico de commits antes da entrega.

## Registro de execução

| Data/hora | Ambiente | Comando/caso | Resultado | Evidência |
|---|---|---|---|---|
| 17/10/2026 | Workspace local | Inspeção da raiz do repositório | Repositório vazio; nenhum teste executável | Diretórios e arquivos de implementação ausentes |

