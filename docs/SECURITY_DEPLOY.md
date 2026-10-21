# Segurança e deploy

Este documento separa o que existe hoje das recomendações para produção. A solução foi dimensionada para o desafio técnico e não substitui uma revisão de segurança.

## Variáveis de ambiente

Defina as variáveis no ambiente do processo da API ou no mecanismo de secrets do provedor. Os exemplos para PowerShell e bash estão no [README](../README.md#configuração). Nunca versione valores reais.

Variáveis opcionais lidas por `application.properties`:

- `JWT_SECRET`: segredo para assinatura JWT. O default é apenas para desenvolvimento; troque-o em produção por um segredo aleatório, longo e exclusivo por ambiente.
- `JWT_EXPIRATION_MS`: validade do token em milissegundos (padrão: `86400000`, 24 horas).
- `DB_PATH`: caminho do arquivo SQLite local (padrão: `orders.db`, relativo ao diretório de execução). Em produção, prefira um caminho absoluto em diretório persistente com acesso restrito.

O Spring Boot também aceita `SERVER_PORT` (padrão: `8080`) e `SPRING_PROFILES_ACTIVE`. Use o perfil `prod` no ambiente publicado; ele recusa segredos curtos e placeholders conhecidos.

Em produção, configure `SPRING_PROFILES_ACTIVE=prod` e injete um `JWT_SECRET` aleatório, exclusivo, com pelo menos 32 bytes por Secret Manager, variáveis protegidas do CI/CD ou secrets do ambiente de hospedagem. A inicialização falha se o perfil `prod` receber um segredo curto ou um placeholder conhecido. Não coloque JWT, senhas, tokens ou arquivos `.db` no Git.

## Práticas de segurança

- Implementado: senhas são transformadas com BCrypt e verificadas por comparação de hash; a senha original não é armazenada nem devolvida pela API.
- Valide e normalize e-mail, nome, endereço, itens e status no backend. O frontend não é uma fronteira de segurança.
- Exija autenticação em todos os endpoints de pedidos e valide a identidade/autoridade do usuário em cada operação.
- Implementado: transições de status são validadas no backend e rejeitadas com `409` quando inválidas.
- Use HTTPS no ambiente publicado e configure o proxy para redirecionar HTTP para HTTPS.
- Não retorne senha, hash, segredo JWT ou stack trace na API.
- Limite tamanho de payload, paginação/listagem e tentativas de login quando o ambiente deixar de ser apenas demonstrativo.
- Mantenha dependências atualizadas e execute testes e análise de vulnerabilidades no CI.

## JWT

O login emite um token assinado usando `JWT_SECRET`. A API:

1. verificar assinatura, expiração e algoritmo esperado;
2. extrair apenas o identificador necessário do usuário;
3. rejeitar token ausente, malformado ou expirado com `401 Unauthorized` (coberto por testes de integração);
4. não aceitar segredo ou algoritmo informado pelo cliente.

Para este desafio, o frontend pode enviar `Authorization: Bearer <token>`. Em um produto real, avalie cuidadosamente armazenamento no navegador, rotação/revogação e proteção contra XSS/CSRF.

## CORS

No desenvolvimento, o proxy do Vite encaminha `/api` para a API local. Em produção, sirva `frontend/dist` atrás de um proxy reverso que encaminhe `/api` para o backend, mantendo a mesma origem. Não existe configuração explícita de CORS na aplicação; se as origens forem separadas, configure allowlist no backend/proxy antes de publicar.

## SQLite

- Mantenha o arquivo SQLite local em um diretório persistente escolhido por `DB_PATH`; preserve-o entre reinicializações e atualizações da aplicação.
- O SQLite atual não é criptografado em repouso. Nome, endereço, complemento, itens e metadados ficam legíveis no arquivo. A persistência do arquivo local não garante confidencialidade; use criptografia de disco/host ou implemente proteção adequada antes de armazenar dados reais.
- Restrinja permissões do diretório e faça backup do arquivo com a aplicação parada ou usando uma estratégia consistente.
- SQLite é adequado para o desafio e baixo volume, mas não é a melhor opção para alta concorrência ou múltiplas réplicas.
- Não compartilhe o mesmo arquivo SQLite entre instâncias concorrentes da API.
- Em produção, planeje migração para PostgreSQL antes de escalar horizontalmente.

## Execução local

1. A execução local usa um segredo padrão de desenvolvimento; não o reutilize fora da máquina de desenvolvimento.
2. Para perfil `prod`, configure `SPRING_PROFILES_ACTIVE=prod` e injete um `JWT_SECRET` aleatório e exclusivo.
3. Inicie a API pelo Maven Wrapper conforme o [README](../README.md#como-executar).
4. Inicie o frontend com `npm ci` e `npm run dev` na pasta `frontend`.
5. Use o proxy do Vite para `/api`; em origens distintas, configure uma allowlist CORS no backend ou no proxy.

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

Prepare o artefato Java da API com o Maven Wrapper e construa o frontend com `npm ci` e `npm run build`. Execute a API com Java 17 sob o gerenciador de processos do ambiente de hospedagem e sirva `frontend/dist` atrás de um proxy reverso HTTPS que encaminhe `/api` para a API. Se as origens forem diferentes, configure uma allowlist CORS no backend ou no proxy e a URL pública da API no build do frontend.

Antes de publicar:

- identifique os artefatos pelo commit usado no build;
- forneça os valores reais por secrets do provedor e ative `SPRING_PROFILES_ACTIVE=prod`;
- configure HTTPS, firewall e acesso restrito à API conforme a topologia escolhida;
- preserve o arquivo SQLite local em diretório persistente definido por `DB_PATH`;
- valide health checks, logs e backup;
- faça smoke test de cadastro, login, criação, listagem e atualização de pedido.

O repositório não inclui configuração completa de hospedagem, TLS, observabilidade ou política de backup do provedor.

## Checklist de entrega

- [ ] `JWT_SECRET` real não está no repositório nem nos logs.
- [ ] Senhas são armazenadas com hash e nunca retornadas pela API.
- [ ] Endpoints de pedidos exigem autenticação.
- [ ] CORS está restrito ao domínio do frontend.
- [ ] Entrada e transições de status são validadas no backend.
- [ ] O arquivo SQLite local está em diretório persistente e há procedimento de backup.
- [ ] Frontend foi construído sem segredos embutidos.
- [ ] Artefatos/dependências foram verificados e identificados pelo commit.
- [ ] Smoke test foi executado no ambiente de entrega.
- [ ] Histórico Git contém commits claros e o repositório não inclui `.env`, banco ou artefatos de build.

