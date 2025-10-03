import { z } from "zod";
import { searchTasksWithCommand } from "../../models/taskModel.js";
import { getGetTaskDetailPrompt } from "../../prompts/index.js";

// 取得完整任务详情的参数
// Get parameters for full task details
export const getTaskDetailSchema = z.object({
  taskId: z
    .string()
    .min(1, {
      message: "任务ID不能为空，请提供有效的任务ID",
      // Task ID cannot be empty, please provide a valid task ID
    })
    .describe("欲查看详情的任务ID"),
    // Task ID for which details are to be viewed
});

// 取得任务完整详情
// Get complete task details
export async function getTaskDetail({
  taskId,
}: z.infer<typeof getTaskDetailSchema>) {
  try {
    // 使用 searchTasksWithCommand 替代 getTaskById，实现记忆区任务搜索
    // Use searchTasksWithCommand instead of getTaskById to implement memory area task search
    // 设置 isId 为 true，表示按 ID 搜索；页码为 1，每页大小为 1
    // Set isId to true to indicate search by ID; page number is 1, page size is 1
    const result = await searchTasksWithCommand(taskId, true, 1, 1);

    // 检查是否找到任务
    // Check if task was found
    if (result.tasks.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `## 错误\n\n找不到ID为 \`${taskId}\` 的任务。请确认任务ID是否正确。`,
            // Error: Cannot find task with ID `${taskId}`. Please confirm the task ID is correct.
          },
        ],
        isError: true,
      };
    }

    // 获取找到的任务（第一个也是唯一的一个）
    // Get the found task (the first and only one)
    const task = result.tasks[0];

    // 使用prompt生成器获取最终prompt
    // Use prompt generator to get the final prompt
    const prompt = await getGetTaskDetailPrompt({
      taskId,
      task,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: prompt,
        },
      ],
    };
  } catch (error) {
    // 使用prompt生成器获取错误消息
    // Use prompt generator to get error message
    const errorPrompt = await getGetTaskDetailPrompt({
      taskId,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      content: [
        {
          type: "text" as const,
          text: errorPrompt,
        },
      ],
    };
  }
}
