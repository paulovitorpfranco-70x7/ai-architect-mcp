# AI Architect MCP

Servidor MCP local para transformar a IA em um arquiteto de software orientado a contexto, especificacao e esteiras mais seguras.

## O que ele faz

O servidor expoe ferramentas para:

- iniciar planejamento orientado a requisitos
- gerar documentos EARS
- sugerir arquitetura
- salvar documentos e diagramas
- criar estrutura de pastas
- ler e atualizar `AI_CONTEXT.md`
- analisar schema de banco
- gerar esqueleto de testes
- rodar `npm audit`
- executar uma esteira de `commit_small_release`

## Instalacao

```bash
git clone https://github.com/paulovitorpfranco-70x7/ai-architect-mcp.git
cd ai-architect-mcp
npm install
npm run build
```

## Configuracao do cliente MCP

O ponto critico deste servidor e a resolucao da raiz do projeto. Se o cliente iniciar o processo no diretorio errado, ferramentas como `salvar_documento`, `analisar_esquema_banco`, `ler_contexto_da_arquitetura` e `commit_small_release` vao operar no lugar errado.

O servidor resolve a raiz nesta ordem:

1. argumento `raiz_projeto` enviado para a ferramenta
2. flag CLI `--project-root`
3. variavel de ambiente `AI_ARCHITECT_PROJECT_ROOT`
4. variavel de ambiente `MCP_PROJECT_ROOT`
5. variavel de ambiente `PROJECT_ROOT`
6. `process.cwd()`

### Exemplo recomendado

```json
{
  "mcpServers": {
    "ai-architect-mcp": {
      "command": "node",
      "args": [
        "caminho/absoluto/da/sua/pasta/ai-architect-mcp/build/index.js",
        "--project-root",
        "caminho/absoluto/do/projeto-alvo"
      ]
    }
  }
}
```

Se o seu cliente suportar `cwd` ou interpolacao de workspace, isso tambem funciona. O importante e nao depender de um `process.cwd()` ambiguo.

## Notas sobre commit_small_release

- se existir script de lint e ele falhar, o commit e bloqueado
- se nao existir script de testes, o commit e bloqueado
- se o script de testes ainda for o placeholder padrao do npm, o commit e bloqueado
- o stage e feito com `git add -A .` dentro da raiz resolvida do projeto

## Desenvolvimento

```bash
npm run build
node build/index.js --project-root caminho/absoluto/do/projeto
```
