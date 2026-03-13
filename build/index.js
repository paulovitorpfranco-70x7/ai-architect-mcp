import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
const execPromise = util.promisify(exec);
// Inicializa o servidor Architect Spec-Driven MCP
const server = new Server({
    name: "ai-architect-mcp",
    version: "1.2.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Define as ferramentas que este MCP fornece para atuar como Arquiteto
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "iniciar_planejamento_projeto",
                description: "Inicia o processo de planejamento de um novo projeto usando Spec-Driven Development e práticas de Clean Code.",
                inputSchema: {
                    type: "object",
                    properties: {
                        objetivo_principal: {
                            type: "string",
                            description: "O objetivo principal ou a ideia do projeto a ser construído.",
                        },
                        tecnologias_desejadas: {
                            type: "array",
                            items: { type: "string" },
                            description: "Lista de tecnologias preferidas pelo usuário (ex: React, Node.js, Python).",
                        },
                    },
                    required: ["objetivo_principal"],
                },
            },
            {
                name: "gerar_documento_requisitos_ears",
                description: "Gera um documento de requisitos estruturado usando o formato EARS (Easy Approach to Requirements Syntax).",
                inputSchema: {
                    type: "object",
                    properties: {
                        funcionalidades: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    nome: { type: "string", description: "Nome da funcionalidade (ex: Autenticação)" },
                                    condicao_previa: { type: "string", description: "Condição para a funcionalidade ocorrer (ex: o usuário não estar logado)" },
                                    evento_gatilho: { type: "string", description: "Ação que dispara a funcionalidade (ex: clicar no botão de login)" },
                                    resposta_esperada: { type: "string", description: "O que o sistema deve fazer (ex: validar as credenciais e emitir um token)" }
                                },
                                required: ["nome", "condicao_previa", "evento_gatilho", "resposta_esperada"]
                            },
                            description: "Lista detalhada das funcionalidades para gerar o EARS.",
                        },
                    },
                    required: ["funcionalidades"],
                },
            },
            {
                name: "sugerir_arquitetura_clean_code",
                description: "Fornece uma sugestão de arquitetura de software focada em Clean Architecture e padrões de Clean Code baseada nos requisitos.",
                inputSchema: {
                    type: "object",
                    properties: {
                        tipo_projeto: {
                            type: "string",
                            description: "O tipo de projeto (ex: api_rest, web_frontend, mobile, cli).",
                            enum: ["api_rest", "web_frontend", "mobile", "cli", "outro"]
                        },
                    },
                    required: ["tipo_projeto"],
                },
            },
            {
                name: "salvar_documento",
                description: "Salva a documentação gerada (EARS, Arquitetura, etc.) em um arquivo no diretório do projeto.",
                inputSchema: {
                    type: "object",
                    properties: {
                        caminho_arquivo: {
                            type: "string",
                            description: "Caminho relativo para salvar o arquivo (ex: docs/requisitos.md)",
                        },
                        conteudo: {
                            type: "string",
                            description: "O conteúdo Markdown a ser salvo.",
                        },
                    },
                    required: ["caminho_arquivo", "conteudo"],
                },
            },
            {
                name: "gerar_estrutura_pastas",
                description: "Gera automaticamente a estrutura de pastas do projeto baseada na Clean Architecture sugerida. Executada a partir da raiz do projeto.",
                inputSchema: {
                    type: "object",
                    properties: {
                        pastas: {
                            type: "array",
                            items: { type: "string" },
                            description: "Lista de caminhos relativos de pastas para criar (ex: src/components, src/pages, src/services).",
                        },
                    },
                    required: ["pastas"],
                },
            },
            {
                name: "criar_plano_de_tarefas",
                description: "Cria um arquivo Markdown com um plano de tarefas (checkboxes) para guiar o desenvolvimento.",
                inputSchema: {
                    type: "object",
                    properties: {
                        tarefas: {
                            type: "array",
                            items: { type: "string" },
                            description: "Lista de tarefas a serem cumpridas passo a passo.",
                        },
                        caminho_arquivo: {
                            type: "string",
                            description: "Caminho relativo para salvar o plano (ex: docs/tarefas.md)",
                        }
                    },
                    required: ["tarefas", "caminho_arquivo"],
                },
            },
            {
                name: "gerar_diagrama_mermaid",
                description: "Gera e salva um diagrama de arquitetura ou fluxo em formato Mermaid (.mmd).",
                inputSchema: {
                    type: "object",
                    properties: {
                        caminho_arquivo: { type: "string", description: "Caminho relativo para salvar o arquivo (ex: docs/arquitetura.mmd)" },
                        codigo_mermaid: { type: "string", description: "O código fonte do diagrama Mermaid." }
                    },
                    required: ["caminho_arquivo", "codigo_mermaid"],
                },
            },
            {
                name: "gerar_pipeline_github_actions",
                description: "Gera um arquivo main.yml de CI/CD para GitHub Actions baseado na stack do projeto.",
                inputSchema: {
                    type: "object",
                    properties: {
                        stack: { type: "string", description: "Stack do projeto (ex: node, python, java)" },
                        passos: {
                            type: "array",
                            items: { type: "string" },
                            description: "Lista de passos como 'lint', 'test', 'build'."
                        }
                    },
                    required: ["stack"],
                },
            },
            {
                name: "auditoria_dependencias",
                description: "Executa 'npm audit' no projeto para identificar vulnerabilidades de segurança.",
                inputSchema: {
                    type: "object",
                    properties: {}
                },
            },
            {
                name: "analisar_esquema_banco",
                description: "Lê o arquivo de Schema do Banco de Dados (.sql, .prisma) para que a IA possa analisar as entidades.",
                inputSchema: {
                    type: "object",
                    properties: {
                        caminho_arquivo: { type: "string", description: "Caminho do arquivo de schema (ex: prisma/schema.prisma, database/schema.sql)" }
                    },
                    required: ["caminho_arquivo"],
                },
            },
            {
                name: "ler_contexto_da_arquitetura",
                description: "Lê o arquivo de contexto da arquitetura (Cérebro do Projeto - AI_CONTEXT.md) para entender as regras, stack e peculiaridades antes de codificar.",
                inputSchema: {
                    type: "object",
                    properties: {}
                },
            },
            {
                name: "atualizar_contexto_da_arquitetura",
                description: "Adiciona novos aprendizados, regras de negócio ou decisões técnicas ao arquivo de contexto da arquitetura (AI_CONTEXT.md) para memória futura.",
                inputSchema: {
                    type: "object",
                    properties: {
                        nova_regra: { type: "string", description: "A nova regra, peculiaridade ou decisão a ser adicionada ao documento." }
                    },
                    required: ["nova_regra"],
                },
            },
            {
                name: "gerar_esqueleto_de_testes",
                description: "Gera a estrutura inicial de arquivos de testes unitários baseados nos requisitos EARS (TDD Scaffold).",
                inputSchema: {
                    type: "object",
                    properties: {
                        caminho_arquivo: { type: "string", description: "Caminho do arquivo de teste a ser gerado (ex: tests/auth.spec.ts)" },
                        framework: { type: "string", description: "Framework de testes (ex: jest, vitest, rspec)" },
                        cenarios: {
                            type: "array",
                            items: { type: "string" },
                            description: "Lista de descrições dos cenários a serem testados (extraídos do Event-Driven/State-Driven do EARS)."
                        }
                    },
                    required: ["caminho_arquivo", "framework", "cenarios"],
                },
            }
        ],
    };
});
// Implementa a lógica de execução de cada ferramenta do Arquiteto
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const args = request.params.arguments || {};
    // Helper functions
    const safeWriteFile = (filePath, content) => {
        // O Node CWD de um app sendo gerenciado pelo Claude/Cursor geralmente é a raiz do diretório do projeto onde o AI foi acionado
        const absolutePath = path.resolve(process.cwd(), filePath);
        const dir = path.dirname(absolutePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(absolutePath, content, "utf-8");
        return absolutePath;
    };
    if (toolName === "iniciar_planejamento_projeto") {
        const objetivo = args.objetivo_principal;
        const tecnologias = args.tecnologias_desejadas || ["A definir"];
        return {
            content: [
                {
                    type: "text",
                    text: `Iniciando planejamento Spec-Driven para o objetivo: "${objetivo}".\nTecnologias consideradas: ${tecnologias.join(", ")}.\n\nPasso 1: Vamos coletar e refinar os requisitos. Por favor, detalhe as funcionalidades chave preenchendo as condições (condicao_previa, evento_gatilho, resposta_esperada) para prosseguir com a declaração EARS usando 'gerar_documento_requisitos_ears'.`,
                },
            ],
        };
    }
    if (toolName === "gerar_documento_requisitos_ears") {
        const funcionalidades = args.funcionalidades;
        let docEars = "# Documento de Requisitos (Formato EARS)\n\n";
        funcionalidades.forEach((func, index) => {
            docEars += `## Funcionalidade ${index + 1}: ${func.nome}\n`;
            docEars += `- **Ubiquitous (Sempre):** O sistema deve fornecer a capacidade de realizar a funcionalidade ${func.nome}.\n`;
            docEars += `- **Event-Driven (Quando):** Quando ${func.evento_gatilho}, o sistema deve ${func.resposta_esperada}.\n`;
            docEars += `- **State-Driven (Enquanto):** Enquanto ${func.condicao_previa}, o sistema deve permitir ${func.nome}.\n\n`;
        });
        return {
            content: [
                {
                    type: "text",
                    text: docEars + "\nRequisitos baseados em EARS gerados com sucesso. O próximo passo é invocar a sugestão de design arquitetural em Clean Code, ou você já pode salvar este documento com a ferramenta 'salvar_documento'.",
                },
            ],
        };
    }
    if (toolName === "sugerir_arquitetura_clean_code") {
        const tipo = args.tipo_projeto;
        let sugestao = "";
        if (tipo === "api_rest") {
            sugestao = "Sugestão de Arquitetura Limpa para API REST:\n- **Domain Layer:** Entidades e Casos de Uso (sem dependências externas).\n- **Interface Adapters:** Controllers, Presenters e Gateways.\n- **Frameworks & Drivers:** Banco de dados, Web Server (Express/Fastify).\n\nPráticas: Injeção de dependência e princípios SOLID.\n\nVocê pode gerar a estrutura de pastas usando a ferramenta 'gerar_estrutura_pastas'.";
        }
        else if (tipo === "web_frontend") {
            sugestao = "Sugestão de Arquitetura para Frontend Web:\n- **Components Layer:** Componentes de UI burros (Dumb Components).\n- **Containers/Pages:** Componentes inteligentes conectados ao estado.\n- **Services/Hooks:** Lógica de negócio e chamadas de API encapsuladas.\n- **Store:** Gerenciamento de estado global (se necessário).\n\nPráticas: Separação de responsabilidades, Custom Hooks para lógica.\n\nVocê pode gerar a estrutura de pastas usando a ferramenta 'gerar_estrutura_pastas'.";
        }
        else {
            sugestao = "Para este tipo de projeto, foque em modularização, baixo acoplamento e alta coesão, mantendo a regra de dependência apontando para as políticas de alto nível.\n\nVocê pode criar as pastas iniciais usando 'gerar_estrutura_pastas'.";
        }
        return {
            content: [
                {
                    type: "text",
                    text: sugestao,
                },
            ],
        };
    }
    if (toolName === "salvar_documento") {
        const caminho_arquivo = args.caminho_arquivo;
        const conteudo = args.conteudo;
        try {
            const fullPath = safeWriteFile(caminho_arquivo, conteudo);
            return {
                content: [{ type: "text", text: `Documento salvo com sucesso em: ${fullPath}` }]
            };
        }
        catch (err) {
            return {
                content: [{ type: "text", text: `Erro ao salvar documento: ${err.message}` }],
                isError: true
            };
        }
    }
    if (toolName === "gerar_estrutura_pastas") {
        const pastas = args.pastas;
        const caminhosCriados = [];
        try {
            pastas.forEach(pasta => {
                const absolutePath = path.resolve(process.cwd(), pasta);
                if (!fs.existsSync(absolutePath)) {
                    fs.mkdirSync(absolutePath, { recursive: true });
                }
                caminhosCriados.push(pasta);
            });
            return {
                content: [{ type: "text", text: `Estrutura de pastas gerada com sucesso:\n- ${caminhosCriados.join("\n- ")}` }]
            };
        }
        catch (err) {
            return {
                content: [{ type: "text", text: `Erro ao criar estrutura de pastas: ${err.message}` }],
                isError: true
            };
        }
    }
    if (toolName === "criar_plano_de_tarefas") {
        const tarefas = args.tarefas;
        const caminho_arquivo = args.caminho_arquivo;
        let conteudo = "# Plano de Tarefas\n\n";
        tarefas.forEach(tarefa => {
            conteudo += `- [ ] ${tarefa}\n`;
        });
        try {
            const fullPath = safeWriteFile(caminho_arquivo, conteudo);
            return {
                content: [{ type: "text", text: `Plano de tarefas criado com sucesso em: ${fullPath}\nAbra o arquivo para acompanhar o progresso marcando os checkboxes.` }]
            };
        }
        catch (err) {
            return {
                content: [{ type: "text", text: `Erro ao criar plano de tarefas: ${err.message}` }],
                isError: true
            };
        }
    }
    if (toolName === "gerar_diagrama_mermaid") {
        const caminho_arquivo = args.caminho_arquivo;
        const codigo_mermaid = args.codigo_mermaid;
        try {
            const fullPath = safeWriteFile(caminho_arquivo, codigo_mermaid);
            return {
                content: [{ type: "text", text: `Diagrama Mermaid salvo com sucesso em: ${fullPath}` }]
            };
        }
        catch (err) {
            return {
                content: [{ type: "text", text: `Erro ao salvar diagrama mermaid: ${err.message}` }],
                isError: true
            };
        }
    }
    if (toolName === "gerar_pipeline_github_actions") {
        const stack = args.stack;
        const passos = args.passos || ["install", "test"];
        const caminho_arquivo = ".github/workflows/main.yml";
        let actionsCode = `name: CI/CD Pipeline\n\non:\n  push:\n    branches: [ "main" ]\n  pull_request:\n    branches: [ "main" ]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n`;
        if (stack.toLowerCase() === "node" || stack.toLowerCase() === "react") {
            actionsCode += `      - name: Use Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: "20.x"\n`;
            if (passos.includes("install"))
                actionsCode += `      - run: npm install\n`;
            if (passos.includes("lint"))
                actionsCode += `      - run: npm run lint\n`;
            if (passos.includes("test"))
                actionsCode += `      - run: npm test\n`;
            if (passos.includes("build"))
                actionsCode += `      - run: npm run build\n`;
        }
        else {
            actionsCode += `      - run: echo "Estrutura para ${stack} gerada de forma genérica"\n`;
        }
        try {
            const fullPath = safeWriteFile(caminho_arquivo, actionsCode);
            return {
                content: [{ type: "text", text: `Pipeline Github Actions gerado em: ${fullPath}` }]
            };
        }
        catch (err) {
            return {
                content: [{ type: "text", text: `Erro ao gerar pipeline: ${err.message}` }],
                isError: true
            };
        }
    }
    if (toolName === "auditoria_dependencias") {
        try {
            const projectPath = process.cwd();
            const { stdout, stderr } = await execPromise("npm audit", { cwd: projectPath });
            return {
                content: [{ type: "text", text: `Relatório de Auditoria (NPM Audit):\n${stdout}\n${stderr}` }]
            };
        }
        catch (err) {
            if (err.stdout) {
                return {
                    content: [{ type: "text", text: `Relatório de Auditoria (Vulnerabilidades Encontradas):\n${err.stdout}` }]
                };
            }
            return {
                content: [{ type: "text", text: `Erro ao executar auditoria: ${err.message}` }],
                isError: true
            };
        }
    }
    if (toolName === "analisar_esquema_banco") {
        const caminho_arquivo = args.caminho_arquivo;
        try {
            const absolutePath = path.resolve(process.cwd(), caminho_arquivo);
            if (!fs.existsSync(absolutePath)) {
                return {
                    content: [{ type: "text", text: `O arquivo de schema não foi encontrado em: ${absolutePath}. Certifique-se de usar o caminho correto.` }],
                    isError: true
                };
            }
            const conteudo = fs.readFileSync(absolutePath, "utf-8");
            return {
                content: [{ type: "text", text: `Conteúdo do Schema do Banco de Dados (${caminho_arquivo}):\n\n${conteudo}` }]
            };
        }
        catch (err) {
            return {
                content: [{ type: "text", text: `Erro ao ler o esquema do banco: ${err.message}` }],
                isError: true
            };
        }
    }
    if (toolName === "ler_contexto_da_arquitetura") {
        const contextPath = path.resolve(process.cwd(), "AI_CONTEXT.md");
        if (!fs.existsSync(contextPath)) {
            return {
                content: [{ type: "text", text: `Arquivo AI_CONTEXT.md não encontrado. O projeto ainda não possui um contexto registrado.` }]
            };
        }
        const conteudo = fs.readFileSync(contextPath, "utf-8");
        return {
            content: [{ type: "text", text: `Contexto do Projeto (Regras e Decisões):\n\n${conteudo}` }]
        };
    }
    if (toolName === "atualizar_contexto_da_arquitetura") {
        const novaRegra = args.nova_regra;
        const contextPath = path.resolve(process.cwd(), "AI_CONTEXT.md");
        let currentContent = "# Contexto da Arquitetura & Decisões do Projeto\n\nEste documento evolui com o projeto. Ele contém regras de negócio, decisões técnicas e stack.\n\n## Regras Descobertas e Adicionadas:\n";
        if (fs.existsSync(contextPath)) {
            currentContent = fs.readFileSync(contextPath, "utf-8");
        }
        const timeNow = new Date().toISOString().split("T")[0];
        const newContent = `${currentContent}\n- [${timeNow}] ${novaRegra}`;
        fs.writeFileSync(contextPath, newContent, "utf-8");
        return {
            content: [{ type: "text", text: `Contexto do projeto atualizado com sucesso no arquivo AI_CONTEXT.md.` }]
        };
    }
    if (toolName === "gerar_esqueleto_de_testes") {
        const caminho = args.caminho_arquivo;
        const fw = args.framework.toLowerCase();
        const cenarios = args.cenarios;
        let testCode = "";
        if (fw === "jest" || fw === "vitest") {
            const moduleName = path.basename(caminho).split(".")[0];
            testCode += `import { describe, it, expect } from '${fw}';\n\n`;
            testCode += `describe('${moduleName} module', () => {\n`;
            cenarios.forEach(cenario => {
                testCode += `  it('deve ${cenario}', () => {\n    // TODO: Implementar teste antes da lógica (TDD)\n    expect(true).toBe(false);\n  });\n\n`;
            });
            testCode += `});\n`;
        }
        else {
            testCode = `// Esqueleto de testes para ${fw}\n// Cenários a cobrir:\n`;
            cenarios.forEach(c => testCode += `// - ${c}\n`);
        }
        try {
            const fullPath = safeWriteFile(caminho, testCode);
            return {
                content: [{ type: "text", text: `Esqueleto TDD gerado com falhas intencionais em: ${fullPath}\n\nATENÇÃO IA: Execute os testes, observe a falha, DEPOIS implemente a feature para fazer o teste passar.` }]
            };
        }
        catch (err) {
            return {
                content: [{ type: "text", text: `Erro ao gerar scaffold de testes: ${err.message}` }],
                isError: true
            };
        }
    }
    throw new Error(`Ferramenta não suportada pelo Arquiteto: ${toolName}`);
});
// Inicialização do Servidor MCP
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Spec-Driven Architect MCP Server inciado com sucesso! Aguardando chamadas stdio da IA.");
}
main().catch((error) => {
    console.error("Erro fatal na inicialização:", error);
    process.exit(1);
});
