/**
 * initProjectRules prompt 生成器
 * initProjectRules prompt generator
 * 负责将模板和参数组合成最终的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */

import { loadPrompt, loadPromptFromTemplate } from "../loader.js";
/**
 * initProjectRules prompt 参数接口
 * initProjectRules prompt parameters interface
 */
export interface InitProjectRulesPromptParams {
  // 目前没有额外参数，未来可按需扩展
  // Currently no additional parameters, can be expanded as needed in the future
}

/**
 * 获取 initProjectRules 的完整 prompt
 * Get the complete prompt for initProjectRules
 * @param params prompt 参数（可选）
 * @param params prompt parameters (optional)
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getInitProjectRulesPrompt(
  params?: InitProjectRulesPromptParams
): Promise<string> {
  const indexTemplate = await loadPromptFromTemplate(
    "initProjectRules/index.md"
  );

  // 加载可能的自定义 prompt (通过环境变量覆盖或追加)
  // Load possible custom prompt (override or append via environment variables)
  return loadPrompt(indexTemplate, "INIT_PROJECT_RULES");
}
