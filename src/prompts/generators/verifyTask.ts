/**
 * verifyTask prompt 生成器
 * verifyTask prompt generator
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
 * verifyTask prompt 参数接口
 * verifyTask prompt parameters interface
 */
export interface VerifyTaskPromptParams {
  task: Task;
  score: number;
  summary: string;
}

/**
 * 提取摘要内容
 * Extract summary content
 * @param content 原始内容
 * @param content Original content
 * @param maxLength 最大长度
 * @param maxLength Maximum length
 * @returns 提取的摘要
 * @returns Extracted summary
 */
function extractSummary(
  content: string | undefined,
  maxLength: number
): string {
  if (!content) return "";

  if (content.length <= maxLength) {
    return content;
  }

  // 简单的摘要提取：截取前 maxLength 个字符并添加省略号
  // Simple summary extraction: truncate to first maxLength characters and add ellipsis
  return content.substring(0, maxLength) + "...";
}

/**
 * 获取 verifyTask 的完整 prompt
 * Get the complete prompt for verifyTask
 * @param params prompt 参数
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns Generated prompt
 */
export async function getVerifyTaskPrompt(
  params: VerifyTaskPromptParams
): Promise<string> {
  const { task, score, summary } = params;
  if (score < 80) {
    const noPassTemplate = await loadPromptFromTemplate("verifyTask/noPass.md");
    const prompt = generatePrompt(noPassTemplate, {
      name: task.name,
      id: task.id,
      summary,
    });
    return prompt;
  }
  const indexTemplate = await loadPromptFromTemplate("verifyTask/index.md");
  const prompt = generatePrompt(indexTemplate, {
    name: task.name,
    id: task.id,
    description: task.description,
    notes: task.notes || "no notes",
    verificationCriteria:
      task.verificationCriteria || "no verification criteria",
    implementationGuideSummary:
      extractSummary(task.implementationGuide, 200) ||
      "no implementation guide",
    analysisResult:
      extractSummary(task.analysisResult, 300) || "no analysis result",
  });

  // 加载可能的自定义 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "VERIFY_TASK");
}
