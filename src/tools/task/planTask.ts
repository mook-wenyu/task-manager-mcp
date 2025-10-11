import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import { getAllTasks } from "../../models/taskModel.js";
import { TaskStatus, Task } from "../../types/index.js";
import { getPlanTaskPrompt } from "../../prompts/index.js";
import { getMemoryDir } from "../../utils/paths.js";

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
  // 获取基础目录路径
  // Get base directory path
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const PROJECT_ROOT = path.resolve(__dirname, "../../..");
  const MEMORY_DIR = await getMemoryDir();

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
    } catch (error) {}
  }

  // 使用prompt生成器获取最终prompt
  // Use prompt generator to get the final prompt
  const prompt = await getPlanTaskPrompt({
    description,
    requirements,
    existingTasksReference,
    completedTasks,
    pendingTasks,
    memoryDir: MEMORY_DIR,
  });

  const structuredContent = {
    kind: "taskManager.plan" as const,
    payload: {
      markdown: prompt,
      prompt,
      ...(existingTasksReference
        ? {
            existingTaskStats: {
              total: completedTasks.length + pendingTasks.length,
              completed: completedTasks.length,
              pending: pendingTasks.length,
            },
          }
        : {}),
    },
  };

  return {
    content: [
      {
        type: "text" as const,
        text: prompt,
      },
    ],
    structuredContent,
  };
}
