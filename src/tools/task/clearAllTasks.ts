import { z } from "zod";
import {
  getAllTasks,
  clearAllTasks as modelClearAllTasks,
} from "../../models/taskModel.js";
import { getClearAllTasksPrompt } from "../../prompts/index.js";

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
  // 安全检查：如果没有确认，则拒绝操作
  // Safety check: refuse operation if not confirmed
  if (!confirm) {
    return {
      content: [
        {
          type: "text" as const,
          text: await getClearAllTasksPrompt({ confirm: false }),
        },
      ],
    };
  }


  // 检查是否真的有任务需要清除
  // Check if there are actually tasks that need to be cleared
  const allTasks = await getAllTasks();
  if (allTasks.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: await getClearAllTasksPrompt({ isEmpty: true }),
        },
      ],
    };
  }

  // 运行清除操作
  // Execute clear operation
  const result = await modelClearAllTasks();

  return {
    content: [
      {
        type: "text" as const,
        text: await getClearAllTasksPrompt({
          success: result.success,
          message: result.message,
          backupFile: result.backupFile,
        }),
      },
    ],
    isError: !result.success,
  };
}
