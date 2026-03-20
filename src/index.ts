import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const execFilePromise = util.promisify(execFile);
const SERVER_VERSION = "1.3.1";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

type ToolArgs = Record<string, unknown>;
type FeatureInput = {
  nome: string;
  condicao_previa: string;
  evento_gatilho: string;
  resposta_esperada: string;
};

const projectRootProperty = {
  type: "string",
  description:
    "Raiz do projeto onde os arquivos e comandos devem ser resolvidos. Se omitida, o MCP usa --project-root, AI_ARCHITECT_PROJECT_ROOT ou process.cwd().",
} as const;

const server = new Server(
  {
    name: "ai-architect-mcp",
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

function textResponse(text: string, isError = false) {
  return {
    content: [{ type: "text" as const, text }],
    ...(isError ? { isError: true } : {}),
  };
}

function withProjectRoot(
  properties: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    ...properties,
    raiz_projeto: projectRootProperty,
  };
}

function getStringArg(args: ToolArgs, key: string): string | undefined {
  const value = args[key];
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getStringArrayArg(args: ToolArgs, key: string): string[] | undefined {
  const value = args[key];
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value.filter((item): item is string => typeof item === "string");
  return items.length > 0 ? items : [];
}

function getCliProjectRoot(): string | undefined {
  const flagIndex = process.argv.indexOf("--project-root");
  if (flagIndex === -1) {
    return undefined;
  }

  return process.argv[flagIndex + 1];
}

function normalizeProjectRoot(candidate?: string): string | undefined {
  if (!candidate || !candidate.trim()) {
    return undefined;
  }

  return path.resolve(process.cwd(), candidate.trim());
}

const configuredProjectRoot =
  normalizeProjectRoot(getCliProjectRoot()) ??
  normalizeProjectRoot(process.env.AI_ARCHITECT_PROJECT_ROOT) ??
  normalizeProjectRoot(process.env.MCP_PROJECT_ROOT) ??
  normalizeProjectRoot(process.env.PROJECT_ROOT);

function resolveProjectRoot(args: ToolArgs): string {
  return (
    normalizeProjectRoot(getStringArg(args, "raiz_projeto")) ??
    configuredProjectRoot ??
    process.cwd()
  );
}

function resolveProjectPath(projectRoot: string, filePath: string): string {
  return path.resolve(projectRoot, filePath);
}

function safeWriteFile(
  projectRoot: string,
  filePath: string,
  content: string
): string {
  const absolutePath = resolveProjectPath(projectRoot, filePath);
  const directory = path.dirname(absolutePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  fs.writeFileSync(absolutePath, content, "utf-8");
  return absolutePath;
}

function formatProjectRoot(projectRoot: string): string {
  return `Raiz do projeto: ${projectRoot}`;
}

function readPackageJson(projectRoot: string): {
  packageJsonPath: string;
  scripts: Record<string, string>;
} {
  const packageJsonPath = path.join(projectRoot, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`package.json nao encontrado em ${packageJsonPath}`);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as {
    scripts?: Record<string, unknown>;
  };

  const scripts: Record<string, string> = {};
  Object.entries(packageJson.scripts ?? {}).forEach(([key, value]) => {
    if (typeof value === "string") {
      scripts[key] = value;
    }
  });

  return { packageJsonPath, scripts };
}

async function runFileCommand(
  command: string,
  args: string[],
  cwd: string
): Promise<{ stdout: string; stderr: string }> {
  const result = await execFilePromise(command, args, {
    cwd,
    encoding: "utf-8",
  });

  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

async function ensureGitRepository(projectRoot: string): Promise<void> {
  await runFileCommand("git", ["rev-parse", "--is-inside-work-tree"], projectRoot);
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "iniciar_planejamento_projeto",
        description:
          "Inicia o processo de planejamento de um novo projeto usando Spec-Driven Development e praticas de Clean Code.",
        inputSchema: {
          type: "object",
          properties: {
            objetivo_principal: {
              type: "string",
              description:
                "O objetivo principal ou a ideia do projeto a ser construido.",
            },
            tecnologias_desejadas: {
              type: "array",
              items: { type: "string" },
              description:
                "Lista de tecnologias preferidas pelo usuario (ex: React, Node.js, Python).",
            },
          },
          required: ["objetivo_principal"],
        },
      },
      {
        name: "gerar_documento_requisitos_ears",
        description:
          "Gera um documento de requisitos estruturado usando o formato EARS (Easy Approach to Requirements Syntax).",
        inputSchema: {
          type: "object",
          properties: {
            funcionalidades: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  nome: {
                    type: "string",
                    description: "Nome da funcionalidade (ex: Autenticacao)",
                  },
                  condicao_previa: {
                    type: "string",
                    description:
                      "Condicao para a funcionalidade ocorrer (ex: o usuario nao estar logado)",
                  },
                  evento_gatilho: {
                    type: "string",
                    description:
                      "Acao que dispara a funcionalidade (ex: clicar no botao de login)",
                  },
                  resposta_esperada: {
                    type: "string",
                    description:
                      "O que o sistema deve fazer (ex: validar as credenciais e emitir um token)",
                  },
                },
                required: [
                  "nome",
                  "condicao_previa",
                  "evento_gatilho",
                  "resposta_esperada",
                ],
              },
              description:
                "Lista detalhada das funcionalidades para gerar o EARS.",
            },
          },
          required: ["funcionalidades"],
        },
      },
      {
        name: "sugerir_arquitetura_clean_code",
        description:
          "Fornece uma sugestao de arquitetura de software focada em Clean Architecture e padroes de Clean Code baseada nos requisitos.",
        inputSchema: {
          type: "object",
          properties: {
            tipo_projeto: {
              type: "string",
              description:
                "O tipo de projeto (ex: api_rest, web_frontend, mobile, cli).",
              enum: ["api_rest", "web_frontend", "mobile", "cli", "outro"],
            },
          },
          required: ["tipo_projeto"],
        },
      },
      {
        name: "salvar_documento",
        description:
          "Salva a documentacao gerada (EARS, Arquitetura, etc.) em um arquivo no diretorio do projeto.",
        inputSchema: {
          type: "object",
          properties: withProjectRoot({
            caminho_arquivo: {
              type: "string",
              description:
                "Caminho relativo para salvar o arquivo (ex: docs/requisitos.md)",
            },
            conteudo: {
              type: "string",
              description: "O conteudo Markdown a ser salvo.",
            },
          }),
          required: ["caminho_arquivo", "conteudo"],
        },
      },
      {
        name: "gerar_estrutura_pastas",
        description:
          "Gera automaticamente a estrutura de pastas do projeto baseada na Clean Architecture sugerida. Executada a partir da raiz do projeto.",
        inputSchema: {
          type: "object",
          properties: withProjectRoot({
            pastas: {
              type: "array",
              items: { type: "string" },
              description:
                "Lista de caminhos relativos de pastas para criar (ex: src/components, src/pages, src/services).",
            },
          }),
          required: ["pastas"],
        },
      },
      {
        name: "criar_plano_de_tarefas",
        description:
          "Cria um arquivo Markdown com um plano de tarefas (checkboxes) para guiar o desenvolvimento.",
        inputSchema: {
          type: "object",
          properties: withProjectRoot({
            tarefas: {
              type: "array",
              items: { type: "string" },
              description:
                "Lista de tarefas a serem cumpridas passo a passo.",
            },
            caminho_arquivo: {
              type: "string",
              description:
                "Caminho relativo para salvar o plano (ex: docs/tarefas.md)",
            },
          }),
          required: ["tarefas", "caminho_arquivo"],
        },
      },
      {
        name: "gerar_diagrama_mermaid",
        description:
          "Gera e salva um diagrama de arquitetura ou fluxo em formato Mermaid (.mmd).",
        inputSchema: {
          type: "object",
          properties: withProjectRoot({
            caminho_arquivo: {
              type: "string",
              description:
                "Caminho relativo para salvar o arquivo (ex: docs/arquitetura.mmd)",
            },
            codigo_mermaid: {
              type: "string",
              description: "O codigo fonte do diagrama Mermaid.",
            },
          }),
          required: ["caminho_arquivo", "codigo_mermaid"],
        },
      },
      {
        name: "gerar_pipeline_github_actions",
        description:
          "Gera um arquivo main.yml de CI/CD para GitHub Actions baseado na stack do projeto.",
        inputSchema: {
          type: "object",
          properties: withProjectRoot({
            stack: {
              type: "string",
              description: "Stack do projeto (ex: node, python, java)",
            },
            passos: {
              type: "array",
              items: { type: "string" },
              description: "Lista de passos como 'lint', 'test', 'build'.",
            },
          }),
          required: ["stack"],
        },
      },
      {
        name: "auditoria_dependencias",
        description:
          "Executa 'npm audit' no projeto para identificar vulnerabilidades de seguranca.",
        inputSchema: {
          type: "object",
          properties: withProjectRoot(),
        },
      },
      {
        name: "analisar_esquema_banco",
        description:
          "Le o arquivo de Schema do Banco de Dados (.sql, .prisma) para que a IA possa analisar as entidades.",
        inputSchema: {
          type: "object",
          properties: withProjectRoot({
            caminho_arquivo: {
              type: "string",
              description:
                "Caminho do arquivo de schema (ex: prisma/schema.prisma, database/schema.sql)",
            },
          }),
          required: ["caminho_arquivo"],
        },
      },
      {
        name: "ler_contexto_da_arquitetura",
        description:
          "Le o arquivo de contexto da arquitetura (AI_CONTEXT.md) para entender as regras, stack e peculiaridades antes de codificar.",
        inputSchema: {
          type: "object",
          properties: withProjectRoot(),
        },
      },
      {
        name: "atualizar_contexto_da_arquitetura",
        description:
          "Adiciona novos aprendizados, regras de negocio ou decisoes tecnicas ao arquivo de contexto da arquitetura (AI_CONTEXT.md) para memoria futura.",
        inputSchema: {
          type: "object",
          properties: withProjectRoot({
            nova_regra: {
              type: "string",
              description:
                "A nova regra, peculiaridade ou decisao a ser adicionada ao documento.",
            },
          }),
          required: ["nova_regra"],
        },
      },
      {
        name: "gerar_esqueleto_de_testes",
        description:
          "Gera a estrutura inicial de arquivos de testes unitarios baseados nos requisitos EARS (TDD Scaffold).",
        inputSchema: {
          type: "object",
          properties: withProjectRoot({
            caminho_arquivo: {
              type: "string",
              description:
                "Caminho do arquivo de teste a ser gerado (ex: tests/auth.spec.ts)",
            },
            framework: {
              type: "string",
              description: "Framework de testes (ex: jest, vitest, rspec)",
            },
            cenarios: {
              type: "array",
              items: { type: "string" },
              description:
                "Lista de descricoes dos cenarios a serem testados (extraidos do Event-Driven/State-Driven do EARS).",
            },
          }),
          required: ["caminho_arquivo", "framework", "cenarios"],
        },
      },
      {
        name: "commit_small_release",
        description:
          "Automatiza um Small Release seguro: roda lint e testes localmente. Se passarem, realiza um git commit protegido.",
        inputSchema: {
          type: "object",
          properties: withProjectRoot({
            mensagem_commit: {
              type: "string",
              description:
                "Mensagem descritiva do commit no padrao Conventional Commits (ex: feat: adiciona login).",
            },
          }),
          required: ["mensagem_commit"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = (request.params.arguments ?? {}) as ToolArgs;

  if (toolName === "iniciar_planejamento_projeto") {
    const objetivo = getStringArg(args, "objetivo_principal");
    const tecnologias = getStringArrayArg(args, "tecnologias_desejadas") ?? [
      "A definir",
    ];

    if (!objetivo) {
      return textResponse(
        "Parametro obrigatorio ausente: objetivo_principal.",
        true
      );
    }

    return textResponse(
      `Iniciando planejamento Spec-Driven para o objetivo: "${objetivo}".\nTecnologias consideradas: ${tecnologias.join(
        ", "
      )}.\n\nPasso 1: detalhe as funcionalidades chave preenchendo condicao_previa, evento_gatilho e resposta_esperada para prosseguir com a declaracao EARS usando 'gerar_documento_requisitos_ears'.`
    );
  }

  if (toolName === "gerar_documento_requisitos_ears") {
    const funcionalidades = (args.funcionalidades ?? []) as FeatureInput[];

    let documento = "# Documento de Requisitos (Formato EARS)\n\n";
    funcionalidades.forEach((funcionalidade, index) => {
      documento += `## Funcionalidade ${index + 1}: ${funcionalidade.nome}\n`;
      documento += `- **Ubiquitous (Sempre):** O sistema deve fornecer a capacidade de realizar a funcionalidade ${funcionalidade.nome}.\n`;
      documento += `- **Event-Driven (Quando):** Quando ${funcionalidade.evento_gatilho}, o sistema deve ${funcionalidade.resposta_esperada}.\n`;
      documento += `- **State-Driven (Enquanto):** Enquanto ${funcionalidade.condicao_previa}, o sistema deve permitir ${funcionalidade.nome}.\n\n`;
    });

    return textResponse(
      `${documento}Requisitos baseados em EARS gerados com sucesso. O proximo passo e invocar a sugestao de design arquitetural em Clean Code, ou salvar este documento com a ferramenta 'salvar_documento'.`
    );
  }

  if (toolName === "sugerir_arquitetura_clean_code") {
    const tipo = getStringArg(args, "tipo_projeto");

    if (tipo === "api_rest") {
      return textResponse(
        "Sugestao de Arquitetura Limpa para API REST:\n- **Domain Layer:** Entidades e Casos de Uso (sem dependencias externas).\n- **Interface Adapters:** Controllers, Presenters e Gateways.\n- **Frameworks & Drivers:** Banco de dados e Web Server (Express/Fastify).\n\nPraticas: injecao de dependencia e principios SOLID.\n\nVoce pode gerar a estrutura de pastas usando a ferramenta 'gerar_estrutura_pastas'."
      );
    }

    if (tipo === "web_frontend") {
      return textResponse(
        "Sugestao de Arquitetura para Frontend Web:\n- **Components Layer:** Componentes de UI burros (dumb components).\n- **Containers/Pages:** Componentes inteligentes conectados ao estado.\n- **Services/Hooks:** Logica de negocio e chamadas de API encapsuladas.\n- **Store:** Gerenciamento de estado global (se necessario).\n\nPraticas: separacao de responsabilidades e custom hooks para logica.\n\nVoce pode gerar a estrutura de pastas usando a ferramenta 'gerar_estrutura_pastas'."
      );
    }

    return textResponse(
      "Para este tipo de projeto, foque em modularizacao, baixo acoplamento e alta coesao, mantendo a regra de dependencia apontando para as politicas de alto nivel.\n\nVoce pode criar as pastas iniciais usando 'gerar_estrutura_pastas'."
    );
  }

  if (toolName === "salvar_documento") {
    const projectRoot = resolveProjectRoot(args);
    const caminhoArquivo = getStringArg(args, "caminho_arquivo");
    const conteudo = getStringArg(args, "conteudo");

    if (!caminhoArquivo || conteudo === undefined) {
      return textResponse(
        "Parametros obrigatorios ausentes: caminho_arquivo e conteudo.",
        true
      );
    }

    try {
      const fullPath = safeWriteFile(projectRoot, caminhoArquivo, conteudo);
      return textResponse(
        `Documento salvo com sucesso em: ${fullPath}\n${formatProjectRoot(
          projectRoot
        )}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido.";
      return textResponse(`Erro ao salvar documento: ${message}`, true);
    }
  }

  if (toolName === "gerar_estrutura_pastas") {
    const projectRoot = resolveProjectRoot(args);
    const pastas = getStringArrayArg(args, "pastas");

    if (!pastas) {
      return textResponse("Parametro obrigatorio ausente: pastas.", true);
    }

    try {
      const caminhosCriados: string[] = [];
      pastas.forEach((pasta) => {
        const absolutePath = resolveProjectPath(projectRoot, pasta);
        if (!fs.existsSync(absolutePath)) {
          fs.mkdirSync(absolutePath, { recursive: true });
        }
        caminhosCriados.push(absolutePath);
      });

      return textResponse(
        `Estrutura de pastas gerada com sucesso:\n- ${caminhosCriados.join(
          "\n- "
        )}\n${formatProjectRoot(projectRoot)}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido.";
      return textResponse(`Erro ao criar estrutura de pastas: ${message}`, true);
    }
  }

  if (toolName === "criar_plano_de_tarefas") {
    const projectRoot = resolveProjectRoot(args);
    const tarefas = getStringArrayArg(args, "tarefas");
    const caminhoArquivo = getStringArg(args, "caminho_arquivo");

    if (!tarefas || !caminhoArquivo) {
      return textResponse(
        "Parametros obrigatorios ausentes: tarefas e caminho_arquivo.",
        true
      );
    }

    let conteudo = "# Plano de Tarefas\n\n";
    tarefas.forEach((tarefa) => {
      conteudo += `- [ ] ${tarefa}\n`;
    });

    try {
      const fullPath = safeWriteFile(projectRoot, caminhoArquivo, conteudo);
      return textResponse(
        `Plano de tarefas criado com sucesso em: ${fullPath}\n${formatProjectRoot(
          projectRoot
        )}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido.";
      return textResponse(`Erro ao criar plano de tarefas: ${message}`, true);
    }
  }

  if (toolName === "gerar_diagrama_mermaid") {
    const projectRoot = resolveProjectRoot(args);
    const caminhoArquivo = getStringArg(args, "caminho_arquivo");
    const codigoMermaid = getStringArg(args, "codigo_mermaid");

    if (!caminhoArquivo || codigoMermaid === undefined) {
      return textResponse(
        "Parametros obrigatorios ausentes: caminho_arquivo e codigo_mermaid.",
        true
      );
    }

    try {
      const fullPath = safeWriteFile(projectRoot, caminhoArquivo, codigoMermaid);
      return textResponse(
        `Diagrama Mermaid salvo com sucesso em: ${fullPath}\n${formatProjectRoot(
          projectRoot
        )}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido.";
      return textResponse(`Erro ao salvar diagrama Mermaid: ${message}`, true);
    }
  }

  if (toolName === "gerar_pipeline_github_actions") {
    const projectRoot = resolveProjectRoot(args);
    const stack = getStringArg(args, "stack");
    const passos = getStringArrayArg(args, "passos") ?? ["install", "test"];
    const caminhoArquivo = ".github/workflows/main.yml";

    if (!stack) {
      return textResponse("Parametro obrigatorio ausente: stack.", true);
    }

    let actionsCode =
      'name: CI/CD Pipeline\n\non:\n  push:\n    branches: [ "main" ]\n  pull_request:\n    branches: [ "main" ]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n';

    if (stack.toLowerCase() === "node" || stack.toLowerCase() === "react") {
      actionsCode +=
        '      - name: Use Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: "20.x"\n';
      if (passos.includes("install")) {
        actionsCode += "      - run: npm install\n";
      }
      if (passos.includes("lint")) {
        actionsCode += "      - run: npm run lint\n";
      }
      if (passos.includes("test")) {
        actionsCode += "      - run: npm test\n";
      }
      if (passos.includes("build")) {
        actionsCode += "      - run: npm run build\n";
      }
    } else {
      actionsCode += `      - run: echo "Estrutura para ${stack} gerada de forma generica"\n`;
    }

    try {
      const fullPath = safeWriteFile(projectRoot, caminhoArquivo, actionsCode);
      return textResponse(
        `Pipeline GitHub Actions gerado em: ${fullPath}\n${formatProjectRoot(
          projectRoot
        )}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido.";
      return textResponse(`Erro ao gerar pipeline: ${message}`, true);
    }
  }

  if (toolName === "auditoria_dependencias") {
    const projectRoot = resolveProjectRoot(args);

    try {
      readPackageJson(projectRoot);
      const { stdout, stderr } = await runFileCommand(
        npmCommand,
        ["audit"],
        projectRoot
      );

      return textResponse(
        `Relatorio de Auditoria (npm audit):\n${stdout}\n${stderr}\n${formatProjectRoot(
          projectRoot
        )}`
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "stdout" in error &&
        typeof error.stdout === "string"
      ) {
        return textResponse(
          `Relatorio de Auditoria (vulnerabilidades encontradas):\n${error.stdout}\n${formatProjectRoot(
            projectRoot
          )}`
        );
      }

      const message =
        error instanceof Error ? error.message : "Erro desconhecido.";
      return textResponse(`Erro ao executar auditoria: ${message}`, true);
    }
  }

  if (toolName === "analisar_esquema_banco") {
    const projectRoot = resolveProjectRoot(args);
    const caminhoArquivo = getStringArg(args, "caminho_arquivo");

    if (!caminhoArquivo) {
      return textResponse(
        "Parametro obrigatorio ausente: caminho_arquivo.",
        true
      );
    }

    try {
      const absolutePath = resolveProjectPath(projectRoot, caminhoArquivo);
      if (!fs.existsSync(absolutePath)) {
        return textResponse(
          `O arquivo de schema nao foi encontrado em: ${absolutePath}.\n${formatProjectRoot(
            projectRoot
          )}`,
          true
        );
      }

      const conteudo = fs.readFileSync(absolutePath, "utf-8");
      return textResponse(
        `Conteudo do Schema do Banco de Dados (${caminhoArquivo}):\n\n${conteudo}\n${formatProjectRoot(
          projectRoot
        )}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido.";
      return textResponse(`Erro ao ler o esquema do banco: ${message}`, true);
    }
  }

  if (toolName === "ler_contexto_da_arquitetura") {
    const projectRoot = resolveProjectRoot(args);
    const contextPath = path.join(projectRoot, "AI_CONTEXT.md");

    if (!fs.existsSync(contextPath)) {
      return textResponse(
        `Arquivo AI_CONTEXT.md nao encontrado.\n${formatProjectRoot(
          projectRoot
        )}`
      );
    }

    const conteudo = fs.readFileSync(contextPath, "utf-8");
    return textResponse(
      `Contexto do Projeto (Regras e Decisoes):\n\n${conteudo}\n${formatProjectRoot(
        projectRoot
      )}`
    );
  }

  if (toolName === "atualizar_contexto_da_arquitetura") {
    const projectRoot = resolveProjectRoot(args);
    const novaRegra = getStringArg(args, "nova_regra");

    if (!novaRegra) {
      return textResponse("Parametro obrigatorio ausente: nova_regra.", true);
    }

    const contextPath = path.join(projectRoot, "AI_CONTEXT.md");
    let currentContent =
      "# Contexto da Arquitetura & Decisoes do Projeto\n\nEste documento evolui com o projeto. Ele contem regras de negocio, decisoes tecnicas e stack.\n\n## Regras Descobertas e Adicionadas:\n";

    if (fs.existsSync(contextPath)) {
      currentContent = fs.readFileSync(contextPath, "utf-8");
    }

    const timeNow = new Date().toISOString().split("T")[0];
    const newContent = `${currentContent}\n- [${timeNow}] ${novaRegra}`;

    try {
      safeWriteFile(projectRoot, "AI_CONTEXT.md", newContent);
      return textResponse(
        `Contexto do projeto atualizado com sucesso no arquivo AI_CONTEXT.md.\n${formatProjectRoot(
          projectRoot
        )}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido.";
      return textResponse(`Erro ao atualizar o contexto: ${message}`, true);
    }
  }

  if (toolName === "gerar_esqueleto_de_testes") {
    const projectRoot = resolveProjectRoot(args);
    const caminho = getStringArg(args, "caminho_arquivo");
    const framework = getStringArg(args, "framework");
    const cenarios = getStringArrayArg(args, "cenarios");

    if (!caminho || !framework || !cenarios) {
      return textResponse(
        "Parametros obrigatorios ausentes: caminho_arquivo, framework e cenarios.",
        true
      );
    }

    let testCode = "";
    const frameworkNormalizado = framework.toLowerCase();

    if (frameworkNormalizado === "jest" || frameworkNormalizado === "vitest") {
      const moduleName = path.basename(caminho).split(".")[0];
      testCode += `import { describe, it, expect } from '${frameworkNormalizado}';\n\n`;
      testCode += `describe('${moduleName} module', () => {\n`;
      cenarios.forEach((cenario) => {
        testCode +=
          `  it('deve ${cenario}', () => {\n` +
          "    // TODO: Implementar teste antes da logica (TDD)\n" +
          "    expect(true).toBe(false);\n" +
          "  });\n\n";
      });
      testCode += "});\n";
    } else {
      testCode = `// Esqueleto de testes para ${frameworkNormalizado}\n// Cenarios a cobrir:\n`;
      cenarios.forEach((cenario) => {
        testCode += `// - ${cenario}\n`;
      });
    }

    try {
      const fullPath = safeWriteFile(projectRoot, caminho, testCode);
      return textResponse(
        `Esqueleto TDD gerado com falhas intencionais em: ${fullPath}\n${formatProjectRoot(
          projectRoot
        )}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido.";
      return textResponse(`Erro ao gerar scaffold de testes: ${message}`, true);
    }
  }

  if (toolName === "commit_small_release") {
    const projectRoot = resolveProjectRoot(args);
    const message = getStringArg(args, "mensagem_commit");

    if (!message) {
      return textResponse(
        "Parametro obrigatorio ausente: mensagem_commit.",
        true
      );
    }

    try {
      const { scripts } = readPackageJson(projectRoot);
      const observacoes: string[] = [];

      if (scripts.lint) {
        try {
          await runFileCommand(npmCommand, ["run", "lint"], projectRoot);
        } catch (error) {
          const stdout =
            typeof error === "object" &&
            error !== null &&
            "stdout" in error &&
            typeof error.stdout === "string"
              ? error.stdout
              : "";
          const stderr =
            typeof error === "object" &&
            error !== null &&
            "stderr" in error &&
            typeof error.stderr === "string"
              ? error.stderr
              : "";

          return textResponse(
            `COMMIT BLOQUEADO: o lint falhou.\n\n${stdout}\n${stderr}\n${formatProjectRoot(
              projectRoot
            )}`,
            true
          );
        }
      } else {
        observacoes.push("Script de lint ausente; etapa ignorada.");
      }

      if (!scripts.test) {
        return textResponse(
          `COMMIT BLOQUEADO: o projeto nao possui script de testes em package.json.\n${formatProjectRoot(
            projectRoot
          )}`,
          true
        );
      }

      if (scripts.test.includes("no test specified")) {
        return textResponse(
          `COMMIT BLOQUEADO: o script de testes ainda e o placeholder padrao do npm.\n${formatProjectRoot(
            projectRoot
          )}`,
          true
        );
      }

      try {
        await runFileCommand(npmCommand, ["test"], projectRoot);
      } catch (error) {
        const stdout =
          typeof error === "object" &&
          error !== null &&
          "stdout" in error &&
          typeof error.stdout === "string"
            ? error.stdout
            : "";
        const stderr =
          typeof error === "object" &&
          error !== null &&
          "stderr" in error &&
          typeof error.stderr === "string"
            ? error.stderr
            : "";

        return textResponse(
          `COMMIT BLOQUEADO: os testes falharam.\n\n${stdout}\n${stderr}\n${formatProjectRoot(
            projectRoot
          )}`,
          true
        );
      }

      try {
        await ensureGitRepository(projectRoot);
      } catch {
        return textResponse(
          `COMMIT BLOQUEADO: o diretorio resolvido nao esta dentro de um repositorio git.\n${formatProjectRoot(
            projectRoot
          )}`,
          true
        );
      }

      await runFileCommand("git", ["add", "-A", "."], projectRoot);
      const staged = await runFileCommand(
        "git",
        ["diff", "--cached", "--name-only"],
        projectRoot
      );

      if (!staged.stdout.trim()) {
        return textResponse(
          `Nenhuma alteracao staged para commitar.\n${formatProjectRoot(
            projectRoot
          )}`,
          true
        );
      }

      const commitResult = await runFileCommand(
        "git",
        ["commit", "-m", message],
        projectRoot
      );

      const observacoesTexto =
        observacoes.length > 0
          ? `\nObservacoes:\n- ${observacoes.join("\n- ")}`
          : "";

      return textResponse(
        `Small Release concluido com sucesso.\n\n${commitResult.stdout}${observacoesTexto}\n${formatProjectRoot(
          projectRoot
        )}`
      );
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "Erro desconhecido.";
      return textResponse(`Falha na esteira de commit: ${detail}`, true);
    }
  }

  throw new Error(`Ferramenta nao suportada pelo Arquiteto: ${toolName}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  const startupRoot = configuredProjectRoot ?? process.cwd();
  console.error(
    `AI Architect MCP Server iniciado com sucesso. Projeto padrao: ${startupRoot}`
  );
}

main().catch((error) => {
  console.error("Erro fatal na inicializacao:", error);
  process.exit(1);
});
