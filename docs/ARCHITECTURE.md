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
- **Tratamento de erros**: erros da aplicação retornam JSON simples, normalmente `{ "error": "..." }`; erros de autenticação podem vir do Spring Security.

## 3. Modelo de dados mínimo

### User

| Campo | Tipo | Regras |
|---|---|---|
| `id` | Long | Chave primária autoincremental |
| `name` | String | Obrigatório |
| `email` | String | Obrigatório, único; normalizado para minúsculas no cadastro |
| `passwordHash` | String | Hash BCrypt; nunca retornar na API |

### Order

| Campo | Tipo | Regras |
|---|---|---|
| `id` | Long | Chave primária autoincremental |
| `customer` | String | Obrigatório |
| `deliveryAddress` | String | Obrigatório |
| `complement` | String | Opcional, até 200 caracteres |
| `items` | String | Obrigatório, texto livre até 2000 caracteres; normalmente um item por linha |
| `status` | Enum | Obrigatório; inicia em `RECEBIDO` |
| `ownerEmail` | String | E-mail do usuário autenticado que criou o pedido; usado para isolamento |
| `createdAt` | Instant | Preenchido no servidor |

`items` é propositalmente um campo de texto, não uma relação `OrderItem`: este mini rastreador não implementa catálogo, preço ou validação de quantidade.

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
- Cada usuário autenticado lista, consulta e altera somente os pedidos associados ao próprio `ownerEmail`; pedidos de outra conta são ocultados com `404`. Não há perfis/RBAC.

## 6. SQLite e configuração

- A aplicação usa `jdbc:sqlite:${DB_PATH:orders.db}`; no Compose, `DB_PATH` aponta para `/data/foody.db` dentro do volume nomeado `foody-sqlite`.
- Hibernate usa `ddl-auto=update` para criar/atualizar tabelas no desafio; não há ferramenta de migrations.
- Usar `ddl-auto=update` apenas para facilitar a execução do desafio; em produção, substituir por migrations.
- Habilitar transações nos services de escrita.
- `createdAt` é devolvido em ISO-8601. A resposta atual não tem `updatedAt`.
- Senhas são armazenadas como hash BCrypt, não criptografia reversível. JWT é assinado com segredo configurado por `JWT_SECRET`.
- Os campos de pedidos (nome, endereço, complemento e itens) ficam em texto claro no arquivo SQLite. O volume Docker não oferece criptografia em repouso; use dados fictícios no desafio e proteção/criptografia de disco para ambiente real.

## 7. CORS

No Compose, o frontend usa o Nginx como proxy `/api`, portanto browser e API compartilham a origem. Não há configuração explícita de CORS na aplicação; se frontend e backend forem publicados em origens distintas, é necessário implementar uma allowlist antes.

## 8. Identidade visual do Foody Delivery

O frontend usa a identidade vermelha da Foody Delivery, logo oficial, tipografia e uma interface clara com cartões e badges de status. Os assets ficam no próprio projeto para a aplicação não depender do site externo em runtime.

## 9. Critérios de aceite arquiteturais

- Backend sobe localmente com Java/Spring Boot e cria/usa o arquivo SQLite.
- Usuário consegue cadastrar-se, fazer login e usar o token para acessar pedidos.
- Pedido guarda cliente, endereço, complemento opcional, itens em texto livre, status e `createdAt`.
- Status começa em `RECEBIDO` e respeita somente as transições definidas.
- API rejeita requisições sem token com `401` e entradas inválidas com `400`.
- Frontend consegue listar pedidos e criar pedido consumindo exclusivamente a API REST.
- O frontend servido pelo Compose encaminha `/api` ao backend; desenvolvimento separado exige CORS configurado conforme a origem usada.
- Segredos e banco local não são commitados; o histórico Git contém commits pequenos e descritivos.

## 10. Fora do escopo e pendências

- Adicionar migrações formais e refresh token somente se houver tempo além do escopo do desafio.
- Confirmar, no teste visual, os tokens finais de cor e tipografia a partir da referência do Foody Delivery.
