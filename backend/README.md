# Foody Delivery API

## Executar
```bash
./mvnw spring-boot:run
```

No Windows, execute `mvnw.cmd spring-boot:run`. O Maven Wrapper baixa a versão configurada automaticamente; é necessário ter Java 17 instalado. Se o caminho do projeto contiver acentos, siga o mapeamento de unidade descrito no README da raiz.

Endpoints públicos: `POST /api/auth/register` e `POST /api/auth/login`. Os demais exigem `Authorization: Bearer <token>`.

Pedidos: `POST /api/orders`, `GET /api/orders`, `GET /api/orders/{id}` e `PATCH /api/orders/{id}/status` com `{ "status": "EM_PREPARO" }`.

O banco SQLite usa `orders.db` por padrão; configure `DB_PATH` e `JWT_SECRET` em produção.
