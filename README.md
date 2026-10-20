# Foody Delivery — Mini rastreador de pedidos

Aplicação web para cadastro e autenticação de usuários e acompanhamento de pedidos de delivery. Cada pedido pertence ao usuário que o criou, e o andamento é controlado por etapas validadas pela API. O projeto combina API REST Java/Spring Boot, interface React e banco SQLite. Pode ser executado localmente sem Docker ou como uma stack com Docker Compose.

## Índice

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura](#estrutura)
- [Pré-requisitos](#pré-requisitos)
- [Executar sem Docker](#executar-sem-docker)
- [Executar com Docker Compose](#executar-com-docker-compose)
- [Configuração](#configuração)
- [API](#api)
- [Persistência](#persistência-e-migrações)
- [Testes e CI](#testes-qualidade-e-ci)
- [Segurança e limites](#segurança-e-limites-conhecidos)
- [Documentação complementar](#documentação-complementar)

## Funcionalidades

O enunciado exige autenticação, API Java/Spring Boot, persistência SQLite ou similar, frontend React e histórico Git. Consulte a [matriz de requisitos](docs/REQUIREMENTS.md) para localizar cada implementação e suas evidências.

- Cadastro e login com e-mail e senha; o cadastro também autentica e devolve um JWT.
- Senhas armazenadas com hash BCrypt; senha e hash nunca são retornados pela API.
- Criação de pedidos com cliente, endereço, complemento opcional e itens em texto livre.
- Listagem paginada, filtro por status, contagem por etapa e consulta por ID.
- Atualização de status respeitando as transições de negócio.
- Isolamento por usuário: cada conta só lista, consulta e altera seus próprios pedidos.
- Interface responsiva com identidade visual Foody Delivery e documentação interativa Swagger.
- Stack Compose opcional com API, frontend servido por Nginx e visualizador SQLite local somente leitura.

Não fazem parte deste mini rastreador catálogo de produtos/restaurantes, preços, pagamentos, cálculo de frete, notificações, múltiplos perfis ou atualização em tempo real. Os itens do pedido são texto livre, normalmente um por linha.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Backend | Java 17, Spring Boot 3, Spring Web, Spring Security, Spring Data JPA, Hibernate, Flyway, SQLite, JWT (JJWT), BCrypt, springdoc-openapi |
| Frontend | React 19, Vite 8, JavaScript, ESLint e Prettier |
| Containers | Docker Compose, Nginx |
| Visualizador SQLite | Python 3.12, biblioteca padrão `http.server` e SQLite em modo somente leitura |
| E2E / CI | Playwright + Chromium, GitHub Actions |

## Estrutura

```text
.
├── backend/
│   ├── src/main/java/       # API, autenticação, pedidos, segurança e regras
│   ├── src/main/resources/  # Configuração e migrações Flyway
│   ├── src/test/            # Testes unitários e de integração
│   ├── Dockerfile, pom.xml
│   └── mvnw / mvnw.cmd      # Maven Wrapper
├── frontend/
│   ├── src/                 # Aplicação React, componentes, páginas e estilos
│   ├── e2e/                 # Cenários Playwright
│   ├── Dockerfile, nginx.conf, package.json
│   └── playwright.config.js
├── infra/
│   ├── docker-compose.yml
│   └── sqlite-viewer/       # Visualizador local read-only
├── docs/                    # Contrato, arquitetura, QA e segurança/deploy
└── README.md
```

## Pré-requisitos

**Sem Docker:** JDK 17, Node.js 22 e npm. Maven não precisa estar instalado globalmente: o wrapper (`mvnw` / `mvnw.cmd`) baixa a versão Maven configurada. Na primeira execução, Maven e npm precisam conseguir baixar suas dependências.

**Com Docker:** Docker Desktop ou Docker Engine e Docker Compose v2 (`docker compose`). Para apenas iniciar a aplicação em containers, não é preciso instalar Java, Node.js ou Python no host.

## Executar sem Docker

Inicie a API e o frontend em terminais separados. O proxy de desenvolvimento do Vite encaminha `/api` para `http://localhost:8080`, portanto este fluxo não exige configuração de CORS.

### 1. API

Na raiz do repositório:

**Windows PowerShell**

```powershell
Set-Location .\backend
.\mvnw.cmd spring-boot:run
```

**macOS / Linux**

```bash
cd backend
./mvnw spring-boot:run
```

A API responde em `http://localhost:8080`. O banco padrão é `backend/orders.db` (relativo ao diretório de execução `backend`) e as migrações são aplicadas automaticamente na inicialização.

### 2. Frontend

Em outro terminal, a partir da raiz:

```bash
cd frontend
npm ci
npm run dev
```

Abra a URL impressa pelo Vite, normalmente `http://localhost:5173`. Mantenha o processo da API ativo. Se mudar a porta da API, ajuste o proxy em `frontend/vite.config.js` para apontar para ela.

No primeiro acesso, clique em **Cadastre-se** e crie sua conta. Não há senha de administrador predefinida. Contas criadas no Docker não são copiadas para o banco local; cada ambiente mantém seus próprios usuários e pedidos.

Para usar frontend e API em origens diferentes, configure uma allowlist CORS no backend ou no proxy. O repositório não fornece uma allowlist pronta; o caminho padrão de desenvolvimento é usar o proxy do Vite.

### 3. Parar e persistir

Pare cada processo com `Ctrl+C`. A próxima inicialização reutiliza `backend/orders.db`. Para começar do zero, pare a API e remova esse arquivo manualmente; isso apaga os dados locais.

## Executar com Docker Compose

Na raiz do projeto, construa e inicie os três serviços:

```bash
docker compose -f infra/docker-compose.yml up --build -d
```

No PowerShell, use o mesmo comando. Na primeira inicialização, aguarde o backend aplicar as migrações. Endereços:

| Serviço | Endereço | Descrição |
|---|---|---|
| Aplicação | [http://localhost:3000](http://localhost:3000) | React servido pelo Nginx |
| API | [http://localhost:8080/api](http://localhost:8080/api) | Base REST |
| Swagger UI | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) | Explorar e chamar endpoints |
| OpenAPI JSON | [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs) | Definição OpenAPI |
| Visualizador SQLite | [http://localhost:8081](http://localhost:8081) | Estrutura e até 100 registros por tabela |

Abra a aplicação e crie uma conta em **Cadastre-se**. O comando padrão não exige configurar `.env`. Se a API local estiver rodando sem Docker na porta 8080, encerre-a com `Ctrl+C` antes de iniciar o Compose, ou personalize `BACKEND_PORT` como descrito abaixo.

O Nginx encaminha `/api` ao serviço `backend` pela rede Compose. O visualizador monta o volume SQLite somente leitura, oculta o valor do hash de senha e publica a porta apenas em `127.0.0.1`. Ele pode exibir “Banco ainda não disponível” antes de a API criar o arquivo; aguarde e atualize. Não exponha a porta 8081 publicamente: a página mostra dados pessoais de pedidos.

O banco do Compose é o volume nomeado `foody-sqlite`, independente de `backend/orders.db`. Parar preservando os dados:

```bash
docker compose -f infra/docker-compose.yml down
```

Ver logs:

```bash
docker compose -f infra/docker-compose.yml logs -f
```

Apagar também o volume e os dados persistidos:

```bash
docker compose -f infra/docker-compose.yml down -v
```

`down -v` é destrutivo para o banco do Compose. Ele não remove o arquivo local `backend/orders.db`.

### Personalizar o Compose

O repositório inclui `infra/.env.example`. Copie-o para `infra/.env`, substitua o valor demonstrativo de `JWT_SECRET` por um segredo local e passe o arquivo explicitamente. `infra/.env` é ignorado pelo Git:

PowerShell: `Copy-Item infra/.env.example infra/.env`. macOS/Linux: `cp infra/.env.example infra/.env`.

```dotenv
FRONTEND_PORT=3000
BACKEND_PORT=8080
SQLITE_VIEWER_PORT=8081
DB_PATH=/data/foody.db
JWT_EXPIRATION_MS=86400000
JWT_SECRET=troque-por-um-segredo-local-forte
SPRING_PROFILES_ACTIVE=local
```

```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml up --build -d
docker compose --env-file infra/.env -f infra/docker-compose.yml down
```

Se alterar `DB_PATH` no Compose, mantenha-o dentro de `/data`, que é o diretório compartilhado pela API e pelo visualizador.

## Configuração

### Backend

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_PATH` | `orders.db` | Caminho do arquivo SQLite; no Compose, `/data/foody.db`. |
| `JWT_SECRET` | Segredo demonstrativo local | Chave para assinatura JWT. Use segredo aleatório e exclusivo fora do desenvolvimento. O perfil `prod` recusa segredos curtos ou placeholders conhecidos. |
| `JWT_EXPIRATION_MS` | `86400000` (24 horas) | Validade do token em milissegundos. |
| `SERVER_PORT` | `8080` | Porta HTTP do Spring Boot. |
| `SPRING_PROFILES_ACTIVE` | Não definido ao executar diretamente; `local` no Compose | Perfil Spring; `prod` habilita verificações do segredo de produção. |

### Frontend e Compose

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `/api` | Base das chamadas HTTP. O Vite encaminha `/api` para a API local; o Nginx do container encaminha para `backend`. É variável de build, não coloque segredos nela. |
| `FRONTEND_PORT` | `3000` | Porta do frontend no host. |
| `BACKEND_PORT` | `8080` | Porta da API no host. |
| `SQLITE_VIEWER_PORT` | `8081` | Porta do visualizador, sempre vinculada ao loopback. |
| `BACKEND_IMAGE`, `FRONTEND_IMAGE`, `SQLITE_VIEWER_IMAGE` | Imagens `foody-*:local` | Nomes opcionais para as imagens do Compose. |

O JWT do navegador fica somente em memória React, não em `localStorage` nem `sessionStorage`; recarregar ou fechar a página exige novo login.

## API

As rotas públicas são cadastro e login. Todas as rotas de pedido exigem `Authorization: Bearer <token>`.

| Método | Rota | Acesso | Resultado |
|---|---|---|---|
| `POST` | `/api/auth/register` | Público | Cria conta e devolve JWT (`201`). |
| `POST` | `/api/auth/login` | Público | Autentica e devolve JWT (`200`). |
| `POST` | `/api/orders` | JWT | Cria pedido em `RECEBIDO` (`201`). |
| `GET` | `/api/orders` | JWT | Lista pedidos paginados, opcionalmente filtrados. |
| `GET` | `/api/orders/{id}` | JWT | Consulta pedido pertencente à conta. |
| `PATCH` | `/api/orders/{id}/status` | JWT | Atualiza status se a transição for válida. |

Exemplo de cadastro:

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "password": "senha-segura"
}
```

Resposta:

```json
{
  "token": "<jwt>",
  "name": "Maria Silva",
  "email": "maria@example.com"
}
```

Exemplo de pedido (enviar o token no cabeçalho `Authorization`):

```json
{
  "customer": "Maria Silva",
  "deliveryAddress": "Rua das Flores, 100, São Paulo - SP",
  "complement": "Bloco B, ap. 32",
  "items": "2x Hambúrguer clássico\n1x Batata frita"
}
```

O servidor define ID, data de criação, responsável e status inicial. Limites: nome 120 caracteres, e-mail 254, senha no mínimo 8, cliente 120, endereço 500, complemento opcional 200 e itens 2000.

`GET /api/orders` aceita `page` (inicia em zero, padrão 0), `size` (padrão 10, de 1 a 100) e `status` opcional. Exemplo: `GET /api/orders?page=0&size=10&status=EM_PREPARO`. A resposta inclui `content`, dados da página (`page`, `size`, `totalElements`, `totalPages`, `first`, `last`) e `statusCounts` para todos os status do usuário, mesmo com filtro aplicado.

Transições disponíveis:

| Status atual | Próximo status permitido |
|---|---|
| `RECEBIDO` | `EM_PREPARO` ou `CANCELADO` |
| `EM_PREPARO` | `SAIU_PARA_ENTREGA` ou `CANCELADO` |
| `SAIU_PARA_ENTREGA` | `ENTREGUE` |
| `ENTREGUE` ou `CANCELADO` | Nenhum (estado final) |

`ENTREGUE` e `CANCELADO` são finais. Saltos, reversões e repetição de status retornam `409`. Dados inválidos retornam `400`; credenciais inválidas ou token ausente/inválido retornam `401`; pedido inexistente ou de outra conta retorna `404`; e-mail duplicado retorna `409`.

No Swagger, execute `POST /api/auth/register` ou `POST /api/auth/login`, copie o campo `token` e clique em **Authorize** para chamar endpoints protegidos. A definição da API configura autenticação Bearer JWT.

## Persistência e migrações

- Execução local: SQLite em `backend/orders.db` por padrão.
- Compose: SQLite em `/data/foody.db`, no volume persistente `foody-sqlite`.
- Flyway aplica migrações versionadas ao iniciar; Hibernate não altera o esquema.
- `V1` cria o esquema legado e `V2` associa pedidos aos usuários, preservando registros que podem ser associados.
- Nome, endereço, complemento e itens ficam em texto claro no arquivo SQLite. O volume garante persistência, não criptografia em repouso.

A base local e o volume Docker são independentes: apagar um não apaga o outro.

## Testes, qualidade e CI

Os comandos seguintes são opcionais para apenas executar o produto.

### Backend

Na pasta `backend`:

```bash
./mvnw -B spotless:check test
```

No Windows PowerShell:

```powershell
.\mvnw.cmd -B spotless:check test
```

Para aplicar a formatação Java: `./mvnw spotless:apply` (ou `.\mvnw.cmd spotless:apply` no PowerShell).

### Frontend

Na pasta `frontend`:

```bash
npm ci
npm run lint
npm run format:check
npm run build
```

`npm run format` aplica Prettier aos arquivos configurados.

### Playwright E2E

Para executar E2E, inicie uma stack Docker Compose de teste chamada `foody-e2e`. É necessário Docker ativo, Node.js 22 e Chromium. O nome separa containers e volume, mas as portas padrão continuam sendo 3000, 8080 e 8081: elas precisam estar livres. Pare a stack normal com `docker compose -f infra/docker-compose.yml down` (preserva seus dados) e encerre a API local antes de executar os comandos abaixo, na raiz:

```bash
docker compose -p foody-e2e -f infra/docker-compose.yml up --build -d
cd frontend
npm ci
npx playwright install chromium
npm run test:e2e
```

Depois, volte à raiz para parar e remover a stack e o banco descartável:

```bash
cd ..
docker compose -p foody-e2e -f infra/docker-compose.yml down -v
```

O Playwright está fixado no `package-lock.json` e é instalado por `npm ci`. Os cenários cobrem Swagger, cadastro, criação e atualização do pedido, sessão em memória após recarga, paginação, filtro (inclusive selecionar novamente a etapa ativa), isolamento entre contas e visualizador SQLite.

A política `.gitattributes` mantém arquivos de texto em LF e scripts Windows em CRLF. Em um checkout antigo, execute `npm run format` no frontend e `./mvnw spotless:apply` no backend para normalizar os arquivos antes dos checks; no PowerShell use `.\mvnw.cmd spotless:apply`.

### GitHub Actions

`.github/workflows/ci.yml` roda em pull requests e pushes à branch `main` e manualmente. Verifica formatação e testes backend, lint/formatação/build frontend, build das imagens Docker e E2E. Há CI, mas não há publicação ou deploy automático (CD) configurado.

## Segurança e limites conhecidos

- Use contas e pedidos fictícios no desenvolvimento. SQLite não criptografa dados em repouso.
- O segredo JWT padrão é somente para desenvolvimento. Em ambiente publicado, configure `SPRING_PROFILES_ACTIVE=prod` e um `JWT_SECRET` aleatório, exclusivo e com ao menos 32 bytes. Não versione segredos nem os inclua em variáveis `VITE_*`.
- O token expira conforme `JWT_EXPIRATION_MS` (24 horas por padrão). A sessão no frontend é em memória e termina ao atualizar ou fechar a página; isso não elimina risco de XSS enquanto a sessão está aberta.
- Docker Compose mantém frontend e API na mesma origem por meio do Nginx. Em origens separadas, configure CORS com allowlist antes de publicar.
- O visualizador é ferramenta local de inspeção, não painel administrativo de produção. Ele exibe informações pessoais dos pedidos; mantenha sua porta no loopback.
- Não estão implementados pagamento, perfis/RBAC, refresh ou revogação de JWT, criptografia SQLite, CD, nem configuração completa de TLS, proxy público e backups de produção.

## Documentação complementar

- [Requisitos do desafio e implementação](docs/REQUIREMENTS.md)
- [Contrato da API](docs/API_CONTRACT.md)
- [Arquitetura e modelo de dados](docs/ARCHITECTURE.md)
- [Checklist de QA](docs/QA_CHECKLIST.md)
- [Segurança e deploy](docs/SECURITY_DEPLOY.md)
