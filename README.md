# Foody Delivery — Mini rastreador de pedidos

Aplicação web para cadastro e autenticação de usuários e acompanhamento de pedidos de delivery. Cada pedido pertence ao usuário que o criou, e o andamento é controlado por etapas validadas pela API. O projeto combina API REST Java/Spring Boot, interface React e banco SQLite. A execução local usa o Maven Wrapper para a API e o Vite para o frontend.

## Índice

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura](#estrutura)
- [Pré-requisitos](#pré-requisitos)
- [Como executar](#como-executar)
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

Não fazem parte deste mini rastreador catálogo de produtos/restaurantes, preços, pagamentos, cálculo de frete, notificações, múltiplos perfis ou atualização em tempo real. Os itens do pedido são texto livre, normalmente um por linha.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Backend | Java 17, Spring Boot 3, Spring Web, Spring Security, Spring Data JPA, Hibernate, Flyway, SQLite, JWT (JJWT), BCrypt, springdoc-openapi |
| Frontend | React 19, Vite 8, JavaScript, ESLint e Prettier |
| E2E / CI | Playwright + Chromium, GitHub Actions |

## Estrutura

```text
.
├── backend/
│   ├── src/main/java/       # API, autenticação, pedidos, segurança e regras
│   ├── src/main/resources/  # Configuração e migrações Flyway
│   ├── src/test/            # Testes unitários e de integração
│   ├── pom.xml
│   └── mvnw / mvnw.cmd      # Maven Wrapper
├── frontend/
│   ├── src/                 # Aplicação React, componentes, páginas e estilos
│   ├── e2e/                 # Cenários Playwright
│   ├── package.json
│   └── playwright.config.js
├── docs/                    # Contrato, arquitetura, QA e segurança/deploy
└── README.md
```

## Pré-requisitos

JDK 17, Node.js 22 e npm. Maven não precisa estar instalado globalmente: o wrapper (`mvnw` / `mvnw.cmd`) baixa a versão Maven configurada. Na primeira execução, Maven e npm precisam conseguir baixar suas dependências.

## Como executar

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

No primeiro acesso, clique em **Cadastre-se** e crie sua conta. Não há senha de administrador predefinida.

Para usar frontend e API em origens diferentes, configure uma allowlist CORS no backend ou no proxy. O repositório não fornece uma allowlist pronta; o caminho padrão de desenvolvimento é usar o proxy do Vite.

### 3. Parar e persistir

Pare cada processo com `Ctrl+C`. A próxima inicialização reutiliza `backend/orders.db`. Para começar do zero, pare a API e remova esse arquivo manualmente; isso apaga os dados locais.

Para inspecionar o banco, abra `backend/orders.db` com qualquer cliente SQLite (por exemplo, DB Browser for SQLite ou a extensão SQLite do VS Code), de preferência com a API parada ou em modo somente leitura. O projeto não fornece ferramenta própria para isso.

## Configuração

### Backend

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_PATH` | `orders.db` | Caminho do arquivo SQLite, relativo ao diretório de execução ou absoluto. |
| `JWT_SECRET` | Segredo padrão apenas para desenvolvimento | Chave para assinatura JWT. Troque por um segredo aleatório e exclusivo em produção. O perfil `prod` recusa segredos curtos ou placeholders conhecidos. |
| `JWT_EXPIRATION_MS` | `86400000` (24 horas) | Validade do token em milissegundos. |
| `SERVER_PORT` | `8080` | Porta HTTP do Spring Boot. |
| `SPRING_PROFILES_ACTIVE` | Não definido | Perfil Spring; `prod` habilita verificações do segredo de produção. |

As variáveis `DB_PATH`, `JWT_SECRET` e `JWT_EXPIRATION_MS` são opcionais e lidas por `backend/src/main/resources/application.properties`. Defina-as no terminal da API antes de iniciá-la. Os exemplos partem da raiz do repositório; o segredo abaixo é apenas ilustrativo.

**Windows PowerShell**

```powershell
$env:DB_PATH = "orders.db"
$env:JWT_SECRET = "substitua-por-um-segredo-aleatorio-com-ao-menos-32-bytes"
$env:JWT_EXPIRATION_MS = "86400000"
Set-Location .\backend
.\mvnw.cmd spring-boot:run
```

**macOS / Linux**

```bash
export DB_PATH=orders.db
export JWT_SECRET='substitua-por-um-segredo-aleatorio-com-ao-menos-32-bytes'
export JWT_EXPIRATION_MS=86400000
cd backend && ./mvnw spring-boot:run
```

### Frontend

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `/api` | Base das chamadas HTTP. O Vite encaminha `/api` para a API local. É variável de build, não coloque segredos nela. |

O JWT do navegador fica somente em memória React, não em `localStorage` nem `sessionStorage`; recarregar ou fechar a página exige novo login.

## API

As rotas públicas são cadastro e login. Todas as rotas de pedido exigem `Authorization: Bearer <token>`.

| Método | Rota | Acesso | Resultado |
|---|---|---|---|
| `POST` | `/api/auth/register` | Público | Cria conta e devolve JWT (`201`). |
| `POST` | `/api/auth/login` | Público | Autentica e devolve JWT (`200`). |
| `POST` | `/api/orders` | JWT | Cria pedido em `RECEBIDO` (`201`). |
| `GET` | `/api/orders` | JWT | Lista pedidos paginados, com filtro por status e busca por ID ou nome do cliente. |
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

`GET /api/orders` aceita `page` (inicia em zero, padrão 0), `size` (padrão 10, de 1 a 100) `status` opcional e `q` opcional (até 100 caracteres) para buscar por nome do cliente (parcial, sem diferenciar maiúsculas) ou por número do pedido (`12`, `#12` ou `#0012`). Exemplo: `GET /api/orders?page=0&size=10&status=EM_PREPARO&q=maria`. A resposta inclui `content`, dados da página (`page`, `size`, `totalElements`, `totalPages`, `first`, `last`) e `statusCounts` para todos os status do usuário, mesmo com filtro ou busca aplicados.

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
- Flyway aplica migrações versionadas ao iniciar; Hibernate não altera o esquema.
- `V1` cria o esquema legado e `V2` associa pedidos aos usuários, preservando registros que podem ser associados.
- Nome, endereço, complemento e itens ficam em texto claro no arquivo SQLite. O arquivo local garante persistência, não criptografia em repouso.

Use `DB_PATH` para escolher outro arquivo SQLite. Preserve o arquivo entre reinicializações e faça backups consistentes antes de alterações importantes.

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

Para executar E2E, use JDK 17, Node.js 22 e Chromium. Inicie a API e o frontend localmente, em terminais separados, antes de rodar o Playwright. Reserve as portas 8080 e 3000 e use um `DB_PATH` descartável para não alterar `backend/orders.db`.

**1. API — Windows PowerShell**, a partir da raiz:

```powershell
$env:DB_PATH = Join-Path ([System.IO.Path]::GetTempPath()) ("foody-e2e-" + [guid]::NewGuid().ToString() + ".db")
Set-Location .\backend
.\mvnw.cmd spring-boot:run
```

**API — macOS / Linux**, a partir da raiz:

```bash
export DB_PATH="$(mktemp -d)/foody-e2e.db"
cd backend && ./mvnw spring-boot:run
```

Guarde o caminho gerado para removê-lo manualmente após encerrar os processos. Aguarde a API responder em `http://127.0.0.1:8080/v3/api-docs`.

**2. Frontend**, em outro terminal, a partir da raiz:

```bash
cd frontend
npm ci
npm run dev -- --port 3000 --strictPort
```

**3. Playwright**, em um terceiro terminal, na pasta `frontend`:

```bash
npx playwright install chromium
npm run test:e2e
```

O Playwright usa `E2E_BASE_URL` ou `http://127.0.0.1:3000`. Se usar outra porta do Vite, defina `$env:E2E_BASE_URL = "http://127.0.0.1:5173"` no PowerShell ou `export E2E_BASE_URL=http://127.0.0.1:5173` no bash antes de executar a suíte. `E2E_API_URL` aponta para `http://127.0.0.1:8080` por padrão; ao mudar a porta da API, ajuste também o proxy do Vite.

Ao terminar, pare os processos com `Ctrl+C` e remova apenas o arquivo SQLite descartável e seu diretório temporário, se criado.

O Playwright está fixado no `package-lock.json` e é instalado por `npm ci`. Os cenários cobrem Swagger, cadastro, criação e atualização do pedido, sessão em memória após recarga, paginação, filtro (inclusive selecionar novamente a etapa ativa), isolamento entre contas, busca e persistência dos pedidos consultada pela API.

A política `.gitattributes` mantém arquivos de texto em LF e scripts Windows em CRLF. Em um checkout antigo, execute `npm run format` no frontend e `./mvnw spotless:apply` no backend para normalizar os arquivos antes dos checks; no PowerShell use `.\mvnw.cmd spotless:apply`.

### GitHub Actions

`.github/workflows/ci.yml` roda em pull requests e pushes à branch `main` e manualmente. Verifica formatação e testes backend, lint/formatação/build frontend e E2E. Para o E2E, a API é iniciada pelo Maven Wrapper e o frontend pelo Vite na porta 3000, diretamente no runner, com um arquivo SQLite descartável. Há CI, mas não há publicação ou deploy automático (CD) configurado.

## Segurança e limites conhecidos

- Use contas e pedidos fictícios no desenvolvimento. SQLite não criptografa dados em repouso.
- O segredo JWT padrão é somente para desenvolvimento. Em ambiente publicado, configure `SPRING_PROFILES_ACTIVE=prod` e um `JWT_SECRET` aleatório, exclusivo e com ao menos 32 bytes. Não versione segredos nem os inclua em variáveis `VITE_*`.
- O token expira conforme `JWT_EXPIRATION_MS` (24 horas por padrão). A sessão no frontend é em memória e termina ao atualizar ou fechar a página; isso não elimina risco de XSS enquanto a sessão está aberta.
- O proxy do Vite mantém as chamadas `/api` na origem do frontend durante o desenvolvimento. No deploy, sirva `frontend/dist` atrás de um proxy reverso que encaminhe `/api` para a API. Em origens separadas, configure CORS com allowlist antes de publicar.
- Ao inspecionar `orders.db` com um cliente SQLite, lembre que o arquivo contém dados pessoais dos pedidos e hashes de senha; não o publique nem o versione.
- Não estão implementados pagamento, perfis/RBAC, refresh ou revogação de JWT, criptografia SQLite, CD, nem configuração completa de TLS, proxy público e backups de produção.

## Documentação complementar

- [Requisitos do desafio e implementação](docs/REQUIREMENTS.md)
- [Contrato da API](docs/API_CONTRACT.md)
- [Arquitetura e modelo de dados](docs/ARCHITECTURE.md)
- [Checklist de QA](docs/QA_CHECKLIST.md)
- [Segurança e deploy](docs/SECURITY_DEPLOY.md)
