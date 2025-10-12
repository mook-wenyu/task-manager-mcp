import { z } from "zod";
import {
  getAllTasks,
  batchCreateOrUpdateTasks,
  clearAllTasks as modelClearAllTasks,
} from "../../models/taskModel.js";
import { RelatedFileType, type Task } from "../../types/index.js";
import { getSplitTasksPrompt } from "../../prompts/index.js";
import { getAllAvailableAgents, type Agent } from "../../utils/agentLoader.js";
import { matchAgentToTask } from "../../utils/agentMatcher.js";
import { serializeTaskDetails } from "../utils/structuredContent.js";

type SplitTasksUpdateMode = "append" | "overwrite" | "selective" | "clearAllTasks";

export const splitTaskItemSchema = z.object({
  name: z
    .string()
    .max(100, {
      message: "任务名称过长，请限制在100个字符以内",
    })
    .describe("简洁明确的任务名称，应能清晰表达任务目的"),
  description: z
    .string()
    .min(10, {
      message: "任务描述过短，请提供更详细的内容以确保理解",
    })
    .describe("详细的任务描述，包含实施要点、技术细节和验收标准"),
  implementationGuide: z
    .string()
    .describe(
      "此特定任务的具体实现方法和步骤，请参考之前的分析结果提供精简pseudocode",
    ),
  dependencies: z
    .array(z.string())
    .optional()
    .describe(
      "此任务依赖的前置任务ID或任务名称列表，支持两种引用方式，名称引用更直观，是一个字符串数组",
    ),
  notes: z
    .string()
    .optional()
    .describe("补充说明、特殊处理要求或实施建议（选填）"),
  relatedFiles: z
    .array(
      z.object({
        path: z
          .string()
          .min(1, {
            message: "文档路径不能为空",
          })
          .describe("文档路径，可以是相对于项目根目录的路径或绝对路径"),
        type: z
          .nativeEnum(RelatedFileType)
          .describe(
            "文档类型 (TO_MODIFY: 待修改, REFERENCE: 参考数据, CREATE: 待创建, DEPENDENCY: 依赖文档, OTHER: 其他)",
          ),
        description: z
          .string()
          .min(1, {
            message: "文档描述不能为空",
          })
          .describe("文档描述，用于说明文档的用途和内容"),
        lineStart: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("相关代码区块的起始行（选填）"),
        lineEnd: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("相关代码区块的结束行（选填）"),
      }),
    )
    .optional()
    .describe(
      "与任务相关的文档列表，用于记录与任务相关的代码文档、参考数据、要创建的文档等（选填）",
    ),
  verificationCriteria: z
    .string()
    .optional()
    .describe("此特定任务的验证标准和检验方法"),
});

export const splitTasksSchema = z.object({
  updateMode: z
    .enum(["append", "overwrite", "selective", "clearAllTasks"])
    .describe(
      "任务更新模式选择：'append'(保留所有现有任务并添加新任务)、'overwrite'(清除所有未完成任务并完全替换，保留已完成任务)、'selective'(智能更新：根据任务名称匹配更新现有任务，保留不在列表中的任务，推荐用于任务微调)、'clearAllTasks'(清除所有任务并创建备份)。\n缺省为'clearAllTasks'模式，只有用户要求变更或修改计划内容才使用其他模式",
    ),
  tasks: z
    .array(splitTaskItemSchema)
    .min(1, {
      message: "请至少提供一个任务",
    })
    .describe(
      "结构化的任务清单，每个任务应保持原子性且有明确的完成标准，避免过于简单的任务，简单修改可与其他任务集成，避免任务过多",
    ),
  globalAnalysisResult: z
    .string()
    .optional()
    .describe("任务最终目标，来自之前分析适用于所有任务的通用部分"),
});

type SplitTasksInput = z.infer<typeof splitTasksSchema>;

type SplitTasksResponseOptions = {
  success: boolean;
  message: string;
  created?: Task[];
  all?: Task[];
  backup?: string | null;
  errorCode?: string;
  errors?: string[];
};

const EMPTY_AGENT_LIST: Agent[] = [];

function createStructuredResponse(
  markdown: string,
  updateMode: SplitTasksUpdateMode,
  {
    success,
    message,
    created,
    all,
    backup,
    errorCode,
    errors,
  }: SplitTasksResponseOptions,
) {
  const payload: Record<string, unknown> = {
    markdown,
    updateMode,
    success,
    message,
  };

  if (created && created.length > 0) {
    payload.createdTasks = serializeTaskDetails(created);
  }

  if (all && all.length > 0) {
    payload.allTasks = serializeTaskDetails(all);
  }

  if (backup) {
    payload.backupFilePath = backup;
  }

  if (errorCode) {
    payload.errorCode = errorCode;
  }

  if (errors && errors.length > 0) {
    payload.errors = errors;
  }

  return {
    content: [
      {
        type: "text" as const,
        text: markdown,
      },
    ],
    structuredContent: {
      kind: "taskManager.split" as const,
      payload,
    },
  };
}

export function createStructuredErrorResponse(
  updateMode: SplitTasksUpdateMode,
  message: string,
  options: Pick<SplitTasksResponseOptions, "errorCode" | "errors"> = {},
) {
  return createStructuredResponse(message, updateMode, {
    success: false,
    message,
    errorCode: options.errorCode,
    errors: options.errors,
  });
}

export async function performSplitTasks({
  updateMode,
  tasks,
  globalAnalysisResult,
}: SplitTasksInput) {
  try {
    const duplicateNames = new Set<string>();
    for (const task of tasks) {
      const nameKey = task.name.trim();
      if (duplicateNames.has(nameKey)) {
        return createStructuredErrorResponse(updateMode, "tasks 参数中存在重复的任务名称，请确保每个任务名称是唯一的", {
          errorCode: "E_DUPLICATE_NAME",
        });
      }
      duplicateNames.add(nameKey);
    }

    let availableAgents: Agent[] = [];
    try {
      availableAgents = await getAllAvailableAgents();
    } catch (error) {
      availableAgents = EMPTY_AGENT_LIST;
    }

    const convertedTasks = tasks.map((task) => {
      const tempTask: Partial<Task> = {
        name: task.name,
        description: task.description,
        notes: task.notes,
        implementationGuide: task.implementationGuide,
      };

      const matchedAgent =
        availableAgents.length > 0
          ? matchAgentToTask(tempTask as Task, availableAgents)
          : undefined;

      return {
        name: task.name,
        description: task.description,
        notes: task.notes,
        dependencies: task.dependencies,
        implementationGuide: task.implementationGuide,
        verificationCriteria: task.verificationCriteria,
        agent: matchedAgent,
        relatedFiles: task.relatedFiles?.map((file) => ({
          path: file.path,
          type: file.type as RelatedFileType,
          description: file.description,
          lineStart: file.lineStart,
          lineEnd: file.lineEnd,
        })),
      };
    });

    let message = "";
    let actionSuccess = true;
    let backupFile: string | null = null;
    let createdTasks: Task[] = [];
    let allTasks: Task[] = [];

    if (updateMode === "clearAllTasks") {
      const clearResult = await modelClearAllTasks();
      if (clearResult.success) {
        message = clearResult.message;
        backupFile = clearResult.backupFile ?? null;
        try {
          createdTasks = await batchCreateOrUpdateTasks(
            convertedTasks,
            "append",
            globalAnalysisResult,
          );
          message += `\n成功创建了 ${createdTasks.length} 个新任务。`;
        } catch (error) {
          actionSuccess = false;
          message += `\n创建新任务时发生错误: ${error instanceof Error ? error.message : String(error)}`;
        }
      } else {
        actionSuccess = false;
        message = clearResult.message;
        return createStructuredErrorResponse(updateMode, message, {
          errorCode: "E_CLEAR_ALL",
        });
      }
    } else {
      try {
        createdTasks = await batchCreateOrUpdateTasks(
          convertedTasks,
          updateMode,
          globalAnalysisResult,
        );
        switch (updateMode) {
          case "append":
            message = `成功追加了 ${createdTasks.length} 个新任务。`;
            break;
          case "overwrite":
            message = `成功清除未完成任务并创建了 ${createdTasks.length} 个新任务。`;
            break;
          case "selective":
            message = `成功选择性更新/创建了 ${createdTasks.length} 个任务。`;
            break;
        }
      } catch (error) {
        actionSuccess = false;
        message = `任务创建失败：${error instanceof Error ? error.message : String(error)}`;
      }
    }

    try {
      allTasks = await getAllTasks();
    } catch (error) {
      allTasks = [...createdTasks];
    }

    const prompt = await getSplitTasksPrompt({
      updateMode,
      createdTasks,
      allTasks,
    });

    const response = createStructuredResponse(prompt, updateMode, {
      success: actionSuccess,
      message,
      created: createdTasks,
      all: allTasks,
      backup: backupFile,
    });

    return {
      ...response,
      ephemeral: {
        taskCreationResult: {
          success: actionSuccess,
          message,
          backupFilePath: backupFile ?? undefined,
        },
      },
    };
  } catch (error) {
    const message =
      "运行任务拆分时发生错误: " + (error instanceof Error ? error.message : String(error));
    return createStructuredErrorResponse(updateMode, message, {
      errorCode: "E_UNEXPECTED",
    });
  }
}
