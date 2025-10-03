/**
 * splitTasks prompt 生成器
 * splitTasks prompt generator
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
 * splitTasks prompt 参数接口
 * splitTasks prompt parameter interface
 */
export interface SplitTasksPromptParams {
  updateMode: string;
  createdTasks: Task[];
  allTasks: Task[];
}

/**
 * 获取 splitTasks 的完整 prompt
 * Get the complete splitTasks prompt
 * @param params prompt 参数
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getSplitTasksPrompt(
  params: SplitTasksPromptParams
): Promise<string> {
  const taskDetailsTemplate = await loadPromptFromTemplate(
    "splitTasks/taskDetails.md"
  );

  const tasksContent = params.createdTasks
    .map((task, index) => {
      let implementationGuide = "no implementation guide";
      if (task.implementationGuide) {
        implementationGuide =
          task.implementationGuide.length > 100
            ? task.implementationGuide.substring(0, 100) + "..."
            : task.implementationGuide;
      }

      let verificationCriteria = "no verification criteria";
      if (task.verificationCriteria) {
        verificationCriteria =
          task.verificationCriteria.length > 100
            ? task.verificationCriteria.substring(0, 100) + "..."
            : task.verificationCriteria;
      }

      const dependencies = task.dependencies
        ? task.dependencies
            .map((d: any) => {
              // 查找依赖任务的名称，提供更友好的显示
              // Find the name of the dependent task for more friendly display
              const depTask = params.allTasks.find((t) => t.id === d.taskId);
              return depTask
                ? `"${depTask.name}" (\`${d.taskId}\`)`
                : `\`${d.taskId}\``;
            })
            .join(", ")
        : "no dependencies";

      return generatePrompt(taskDetailsTemplate, {
        index: index + 1,
        name: task.name,
        id: task.id,
        description: task.description,
        notes: task.notes || "no notes",
        implementationGuide: implementationGuide,
        verificationCriteria: verificationCriteria,
        dependencies: dependencies,
      });
    })
    .join("\n");

  const indexTemplate = await loadPromptFromTemplate("splitTasks/index.md");
  const prompt = generatePrompt(indexTemplate, {
    updateMode: params.updateMode,
    tasksContent,
  });

  // 加载可能的自定义 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "SPLIT_TASKS");
}
