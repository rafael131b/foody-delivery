# Mini Rastreador de Pedidos — Contrato da API

## Convenções

- Base URL local: `http://localhost:8080/api`
- Interface interativa Swagger: `http://localhost:8080/swagger-ui/index.html` (documentação OpenAPI em `http://localhost:8080/v3/api-docs`)
- Formato: `application/json; charset=utf-8`
- IDs: inteiro (`Long`) gerado pela base
- Datas: ISO-8601 UTC, por exemplo `2026-10-17T12:30:00Z`
- Autenticação: `Authorization: Bearer <jwt>` em todas as rotas de pedidos
- Resposta de erro da aplicação: objeto JSON `{ "error": "..." }`.

## Enum de status

```text
RECEBIDO
EM_PREPARO
SAIU_PARA_ENTREGA
ENTREGUE
CANCELADO
```

Transições válidas:

```text
RECEBIDO -> EM_PREPARO | CANCELADO
EM_PREPARO -> SAIU_PARA_ENTREGA | CANCELADO
SAIU_PARA_ENTREGA -> ENTREGUE
```

## Autenticação

### `POST /auth/register`

Cria um usuário.

Request:

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "password": "senha-segura"
}
```

Resposta `201 Created` (o cadastro também retorna token):

```json
{ "token": "eyJ...", "name": "Maria Silva", "email": "maria@example.com" }
```

Não retornar senha ou hash. E-mail duplicado: `409 Conflict`. Dados inválidos: `400 Bad Request`. O nome aceita até 120 caracteres, o e-mail até 254 e a senha precisa ter pelo menos 8 caracteres.

### `POST /auth/login`

Request:

```json
{
  "email": "maria@example.com",
  "password": "senha-segura"
}
```

Resposta `200 OK`:

```json
{ "token": "eyJ...", "name": "Maria Silva", "email": "maria@example.com" }
```

Credenciais inválidas: `401 Unauthorized`.

## Pedidos

### `POST /orders`

Cria um pedido para o usuário autenticado. O servidor define `id`, `status` (inicialmente `RECEBIDO`) e `createdAt`.

Request:

```json
{
  "customer": "Maria Silva",
  "deliveryAddress": "Rua das Flores, 100, São Paulo - SP",
  "complement": "Bloco B, ap. 32",
  "items": "2x Hambúrguer clássico\\n1x Batata frita"
}
```

`customer` aceita até 120 caracteres, `deliveryAddress` até 500, `complement` é opcional (até 200) e `items` é texto livre (até 2000), normalmente um item por linha. Não há catálogo nem validação de quantidades. `allowedNextStatuses` é calculado pelo backend e representa as próximas transições válidas para o status atual; o backend continua validando qualquer atualização. Resposta `201 Created`:

```json
{
  "id": 1,
  "customer": "Maria Silva",
  "deliveryAddress": "Rua das Flores, 100, São Paulo - SP",
  "complement": "Bloco B, ap. 32",
  "status": "RECEBIDO",
  "responsibleName": "Maria Silva",
  "allowedNextStatuses": ["EM_PREPARO", "CANCELADO"],
  "items": "2x Hambúrguer clássico\\n1x Batata frita",
  "createdAt": "2026-10-17T12:30:00Z"
}
```

### `GET /orders`

Lista pedidos acessíveis ao usuário autenticado, ordenados por `createdAt` decrescente. Aceita `page` (padrão `0`), `size` (padrão `10`, entre `1` e `100`) e `status` opcional. Aceita também `q` opcional (até 100 caracteres; acima disso, `400`): busca o nome do cliente por trecho, sem diferenciar maiúsculas, ou o número do pedido quando `q` é numérico (aceita `#` e zeros à esquerda, ex. `#0012`). `q` combina com `status`; `totalElements` e `totalPages` refletem a busca, e `statusCounts` continua com o total de cada status do usuário. Resposta `200 OK`:

```json
{
  "content": [
    {
      "id": 1,
      "customer": "Maria Silva",
      "deliveryAddress": "Rua das Flores, 100, São Paulo - SP",
      "complement": "Bloco B, ap. 32",
      "status": "EM_PREPARO",
      "responsibleName": "Maria Silva",
      "allowedNextStatuses": ["SAIU_PARA_ENTREGA", "CANCELADO"],
      "items": "2x Hambúrguer clássico",
      "createdAt": "2026-10-17T12:30:00Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true,
  "statusCounts": { "RECEBIDO": 0, "EM_PREPARO": 1, "SAIU_PARA_ENTREGA": 0, "ENTREGUE": 0, "CANCELADO": 0 }
}
```

O status desconhecido ou os parâmetros de paginação inválidos retornam `400 Bad Request`. `statusCounts` informa as contagens de todos os status do usuário, independentemente do filtro aplicado à página.

### `GET /orders/{id}`

Retorna um pedido. Respostas: `200 OK`, `404 Not Found` quando não existe. Não vazar existência de recursos sem autorização: a implementação pode responder `404` para pedido de outro usuário.

### `PATCH /orders/{id}/status`

Atualiza somente o status, respeitando as transições permitidas.

Request:

```json
{
  "status": "EM_PREPARO"
}
```

Resposta `200 OK`: pedido atualizado. Transição inválida (incluindo repetição ou mudança a partir de estado final): `409 Conflict`. Status desconhecido ou ausente: `400 Bad Request`. Pedido inexistente ou pertencente a outro usuário: `404`.

## Formato de erro

Exemplo de erro de validação da aplicação:

```json
{ "error": "Dados inválidos" }
```

Códigos esperados:

| Código | Uso |
|---|---|
| `400` | JSON inválido, campo obrigatório ausente ou validação falhou |
| `401` | Credenciais de login inválidas |
| `401` | Token de acesso ausente, inválido ou expirado |
| `403` | Usuário autenticado sem permissão para o recurso, se houver regras de autorização adicionais |
| `404` | Pedido não encontrado ou não pertence ao usuário autenticado |
| `409` | E-mail duplicado ou transição de status inválida |
| `500` | Erro inesperado, sem expor stack trace |

## CORS e segurança do contrato

No desenvolvimento, o proxy do Vite encaminha `/api` para a API local. No deploy, um proxy reverso pode servir `frontend/dist` e encaminhar `/api`, mantendo a mesma origem. A aplicação não define allowlist CORS; configure uma antes de servir frontend e backend em origens diferentes. Não incluir senha, hash ou segredo nas respostas e não colocar JWT em URL, query string ou logs.

## Critérios de aceite da API

- Cadastro retorna `201`, login retorna JWT e pedidos sem JWT ou com token inválido/expirado retornam `401`.
- O pedido criado inicia sempre em `RECEBIDO`.
- O frontend consegue criar e listar pedidos usando os payloads acima.
- A consulta por ID retorna o objeto completo ou `404`.
- IDs são `Long`; pedidos são isolados por usuário autenticado.
- Itens são texto livre e o complemento é opcional.
- Apenas as cinco strings do enum são aceitas.
- Transições válidas funcionam; saltos, reversões e alteração de estados finais falham com `409`.
- Validações de nome, e-mail, senha, endereço e itens retornam `400` com mensagem útil.
- Nenhum endpoint retorna `passwordHash`.
