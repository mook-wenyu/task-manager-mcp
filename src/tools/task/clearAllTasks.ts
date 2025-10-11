import { z } from "zod";
import {
  getAllTasks,
  clearAllTasks as modelClearAllTasks,
} from "../../models/taskModel.js";
import { getClearAllTasksPrompt } from "../../prompts/index.js";
import { TaskStatus } from "../../types/index.js";

// 清除所有任务工具
// Clear all tasks tool
export const clearAllTasksSchema = z.object({
  confirm: z
    .boolean()
    .refine((val) => val === true, {
      message:
        "必须明确确认清除操作，请将 confirm 参数设置为 true 以确认此危险操作",
        // Must explicitly confirm clear operation, please set confirm parameter to true to confirm this dangerous operation
    })
    .describe("确认删除所有未完成的任务（此操作不可逆）"),
    // Confirm deletion of all incomplete tasks (this operation is irreversible)
});

export async function clearAllTasks({
  confirm,
}: z.infer<typeof clearAllTasksSchema>) {
  const buildResponse = async (
    promptArgs: Parameters<typeof getClearAllTasksPrompt>[0],
    options: {
      success: boolean;
      message: string;
      backupFilePath?: string;
      totalRemoved?: number;
      completedBackedUp?: number;
      isError?: boolean;
    }
  ) => {
    const markdown = await getClearAllTasksPrompt(promptArgs);
    const payload: Record<string, unknown> = {
      markdown,
      success: options.success,
      message: options.message,
    };

    if (typeof options.totalRemoved === "number") {
      payload.totalRemoved = options.totalRemoved;
    }

    if (typeof options.completedBackedUp === "number") {
      payload.completedBackedUp = options.completedBackedUp;
    }

    if (options.backupFilePath) {
      payload.backupFilePath = options.backupFilePath;
    }

    return {
      content: [
        {
          type: "text" as const,
          text: markdown,
        },
      ],
      structuredContent: {
        kind: "taskManager.clear" as const,
        payload,
      },
      ...(options.isError ? { isError: true } : {}),
    };
  };

  if (!confirm) {
    return buildResponse(
      { confirm: false },
      {
        success: false,
        message: "未确认清除操作",
        totalRemoved: 0,
        completedBackedUp: 0,
        isError: true,
      }
    );
  }

  const allTasks = await getAllTasks();
  const totalRemoved = allTasks.length;
  const completedBackedUp = allTasks.filter(
    (task) => task.status === TaskStatus.COMPLETED
  ).length;

  if (totalRemoved === 0) {
    return buildResponse(
      { isEmpty: true },
      {
        success: true,
        message: "没有任务需要清除",
        totalRemoved: 0,
        completedBackedUp: 0,
      }
    );
  }

  const result = await modelClearAllTasks();

  return buildResponse(
    {
      success: result.success,
      message: result.message,
      backupFile: result.backupFile,
    },
    {
      success: result.success,
      message: result.message,
      backupFilePath: result.backupFile ?? undefined,
      totalRemoved,
      completedBackedUp,
      isError: !result.success,
    }
  );
}
