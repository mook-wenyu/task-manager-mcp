import { z } from "zod";
import { getReflectTaskPrompt } from "../../prompts/index.js";
import { createReflectTaskErrorResponse } from "./taskErrorHelpers.js";

// 反思构想工具
// Task reflection tool
export const reflectTaskSchema = z.object({
  summary: z
    .string()
    .min(10, {
      message: "任务摘要不能少于10个字符，请提供更详细的描述以确保任务目标明确",
      // Task summary cannot be less than 10 characters, please provide more detailed description to ensure task objectives are clear
    })
    .describe("结构化的任务摘要，保持与分析阶段一致以确保连续性"),
    // Structured task summary, maintaining consistency with analysis phase to ensure continuity
  analysis: z
    .string()
    .min(100, {
      message: "技术分析内容不够详尽，请提供完整的技术分析和实施方案",
      // Technical analysis content is not detailed enough, please provide complete technical analysis and implementation plan
    })
    .describe(
      "完整详尽的技术分析结果，包括所有技术细节、依赖组件和实施方案，如果需要提供代码请使用 pseudocode 格式且仅提供高级逻辑流程和关键步骤避免完整代码"
      // Complete and detailed technical analysis results, including all technical details, dependent components and implementation plans, if code is needed please use pseudocode format and only provide high-level logic flow and key steps avoiding complete code
    ),
});

export async function reflectTask({
  summary,
  analysis,
}: z.infer<typeof reflectTaskSchema>) {
  try {
    // 使用prompt生成器获取最终prompt
    // Use prompt generator to get the final prompt
    const prompt = await getReflectTaskPrompt({
      summary,
      analysis,
    });

    const structuredContent = {
      kind: "taskManager.reflect" as const,
      payload: {
        markdown: prompt,
        summary,
        analysis,
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
    const message = `reflect_task 执行失败：${
      error instanceof Error ? error.message : String(error)
    }`;
    return createReflectTaskErrorResponse({
      message,
      errorCode: "E_UNEXPECTED",
      details:
        error instanceof Error && error.stack ? [error.stack] : undefined,
      summary,
      analysis,
    });
  }
}
