/**
 * researchMode prompt 生成器
 * researchMode prompt generator
 * 负责将模板和参数组合成最终的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";

/**
 * researchMode prompt 参数接口
 * researchMode prompt parameter interface
 */
export interface ResearchModePromptParams {
  topic: string;
  previousState: string;
  currentState: string;
  nextSteps: string;
  memoryDir: string;
}

/**
 * 获取 researchMode 的完整 prompt
 * Get the complete researchMode prompt
 * @param params prompt 参数
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getResearchModePrompt(
  params: ResearchModePromptParams
): Promise<string> {
  // 处理之前的研究状态
  // Process previous research state
  let previousStateContent = "";
  if (params.previousState && params.previousState.trim() !== "") {
    const previousStateTemplate = await loadPromptFromTemplate(
      "researchMode/previousState.md"
    );
    previousStateContent = generatePrompt(previousStateTemplate, {
      previousState: params.previousState,
    });
  } else {
    previousStateContent = "这是第一次进行此主题的研究，没有之前的研究状态。";
    // This is the first research on this topic, no previous research state.
  }

  // 加载主要模板
  // Load main template
  const indexTemplate = await loadPromptFromTemplate("researchMode/index.md");
  let prompt = generatePrompt(indexTemplate, {
    topic: params.topic,
    previousStateContent: previousStateContent,
    currentState: params.currentState,
    nextSteps: params.nextSteps,
    memoryDir: params.memoryDir,
    time: new Date().toLocaleString(),
  });

  // 加载可能的自定义 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "RESEARCH_MODE");
}
