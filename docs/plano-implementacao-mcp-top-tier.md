# Plano de Implementacao do AI Architect MCP

## Objetivo

Evoluir o `ai-architect-mcp` de um servidor MCP funcional para um sistema de governanca arquitetural orientado a contexto, capaz de:

- descobrir a stack e a estrutura real de um projeto
- escolher ou confirmar uma arquitetura adequada ao contexto
- materializar a base inicial do projeto com seguranca
- alinhar continuamente a implementacao com metodo de engenharia e regras arquiteturais
- detectar desvios e orientar correcoes antes que a base degrade

## Principios que devem permanecer

Estes pontos fazem parte da identidade do MCP e nao devem ser removidos durante a evolucao:

- `XP` como metodo operacional de desenvolvimento
- `TDD` como estrategia preferencial para mudancas comportamentais
- `Small Releases` como disciplina de entrega frequente e segura
- `Spec-Driven Development` para transformar objetivo em requisitos e backlog executavel
- `Context First` para respeitar stack, restricoes e decisoes do projeto real
- `Clean Code` e `Clean Architecture` como referencias, sem dogmatismo quando o contexto pedir outra estrutura

## Problema atual

O MCP atual ja entrega valor em:

- leitura e atualizacao de `AI_CONTEXT.md`
- geracao de artefatos iniciais
- sugestoes arquiteturais
- esteira basica de release

Mas ainda depende demais de templates genericos e possui limitacoes importantes:

- logica central monolitica em `src/index.ts`
- baixa validacao semantica do projeto real
- ausencia de engine formal de regras arquiteturais
- ausencia de perfis versionados de metodologia e arquitetura
- ausencia de auditoria de drift arquitetural
- pouca seguranca em paths e operacoes de escrita
- falta de testes automatizados do proprio MCP

## Resultado esperado

O MCP deve operar como um `Architecture Operating System`, com tres eixos claros:

1. `MethodologyProfile`
Define como o desenvolvimento deve acontecer: XP, TDD, Small Releases, cadencia de refatoracao, gates e criterios de entrega.

2. `ArchitectureProfile`
Define como o sistema deve ser estruturado: camadas, pastas, fronteiras, convencoes, regras de dependencia e estrategia de teste.

3. `ProjectContext`
Define as regras locais do projeto: stack, decisoes tecnicas, restricoes, convencoes, integracoes, ambiente e direcao de produto.

## Arquitetura interna alvo do MCP

```text
src/
  domain/
    entities/
    value-objects/
    services/
  application/
    use-cases/
    dto/
  infrastructure/
    filesystem/
    git/
    node/
    parsers/
    serializers/
  analyzers/
    stack/
    structure/
    scripts/
    dependencies/
    source/
  policies/
    methodology/
    architecture/
    release/
  profiles/
    methodologies/
    architectures/
  generators/
    documents/
    blueprints/
    pipelines/
    tests/
  mcp/
    tools/
    presenters/
  shared/
    errors/
    utils/
    schemas/
```

## Componentes obrigatorios

### 1. Project Discovery Engine

Responsavel por descobrir o projeto real antes de qualquer recomendacao ou geracao.

Deve inspecionar:

- `package.json`, scripts e package manager
- bundler e framework
- alias e configuracoes de import
- estrutura de pastas
- roteamento
- presenca de ORM, banco, migrations e schema
- ferramentas de testes
- pipeline CI/CD existente
- convencoes de arquivo e nomenclatura

Artefatos gerados:

- `architecture/project-profile.json`
- resumo textual para o `AI_CONTEXT.md`

### 2. Methodology Profile Engine

Perfis iniciais sugeridos:

- `xp-default`
- `xp-strict-tdd`
- `lean-delivery`

Cada perfil deve definir:

- tamanho maximo recomendado de slice
- obrigatoriedade ou nao de testes antes da implementacao
- criterio de `small release`
- politica de refatoracao
- gates de lint, test, build e diff review

### 3. Architecture Profile Engine

Perfis iniciais sugeridos:

- `react-vite-static-first`
- `react-feature-first`
- `nextjs-app-router`
- `node-api-hexagonal`
- `node-api-clean-architecture`

Cada perfil deve definir:

- estrutura de pastas esperada
- fronteiras entre camadas
- imports permitidos e proibidos
- local de services, hooks, adapters, repositories e schemas
- estrategia minima de testes
- estrategia de CI/CD

### 4. Rule Engine

Responsavel por validar aderencia entre codigo e arquitetura escolhida.

Deve cobrir:

- paths fora de `projectRoot`
- escrita e leitura fora da raiz do projeto
- imports proibidos entre camadas
- uso de infraestrutura em camada indevida
- criacao de arquivos em local incorreto
- ausencia de artefatos obrigatorios para o perfil escolhido
- diffs grandes demais para a politica de `small release`

### 5. Drift Detection Engine

Deve comparar:

- estado atual do projeto
- perfil arquitetural escolhido
- regras persistidas no contexto e ADRs
- diff atual do git

Saidas esperadas:

- violacoes
- risco
- sugestao de realinhamento
- recomendacao de ADR quando a mudanca for legitima

### 6. Artifact and Decision Store

Persistencia recomendada:

- `AI_CONTEXT.md` para leitura humana
- `architecture/project-profile.json` para estado descoberto
- `architecture/rules.yaml` para politicas formais
- `docs/adr/*.md` para decisoes versionadas
- `docs/roadmaps/*.md` para backlog e planejamento incremental

## Evolucao das tools

### Tools atuais que devem permanecer

- `iniciar_planejamento_projeto`
- `gerar_documento_requisitos_ears`
- `sugerir_arquitetura_clean_code`
- `salvar_documento`
- `gerar_estrutura_pastas`
- `criar_plano_de_tarefas`
- `gerar_diagrama_mermaid`
- `gerar_pipeline_github_actions`
- `auditoria_dependencias`
- `analisar_esquema_banco`
- `ler_contexto_da_arquitetura`
- `atualizar_contexto_da_arquitetura`
- `gerar_esqueleto_de_testes`
- `commit_small_release`

### Tools novas prioritarias

- `descobrir_projeto_e_stack`
- `gerar_project_profile`
- `selecionar_metodologia`
- `selecionar_perfil_arquitetural`
- `materializar_blueprint_inicial`
- `validar_aderencia_arquitetural`
- `auditar_drift_arquitetural`
- `analisar_diff_e_sugerir_realinhamento`
- `registrar_adr`
- `planejar_proximo_incremento`
- `executar_release_gate`

## Comportamento esperado por metodologia

### XP

O MCP deve transformar XP em comportamento concreto:

- quebrar demandas em slices pequenos
- incentivar ou exigir TDD conforme perfil
- bloquear release com diff amplo demais
- exigir validacao automatizada minima
- sugerir refatoracao apos `green`
- privilegiar passos pequenos e reversiveis

### TDD

O MCP deve:

- gerar testes falhos iniciais coerentes com os requisitos
- checar se o projeto tem framework de testes compativel
- sugerir cenarios derivados de eventos e estados do EARS
- associar teste ao slice e nao gerar scaffolds arbitrarios

### Small Releases

O MCP deve:

- operar com `dry-run` por padrao nas acoes mais sensiveis
- trabalhar com lista explicita de arquivos alvo
- evitar `git add -A .` como comportamento padrao
- falhar quando o repositorio estiver sujo de forma ambigua
- produzir relatorio claro de gate antes do commit

## Fases de implementacao

## Fase 0 - Hardening da base

Objetivo:
Tornar o MCP seguro e preparado para evolucao.

Implementar:

- refatoracao do `src/index.ts` monolitico em modulos
- validacao de inputs com schema forte
- containment de paths dentro de `projectRoot`
- `dry-run` para tools de escrita e release
- respostas estruturadas padrao
- logs internos minimos
- suite inicial de testes unitarios

Criterios de aceite:

- nenhuma tool consegue ler ou escrever fora do `projectRoot`
- `commit_small_release` nao usa stage global por padrao
- cobertura inicial dos fluxos criticos

## Fase 1 - Descoberta e contexto estruturado

Objetivo:
Fazer o MCP entender o projeto real antes de sugerir estrutura.

Implementar:

- `ProjectDiscoveryEngine`
- `project-profile.json`
- sincronizacao entre descoberta e `AI_CONTEXT.md`
- leitura de framework, bundler, scripts, testes, banco e convencoes

Criterios de aceite:

- o MCP consegue descrever corretamente a stack e a estrutura de um projeto sem depender de prompt manual

## Fase 2 - Perfis de metodologia e arquitetura

Objetivo:
Separar metodo, arquitetura e contexto.

Implementar:

- `MethodologyProfile`
- `ArchitectureProfile`
- carregamento de perfis versionados
- persistencia da escolha do perfil no projeto

Criterios de aceite:

- o MCP consegue operar com perfis diferentes sem mudar codigo core

## Fase 3 - Rule Engine e aderencia arquitetural

Objetivo:
Validar se o desenvolvimento esta respeitando a arquitetura escolhida.

Implementar:

- regras de imports permitidos e proibidos
- regras de localizacao de arquivos
- regras por stack e por perfil arquitetural
- ferramenta `validar_aderencia_arquitetural`

Criterios de aceite:

- o MCP consegue apontar violacoes concretas com referencia clara ao problema

## Fase 4 - Drift detection e realinhamento continuo

Objetivo:
Acompanhar a evolucao do projeto e evitar degradacao estrutural.

Implementar:

- leitura de `git diff`
- classificacao de risco por mudanca
- deteccao de mudancas legitimas que exigem ADR
- recomendacao de realinhamento

Criterios de aceite:

- o MCP consegue dizer se o diff atual esta aderente, em risco ou em violacao

## Fase 5 - Release gate profissional

Objetivo:
Transformar `commit_small_release` em um gate de entrega confiavel.

Implementar:

- `executar_release_gate`
- validacao de repositorio limpo ou escopo explicito
- lint, test, build e regras arquiteturais
- commit apenas dos arquivos autorizados
- relatorio final estruturado

Criterios de aceite:

- o gate informa claramente o que passou, o que falhou e o que precisa ser corrigido antes da entrega

## Backlog tecnico priorizado

### P0

- extrair `filesystem service`, `git service` e `tool handlers`
- implementar `assertPathInsideProjectRoot`
- substituir paths livres por APIs seguras
- adicionar validacao com `zod`
- criar testes para `resolveProjectRoot`, `safeWriteFile`, `analisar_esquema_banco` e `commit_small_release`
- introduzir `dryRun` nas tools sensiveis

### P1

- criar `ProjectProfile`
- criar `MethodologyProfile`
- criar `ArchitectureProfile`
- criar `RuleViolation` e `ReleaseGateReport`
- implementar `descobrir_projeto_e_stack`
- implementar `validar_aderencia_arquitetural`

### P2

- implementar leitura de diff
- implementar ADRs versionados
- implementar `executar_release_gate`
- gerar backlog incremental baseado em contexto e perfil

### P3

- perfis por framework mais detalhados
- suporte a multiplos ecossistemas
- observabilidade melhor
- melhores mensagens de explicacao e recomendacao

## Estrategia de testes do proprio MCP

Camadas de teste recomendadas:

- `unit`: funcoes puras, resolucao de paths, validacoes e rules
- `integration`: tools MCP com fixtures de projeto
- `contract`: forma e conteudo das respostas MCP
- `e2e`: fixtures completas para `react-vite`, `node-api` e `nextjs`

Fixtures minimas:

- `fixtures/react-vite-static-first`
- `fixtures/node-api-hexagonal`
- `fixtures/nextjs-app-router`

## Primeira entrega recomendada

Se houver pouco tempo, a melhor sequencia inicial e:

1. refatorar `src/index.ts`
2. blindar `projectRoot`
3. criar `ProjectDiscoveryEngine`
4. criar `MethodologyProfile` com `xp-default`
5. criar `ArchitectureProfile` com `react-vite-static-first`
6. implementar `validar_aderencia_arquitetural`
7. substituir `commit_small_release` por gate com escopo explicito

## Definicao de pronto para o nivel top tier

O MCP sera considerado maduro quando:

- entender o projeto real antes de propor mudancas
- respeitar o contexto persistido e os perfis selecionados
- transformar XP e TDD em politicas executaveis
- detectar drift arquitetural com confiabilidade
- bloquear operacoes perigosas por padrao
- gerar artefatos, estrutura e gates coerentes com a stack
- possuir testes automatizados suficientes para evolucao segura
