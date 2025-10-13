import { z } from "zod";
import { getAllTasks } from "../../models/taskModel.js";
import { TaskStatus, Task } from "../../types/index.js";
import { getPlanTaskPrompt } from "../../prompts/index.js";
import { getGlobalServer, getMemoryDir } from "../../utils/paths.js";
import { createPlanTaskErrorResponse } from "./taskErrorHelpers.js";
import { listConnectionReferences } from "../../utils/connectionStore.js";

function getSpecTemplateBlueprint() {
  return {
    files: [
      {
        path: "<DATA_DIR>/specs/<taskId>/spec.md",
        format: "markdown",
        description: "规格正文骨架",
        required: true,
      },
      {
        path: "<DATA_DIR>/specs/<taskId>/spec.json",
        format: "json",
        description: "规格 JSON Schema 模板",
      },
      {
        path: "<DATA_DIR>/specs/<taskId>/graph.json",
        format: "json",
        description: "规格任务图模板",
      },
    ],
    sections: [
      {
        id: "overview",
        title: "任务背景",
        description: "说明业务上下文、问题与目标。",
      },
      {
        id: "scope",
        title: "范围界定",
        description: "列出包含与排除的工作内容。",
      },
      {
        id: "deliverables",
        title: "交付物清单",
        description: "约定代码、文档与演示等输出。",
      },
      {
        id: "risks",
        title: "风险与依赖",
        description: "识别阻塞因素与待确认项。",
      },
    ],
    questions: [
      "有哪些输入或外部依赖需要澄清？",
      "验收标准如何判定成功？",
      "是否存在时程或资源约束？",
    ],
  };
}

function getWorkflowPatternBlueprint() {
  return {
    default: "serial",
    options: [
      {
        name: "serial",
        description: "规格→实现→验证顺序推进，适合单线程执行。",
      },
      {
        name: "parallel",
        description: "规格与调研并行，适用于多人协作同步推进。",
      },
      {
        name: "evaluator",
        description: "引入独立评估阶段，强调质量门禁与复审。",
      },
    ],
    suggestedSteps: [
      {
        id: "spec",
        title: "规格整理",
        description: "收集上下文与范围，明确验收标准。",
        stage: "spec",
      },
      {
        id: "implementation",
        title: "实现执行",
        description: "按照规格小步迭代并记录测试结果。",
        stage: "implementation",
      },
      {
        id: "verification",
        title: "验证归档",
        description: "运行测试、记录验证与后续行动。",
        stage: "verification",
      },
    ],
  };
}

function getRoleBlueprint() {
  return [
    {
      name: "规格主笔",
      summary: "梳理需求、维护规格与开放问题列表。",
      responsibilities:
        "产出规格模板、同步风险与澄清项，保持上下文一致性。",
      defaultTools: ["plan_task", "generate_spec_template"],
    },
    {
      name: "实现执行者",
      summary: "依据规格落地代码与文档变更，确保最小可行实现。",
      responsibilities:
        "小步提交、随改随测、更新实施记录与相关文档链接。",
      defaultTools: ["execute_task"],
    },
    {
      name: "验证审阅者",
      summary: "复核实现质量、验证测试并记录验收结论。",
      responsibilities:
        "运行/审查测试、补充验收记录、给出后续改进建议。",
      defaultTools: ["verify_task"],
    },
  ];
}

function getOpenQuestionsBlueprint(
  specTemplate = getSpecTemplateBlueprint()
) {
  const questions = specTemplate.questions ?? [];
  return questions.map((question, index) => ({
    id: `oq-${index + 1}`,
    question,
    required: true,
  }));
}

// 开始规划工具
// Start planning tool
export const planTaskSchema = z.object({
  description: z
    .string()
    .min(10, {
      message: "任务描述不能少于10个字符，请提供更详细的描述以确保任务目标明确",
      // Task description cannot be less than 10 characters, please provide a more detailed description to ensure clear task objectives
    })
    .describe("完整详细的任务问题描述，应包含任务目标、背景及预期成果"),
    // Complete and detailed task problem description, should include task objectives, background and expected results
  requirements: z
    .string()
    .optional()
    .describe("任务的特定技术要求、业务约束条件或品质标准（选填）"),
    // Specific technical requirements, business constraints or quality standards for the task (optional)
  existingTasksReference: z
    .boolean()
    .optional()
    .default(false)
    .describe("是否参考现有任务作为规划基础，用于任务调整和延续性规划"),
    // Whether to reference existing tasks as a planning foundation, used for task adjustment and continuity planning
});

export async function planTask({
  description,
  requirements,
  existingTasksReference = false,
}: z.infer<typeof planTaskSchema>) {
  const MEMORY_DIR = await getMemoryDir();
  const server = getGlobalServer();
  let finalRequirements = requirements;
  let existingTaskStats:
    | {
        total: number;
        completed: number;
        pending: number;
      }
    | undefined;

  try {
    if (!finalRequirements && server?.elicitInput) {
      try {
        const elicitation = await server.elicitInput({
          message:
            "是否要补充本次规划的技术/业务约束（可留空跳过）？",
          requestedSchema: {
            type: "object",
            properties: {
              requirements: {
                type: "string",
                title: "额外约束",
                description:
                  "例如性能目标、接口依赖、上线窗口等（可选）",
              },
            },
          },
        });

        if (
          elicitation.action === "accept" &&
          typeof elicitation.content?.requirements === "string"
        ) {
          const trimmed = elicitation.content.requirements.trim();
          if (trimmed.length > 0) {
            finalRequirements = trimmed;
          }
        }
      } catch (error) {
        console.warn(
          "planTask elicitation failed",
          error instanceof Error ? error.message : error
        );
      }
    }

    // 准备所需参数
    // Prepare required parameters
    let completedTasks: Task[] = [];
    let pendingTasks: Task[] = [];

    // 当 existingTasksReference 为 true 时，从数据库中加载所有任务作为参考
    // When existingTasksReference is true, load all tasks from database as reference
    if (existingTasksReference) {
      try {
        const allTasks = await getAllTasks();

        // 将任务分为已完成和未完成两类
        // Divide tasks into completed and incomplete categories
        completedTasks = allTasks.filter(
          (task) => task.status === TaskStatus.COMPLETED
        );
        pendingTasks = allTasks.filter(
          (task) => task.status !== TaskStatus.COMPLETED
        );
        existingTaskStats = {
          total: completedTasks.length + pendingTasks.length,
          completed: completedTasks.length,
          pending: pendingTasks.length,
        };
      } catch (error) {
        existingTaskStats = undefined;
      }
    }

    // 使用prompt生成器获取最终prompt
    // Use prompt generator to get the final prompt
    const prompt = await getPlanTaskPrompt({
      description,
      requirements: finalRequirements,
      existingTasksReference,
      completedTasks,
      pendingTasks,
      memoryDir: MEMORY_DIR,
    });

    const connectionReferences = await listConnectionReferences();
    let promptWithConnections = prompt;
    if (connectionReferences.length > 0) {
      const connectionLines = connectionReferences
        .map((connection) => {
          const pieces = [`- ${connection.key}`];
          if (connection.transport) {
            pieces.push(`传输：${connection.transport}`);
          }
          if (connection.description) {
            pieces.push(`说明：${connection.description}`);
          }
          if (connection.required) {
            pieces.push("必需");
          }
          return pieces.join(" · ");
        })
        .join("\n");
      promptWithConnections = `${prompt}\n\n## 可用连接\n${connectionLines}`;
    }

    const specBlueprint = getSpecTemplateBlueprint();
    const workflowBlueprint = getWorkflowPatternBlueprint();
    const roleBlueprint = getRoleBlueprint();
    const openQuestionsBlueprint = getOpenQuestionsBlueprint(specBlueprint);

    let enhancedPrompt = promptWithConnections;
    const workflowLines = [
      "## 推荐工作流",
      `- 默认模式：${workflowBlueprint.default}`,
      ...((workflowBlueprint.options ?? []).map(
        (option) =>
          `- ${option.name}${option.description ? `：${option.description}` : ""}`
      ) || []),
    ];

    const roleLines = [
      "## 预设角色分工",
      ...roleBlueprint.map((role) => {
        const summaryPieces = [role.name];
        if (role.summary) {
          summaryPieces.push(role.summary);
        }
        return `- ${summaryPieces.join(" · ")}`;
      }),
    ];

    const openQuestionLines = [
      "## 待澄清问题",
      ...openQuestionsBlueprint.map(
        (question, index) => `- Q${index + 1}：${question.question}`
      ),
    ];

    enhancedPrompt = `${enhancedPrompt}\n\n${workflowLines.join(
      "\n"
    )}\n\n${roleLines.join("\n")}\n\n${openQuestionLines.join("\n")}`;

    const structuredContent = {
      kind: "taskManager.plan" as const,
      payload: {
        markdown: enhancedPrompt,
        prompt: enhancedPrompt,
        specTemplate: specBlueprint,
        workflowPattern: workflowBlueprint,
        roles: roleBlueprint,
        openQuestions: openQuestionsBlueprint,
        ...(finalRequirements
          ? { requirements: finalRequirements }
          : {}),
        ...(existingTasksReference && existingTaskStats
          ? { existingTaskStats }
          : {}),
        ...(connectionReferences.length > 0
          ? { connections: connectionReferences }
          : {}),
      },
    };

    return {
      content: [
        {
          type: "text" as const,
          text: enhancedPrompt,
        },
      ],
      structuredContent,
    };
  } catch (error) {
    const message = `plan_task 执行失败：${
      error instanceof Error ? error.message : String(error)
    }`;
    return createPlanTaskErrorResponse({
      message,
      errorCode: "E_UNEXPECTED",
      details:
        error instanceof Error && error.stack
          ? [error.stack]
          : undefined,
      requirements: finalRequirements,
      existingTaskStats,
    });
  }
}
