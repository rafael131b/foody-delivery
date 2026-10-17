# Skills instaladas

Registro da revisão e instalação solicitada em 17/10/2026.

## `frontend-design`

- Fonte: `https://github.com/anthropics/skills`
- Skill instalada: `.agents/skills/frontend-design`
- Resultado: instalada com sucesso pelo comando `npx skills add https://github.com/anthropics/skills --skill frontend-design`.
- Escopo: orientação de direção visual, tipografia, paleta, layout, conteúdo, responsividade, acessibilidade e autocrítica visual para interfaces frontend.
- Aplicação neste projeto: deve orientar a interface React/TypeScript do rastreador de pedidos, preservando a identidade visual da Foody Delivery e evitando escolhas genéricas.
- Licença declarada no pacote: `Complete terms in LICENSE.txt`; o arquivo de licença foi incluído na instalação.
- Avaliação do instalador: `Safe`, 0 alertas no Socket, `Low Risk` no Snyk.
- Dependências operacionais adicionais: nenhuma indicada no `SKILL.md`.

## `agent-browser`

- Fonte solicitada: `https://github.com/qu-skills/skills`
- Skill instalada: `.agents/skills/agent-browser`
- Resultado: instalada com sucesso pelo comando `npx skills add https://github.com/qu-skills/skills --skill agent-browser`.
- Escopo: automação de navegador por meio do CLI `belt`/Inference.sh, usando Playwright por baixo, com navegação, snapshots, interação, screenshots, upload, execução de JavaScript e gravação de vídeo.
- Aplicação neste projeto: poderá apoiar validação visual e fluxos de navegador do frontend; não substitui testes E2E versionados no projeto.
- Dependências indicadas pela própria skill: instalar o CLI `belt` (`npx skills add belt-sh/cli`), autenticar com `belt login` e usar o serviço/app `agent-browser` da inference.sh.
- Dependências práticas dos exemplos: comandos Unix como `jq` aparecem nos exemplos; validar disponibilidade no ambiente Windows antes de usar os templates.
- Riscos: a skill declara `allowed-tools: Bash(belt *)` e pode interagir com páginas, executar JavaScript no navegador, fazer uploads e gravar sessões. O instalador reportou `Safe`, 1 alerta no Socket e `High Risk` no Snyk. Não usar com credenciais reais, dados sensíveis ou uploads fora do escopo; revisar cada comando antes da execução.

## Decisão de uso

- As skills foram instaladas, mas não foram executadas contra o projeto nesta etapa.
- Nenhum arquivo de código foi alterado.
- `frontend-design` é aprovada para orientar a implementação visual.
- `agent-browser` fica condicionada à instalação/revisão do `belt`, autenticação explícita e execução somente em ambientes de teste.
- Para testes automatizados reproduzíveis, manter Playwright/Vitest/React Testing Library no próprio repositório; `agent-browser` deve ser complementar para inspeção e validação assistida.

