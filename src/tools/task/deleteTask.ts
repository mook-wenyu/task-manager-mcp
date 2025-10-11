import { z } from "zod";
import { UUID_V4_REGEX } from "../../utils/regex.js";
import {
  getTaskById,
  deleteTask as modelDeleteTask,
} from "../../models/taskModel.js";
import { TaskStatus } from "../../types/index.js";
import { getDeleteTaskPrompt } from "../../prompts/index.js";

// 删除任务工具
// Delete task tool
export const deleteTaskSchema = z.object({
  taskId: z
    .string()
    .regex(UUID_V4_REGEX, {
      message: "任务ID格式无效，请提供有效的UUID v4格式",
      // Task ID format is invalid, please provide a valid UUID v4 format
    })
    .describe("待删除任务的唯一标识符，必须是系统中存在且未完成的任务ID"),
    // Unique identifier of the task to be deleted, must be an existing and incomplete task ID in the system
});

export async function deleteTask({ taskId }: z.infer<typeof deleteTaskSchema>) {
  const buildResponse = async (
    promptArgs: Parameters<typeof getDeleteTaskPrompt>[0],
    options: { success: boolean; message: string; isError?: boolean }
  ) => {
    const markdown = await getDeleteTaskPrompt(promptArgs);
    return {
      content: [
        {
          type: "text" as const,
          text: markdown,
        },
      ],
      structuredContent: {
        kind: "taskManager.delete" as const,
        payload: {
          markdown,
          taskId,
          success: options.success,
          message: options.message,
        },
      },
      ...(options.isError ? { isError: true } : {}),
    };
  };

  const task = await getTaskById(taskId);

  if (!task) {
    return buildResponse({ taskId }, {
      success: false,
      message: "找不到指定任务",
      isError: true,
    });
  }

  if (task.status === TaskStatus.COMPLETED) {
    return buildResponse(
      {
        taskId,
        task,
        isTaskCompleted: true,
      },
      {
        success: false,
        message: "无法删除已完成的任务",
        isError: true,
      }
    );
  }

  const result = await modelDeleteTask(taskId);

  return buildResponse(
    {
      taskId,
      task,
      success: result.success,
      message: result.message,
    },
    {
      success: result.success,
      message: result.message,
      isError: !result.success,
    }
  );
}
