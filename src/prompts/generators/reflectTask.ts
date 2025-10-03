/**
 * reflectTask prompt 生成器
 * reflectTask prompt generator
 * 负责将模板和参数组合成最终的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";

/**
 * reflectTask prompt 参数接口
 * reflectTask prompt parameter interface
 */
export interface ReflectTaskPromptParams {
  summary: string;
  analysis: string;
}

/**
 * 获取 reflectTask 的完整 prompt
 * Get the complete reflectTask prompt
 * @param params prompt 参数
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getReflectTaskPrompt(
  params: ReflectTaskPromptParams
): Promise<string> {
  const indexTemplate = await loadPromptFromTemplate("reflectTask/index.md");
  const prompt = generatePrompt(indexTemplate, {
    summary: params.summary,
    analysis: params.analysis,
  });

  // 加载可能的自定义 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "REFLECT_TASK");
}
