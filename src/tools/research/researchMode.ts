import { z } from "zod";
import { getResearchModePrompt } from "../../prompts/index.js";
import { getMemoryDir } from "../../utils/paths.js";

// 研究模式工具
// Research mode tool
export const researchModeSchema = z.object({
  topic: z
    .string()
    .min(5, {
      message: "研究主题不能少于5个字符，请提供明确的研究主题",
      // Research topic cannot be less than 5 characters, please provide a clear research topic
    })
    .describe("要研究的程序编程主题内容，应该明确且具体"),
    // Programming topic content to be researched, should be clear and specific
  previousState: z
    .string()
    .optional()
    .default("")
    .describe(
      "之前的研究状态和内容摘要，第一次运行时为空，后续会包含之前详细且关键的研究成果，这将帮助后续的研究"
      // Previous research state and content summary, empty on first execution, subsequently contains previous detailed and key research results, this will help subsequent research
    ),
  currentState: z
    .string()
    .describe(
      "当前 Agent 主要该运行的内容，例如使用网络工具搜索某些关键字或分析特定代码，研究完毕后请调用 research_mode 来记录状态并与之前的`previousState`集成，这将帮助你更好的保存与运行研究内容"
      // Main content that the current Agent should execute, such as using web tools to search for certain keywords or analyze specific code, after research is completed please call research_mode to record state and integrate with previous `previousState`, this will help you better save and execute research content
    ),
  nextSteps: z
    .string()
    .describe(
      "后续的计划、步骤或研究方向，用来约束 Agent 不偏离主题或走错方向，如果研究过程中发现需要调整研究方向，请更新此字段"
      // Subsequent plans, steps or research directions, used to constrain Agent from deviating from topic or going in wrong direction, if need to adjust research direction during research process, please update this field
    ),
});

export async function researchMode({
  topic,
  previousState = "",
  currentState,
  nextSteps,
}: z.infer<typeof researchModeSchema>) {
  // 获取基础目录路径
  // Get base directory path
  const MEMORY_DIR = await getMemoryDir();

  // 使用prompt生成器获取最终prompt
  // Use prompt generator to get final prompt
  const prompt = await getResearchModePrompt({
    topic,
    previousState,
    currentState,
    nextSteps,
    memoryDir: MEMORY_DIR,
  });

  return {
    content: [
      {
        type: "text" as const,
        text: prompt,
      },
    ],
    structuredContent: {
      kind: "taskManager.research" as const,
      payload: {
        markdown: prompt,
        topic,
        previousState,
        currentState,
        nextSteps,
        memoryDir: MEMORY_DIR,
      },
    },
  };
}
