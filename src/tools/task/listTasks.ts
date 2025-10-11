import { z } from "zod";
import { getAllTasks } from "../../models/taskModel.js";
import { TaskStatus } from "../../types/index.js";
import { getListTasksPrompt } from "../../prompts/index.js";
import {
  countTasksByStatus,
  serializeTaskDetails,
} from "../utils/structuredContent.js";

export const listTasksSchema = z.object({
  status: z
    .enum(["all", "pending", "in_progress", "completed"])
    .describe("要列出的任务状态，可选择 'all' 列出所有任务，或指定具体状态"),
    // Task status to list, choose 'all' to list all tasks, or specify a specific status
});

// 列出任务工具
// List tasks tool
export async function listTasks({ status }: z.infer<typeof listTasksSchema>) {
  const tasks = await getAllTasks();
  let filteredTasks = tasks;
  switch (status) {
    case "all":
      break;
    case "pending":
      filteredTasks = tasks.filter(
        (task) => task.status === TaskStatus.PENDING
      );
      break;
    case "in_progress":
      filteredTasks = tasks.filter(
        (task) => task.status === TaskStatus.IN_PROGRESS
      );
      break;
    case "completed":
      filteredTasks = tasks.filter(
        (task) => task.status === TaskStatus.COMPLETED
      );
      break;
  }

  const counts = countTasksByStatus(tasks);
  counts.filtered = filteredTasks.length;

  if (filteredTasks.length === 0) {
    const message = `## 系统通知\n\n目前系统中没有${
      status === "all" ? "任何" : `任何 ${status} 的`
    }任务。请查找其他状态任务或先使用「split_tasks」工具创建任务结构，再进行后续操作。`;

    return {
      content: [
        {
          type: "text" as const,
          text: message,
        },
      ],
      structuredContent: {
        kind: "taskManager.list" as const,
        payload: {
          markdown: message,
          requestedStatus: status,
          counts,
          tasks: [],
        },
      },
    };
  }

  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  // 使用prompt生成器获取最终prompt
  // Use prompt generator to get the final prompt
  const prompt = await getListTasksPrompt({
    status,
    tasks: tasksByStatus,
    allTasks: filteredTasks,
  });

  return {
    content: [
      {
        type: "text" as const,
        text: prompt,
      },
    ],
    structuredContent: {
      kind: "taskManager.list" as const,
      payload: {
        markdown: prompt,
        requestedStatus: status,
        counts,
        tasks: serializeTaskDetails(filteredTasks),
      },
    },
  };
}
