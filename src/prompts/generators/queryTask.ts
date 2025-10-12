/**
 * queryTask prompt 生成器
 * queryTask prompt generator
 * 负责将模板和参数组合成最终的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";
import { Task } from "../../types/index.js";

/**
 * queryTask prompt 参数接口
 * queryTask prompt parameters interface
 */
export interface QueryTaskPromptParams {
  query: string;
  isId: boolean;
  tasks: Task[];
  totalTasks: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 获取 queryTask 的完整 prompt
 * Get the complete prompt for queryTask
 * @param params prompt 参数
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getQueryTaskPrompt(
  params: QueryTaskPromptParams
): Promise<string> {
  const { query, tasks, totalTasks, page, pageSize, totalPages } = params;

  if (tasks.length === 0) {
    const notFoundTemplate = await loadPromptFromTemplate(
      "queryTask/notFound.md"
    );
    return generatePrompt(notFoundTemplate, {
      query,
    });
  }

  const taskDetailsTemplate = await loadPromptFromTemplate(
    "queryTask/taskDetails.md"
  );
  let tasksContent = "";
  for (const task of tasks) {
    tasksContent += generatePrompt(taskDetailsTemplate, {
      taskId: task.id,
      taskName: task.name,
      taskStatus: task.status,
      taskDescription:
        task.description.length > 100
          ? `${task.description.substring(0, 100)}...`
          : task.description,
      createdAt: new Date(task.createdAt).toLocaleString(),
    });
  }

  const indexTemplate = await loadPromptFromTemplate("queryTask/index.md");
  const prompt = generatePrompt(indexTemplate, {
    tasksContent,
    page,
    totalPages,
    pageSize,
    totalTasks,
    query,
  });

  // 加载可能的自定义 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "QUERY_TASK");
}
