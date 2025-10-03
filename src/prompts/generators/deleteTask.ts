/**
 * deleteTask prompt 生成器
 * 负责将模板和参数组合成最终的 prompt
 * deleteTask prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";
import { Task } from "../../types/index.js";

/**
 * deleteTask prompt 参数接口
 * deleteTask prompt parameter interface
 */
export interface DeleteTaskPromptParams {
  taskId: string;
  task?: Task;
  success?: boolean;
  message?: string;
  isTaskCompleted?: boolean;
}

/**
 * 获取 deleteTask 的完整 prompt
 * Get the complete prompt for deleteTask
 * @param params prompt 参数
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getDeleteTaskPrompt(
  params: DeleteTaskPromptParams
): Promise<string> {
  const { taskId, task, success, message, isTaskCompleted } = params;

  // 处理任务不存在的情况
  // Handle case when task does not exist
  if (!task) {
    const notFoundTemplate = await loadPromptFromTemplate(
      "deleteTask/notFound.md"
    );
    return generatePrompt(notFoundTemplate, {
      taskId,
    });
  }

  // 处理任务已完成的情况
  // Handle case when task is already completed
  if (isTaskCompleted) {
    const completedTemplate = await loadPromptFromTemplate(
      "deleteTask/completed.md"
    );
    return generatePrompt(completedTemplate, {
      taskId: task.id,
      taskName: task.name,
    });
  }

  // 处理删除成功或失败的情况
  // Handle successful or failed deletion cases
  const responseTitle = success ? "Success" : "Failure";
  const indexTemplate = await loadPromptFromTemplate("deleteTask/index.md");
  const prompt = generatePrompt(indexTemplate, {
    responseTitle,
    message,
  });

  // 加载可能的自定义 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "DELETE_TASK");
}
