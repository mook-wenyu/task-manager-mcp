import { access } from "fs/promises";
import path from "path";
import { z } from "zod";
import { getTaskById } from "../../models/taskModel.js";
import { writeJsonFileAtomic, writeTextFileAtomic } from "../../utils/fileWriter.js";
import { getDataDir } from "../../utils/paths.js";
import type { Task } from "../../types/index.js";

function buildSpecMarkdown(task: Task): string {
  const lines = [
    `# 任务规格：${task.name}`,
    "",
    "## 一、任务背景",
    task.description ?? "（请填写任务背景与业务上下文）",
    "",
    "## 二、目标与成果",
    "- [ ] 清晰列出业务/技术目标",
    "- [ ] 明确成功判定标准",
    "",
    "## 三、范围界定",
    "- 正向范围：",
    "- 排除项：",
    "",
    "## 四、实现策略",
    "1. 关键步骤与里程碑",
    "2. 依赖的外部接口或资源",
    "",
    "## 五、交付物清单",
    "- 代码改动：",
    "- 文档与示例：",
    "",
    "## 六、风险与澄清项",
    "- 待确认问题：",
    "- 风险缓解策略：",
  ];

  return `${lines.join("\n")}\n`;
}

function buildSpecJson(task: Task): Record<string, unknown> {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: task.name,
    description: task.description ?? "任务规格骨架",
    type: "object",
    required: ["objective", "scope"],
    properties: {
      objective: {
        type: "string",
        description: "描述本任务期望达成的业务与技术目标",
      },
      acceptanceCriteria: {
        type: "array",
        items: { type: "string" },
        description: "罗列可验证的验收标准",
      },
      scope: {
        type: "object",
        properties: {
          include: {
            type: "array",
            items: { type: "string" },
          },
          exclude: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      deliverables: {
        type: "array",
        items: { type: "string" },
        description: "列出需要交付的产出物",
      },
      openQuestions: {
        type: "array",
        items: { type: "string" },
        description: "记录仍待澄清的问题",
      },
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      taskId: task.id,
    },
  };
}

function buildGraphTemplate(task: Task): Record<string, unknown> {
  return {
    taskId: task.id,
    nodes: [
      { id: "spec", label: "规格", type: "phase" },
      { id: "implementation", label: "实现", type: "phase" },
      { id: "verification", label: "验证", type: "phase" },
    ],
    edges: [
      { from: "spec", to: "implementation" },
      { from: "implementation", to: "verification" },
    ],
  };
}

const REQUIRED_FILES = ["spec.md", "spec.json", "graph.json"] as const;

type RequiredFileName = (typeof REQUIRED_FILES)[number];

async function ensureFilesCanBeGenerated(
  specsDir: string,
  force: boolean
): Promise<void> {
  if (force) {
    return;
  }

  for (const fileName of REQUIRED_FILES) {
    const absolutePath = path.join(specsDir, fileName);
    try {
      await access(absolutePath);
      throw new Error(
        `检测到已存在的模板文件：${absolutePath}。如需覆盖，请设置 force=true。`
      );
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError?.code === "ENOENT") {
        continue;
      }
      throw error;
    }
  }
}

const SpecTemplateResultSchema = z.object({
  taskId: z.string().uuid(),
  force: z.boolean().optional(),
});

export const generateSpecTemplateSchema = SpecTemplateResultSchema;

export async function generateSpecTemplate(
  { taskId, force = false }: z.infer<typeof generateSpecTemplateSchema>
) {
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
  const specsDir = path.join(dataDir, "specs", taskId);

  try {
    await ensureFilesCanBeGenerated(specsDir, force);
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

  const files: Record<RequiredFileName, string> = {
    "spec.md": path.join(specsDir, "spec.md"),
    "spec.json": path.join(specsDir, "spec.json"),
    "graph.json": path.join(specsDir, "graph.json"),
  };

  await writeTextFileAtomic(files["spec.md"], buildSpecMarkdown(task));
  await writeJsonFileAtomic(files["spec.json"], buildSpecJson(task));
  await writeJsonFileAtomic(files["graph.json"], buildGraphTemplate(task));

  const summaryLines = [
    "## 规格模板已生成",
    "",
    `- ${path.relative(dataDir, files["spec.md"])} (Markdown)`,
    `- ${path.relative(dataDir, files["spec.json"])} (JSON Schema)`,
    `- ${path.relative(dataDir, files["graph.json"])} (任务图)`,
  ];

  return {
    content: [
      {
        type: "text" as const,
        text: `${summaryLines.join("\n")}\n`,
      },
    ],
    structuredContent: {
      kind: "spec.generateTemplate",
      payload: {
        taskId,
        directory: specsDir,
        files: REQUIRED_FILES.map((fileName) => ({
          name: fileName,
          path: files[fileName],
        })),
      },
    },
  };
}
