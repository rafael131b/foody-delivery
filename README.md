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
docker compose -f infra/docker-compose.yml up --build
```

A interface ficará em `http://localhost:3000`; a API também fica disponível diretamente em `http://localhost:8080`. No frontend em Docker, as chamadas `/api` são encaminhadas ao backend pela rede interna do Compose. Para parar os serviços, pressione `Ctrl+C`; para remover os containers depois de iniciar em segundo plano, use `docker compose -f infra/docker-compose.yml down`.

O Compose usa um segredo JWT local de desenvolvimento por padrão. Configure um `JWT_SECRET` forte antes de qualquer uso em produção.

## Escopo entregue

- Cadastro e login com JWT e BCrypt.
- Endpoints protegidos para criar, listar, consultar e atualizar pedidos.
- Status `RECEBIDO`, `EM_PREPARO`, `SAIU_PARA_ENTREGA`, `ENTREGUE` e `CANCELADO`.
- Persistência SQLite.
- Interface responsiva inspirada na identidade operacional da Foody Delivery: azul-marinho, verde de ação, cartões e badges de status.

## Referências

A direção visual foi baseada na comunicação pública da [Foody Delivery](https://foodydelivery.com/), sem copiar ativos proprietários.
