import { access, readFile } from "fs/promises";
import path from "path";
import { z } from "zod";
import { getTaskById } from "../../models/taskModel.js";
import { writeJsonFileAtomic } from "../../utils/fileWriter.js";
import { getDataDir } from "../../utils/paths.js";
import type { Task } from "../../types/index.js";

const ROLE_VERSION = 1;

const RoleTemplateSchema = z.object({
  name: z.string(),
  summary: z.string().optional(),
  responsibilities: z.string().optional(),
  prompt: z.string().optional(),
  defaultTools: z.array(z.string()).optional(),
});

export type RoleTemplate = z.infer<typeof RoleTemplateSchema>;

const RoleDocumentSchema = z.object({
  version: z.literal(ROLE_VERSION),
  taskId: z.string().uuid(),
  pattern: z.enum(["serial", "parallel", "evaluator"]),
  generatedAt: z.string(),
  roles: z.array(RoleTemplateSchema).min(1),
});

export type RoleDocument = z.infer<typeof RoleDocumentSchema>;

const RenderRolePromptSchema = z.object({
  taskId: z.string().uuid({
    message: "任务 ID 需为有效的 UUID v4",
  }),
  pattern: z.enum(["serial", "parallel", "evaluator"]).optional(),
  force: z.boolean().optional(),
});

export const renderRolePromptSchema = RenderRolePromptSchema;

function getSpecsDir(dataDir: string, taskId: string) {
  return path.join(dataDir, "specs", taskId);
}

function getRolesJsonPath(specsDir: string) {
  return path.join(specsDir, "roles.json");
}

async function ensureWritable(filePath: string, force: boolean) {
  if (force) {
    return;
  }
  try {
    await access(filePath);
    throw new Error(
      `检测到已存在的角色提示文件：${filePath}。如需覆盖请设置 force=true。`
    );
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError?.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

function buildRoles(task: Task, pattern: "serial" | "parallel" | "evaluator") {
  const baseRoles: Record<
    "specLead" | "implementer" | "reviewer" | "coordinator",
    RoleTemplate
  > = {
    specLead: {
      name: "规格主笔",
      summary: "整理上下文与范围，维护规格模板的一致性。",
      responsibilities:
        "收敛需求、维护 open questions、产出规格模板并同步风险。",
      prompt: `你是任务「${task.name}」的规格主笔，请先确认任务背景、输入依赖与验收标准，确保规格模板与实际目标一致，必要时更新 open questions。`,
      defaultTools: ["plan_task", "generate_spec_template"],
    },
    implementer: {
      name: "实现执行者",
      summary: "按照规格执行代码与文档改动，保持小步迭代。",
      responsibilities:
        "落地实现、同步测试记录、在执行过程中及时反馈风险。",
      prompt: `你负责任务「${task.name}」的实现阶段，请根据规格与工作流步骤执行代码修改与测试，并在完成后总结改动与自测情况。`,
      defaultTools: ["execute_task"],
    },
    reviewer: {
      name: "验证审阅者",
      summary: "负责质量审核、测试复核与验收记录。",
      responsibilities:
        "复核实现成果、运行或审查测试、补充验收与后续行动。",
      prompt: `你负责任务「${task.name}」的质量审核，请复核实现、验证测试并记录验收结论或需要补救的事项。`,
      defaultTools: ["verify_task"],
    },
    coordinator: {
      name: "协同协调者",
      summary: "维持多角色协作节奏与信息同步。",
      responsibilities:
        "组织并行任务、记录调研结果、协调连接与资源依赖。",
      prompt: `你负责任务「${task.name}」的协作协调，请同步调研/实现进展，维护连接与资源依赖，并推动角色按约定节奏协作。`,
      defaultTools: ["list_tasks", "research_mode"],
    },
  };

  switch (pattern) {
    case "parallel":
      return [
        baseRoles.specLead,
        baseRoles.coordinator,
        baseRoles.implementer,
        baseRoles.reviewer,
      ];
    case "evaluator":
      return [
        baseRoles.specLead,
        baseRoles.implementer,
        {
          ...baseRoles.reviewer,
          name: "评估者",
          summary: "独立评估实现质量，确保关键决策与风险透明。",
          responsibilities:
            "审查实现、复核测试覆盖，必要时退回调整并记录评估结论。",
          prompt: `你是任务「${task.name}」的评估者，请独立审查实现结果、确认关键决策与风险缓解，并输出评估结论。`,
          defaultTools: ["verify_task", "process_thought"],
        },
        baseRoles.reviewer,
      ];
    case "serial":
    default:
      return [baseRoles.specLead, baseRoles.implementer, baseRoles.reviewer];
  }
}

export async function loadRoleTemplates(
  taskId: string
): Promise<RoleTemplate[] | null> {
  try {
    const dataDir = await getDataDir();
    const jsonPath = getRolesJsonPath(getSpecsDir(dataDir, taskId));
    const raw = await readFile(jsonPath, "utf-8");
    const parsed = JSON.parse(raw);
    const document = RoleDocumentSchema.parse(parsed);
    return document.roles;
  } catch {
    return null;
  }
}

export async function renderRolePrompt(
  params: z.infer<typeof RenderRolePromptSchema>
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
  const rolesPath = getRolesJsonPath(specsDir);

  try {
    await ensureWritable(rolesPath, force);
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

  const roles = buildRoles(task, pattern);
  const document: RoleDocument = {
    version: ROLE_VERSION,
    taskId: task.id,
    pattern,
    generatedAt: new Date().toISOString(),
    roles,
  };

  await writeJsonFileAtomic(rolesPath, document);

  const summaryLines = [
    "## 角色提示已生成",
    "",
    `- 模式：${pattern}`,
    `- 角色数量：${roles.length}`,
    "",
    "### 角色分工",
    ...roles.map((role) => {
      const details = [role.name];
      if (role.summary) {
        details.push(role.summary);
      }
      return `- ${details.join(" · ")}`;
    }),
    "",
    `文件：${path.relative(dataDir, rolesPath)} (JSON)`,
  ];

  const markdown = `${summaryLines.join("\n")}\n`;

  return {
    content: [
      {
        type: "text" as const,
        text: markdown,
      },
    ],
    structuredContent: {
      kind: "roles.renderPrompt" as const,
      payload: {
        markdown,
        taskId,
        pattern,
        file: {
          path: rolesPath,
          format: "json",
        },
        roles,
      },
    },
  };
}
