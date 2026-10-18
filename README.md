# Foody Delivery — Mini Rastreador de Pedidos

Aplicação simplificada para autenticação e acompanhamento de pedidos de delivery.
Foody Delivery order-tracking application.

## Estrutura

- `backend/`: API REST em Java 17, Spring Boot, JPA e SQLite.
- `frontend/`: aplicação React + Vite.
- `docs/`: arquitetura, contrato da API, QA e segurança/deploy.
- `infra/`: exemplo de variáveis e Docker Compose.

## Executar localmente

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

No Windows, use `mvnw.cmd spring-boot:run`. Se o caminho da pasta tiver acentos e o Java não localizar a classe principal, mapeie temporariamente a pasta do backend para uma letra de unidade antes de iniciar:

```powershell
cd "C:\dev\Teste Técnico\Foody Delivery"
subst Z: "$PWD"
Set-Location Z:\backend
.\mvnw.cmd spring-boot:run
```

Ao encerrar a API com `Ctrl+C`, remova o mapeamento com `subst Z: /d`. O Maven Wrapper baixa a versão necessária automaticamente; é preciso ter Java 17 instalado.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend usa `http://localhost:8080/api` por padrão. Para alterar, copie `.env.example` para `.env` e configure `VITE_API_URL`.

### Docker

Com o Docker Desktop aberto, na raiz do projeto execute:

```bash
docker compose -f infra/docker-compose.yml up --build -d
```

A aplicação não exige arquivo `.env` nem cadastro prévio: crie a conta pela tela de login. Depois de iniciar, abra:

- Aplicação: <http://localhost:3000>
- API: <http://localhost:8080/api>
- Visualizador SQLite (somente leitura): <http://localhost:8081>

As chamadas `/api` do frontend passam pelo Nginx até o backend na rede interna do Compose. Para encerrar, execute `docker compose -f infra/docker-compose.yml down`; o volume do banco será preservado.

O visualizador mostra a estrutura das tabelas e até 100 registros por tabela. Na listagem de pedidos, o responsável aparece pelo nome, obtido pela relação com `users`; o e-mail é usado apenas para login. O visualizador monta o volume do SQLite em modo somente leitura, oculta os valores de `password_hash` e publica a porta apenas no loopback (`127.0.0.1`). Se abrir antes de a API criar o banco na primeira inicialização, atualize a página alguns segundos depois. **Não exponha a porta 8081 em uma rede pública ou ambiente de produção.**

O padrão do banco é `DB_PATH=/data/foody.db`. Se alterar `DB_PATH`, mantenha o arquivo dentro de `/data` para que a API e o visualizador continuem acessando o mesmo volume. Para trocar a porta do visualizador, defina `SQLITE_VIEWER_PORT` no ambiente ou no arquivo `infra/.env` (exemplo: `SQLITE_VIEWER_PORT=8082`). O Compose lê as variáveis de `infra/.env` quando o arquivo Compose está em `infra/`.

Para parar os serviços, pressione `Ctrl+C`; para remover os containers depois de iniciar em segundo plano, use:

```bash
docker compose -f infra/docker-compose.yml down
```

Esse comando preserva o volume `foody-sqlite` e os dados. **Não use `down -v` se quiser manter o banco**, pois essa opção apaga o volume persistente.



O Compose usa um segredo JWT local de desenvolvimento por padrão. Configure um `JWT_SECRET` forte antes de qualquer uso em produção.

## Teste ponta a ponta

O teste de navegador cobre cadastro, criação de pedido, atualização de status, persistência após recarregar e conferência dos registros no visualizador SQLite. No GitHub Actions, ele sobe uma stack Compose isolada e executa o fluxo em Chromium.

Para reproduzir localmente, com Docker Desktop iniciado:

```bash
docker compose -p foody-e2e -f infra/docker-compose.yml up --build -d
cd frontend
npm ci
npm install --no-save --package-lock=false @playwright/test@1.56.1
npx playwright install chromium
npx playwright test --config=playwright.config.js
```

Depois do teste, volte à raiz do repositório e pare a stack:

```bash
docker compose -p foody-e2e -f infra/docker-compose.yml down
```

Use o nome de projeto `foody-e2e` para manter os containers e o volume de teste separados da sua stack de desenvolvimento.
## Escopo entregue

- Cadastro e login com JWT e BCrypt.
- Endpoints protegidos para criar, listar, consultar e atualizar pedidos.
- Status `RECEBIDO`, `EM_PREPARO`, `SAIU_PARA_ENTREGA`, `ENTREGUE` e `CANCELADO`.
- Persistência SQLite.
- Migrações versionadas com Flyway; dados legados de pedidos são associados ao usuário por ID, preservando os registros existentes.
- Validação de transições no backend e complemento opcional no endereço do pedido.
- CI no GitHub Actions: testes do backend, build do frontend e das imagens Docker em PRs e pushes à `main`; CD/deploy não está configurado.
- Interface responsiva alinhada à identidade pública da Foody Delivery, com tipografia Sen, paleta vermelha, logo oficial e cartões/badges de status.

## Referências

A direção visual e o logo foram baseados nos materiais públicos da [Foody Delivery](https://foodydelivery.com/).
