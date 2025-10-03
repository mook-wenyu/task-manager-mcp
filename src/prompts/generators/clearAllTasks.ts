/**
 * clearAllTasks prompt 生成器
 * 负责将模板和参数组合成最终的 prompt
 */
/**
 * clearAllTasks prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";

/**
 * clearAllTasks prompt 参数接口
 */
/**
 * clearAllTasks prompt parameter interface
 */
export interface ClearAllTasksPromptParams {
  confirm?: boolean;
  success?: boolean;
  message?: string;
  backupFile?: string;
  isEmpty?: boolean;
}

/**
 * 获取 clearAllTasks 的完整 prompt
 * @param params prompt 参数
 * @returns 生成的 prompt
 */
/**
 * Get complete prompt for clearAllTasks
 * @param params prompt parameters
 * @returns generated prompt
 */
export async function getClearAllTasksPrompt(
  params: ClearAllTasksPromptParams
): Promise<string> {
  const { confirm, success, message, backupFile, isEmpty } = params;

  // 处理未确认的情况
  // Handle unconfirmed situations
  if (confirm === false) {
    const cancelTemplate = await loadPromptFromTemplate(
      "clearAllTasks/cancel.md"
    );
    return generatePrompt(cancelTemplate, {});
  }

  // 处理无任务需要清除的情况
  // Handle situations where no tasks need to be cleared
  if (isEmpty) {
    const emptyTemplate = await loadPromptFromTemplate(
      "clearAllTasks/empty.md"
    );
    return generatePrompt(emptyTemplate, {});
  }

  // 处理清除成功或失败的情况
  // Handle success or failure situations for clearing
  const responseTitle = success ? "Success" : "Failure";

  // 使用模板生成 backupInfo
  // Use template to generate backupInfo
  const backupInfo = backupFile
    ? generatePrompt(
        await loadPromptFromTemplate("clearAllTasks/backupInfo.md"),
        {
          backupFile,
        }
      )
    : "";

  const indexTemplate = await loadPromptFromTemplate("clearAllTasks/index.md");
  const prompt = generatePrompt(indexTemplate, {
    responseTitle,
    message,
    backupInfo,
  });

  // 加载可能的自定义 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "CLEAR_ALL_TASKS");
}
