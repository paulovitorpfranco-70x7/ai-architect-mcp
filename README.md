# 🏗️ AI Architect MCP (Model Context Protocol)

O **AI Architect MCP** é um servidor local projetado para conectar a sua Inteligência Artificial favorita (Claude, Cursor, Roo Code/Codex, etc) diretamente ao seu ambiente de desenvolvimento local, transformando-a em um **Arquiteto de Software Sênior e Tech Lead Automatizado**.

Este projeto foi desenhado sob a ótica de engenharia orientada a testes, documentação viva, pequenos releases (*Small Releases*) e **Clean Architecture**, seguindo fluxo iterativo anti-alucinações. Ele não serve apenas para gerar código, mas para **guiar o processo de construção de software real do Zero à Pós-Produção**.

## 🧠 Por que usar este MCP?

Inspirado nas práticas de Pair Programming com IA e *Extreme Programming* (XP), o MCP resolve o problema do "Vibe Coding", onde a IA gera código impossível de manter. Ele força a IA a planejar a arquitetura, registrar decisões no "cérebro" do projeto (`AI_CONTEXT.md`), escrever especificações EARS de negócio, iniciar o TDD criando testes que falham e bloquear commits mal testados.

## 🛠️ Super Poderes (Ferramentas Disponíveis)

Este servidor expõe **14 ferramentas** para o cliente MCP:

### 🎯 1. Planejamento Base
*   `iniciar_planejamento_projeto`: Inicia o processo guiado pedindo as funcionalidades-chave.
*   `gerar_documento_requisitos_ears`: Força a IA a detalhar o projeto na sintaxe EARS (Condição Prévia, Evento Gatilho, Resposta Esperada).
*   `sugerir_arquitetura_clean_code`: Propõe camadas lógicas de *Clean Architecture* baseada no tipo (API REST, Web Frontend, etc).
*   `criar_plano_de_tarefas`: Cria `tarefas.md` no seu projeto contendo os checkpoints.

### 🧠 2. O Cérebro do Projeto (Living Document)
*   `ler_contexto_da_arquitetura`: Lê o arquivo `AI_CONTEXT.md` para entender as regras, peculiaridades, erros do passado e bibliotecas obrigatórias do seu projeto *antes* de codificar.
*   `atualizar_contexto_da_arquitetura`: Registra com data novos aprendizados e peculiaridades do projeto, evitando que a IA (ou você) esqueçam regras importantes no futuro.

### 📂 3. Infraestrutura & Código (Scaffolding)
*   `gerar_estrutura_pastas`: A IA cria as pastas físicas na sua máquina baseado em Clean Architecture.
*   `salvar_documento`: A IA pode iterar sobre documentações teóricas e persistí-las como arquivos fidedignos em Markdown localmente.
*   `gerar_esqueleto_de_testes`: **(Scaffold TDD)** Cria arquivos `.test.ts` vazios dos cenários EARS com falhas intencionais exigindo que a IA aplique o ciclo "Red-Green-Refactor".

### 🔎 4. Anti-Alucinações & Integração (Contexto Local)
*   `analisar_esquema_banco`: O MCP pode ler seus arquivos de tabela reais (`schema.prisma`, `.sql`) enviando os modelos exatos de banco de dados para a IA para que ela não invente campos ou strings de conexão.
*   `auditoria_dependencias`: Roda ocultamente o comando `npm audit` em background entregando o status de vulnerabilidade do projeto para a IA.

### 🛡️ 5. DevOps & Continuous Delivery
*   `gerar_pipeline_github_actions`: Analisa a stack e cria arquivos `.github/workflows/main.yml` padronizados para integração contínua na nuvem.
*   `commit_small_release`: **Esteira Segura Local.** Em vez da IA só enviar o código, ela invoca essa ferramenta que força a rotina de Linter e `npm test`. O commit só é executado localmente se tudo estiver verde, gerando "Small Releases" e protegendo a branch contra lixo gerado.
*   `gerar_diagrama_mermaid`: A Inteligência produz os scripts (diagramas de classe, C4 Models) e o MCP gera os arquivos renderizáveis `.mmd`.

---

## 🚀 Como Instalar e Rodar

O servidor é construído em Node.js com TypeScript e encapsula as integrações com os clientes Standard I/O.

1. Clone o repositório:
```bash
git clone https://github.com/paulovitorpfranco-70x7/ai-architect-mcp.git
cd ai-architect-mcp
```

2. Instale as dependências:
```bash
npm install
```

3. Compile e rode o servidor MCP (Build):
```bash
npm run build
```

4. Configure o seu cliente (Claude Desktop, Cursor, Roo Code/Codex):
Adicione a rota ABSOLUTA do `build/index.js` gerado nas especificações do `mcpServers` do seu App:

```json
{
  "mcpServers": {
    "ai-architect-mcp": {
      "command": "node",
      "args": [
        "caminho/absoluto/da/sua/pasta/ai-architect-mcp/build/index.js"
      ]
    }
  }
}
```

5. Reinicie o seu editor de código e o MCP estará ativado. Peça à IA: *"Eu quero criar um app, ative seu Arquiteto para planejar o projeto!"*
