import "dotenv/config";
import { loadPromptFromTemplate } from "./prompts/loader.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { performance } from "node:perf_hooks";
import type { ZodRawShape } from "zod";
import { setGlobalServer } from "./utils/paths.js";
import {
  TOOL_STRUCTURED_SCHEMAS,
  validateStructuredContent,
  type ToolStructuredContentName,
} from "./tools/schemas/index.js";
import { logToolInvocation } from "./utils/structuredLogger.js";
import { recordMemoryFromTool } from "./utils/memoryRecorder.js";
import { validateProtocolVersion } from "./utils/protocolGuards.js";

import {
  planTask,
  planTaskSchema,
  analyzeTask,
  analyzeTaskSchema,
  reflectTask,
  reflectTaskSchema,
  splitTasksRaw,
  splitTasksRawSchema,
  listTasks,
  listTasksSchema,
  executeTask,
  executeTaskSchema,
  verifyTask,
  verifyTaskSchema,
  deleteTask,
  deleteTaskSchema,
  clearAllTasks,
  clearAllTasksSchema,
  updateTaskContent,
  updateTaskContentSchema,
  queryTask,
  queryTaskSchema,
  getTaskDetail,
  getTaskDetailSchema,
  processThought,
  processThoughtSchema,
  initProjectRules,
  researchMode,
  researchModeSchema,
  memoryReplay,
  memoryReplaySchema,
  generateSpecTemplate,
  generateSpecTemplateSchema,
  registerConnection,
  registerConnectionSchema,
  generateWorkflow,
  generateWorkflowSchema,
  renderRolePrompt,
  renderRolePromptSchema,
  queueResearchTask,
  queueResearchTaskSchema,
} from "./tools/index.js";

type ToolInvocation = CallToolResult | Promise<CallToolResult>;

type BaseToolDefinition = {
  name: string;
  template: string;
  title?: string;
};

type ToolDefinition =
  | (BaseToolDefinition & {
      schema: ZodRawShape;
      invoke: (args: unknown) => ToolInvocation;
    })
  | (BaseToolDefinition & {
      invoke: () => ToolInvocation;
    });

const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "plan_task",
    template: "toolsDescription/planTask.md",
    schema: planTaskSchema.shape,
    invoke: (args) => planTask(args as unknown as Parameters<typeof planTask>[0]),
  },
  {
    name: "analyze_task",
    template: "toolsDescription/analyzeTask.md",
    schema: analyzeTaskSchema.shape,
    invoke: (args) => analyzeTask(args as unknown as Parameters<typeof analyzeTask>[0]),
  },
  {
    name: "reflect_task",
    template: "toolsDescription/reflectTask.md",
    schema: reflectTaskSchema.shape,
    invoke: (args) => reflectTask(args as unknown as Parameters<typeof reflectTask>[0]),
  },
  {
    name: "split_tasks",
    template: "toolsDescription/splitTasks.md",
    schema: splitTasksRawSchema.shape,
    invoke: (args) => splitTasksRaw(args as unknown as Parameters<typeof splitTasksRaw>[0]),
  },
  {
    name: "list_tasks",
    template: "toolsDescription/listTasks.md",
    schema: listTasksSchema.shape,
    invoke: (args) => listTasks(args as unknown as Parameters<typeof listTasks>[0]),
  },
  {
    name: "execute_task",
    template: "toolsDescription/executeTask.md",
    schema: executeTaskSchema.shape,
    invoke: (args) => executeTask(args as unknown as Parameters<typeof executeTask>[0]),
  },
  {
    name: "verify_task",
    template: "toolsDescription/verifyTask.md",
    schema: verifyTaskSchema.shape,
    invoke: (args) => verifyTask(args as unknown as Parameters<typeof verifyTask>[0]),
  },
  {
    name: "delete_task",
    template: "toolsDescription/deleteTask.md",
    schema: deleteTaskSchema.shape,
    invoke: (args) => deleteTask(args as unknown as Parameters<typeof deleteTask>[0]),
  },
  {
    name: "clear_all_tasks",
    template: "toolsDescription/clearAllTasks.md",
    schema: clearAllTasksSchema.shape,
    invoke: (args) => clearAllTasks(args as unknown as Parameters<typeof clearAllTasks>[0]),
  },
  {
    name: "update_task",
    template: "toolsDescription/updateTask.md",
    schema: updateTaskContentSchema.shape,
    invoke: (args) =>
      updateTaskContent(args as unknown as Parameters<typeof updateTaskContent>[0]),
  },
  {
    name: "query_task",
    template: "toolsDescription/queryTask.md",
    schema: queryTaskSchema.shape,
    invoke: (args) => queryTask(args as unknown as Parameters<typeof queryTask>[0]),
  },
  {
    name: "get_task_detail",
    template: "toolsDescription/getTaskDetail.md",
    schema: getTaskDetailSchema.shape,
    invoke: (args) => getTaskDetail(args as unknown as Parameters<typeof getTaskDetail>[0]),
  },
  {
    name: "process_thought",
    template: "toolsDescription/processThought.md",
    schema: processThoughtSchema.shape,
    invoke: (args) => processThought(args as unknown as Parameters<typeof processThought>[0]),
  },
  {
    name: "memory_replay",
    template: "toolsDescription/memoryReplay.md",
    schema: memoryReplaySchema.shape,
    invoke: (args) => memoryReplay(args as unknown as Parameters<typeof memoryReplay>[0]),
  },
  {
    name: "generate_spec_template",
    template: "toolsDescription/generateSpecTemplate.md",
    schema: generateSpecTemplateSchema.shape,
    invoke: (args) =>
      generateSpecTemplate(
        args as unknown as Parameters<typeof generateSpecTemplate>[0]
      ),
  },
  {
    name: "generate_workflow",
    template: "toolsDescription/generateWorkflow.md",
    schema: generateWorkflowSchema.shape,
    invoke: (args) =>
      generateWorkflow(
        args as unknown as Parameters<typeof generateWorkflow>[0]
      ),
  },
  {
    name: "render_role_prompt",
    template: "toolsDescription/renderRolePrompt.md",
    schema: renderRolePromptSchema.shape,
    invoke: (args) =>
      renderRolePrompt(
        args as unknown as Parameters<typeof renderRolePrompt>[0]
      ),
  },
  {
    name: "register_connection",
    template: "toolsDescription/registerConnection.md",
    schema: registerConnectionSchema.shape,
    invoke: (args) =>
      registerConnection(
        args as unknown as Parameters<typeof registerConnection>[0]
      ),
  },
  {
    name: "init_project_rules",
    template: "toolsDescription/initProjectRules.md",
    invoke: () => initProjectRules(),
  },
  {
    name: "research_mode",
    template: "toolsDescription/researchMode.md",
    schema: researchModeSchema.shape,
    invoke: (args) => researchMode(args as unknown as Parameters<typeof researchMode>[0]),
  },
  {
    name: "queue_research_task",
    template: "toolsDescription/queueResearchTask.md",
    schema: queueResearchTaskSchema.shape,
    invoke: (args) =>
      queueResearchTask(
        args as unknown as Parameters<typeof queueResearchTask>[0]
      ),
  },
];

function hasStructuredSchema(name: string): name is ToolStructuredContentName {
  return Object.prototype.hasOwnProperty.call(
    TOOL_STRUCTURED_SCHEMAS,
    name
  );
}

function withStructuredValidation(
  name: ToolStructuredContentName,
  result: CallToolResult
): CallToolResult {
  if (!result.structuredContent) {
    console.warn(`[${name}] 缺少 structuredContent，已跳过 schema 校验`);
    return result;
  }

  const validated = validateStructuredContent(name, result.structuredContent);
  return {
    ...result,
    structuredContent: validated,
  };
}

async function resolveToolResult(
  name: string,
  invocation: ToolInvocation
): Promise<CallToolResult> {
  const result = await Promise.resolve(invocation);

  if (hasStructuredSchema(name)) {
    return withStructuredValidation(name, result);
  }

  return result;
}

function extractErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" || typeof code === "number") {
      return String(code);
    }
  }
  return undefined;
}

type RequestContext = {
  requestInfo?: {
    headers?: Record<string, string | string[] | undefined>;
  };
};

async function invokeWithLogging(
  name: string,
  invocation: ToolInvocation,
  extra?: RequestContext
): Promise<CallToolResult> {
  validateProtocolVersion(extra?.requestInfo?.headers);

  const startedAt = performance.now();
  try {
    const result = await resolveToolResult(name, invocation);
    logToolInvocation({
      toolName: name,
      status: "success",
      durationMs: Math.round(performance.now() - startedAt),
      hasStructuredContent: Boolean(result.structuredContent),
    });
    try {
      await recordMemoryFromTool(name, result);
    } catch (memoryError) {
      console.warn(
        `[${name}] 记录记忆时失败:`,
        memoryError instanceof Error ? memoryError.message : memoryError
      );
    }
    return result;
  } catch (error) {
    logToolInvocation({
      toolName: name,
      status: "error",
      durationMs: Math.round(performance.now() - startedAt),
      errorMessage: error instanceof Error ? error.message : String(error),
      errorCode: extractErrorCode(error),
    });
    throw error;
  }
}

async function registerTools(server: McpServer): Promise<void> {
  for (const tool of TOOL_DEFINITIONS) {
    const description = await loadPromptFromTemplate(tool.template);
    const baseConfig = {
      title: tool.title ?? tool.name,
      description,
    };

    const outputShape = hasStructuredSchema(tool.name)
      ? TOOL_STRUCTURED_SCHEMAS[tool.name].shape
      : undefined;

    if ("schema" in tool) {
      server.registerTool(
        tool.name,
        {
          ...baseConfig,
          inputSchema: tool.schema,
          ...(outputShape ? { outputSchema: outputShape } : {}),
        },
        async (args, extra) => {
          const invocation = tool.invoke(args);
          return await invokeWithLogging(tool.name, invocation, extra as RequestContext);
        }
      );
    } else {
      server.registerTool(
        tool.name,
        {
          ...baseConfig,
          ...(outputShape ? { outputSchema: outputShape } : {}),
        },
        async (_args, extra) => {
          const invocation = tool.invoke();
          return await invokeWithLogging(tool.name, invocation, extra as RequestContext);
        }
      );
    }
  }
}

async function main() {
  try {
    const server = new McpServer(
      {
        name: "Mook Task Manager MCP",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {
            listChanged: false,
          },
          logging: {},
          prompts: {},
          resources: {},
        },
      }
    );

    setGlobalServer(server.server);

    await registerTools(server);

    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    console.error("Mook Task Manager MCP 服务器启动失败", error);
    process.exit(1);
  }
}

main().catch(console.error);
