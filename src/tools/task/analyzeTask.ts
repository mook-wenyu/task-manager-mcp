import { z } from "zod";
import { getAnalyzeTaskPrompt } from "../../prompts/index.js";
import { createAnalyzeTaskErrorResponse } from "./taskErrorHelpers.js";

// 分析问题工具
// Task analysis tool
export const analyzeTaskSchema = z.object({
  summary: z
    .string()
    .min(10, {
      message: "任务摘要不能少于10个字符，请提供更详细的描述以确保任务目标明确",
      // Task summary must be at least 10 characters long, please provide a more detailed description to ensure clear task objectives
    })
    .describe(
      "结构化的任务摘要，包含任务目标、范围与关键技术挑战，最少10个字符"
      // Structured task summary including task objectives, scope and key technical challenges, minimum 10 characters
    ),
  initialConcept: z
    .string()
    .min(50, {
      message:
        "初步解答构想不能少于50个字符，请提供更详细的内容确保技术方案清晰",
        // Initial solution concept must be at least 50 characters long, please provide more detailed content to ensure clear technical solution
    })
    .describe(
      "最少50个字符的初步解答构想，包含技术方案、架构设计和实施策略，如果需要提供代码请使用 pseudocode 格式且仅提供高级逻辑流程和关键步骤避免完整代码"
      // Initial solution concept of at least 50 characters, including technical solution, architectural design and implementation strategy. If code is needed, use pseudocode format providing only high-level logic flow and key steps, avoiding complete code
    ),
  previousAnalysis: z
    .string()
    .optional()
    .describe("前次迭代的分析结果，用于持续改进方案（仅在重新分析时需提供）"),
    // Previous iteration analysis results, used for continuous solution improvement (only required when re-analyzing)
});

export async function analyzeTask({
  summary,
  initialConcept,
  previousAnalysis,
}: z.infer<typeof analyzeTaskSchema>) {
  try {
    // 使用prompt生成器获取最终prompt
    // Use prompt generator to get the final prompt
    const prompt = await getAnalyzeTaskPrompt({
      summary,
      initialConcept,
      previousAnalysis,
    });

    const structuredContent = {
      kind: "taskManager.analyze" as const,
      payload: {
        markdown: prompt,
        summary,
        initialConcept,
        ...(previousAnalysis ? { previousAnalysis } : {}),
      },
    };

    return {
      content: [
        {
          type: "text" as const,
          text: prompt,
        },
      ],
      structuredContent,
    };
  } catch (error) {
    const message = `analyze_task 执行失败：${
      error instanceof Error ? error.message : String(error)
    }`;
    return createAnalyzeTaskErrorResponse({
      message,
      errorCode: "E_UNEXPECTED",
      details:
        error instanceof Error && error.stack ? [error.stack] : undefined,
      summary,
      initialConcept,
      previousAnalysis,
    });
  }
}
