/**
 * executeTask prompt 生成器
 * 负责将模板和参数组合成最终的 prompt
 * executeTask prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";
import { Task, TaskStatus } from "../../types/index.js";

/**
 * 任务复杂度评估的接口
 * Interface for task complexity assessment
 */
interface ComplexityAssessment {
  level: string;
  metrics: {
    descriptionLength: number;
    dependenciesCount: number;
  };
  recommendations?: string[];
}

interface ConnectionSummary {
  key: string;
  description?: string;
  transport?: string;
  required?: boolean;
}

interface WorkflowSummary {
  pattern: string;
  currentStepId?: string;
  steps?: {
    id: string;
    title: string;
    description?: string;
    stage?: string;
    status?: string;
  }[];
}

interface RoleSummary {
  name: string;
  summary?: string;
  responsibilities?: string;
  prompt?: string;
  defaultTools?: string[];
}

interface StageProgressEntry {
  stage: string;
  status: string;
  updatedAt?: string;
  notes?: string;
}

/**
 * executeTask prompt 参数接口
 * executeTask prompt parameter interface
 */
export interface ExecuteTaskPromptParams {
  task: Task;
  complexityAssessment?: ComplexityAssessment;
  relatedFilesSummary?: string;
  dependencyTasks?: Task[];
  connections?: ConnectionSummary[];
  workflow?: WorkflowSummary;
  roles?: RoleSummary[];
  stageProgress?: StageProgressEntry[];
}

/**
 * 获取复杂度级别的样式文本
 * Get styled text for complexity level
 * @param level 复杂度级别
 * @param level complexity level
 * @returns 样式文本
 * @returns styled text
 */
function getComplexityStyle(level: string): string {
  switch (level) {
    case "VERY_HIGH":
      return "⚠️ **警告：此任务复杂度极高** ⚠️";
      // ⚠️ **Warning: This task has extremely high complexity** ⚠️
    case "HIGH":
      return "⚠️ **注意：此任务复杂度较高**";
      // ⚠️ **Notice: This task has relatively high complexity**
    case "MEDIUM":
      return "**提示：此任务具有一定复杂性**";
      // **Tip: This task has some complexity**
    default:
      return "";
  }
}

/**
 * 获取 executeTask 的完整 prompt
 * Get the complete prompt for executeTask
 * @param params prompt 参数
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getExecuteTaskPrompt(
  params: ExecuteTaskPromptParams
): Promise<string> {
  const { task, complexityAssessment, relatedFilesSummary, dependencyTasks } =
    params;

  const notesTemplate = await loadPromptFromTemplate("executeTask/notes.md");
  let notesPrompt = "";
  if (task.notes) {
    notesPrompt = generatePrompt(notesTemplate, {
      notes: task.notes,
    });
  }

  const implementationGuideTemplate = await loadPromptFromTemplate(
    "executeTask/implementationGuide.md"
  );
  let implementationGuidePrompt = "";
  if (task.implementationGuide) {
    implementationGuidePrompt = generatePrompt(implementationGuideTemplate, {
      implementationGuide: task.implementationGuide,
    });
  }

  const verificationCriteriaTemplate = await loadPromptFromTemplate(
    "executeTask/verificationCriteria.md"
  );
  let verificationCriteriaPrompt = "";
  if (task.verificationCriteria) {
    verificationCriteriaPrompt = generatePrompt(verificationCriteriaTemplate, {
      verificationCriteria: task.verificationCriteria,
    });
  }

  const analysisResultTemplate = await loadPromptFromTemplate(
    "executeTask/analysisResult.md"
  );
  let analysisResultPrompt = "";
  if (task.analysisResult) {
    analysisResultPrompt = generatePrompt(analysisResultTemplate, {
      analysisResult: task.analysisResult,
    });
  }

  const connectionsTemplate = await loadPromptFromTemplate(
    "executeTask/connections.md"
  );
  let connectionsPrompt = "";
  if (params.connections && params.connections.length > 0) {
    const connectionLines = params.connections
      .map((connection) => {
        const details: string[] = [connection.key];
        if (connection.transport) {
          details.push(`传输：${connection.transport}`);
        }
        if (connection.description) {
          details.push(connection.description);
        }
        if (connection.required) {
          details.push("必需");
        }
        return `- ${details.join(" · ")}`;
      })
      .join("\\n");
    connectionsPrompt = generatePrompt(connectionsTemplate, {
      connections: connectionLines,
    });
  }

  const dependencyTasksTemplate = await loadPromptFromTemplate(
    "executeTask/dependencyTasks.md"
  );
  let dependencyTasksPrompt = "";
  if (dependencyTasks && dependencyTasks.length > 0) {
    const completedDependencyTasks = dependencyTasks.filter(
      (t) => t.status === TaskStatus.COMPLETED && t.summary
    );

    if (completedDependencyTasks.length > 0) {
      let dependencyTasksContent = "";
      for (const depTask of completedDependencyTasks) {
        dependencyTasksContent += `### ${depTask.name}\n${
          depTask.summary || "*无完成摘要*"
          // "*No completion summary*"
        }\n\n`;
      }
      dependencyTasksPrompt = generatePrompt(dependencyTasksTemplate, {
        dependencyTasks: dependencyTasksContent,
      });
    }
  }

  const relatedFilesSummaryTemplate = await loadPromptFromTemplate(
    "executeTask/relatedFilesSummary.md"
  );
  let relatedFilesSummaryPrompt = "";
  relatedFilesSummaryPrompt = generatePrompt(relatedFilesSummaryTemplate, {
    relatedFilesSummary: relatedFilesSummary || "当前任务没有关联的文档。",
    // "The current task has no associated files."
  });

  const complexityTemplate = await loadPromptFromTemplate(
    "executeTask/complexity.md"
  );
  let complexityPrompt = "";
  if (complexityAssessment) {
    const complexityStyle = getComplexityStyle(complexityAssessment.level);
    let recommendationContent = "";
    if (
      complexityAssessment.recommendations &&
      complexityAssessment.recommendations.length > 0
    ) {
      for (const recommendation of complexityAssessment.recommendations) {
        recommendationContent += `- ${recommendation}\n`;
      }
    }
    complexityPrompt = generatePrompt(complexityTemplate, {
      level: complexityAssessment.level,
      complexityStyle: complexityStyle,
      descriptionLength: complexityAssessment.metrics.descriptionLength,
      dependenciesCount: complexityAssessment.metrics.dependenciesCount,
      recommendation: recommendationContent,
    });
  }

  const workflowTemplate = await loadPromptFromTemplate(
    "executeTask/workflow.md"
  );
  let workflowPrompt = "";
  if (params.workflow) {
    const stepsContent =
      params.workflow.steps && params.workflow.steps.length > 0
        ? params.workflow.steps
            .map((step, index) => {
              const details: string[] = [
                `${index + 1}. ${step.title} (${step.id})`,
              ];
              if (step.stage) {
                details.push(`阶段：${step.stage}`);
              }
              if (step.description) {
                details.push(step.description);
              }
              return details.join(" · ");
            })
            .join("\n")
        : "无可用步骤，请先生成工作流模板。";
    workflowPrompt = generatePrompt(workflowTemplate, {
      pattern: params.workflow.pattern,
      currentStep: params.workflow.currentStepId ?? "未指定",
      steps: stepsContent,
    });
  }

  const rolesTemplate = await loadPromptFromTemplate("executeTask/roles.md");
  let rolesPrompt = "";
  if (params.roles && params.roles.length > 0) {
    const rolesContent = params.roles
      .map((role) => {
        const details: string[] = [role.name];
        if (role.summary) {
          details.push(role.summary);
        }
        if (role.responsibilities) {
          details.push(role.responsibilities);
        }
        if (role.defaultTools && role.defaultTools.length > 0) {
          details.push(`默认工具：${role.defaultTools.join(", ")}`);
        }
        return `- ${details.join(" · ")}`;
      })
      .join("\n");
    rolesPrompt = generatePrompt(rolesTemplate, {
      roles: rolesContent,
    });
  }

  const stageTemplate = await loadPromptFromTemplate(
    "executeTask/stageProgress.md"
  );
  let stagePrompt = "";
  if (params.stageProgress && params.stageProgress.length > 0) {
    const stageLines = params.stageProgress
      .map((stage) => {
        const pieces: string[] = [`- ${stage.stage}`];
        pieces.push(`状态：${stage.status}`);
        if (stage.updatedAt) {
          pieces.push(`更新：${stage.updatedAt}`);
        }
        if (stage.notes) {
          pieces.push(stage.notes);
        }
        return pieces.join(" · ");
      })
      .join("\n");
    stagePrompt = generatePrompt(stageTemplate, {
      stages: stageLines,
    });
  }

  const indexTemplate = await loadPromptFromTemplate("executeTask/index.md");
  let prompt = generatePrompt(indexTemplate, {
    name: task.name,
    id: task.id,
    description: task.description,
    notesTemplate: notesPrompt,
    implementationGuideTemplate: implementationGuidePrompt,
    verificationCriteriaTemplate: verificationCriteriaPrompt,
    analysisResultTemplate: analysisResultPrompt,
    connectionsTemplate: connectionsPrompt,
    dependencyTasksTemplate: dependencyTasksPrompt,
    relatedFilesSummaryTemplate: relatedFilesSummaryPrompt,
    complexityTemplate: complexityPrompt,
    workflowTemplate: workflowPrompt,
    rolesTemplate: rolesPrompt,
    stageProgressTemplate: stagePrompt,
  });

  // 如果任务有指定的代理，添加 sub-agent 命令
  if (task.agent) {
    // 在 prompt 开头添加 use sub-agent 命令
    prompt = `use sub-agent ${task.agent}\n\n${prompt}`;
  }

  // 加载可能的自定义 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "EXECUTE_TASK");
}
