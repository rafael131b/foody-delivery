# Segurança e deploy

Este documento descreve a configuração mínima recomendada para o Mini Rastreador de Pedidos. A solução foi dimensionada para o desafio técnico e não substitui uma revisão de segurança para produção.

## Variáveis de ambiente

Copie `infra/.env.example` para um arquivo de ambiente local ou para o mecanismo de secrets do provedor. Nunca versione o arquivo com valores reais.

Variáveis esperadas:

- `JWT_SECRET`: segredo aleatório, longo e exclusivo por ambiente. Não use o valor de exemplo.
- `JWT_EXPIRATION_MINUTES`: validade curta do token, por exemplo `60`.
- `CORS_ALLOWED_ORIGINS`: origens explícitas do frontend, separadas por vírgula. Não use `*` quando houver autenticação.
- `SQLITE_DB_PATH`: caminho do arquivo SQLite persistente, como `/data/foody.db`.
- `BACKEND_IMAGE` e `FRONTEND_IMAGE`: imagens publicadas no deploy.
- `BACKEND_PORT` e `FRONTEND_PORT`: portas expostas pelo compose.

Em produção, injete segredos por Secret Manager, variáveis protegidas do CI/CD ou secrets do ambiente de hospedagem. Não coloque JWT, senhas, tokens ou arquivos `.db` no Git.

## Práticas de segurança

- Armazene senhas somente com hash adaptativo seguro (preferencialmente BCrypt/Argon2); nunca salve senha em texto puro nem registre senha em logs.
- Valide e normalize e-mail, nome, endereço, itens e status no backend. O frontend não é uma fronteira de segurança.
- Exija autenticação em todos os endpoints de pedidos e valide a identidade/autoridade do usuário em cada operação.
- O cliente não deve escolher livremente transições de status; valide as transições permitidas no servidor e rejeite valores desconhecidos.
- Use HTTPS no ambiente publicado e configure o proxy para redirecionar HTTP para HTTPS.
- Não retorne senha, hash, segredo JWT ou stack trace na API.
- Limite tamanho de payload, paginação/listagem e tentativas de login quando o ambiente deixar de ser apenas demonstrativo.
- Mantenha dependências atualizadas e execute testes e análise de vulnerabilidades no CI.

## JWT

O login deve emitir um token assinado usando `JWT_SECRET`. A API deve:

1. verificar assinatura, expiração e algoritmo esperado;
2. extrair apenas o identificador necessário do usuário;
3. rejeitar token ausente, malformado ou expirado com `401 Unauthorized`;
4. não aceitar segredo ou algoritmo informado pelo cliente.

Para este desafio, o frontend pode enviar `Authorization: Bearer <token>`. Em um produto real, avalie cuidadosamente armazenamento no navegador, rotação/revogação e proteção contra XSS/CSRF.

## CORS

Configure `CORS_ALLOWED_ORIGINS` com a URL exata do frontend, por exemplo `http://localhost:3000` no desenvolvimento. Não habilite credenciais com origem curinga. Em produção, substitua pelo domínio HTTPS real e permita somente métodos e headers necessários (`GET`, `POST`, `PATCH`/`PUT`, `OPTIONS`, `Content-Type`, `Authorization`).

## SQLite

- Use um volume persistente montado em `/data`; o arquivo não deve ficar apenas no filesystem efêmero do container.
- Restrinja permissões do diretório e faça backup do arquivo com a aplicação parada ou usando uma estratégia consistente.
- SQLite é adequado para o desafio e baixo volume, mas não é a melhor opção para alta concorrência ou múltiplas réplicas.
- Não compartilhe o mesmo arquivo SQLite entre containers concorrentes.
- Em produção, planeje migração para PostgreSQL antes de escalar horizontalmente.

## Execução local

1. Copie `infra/.env.example` para `.env` (ou configure as variáveis na IDE).
2. Gere um `JWT_SECRET` local forte.
3. Inicie a API com o comando documentado pelo agente de backend.
4. Inicie o frontend com o comando documentado pelo agente de frontend.
5. Acesse somente as origens permitidas por CORS.

Não use dados reais de clientes no ambiente local. Para validar autenticação, use uma conta de teste com senha exclusiva.

## Build do frontend

O build deve ser reproduzível e não deve embutir segredos. Variáveis públicas do frontend devem conter apenas a URL pública da API (por exemplo, `VITE_API_URL` ou equivalente); JWT secret e credenciais ficam exclusivamente no backend.

Exemplo genérico:

```bash
npm ci
npm run build
```

Publique apenas o diretório de artefatos gerado pelo build. Sirva arquivos estáticos com um servidor web e configure fallback para `index.html` caso o frontend use roteamento client-side.

## Deploy simplificado

O arquivo `infra/docker-compose.yml` fornece uma referência para executar imagens já construídas da API e do frontend. Antes de usar:

- publique imagens imutáveis com tag de commit;
- forneça os valores reais por secrets do provedor;
- configure um proxy HTTPS na frente do frontend/API;
- monte o volume `foody-sqlite` para preservar os pedidos;
- valide health checks, logs e backup;
- faça smoke test de cadastro, login, criação, listagem e atualização de pedido.

O compose de referência não substitui TLS, firewall, observabilidade ou política de backup do provedor.

## Checklist de entrega

- [ ] `JWT_SECRET` real não está no repositório nem nos logs.
- [ ] Senhas são armazenadas com hash e nunca retornadas pela API.
- [ ] Endpoints de pedidos exigem autenticação.
- [ ] CORS está restrito ao domínio do frontend.
- [ ] Entrada e transições de status são validadas no backend.
- [ ] SQLite está em volume persistente e há procedimento de backup.
- [ ] Frontend foi construído sem segredos embutidos.
- [ ] Imagens/dependências foram verificadas e identificadas pelo commit.
- [ ] Smoke test foi executado no ambiente de entrega.
- [ ] Histórico Git contém commits claros e o repositório não inclui `.env`, banco ou artefatos de build.

