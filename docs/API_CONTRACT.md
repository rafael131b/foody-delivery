# Mini Rastreador de Pedidos — Contrato da API

## Convenções

- Base URL local: `http://localhost:8080/api`
- Formato: `application/json; charset=utf-8`
- IDs: UUID (ou o tipo único escolhido pela implementação)
- Datas: ISO-8601 UTC, por exemplo `2026-10-17T12:30:00Z`
- Autenticação: `Authorization: Bearer <jwt>` em todas as rotas de pedidos
- Campos desconhecidos devem ser ignorados ou rejeitados de forma consistente; não devem alterar dados.

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

Resposta `201 Created`:

```json
{
  "id": "user-id",
  "name": "Maria Silva",
  "email": "maria@example.com"
}
```

Não retornar senha ou hash. E-mail duplicado: `409 Conflict`. Dados inválidos: `400 Bad Request`.

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
{
  "token": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 7200,
  "user": {
    "id": "user-id",
    "name": "Maria Silva",
    "email": "maria@example.com"
  }
}
```

Credenciais inválidas: `401 Unauthorized`.

## Pedidos

### `POST /orders`

Cria um pedido para o usuário autenticado. O servidor define `id`, `status`, `createdAt` e `updatedAt`.

Request:

```json
{
  "customerName": "Maria Silva",
  "deliveryAddress": "Rua das Flores, 100, São Paulo - SP",
  "items": [
    {
      "name": "Hambúrguer clássico",
      "quantity": 2
    },
    {
      "name": "Batata frita",
      "quantity": 1
    }
  ]
}
```

Regras: `items` deve conter pelo menos um item; `quantity` deve ser maior que zero. Resposta `201 Created`:

```json
{
  "id": "order-id",
  "customerName": "Maria Silva",
  "deliveryAddress": "Rua das Flores, 100, São Paulo - SP",
  "status": "RECEBIDO",
  "items": [
    { "id": "item-id", "name": "Hambúrguer clássico", "quantity": 2 },
    { "id": "item-id-2", "name": "Batata frita", "quantity": 1 }
  ],
  "createdAt": "2026-10-17T12:30:00Z",
  "updatedAt": "2026-10-17T12:30:00Z"
}
```

### `GET /orders`

Lista pedidos acessíveis ao usuário autenticado, ordenados por `createdAt` decrescente. Resposta `200 OK`:

```json
[
  {
    "id": "order-id",
    "customerName": "Maria Silva",
    "deliveryAddress": "Rua das Flores, 100, São Paulo - SP",
    "status": "EM_PREPARO",
    "items": [{ "id": "item-id", "name": "Hambúrguer clássico", "quantity": 2 }],
    "createdAt": "2026-10-17T12:30:00Z",
    "updatedAt": "2026-10-17T12:35:00Z"
  }
]
```

Paginação é opcional para o desafio; se implementada, usar `page`, `size` e `sort` sem alterar o formato básico sem documentação adicional.

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

Resposta `200 OK`: objeto completo do pedido com `status` e `updatedAt` atualizados. Status desconhecido ou transição inválida: `400` ou `409`, respectivamente. Pedido inexistente: `404`.

## Erros padronizados

Exemplo:

```json
{
  "timestamp": "2026-10-17T12:40:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication is required",
  "path": "/api/orders"
}
```

Códigos esperados:

| Código | Uso |
|---|---|
| `400` | JSON inválido, campo obrigatório ausente ou validação falhou |
| `401` | Token ausente, inválido ou expirado |
| `404` | Usuário/pedido não encontrado |
| `409` | E-mail duplicado ou transição de status inválida |
| `500` | Erro inesperado, sem expor stack trace |

## CORS e segurança do contrato

Configurar a origem permitida por variável de ambiente, com `http://localhost:3000` e `http://localhost:5173` como opções locais documentadas. Permitir `GET`, `POST`, `PATCH`, `OPTIONS`, `Content-Type` e `Authorization`. Não incluir senha, hash ou segredo nas respostas e não colocar JWT em URL, query string ou logs.

## Critérios de aceite da API

- Cadastro retorna `201`, login retorna JWT e pedidos sem JWT retornam `401`.
- O pedido criado inicia sempre em `RECEBIDO`.
- O frontend consegue criar e listar pedidos usando os payloads acima.
- A consulta por ID retorna o objeto completo ou `404`.
- Apenas as cinco strings do enum são aceitas.
- Transições válidas funcionam; saltos, reversões e alteração de estados finais falham com `409`.
- Validações de nome, e-mail, senha, endereço e itens retornam `400` com mensagem útil.
- Nenhum endpoint retorna `passwordHash`.
