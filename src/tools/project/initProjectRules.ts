import { z } from "zod";
import { getInitProjectRulesPrompt } from "../../prompts/index.js";

// 定义schema
// Define schema
export const initProjectRulesSchema = z.object({});

/**
 * 初始化项目规范工具函数
 * Initialize project specification tool function
 * 提供创建规范文档的指导
 * Provide guidance for creating specification documents
 */
export async function initProjectRules() {
  try {
    // 从生成器获取提示词
    // Get prompt from generator
    const promptContent = await getInitProjectRulesPrompt();

    // 返回成功响应
    // Return success response
    return {
      content: [
        {
          type: "text" as const,
          text: promptContent,
        },
      ],
      structuredContent: {
        kind: "taskManager.projectRules" as const,
        payload: {
          markdown: promptContent,
          createdFiles: [],
          warnings: [],
        },
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    const message = `初始化项目规范时发生错误: ${errorMessage}`;
    return {
      content: [
        {
          type: "text" as const,
          text: message,
        },
      ],
      structuredContent: {
        kind: "taskManager.projectRules" as const,
        payload: {
          markdown: message,
          createdFiles: [],
          warnings: [errorMessage],
        },
      },
    };
  }
}
