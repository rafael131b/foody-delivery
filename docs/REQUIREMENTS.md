# Requisitos do desafio e implementação

Este documento registra o enunciado fornecido pelo candidato e relaciona cada obrigação à implementação. O objetivo é facilitar a avaliação do mini rastreador de pedidos.

## Requisitos obrigatórios

| Requisito do enunciado | Implementação | Onde conferir |
|---|---|---|
| Cadastro com nome, e-mail e senha | `POST /api/auth/register`, validação de entrada e hash BCrypt | `AuthController`, `AuthService` e `AuthControllerIntegrationTest` |
| Login com e-mail e senha | `POST /api/auth/login`, emissão de JWT | `AuthService` e testes de autenticação |
| Apenas usuários autenticados acessam o sistema | Tela de login e endpoints de pedidos protegidos | `SecurityConfig`, `App.jsx` e `OrderControllerIntegrationTest` |
| API REST em Java e Spring Boot | Java 17, Spring Boot, controllers e DTOs | `backend/pom.xml` e Swagger |
| Criar pedido com cliente, itens e endereço | `POST /api/orders` | `OrderController`, `OrderDtos` e teste E2E |
| Atualizar status com os cinco valores especificados | `PATCH /api/orders/{id}/status`; `RECEBIDO`, `EM_PREPARO`, `SAIU_PARA_ENTREGA`, `ENTREGUE`, `CANCELADO` | `OrderStatus`, `OrderService` e testes de transição |
| Listar pedidos e buscar por ID | `GET /api/orders` e `GET /api/orders/{id}` | Swagger e testes de integração |
| Persistência em SQLite ou similar | SQLite em arquivo local e migrações Flyway | `application.properties`, migrações e configuração de `DB_PATH` no README |
| React para listar status e criar pedidos | Lista paginada, formulário de criação e atualização de status | `OrdersPage`, `OrderForm` e `frontend/e2e/order-flow.spec.js` |
| Repositório Git com histórico de commits | Histórico versionado no repositório | `git log --oneline` e pull requests no GitHub |

## Decisões de escopo

- **SQLite atende expressamente ao enunciado.** Ele simplifica a execução do teste sem exigir um servidor de banco separado. A escolha não é uma pendência para substituição por PostgreSQL.
- O enunciado deixa a forma de autenticação livre. A solução usa JWT e BCrypt.
- A listagem foi interpretada como os pedidos da conta autenticada. Buscar ou alterar um pedido de outra conta retorna `404`; não existe papel de administrador com visão global.
- Os itens são texto livre, normalmente um por linha. O enunciado não pede catálogo, preços, pagamentos, gestão de motoboys ou associação de entregadores.
- O requisito de versionamento pede histórico de commits. Não determina nomes de branches ou o fluxo `feature → release → master`.
- Paginação no backend, complemento, Swagger, CI e E2E são complementos à entrega.

## Roteiro rápido para avaliação

1. Siga as instruções de [como executar no README](../README.md#como-executar).
2. Abra a aplicação, clique em **Cadastre-se** e crie uma conta com dados fictícios.
3. Crie um pedido, confira a listagem e avance seu status.
4. Consulte o pedido por ID no Swagger usando o token obtido no login.
5. Se quiser, confira os registros em `backend/orders.db` com qualquer cliente SQLite (por exemplo, DB Browser for SQLite ou a extensão SQLite do VS Code) e a cobertura em [QA](QA_CHECKLIST.md).

Os resultados de testes registrados no QA têm data e ambiente; requisitos implementados não significam que todos os cenários possíveis foram testados.
