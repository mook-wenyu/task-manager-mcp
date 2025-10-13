import { access, readFile } from "fs/promises";
import path from "path";
import { z } from "zod";
import { getTaskById } from "../../models/taskModel.js";
import {
  writeJsonFileAtomic,
  writeTextFileAtomic,
} from "../../utils/fileWriter.js";
import { getDataDir } from "../../utils/paths.js";
import type { Task } from "../../types/index.js";

const WORKFLOW_VERSION = 1;

const PATTERN_OPTIONS = ["serial", "parallel", "evaluator"] as const;

type WorkflowPattern = (typeof PATTERN_OPTIONS)[number];

const WorkflowStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  stage: z.string().optional(),
});

const WorkflowDefinitionSchema = z.object({
  version: z.literal(WORKFLOW_VERSION),
  taskId: z.string().uuid(),
  pattern: z.enum(PATTERN_OPTIONS),
  createdAt: z.string(),
  updatedAt: z.string(),
  summary: z.string(),
  steps: z.array(WorkflowStepSchema).min(1),
});

export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;

const WorkflowGenerateSchema = z.object({
  taskId: z.string().uuid({
    message: "任务 ID 需为有效的 UUID v4",
  }),
  pattern: z.enum(PATTERN_OPTIONS).optional(),
  force: z.boolean().optional(),
});

export const generateWorkflowSchema = WorkflowGenerateSchema;

function getSpecsDir(dataDir: string, taskId: string) {
  return path.join(dataDir, "specs", taskId);
}

function getWorkflowJsonPath(specsDir: string) {
  return path.join(specsDir, "workflow.json");
}

function getWorkflowMarkdownPath(specsDir: string) {
  return path.join(specsDir, "workflow.md");
}

async function ensureWritable(filePath: string, force: boolean) {
  if (force) {
    return;
  }
  try {
    await access(filePath);
    throw new Error(
      `检测到已存在的工作流文件：${filePath}。如需覆盖请设置 force=true。`
    );
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError?.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

function buildSerialWorkflow(task: Task): WorkflowDefinition {
  const now = new Date().toISOString();
  return {
    version: WORKFLOW_VERSION,
    taskId: task.id,
    pattern: "serial",
    createdAt: now,
    updatedAt: now,
    summary:
      "串行模式：按规格→实现→验证的顺序推进，适用于单线程执行与严格依赖。",
    steps: [
      {
        id: "spec",
        title: "规格整理",
        description: "确认上下文、交付物与验收准则，产出规格模板。",
        stage: "spec",
      },
      {
        id: "implementation",
        title: "实现执行",
        description: "依据规格执行编码与修改，保持小步提交与随改随测。",
        stage: "implementation",
      },
      {
        id: "verification",
        title: "验证记录",
        description: "运行测试并记录验证结果，补充风险与后续行动。",
        stage: "verification",
      },
    ],
  };
}

function buildParallelWorkflow(task: Task): WorkflowDefinition {
  const now = new Date().toISOString();
  return {
    version: WORKFLOW_VERSION,
    taskId: task.id,
    pattern: "parallel",
    createdAt: now,
    updatedAt: now,
    summary:
      "并行模式：规格与调研先行，实施与验证可并行推进，适合多角色协作场景。",
    steps: [
      {
        id: "spec",
        title: "规格协调",
        description: "集结需求方与执行方，共享规格草案与边界确认。",
        stage: "spec",
      },
      {
        id: "research",
        title: "调研澄清",
        description: "同步研究任务、外部依赖与风险缓解，保持信息流动。",
        stage: "analysis",
      },
      {
        id: "implementation",
        title: "实现同步",
        description: "多人协同实现，分派组件/子模块并进行互审。",
        stage: "implementation",
      },
      {
        id: "verification",
        title: "交叉验证",
        description: "实施者与评审者并行运行测试、编写验收记录。",
        stage: "verification",
      },
    ],
  };
}

function buildEvaluatorWorkflow(task: Task): WorkflowDefinition {
  const now = new Date().toISOString();
  return {
    version: WORKFLOW_VERSION,
    taskId: task.id,
    pattern: "evaluator",
    createdAt: now,
    updatedAt: now,
    summary:
      "审查模式：在实现阶段引入评估者角色，确保关键决策与质量门禁独立完成。",
    steps: [
      {
        id: "spec",
        title: "规格审阅",
        description: "编写规格并由审阅者确认范围、验收标准与风险。",
        stage: "spec",
      },
      {
        id: "implementation",
        title: "实现交付",
        description:
          "执行编码与文档同步，提交最小可行实现并附自测记录。",
        stage: "implementation",
      },
      {
        id: "evaluation",
        title: "质量评估",
        description:
          "独立评估者审查实现与测试，必要时退回修正或确认通过。",
        stage: "evaluation",
      },
      {
        id: "verification",
        title: "验收归档",
        description: "记录评估结论、验收证据与后续待办，归档产出物。",
        stage: "verification",
      },
    ],
  };
}

function buildWorkflowDefinition(task: Task, pattern: WorkflowPattern) {
  switch (pattern) {
    case "parallel":
      return buildParallelWorkflow(task);
    case "evaluator":
      return buildEvaluatorWorkflow(task);
    case "serial":
    default:
      return buildSerialWorkflow(task);
  }
}

function buildWorkflowMarkdown(
  definition: WorkflowDefinition,
  dataDir: string,
  jsonPath: string,
  markdownPath: string
) {
  const lines: string[] = [
    "## 工作流模板已生成",
    "",
    `- 模式：${definition.pattern}`,
    `- 摘要：${definition.summary}`,
    "",
    "### 推荐步骤",
  ];

  definition.steps.forEach((step, index) => {
    const parts = [`${index + 1}. **${step.title}** (${step.id})`];
    if (step.stage) {
      parts.push(`阶段：${step.stage}`);
    }
    if (step.description) {
      parts.push(step.description);
    }
    lines.push(parts.join(" · "));
  });

  lines.push(
    "",
    "### 文件位置",
    `- ${path.relative(dataDir, jsonPath)} (JSON)`,
    `- ${path.relative(dataDir, markdownPath)} (Markdown)`
  );

  return `${lines.join("\n")}\n`;
}

export async function loadWorkflowDefinition(
  taskId: string
): Promise<WorkflowDefinition | null> {
  try {
    const dataDir = await getDataDir();
    const jsonPath = getWorkflowJsonPath(getSpecsDir(dataDir, taskId));
    const raw = await readFile(jsonPath, "utf-8");
    const parsed = JSON.parse(raw);
    return WorkflowDefinitionSchema.parse(parsed);
  } catch {
    return null;
  }
}

export async function generateWorkflow(
  params: z.infer<typeof WorkflowGenerateSchema>
) {
  const { taskId, pattern = "serial", force = false } = params;
  const task = await getTaskById(taskId);

  if (!task) {
    const message = `找不到 ID 为 \`${taskId}\` 的任务，请确认后重试。`;
    return {
      content: [
        {
          type: "text" as const,
          text: `## 生成失败\n\n${message}`,
        },
      ],
      isError: true as const,
    };
  }

  const dataDir = await getDataDir();
  const specsDir = getSpecsDir(dataDir, taskId);
  const workflowJsonPath = getWorkflowJsonPath(specsDir);
  const workflowMarkdownPath = getWorkflowMarkdownPath(specsDir);

  try {
    await ensureWritable(workflowJsonPath, force);
    await ensureWritable(workflowMarkdownPath, force);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error ?? "未知错误");
    return {
      content: [
        {
          type: "text" as const,
          text: `## 生成终止\n\n${message}`,
        },
      ],
      isError: true as const,
    };
  }

  const definition = buildWorkflowDefinition(task, pattern);
  await writeJsonFileAtomic(workflowJsonPath, definition);
  const markdown = buildWorkflowMarkdown(
    definition,
    dataDir,
    workflowJsonPath,
    workflowMarkdownPath
  );
  await writeTextFileAtomic(workflowMarkdownPath, markdown);

  return {
    content: [
      {
        type: "text" as const,
        text: markdown,
      },
    ],
    structuredContent: {
      kind: "workflow.generate" as const,
      payload: {
        markdown,
        taskId,
        pattern: definition.pattern,
        directory: specsDir,
        files: [
          {
            name: "workflow.json",
            path: workflowJsonPath,
            format: "json",
          },
          {
            name: "workflow.md",
            path: workflowMarkdownPath,
            format: "markdown",
          },
        ],
        workflow: {
          pattern: definition.pattern,
          summary: definition.summary,
          steps: definition.steps.map((step) => ({
            id: step.id,
            title: step.title,
            description: step.description,
            stage: step.stage,
          })),
        },
      },
    },
  };
}
