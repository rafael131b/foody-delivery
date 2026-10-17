# Mini Rastreador de Pedidos — Arquitetura

## 1. Objetivo e escopo

Aplicação mínima para autenticar usuários e acompanhar pedidos de delivery. O backend expõe uma API REST em Java + Spring Boot; o frontend é uma aplicação React; os dados são persistidos em SQLite.

O escopo inclui cadastro, login, criação de pedido, consulta de pedidos e atualização de status. Não inclui pagamento, catálogo de restaurantes, cálculo de frete, notificações, múltiplos perfis ou atualização em tempo real.

## 2. Arquitetura lógica

```text
React (browser)
       |
       | HTTP/JSON + Bearer JWT
       v
Spring Boot REST API
  ├─ Controllers: autenticação e pedidos
  ├─ Services: regras de negócio e transições de status
  ├─ Repositories: Spring Data JPA
  └─ SQLite: banco local em arquivo
```

### Camadas

- **Controller**: valida entrada HTTP, autenticação e códigos de resposta; não contém regra de negócio.
- **Service**: cria usuários e pedidos, aplica transições de status e controla autorização.
- **Repository**: acesso às entidades via JPA/Hibernate.
- **Security**: Spring Security com JWT stateless; senha armazenada somente como hash BCrypt.
- **DTOs**: contratos de entrada e saída independentes das entidades persistidas.
- **Tratamento de erros**: resposta JSON padronizada com `timestamp`, `status`, `error`, `message` e `path`.

## 3. Modelo de dados mínimo

### User

| Campo | Tipo | Regras |
|---|---|---|
| `id` | UUID ou Long | Chave primária |
| `name` | String | Obrigatório, 2–120 caracteres |
| `email` | String | Obrigatório, válido e único; normalizado para minúsculas |
| `passwordHash` | String | Obrigatório; nunca retornar na API |
| `createdAt` | Instant | Preenchido no servidor |

### Order

| Campo | Tipo | Regras |
|---|---|---|
| `id` | UUID ou Long | Chave primária |
| `customerName` | String | Obrigatório, 2–120 caracteres |
| `deliveryAddress` | String | Obrigatório, 5–300 caracteres |
| `status` | Enum | Obrigatório; inicia em `RECEBIDO` |
| `createdBy` | User | Usuário autenticado que criou o pedido |
| `createdAt` | Instant | Preenchido no servidor |
| `updatedAt` | Instant | Atualizado em cada alteração |

### OrderItem

| Campo | Tipo | Regras |
|---|---|---|
| `id` | UUID ou Long | Chave primária |
| `orderId` | Order | Obrigatório; exclusão em cascata com o pedido |
| `name` | String | Obrigatório, 1–120 caracteres |
| `quantity` | Integer | Obrigatório, inteiro maior que zero |

Uma tabela `order_items` é preferível a serializar itens em uma coluna JSON: mantém a consulta simples, validação explícita e portabilidade JPA. Valores monetários não são necessários no desafio; portanto, não devem ser inventados no contrato.

## 4. Status e transições

Status permitidos: `RECEBIDO`, `EM_PREPARO`, `SAIU_PARA_ENTREGA`, `ENTREGUE`, `CANCELADO`.

Transições mínimas permitidas:

```text
RECEBIDO -> EM_PREPARO
RECEBIDO -> CANCELADO
EM_PREPARO -> SAIU_PARA_ENTREGA
EM_PREPARO -> CANCELADO
SAIU_PARA_ENTREGA -> ENTREGUE
```

`ENTREGUE` e `CANCELADO` são estados finais. Não permitir saltos, reversões ou alterações no pedido depois de um estado final. O endpoint deve responder `409 Conflict` para uma transição inválida.

## 5. Autenticação e autorização

- `POST /api/auth/register` cria o usuário e aplica BCrypt à senha.
- `POST /api/auth/login` valida e-mail/senha e devolve um JWT.
- Todos os endpoints de pedidos exigem `Authorization: Bearer <token>`.
- O JWT deve conter ao menos o identificador do usuário, sujeito (`sub`) e expiração curta (por exemplo, 2 horas).
- Não persistir tokens nem senhas em texto puro.
- Para esta versão, todos os usuários autenticados podem listar, consultar e alterar pedidos. Não há RBAC.

## 6. SQLite e configuração

- Usar um arquivo local, por exemplo `data/foody.db`, excluído do versionamento.
- Configurar o datasource pelo ambiente (`SPRING_DATASOURCE_URL`), mantendo SQLite como padrão local.
- Usar `ddl-auto=update` apenas para facilitar a execução do desafio; em produção, substituir por migrations.
- Habilitar transações nos services de escrita.
- Datas em UTC no banco e em ISO-8601 nas respostas.
- IDs podem ser UUID para evitar dependência de sequência e facilitar exposição segura no frontend.

## 7. CORS

Permitir somente origens configuradas por ambiente, com padrão local `http://localhost:3000` e/ou `http://localhost:5173`, conforme o servidor React usado. Permitir métodos `GET`, `POST`, `PATCH`, `OPTIONS` e os headers `Authorization`, `Content-Type`. Não usar `*` junto com credenciais.

## 8. Identidade visual do Foody Delivery

O frontend deve usar a referência visual do site indicado pelo desafio: interface clara, foco em card/lista de pedidos, acentos em verde associados à marca, cantos arredondados, hierarquia tipográfica simples e estados apresentados como badges. A implementação deve reproduzir a linguagem visual geral sem copiar assets proprietários ou criar dependência do site externo. Cores, logo e fontes devem ficar centralizados em tokens CSS para ajuste rápido.

## 9. Critérios de aceite arquiteturais

- Backend sobe localmente com Java/Spring Boot e cria/usa o arquivo SQLite.
- Usuário consegue cadastrar-se, fazer login e usar o token para acessar pedidos.
- Pedido guarda cliente, endereço, ao menos um item, status e timestamps.
- Status começa em `RECEBIDO` e respeita somente as transições definidas.
- API rejeita requisições sem token com `401` e entradas inválidas com `400`.
- Frontend consegue listar pedidos e criar pedido consumindo exclusivamente a API REST.
- CORS funciona para a origem local configurada sem abrir acesso indiscriminado.
- Segredos e banco local não são commitados; o histórico Git contém commits pequenos e descritivos.

## 10. Fora do escopo e pendências

- Definir se a porta do frontend será 3000 ou 5173 no setup final.
- Escolher UUID ou Long na implementação, mantendo consistência em entidades, DTOs e rotas.
- Adicionar migrações formais e refresh token somente se houver tempo além do escopo do desafio.
- Confirmar, no teste visual, os tokens finais de cor e tipografia a partir da referência do Foody Delivery.
