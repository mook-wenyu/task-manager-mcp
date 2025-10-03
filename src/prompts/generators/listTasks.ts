/**
 * listTasks prompt 生成器
 * listTasks prompt generator
 * 负责将模板和参数组合成最终的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";
import { Task, TaskStatus } from "../../types/index.js";

/**
 * listTasks prompt 参数接口
 * listTasks prompt parameters interface
 */
export interface ListTasksPromptParams {
  status: string;
  tasks: Record<string, Task[]>;
  allTasks: Task[];
}

/**
 * 获取 listTasks 的完整 prompt
 * Get the complete prompt for listTasks
 * @param params prompt 参数
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getListTasksPrompt(
  params: ListTasksPromptParams
): Promise<string> {
  const { status, tasks, allTasks } = params;

  // 如果没有任务，显示通知
  // If there are no tasks, show notification
  if (allTasks.length === 0) {
    const notFoundTemplate = await loadPromptFromTemplate(
      "listTasks/notFound.md"
    );
    const statusText = status === "all" ? "任何" : `任何 ${status} 的`;
    // Set status text: "any" for all, or "any [status]" for specific status
    return generatePrompt(notFoundTemplate, {
      statusText: statusText,
    });
  }

  // 获取所有状态的计数
  // Get counts for all statuses
  const statusCounts = Object.values(TaskStatus)
    .map((statusType) => {
      const count = tasks[statusType]?.length || 0;
      return `- **${statusType}**: ${count} 个任务`;
      // Return formatted string showing task count for each status
    })
    .join("\n");

  let filterStatus = "all";
  switch (status) {
    case "pending":
      filterStatus = TaskStatus.PENDING;
      break;
    case "in_progress":
      filterStatus = TaskStatus.IN_PROGRESS;
      break;
    case "completed":
      filterStatus = TaskStatus.COMPLETED;
      break;
  }

  let taskDetails = "";
  let taskDetailsTemplate = await loadPromptFromTemplate(
    "listTasks/taskDetails.md"
  );
  // 添加每个状态下的详细任务
  // Add detailed tasks under each status
  for (const statusType of Object.values(TaskStatus)) {
    const tasksWithStatus = tasks[statusType] || [];
    if (
      tasksWithStatus.length > 0 &&
      (filterStatus === "all" || filterStatus === statusType)
    ) {
      for (const task of tasksWithStatus) {
        let dependencies = "没有依赖";
        // Default dependency text when no dependencies exist
        if (task.dependencies && task.dependencies.length > 0) {
          dependencies = task.dependencies
            .map((d) => `\`${d.taskId}\``)
            .join(", ");
        }
        taskDetails += generatePrompt(taskDetailsTemplate, {
          name: task.name,
          id: task.id,
          description: task.description,
          createAt: task.createdAt,
          complatedSummary:
            (task.summary || "").substring(0, 100) +
            ((task.summary || "").length > 100 ? "..." : ""),
          dependencies: dependencies,
          complatedAt: task.completedAt,
        });
      }
    }
  }

  const indexTemplate = await loadPromptFromTemplate("listTasks/index.md");
  let prompt = generatePrompt(indexTemplate, {
    statusCount: statusCounts,
    taskDetailsTemplate: taskDetails,
  });

  // 加载可能的自定义 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "LIST_TASKS");
}
