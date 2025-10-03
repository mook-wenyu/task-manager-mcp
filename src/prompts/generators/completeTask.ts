/**
 * completeTask prompt 生成器
 * 负责将模板和参数组合成最终的 prompt
 * completeTask prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";
import { Task } from "../../types/index.js";

/**
 * completeTask prompt 参数接口
 * completeTask prompt parameter interface
 */
export interface CompleteTaskPromptParams {
  task: Task;
  completionTime: string;
}

/**
 * 获取 completeTask 的完整 prompt
 * Get the complete prompt for completeTask
 * @param params prompt 参数
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getCompleteTaskPrompt(
  params: CompleteTaskPromptParams
): Promise<string> {
  const { task, completionTime } = params;

  const indexTemplate = await loadPromptFromTemplate("completeTask/index.md");

  // 开始构建基本 prompt
  // Start building the basic prompt
  let prompt = generatePrompt(indexTemplate, {
    name: task.name,
    id: task.id,
    completionTime: completionTime,
  });

  // 加载可能的自定义 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "COMPLETE_TASK");
}
