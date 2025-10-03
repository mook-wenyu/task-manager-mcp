import { z } from "zod";
import {
  getAllTasks,
  batchCreateOrUpdateTasks,
  clearAllTasks as modelClearAllTasks,
} from "../../models/taskModel.js";
import { RelatedFileType, Task } from "../../types/index.js";
import { getSplitTasksPrompt } from "../../prompts/index.js";
import { getAllAvailableAgents } from "../../utils/agentLoader.js";
import { matchAgentToTask } from "../../utils/agentMatcher.js";

// 拆分任务工具
// Task splitting tool
export const splitTasksSchema = z.object({
  updateMode: z
    .enum(["append", "overwrite", "selective", "clearAllTasks"])
    .describe(
      "任务更新模式选择：'append'(保留所有现有任务并添加新任务)、'overwrite'(清除所有未完成任务并完全替换，保留已完成任务)、'selective'(智能更新：根据任务名称匹配更新现有任务，保留不在列表中的任务，推荐用于任务微调)、'clearAllTasks'(清除所有任务并创建备份)。\n缺省为'clearAllTasks'模式，只有用户要求变更或修改计划内容才使用其他模式"
      // Task update mode selection: 'append' (keep all existing tasks and add new tasks), 'overwrite' (clear all incomplete tasks and completely replace, keep completed tasks), 'selective' (intelligent update: update existing tasks based on task name matching, keep tasks not in the list, recommended for task fine-tuning), 'clearAllTasks' (clear all tasks and create backup). Default is 'clearAllTasks' mode, only use other modes when user requests changes or modifications to plan content
    ),
  tasks: z
    .array(
      z.object({
        name: z
          .string()
          .max(100, {
            message: "任务名称过长，请限制在100个字符以内",
            // Task name is too long, please limit to within 100 characters
          })
          .describe("简洁明确的任务名称，应能清晰表达任务目的"),
          // Concise and clear task name, should clearly express the task purpose
        description: z
          .string()
          .min(10, {
            message: "任务描述过短，请提供更详细的内容以确保理解",
            // Task description is too short, please provide more detailed content to ensure understanding
          })
          .describe("详细的任务描述，包含实施要点、技术细节和验收标准"),
          // Detailed task description, including implementation points, technical details and acceptance criteria
        implementationGuide: z
          .string()
          .describe(
            "此特定任务的具体实现方法和步骤，请参考之前的分析结果提供精简pseudocode"
            // Specific implementation methods and steps for this particular task, please refer to previous analysis results to provide concise pseudocode
          ),
        dependencies: z
          .array(z.string())
          .optional()
          .describe(
            "此任务依赖的前置任务ID或任务名称列表，支持两种引用方式，名称引用更直观，是一个字符串数组"
            // List of prerequisite task IDs or task names that this task depends on, supports two reference methods, name reference is more intuitive, is a string array
          ),
        notes: z
          .string()
          .optional()
          .describe("补充说明、特殊处理要求或实施建议（选填）"),
          // Additional notes, special handling requirements or implementation suggestions (optional)
        relatedFiles: z
          .array(
            z.object({
              path: z
                .string()
                .min(1, {
                  message: "文档路径不能为空",
                  // File path cannot be empty
                })
                .describe("文档路径，可以是相对于项目根目录的路径或绝对路径"),
                // File path, can be a path relative to the project root directory or an absolute path
              type: z
                .nativeEnum(RelatedFileType)
                .describe(
                  "文档类型 (TO_MODIFY: 待修改, REFERENCE: 参考数据, CREATE: 待创建, DEPENDENCY: 依赖文档, OTHER: 其他)"
                  // File type (TO_MODIFY: to be modified, REFERENCE: reference material, CREATE: to be created, DEPENDENCY: dependency file, OTHER: other)
                ),
              description: z
                .string()
                .min(1, {
                  message: "文档描述不能为空",
                  // File description cannot be empty
                })
                .describe("文档描述，用于说明文档的用途和内容"),
                // File description, used to explain the purpose and content of the file
              lineStart: z
                .number()
                .int()
                .positive()
                .optional()
                .describe("相关代码区块的起始行（选填）"),
                // Starting line of the related code block (optional)
              lineEnd: z
                .number()
                .int()
                .positive()
                .optional()
                .describe("相关代码区块的结束行（选填）"),
                // Ending line of the related code block (optional)
            })
          )
          .optional()
          .describe(
            "与任务相关的文档列表，用于记录与任务相关的代码文档、参考数据、要创建的文档等（选填）"
            // List of files related to the task, used to record code files, reference materials, files to be created, etc. related to the task (optional)
          ),
        verificationCriteria: z
          .string()
          .optional()
          .describe("此特定任务的验证标准和检验方法"),
          // Verification standards and inspection methods for this specific task
      })
    )
    .min(1, {
      message: "请至少提供一个任务",
      // Please provide at least one task
    })
    .describe(
      "结构化的任务清单，每个任务应保持原子性且有明确的完成标准，避免过于简单的任务，简单修改可与其他任务集成，避免任务过多"
      // Structured task list, each task should maintain atomicity and have clear completion criteria, avoid overly simple tasks, simple modifications can be integrated with other tasks, avoid too many tasks
    ),
  globalAnalysisResult: z
    .string()
    .optional()
    .describe("任务最终目标，来自之前分析适用于所有任务的通用部分"),
    // Task final objectives, from previous analysis applicable to the common part of all tasks
});

export async function splitTasks({
  updateMode,
  tasks,
  globalAnalysisResult,
}: z.infer<typeof splitTasksSchema>) {
  try {
    // 加载可用的代理
    // Load available agents
    let availableAgents: any[] = [];
    try {
      availableAgents = await getAllAvailableAgents();
    } catch (error) {
      // 如果加载代理失败，继续运行但不分配代理
      // If agent loading fails, continue execution but don't assign agents
      availableAgents = [];
    }

    // 检查 tasks 里面的 name 是否有重复
    // Check if there are duplicate names in tasks
    const nameSet = new Set();
    for (const task of tasks) {
      if (nameSet.has(task.name)) {
        return {
          content: [
            {
              type: "text" as const,
              text: "tasks 参数中存在重复的任务名称，请确保每个任务名称是唯一的",
              // Duplicate task names exist in tasks parameter, please ensure each task name is unique
            },
          ],
        };
      }
      nameSet.add(task.name);
    }

    // 根据不同的更新模式处理任务
    // Handle tasks according to different update modes
    let message = "";
    let actionSuccess = true;
    let backupFile = null;
    let createdTasks: Task[] = [];
    let allTasks: Task[] = [];

    // 将任务数据转换为符合batchCreateOrUpdateTasks的格式
    // Convert task data to format compatible with batchCreateOrUpdateTasks
    const convertedTasks = tasks.map((task) => {
      // 创建一个临时的 Task 对象用于代理匹配
      // Create a temporary Task object for agent matching
      const tempTask: Partial<Task> = {
        name: task.name,
        description: task.description,
        notes: task.notes,
        implementationGuide: task.implementationGuide,
      };

      // 使用 matchAgentToTask 找到最适合的代理
      // Use matchAgentToTask to find the most suitable agent
      const matchedAgent = availableAgents.length > 0 
        ? matchAgentToTask(tempTask as Task, availableAgents)
        : undefined;

      return {
        name: task.name,
        description: task.description,
        notes: task.notes,
        dependencies: task.dependencies,
        implementationGuide: task.implementationGuide,
        verificationCriteria: task.verificationCriteria,
        agent: matchedAgent, // 添加代理分配
        // Add agent assignment
        relatedFiles: task.relatedFiles?.map((file) => ({
          path: file.path,
          type: file.type as RelatedFileType,
          description: file.description,
          lineStart: file.lineStart,
          lineEnd: file.lineEnd,
        })),
      };
    });

    // 处理 clearAllTasks 模式
    // Handle clearAllTasks mode
    if (updateMode === "clearAllTasks") {
      const clearResult = await modelClearAllTasks();

      if (clearResult.success) {
        message = clearResult.message;
        backupFile = clearResult.backupFile;

        try {
          // 清空任务后再创建新任务
          // Clear tasks and then create new tasks
          createdTasks = await batchCreateOrUpdateTasks(
            convertedTasks,
            "append",
            globalAnalysisResult
          );
          message += `\n成功创建了 ${createdTasks.length} 个新任务。`;
          // Successfully created ${createdTasks.length} new tasks.
        } catch (error) {
          actionSuccess = false;
          message += `\n创建新任务时发生错误: ${
          // Error occurred when creating new tasks: ${
            error instanceof Error ? error.message : String(error)
          }`;
        }
      } else {
        actionSuccess = false;
        message = clearResult.message;
      }
    } else {
      // 对于其他模式，直接使用 batchCreateOrUpdateTasks
      // For other modes, use batchCreateOrUpdateTasks directly
      try {
        createdTasks = await batchCreateOrUpdateTasks(
          convertedTasks,
          updateMode,
          globalAnalysisResult
        );

        // 根据不同的更新模式生成消息
        // Generate messages based on different update modes
        switch (updateMode) {
          case "append":
            message = `成功追加了 ${createdTasks.length} 个新任务。`;
            // Successfully appended ${createdTasks.length} new tasks.
            break;
          case "overwrite":
            message = `成功清除未完成任务并创建了 ${createdTasks.length} 个新任务。`;
            // Successfully cleared incomplete tasks and created ${createdTasks.length} new tasks.
            break;
          case "selective":
            message = `成功选择性更新/创建了 ${createdTasks.length} 个任务。`;
            // Successfully selectively updated/created ${createdTasks.length} tasks.
            break;
        }
      } catch (error) {
        actionSuccess = false;
        message = `任务创建失败：${
        // Task creation failed: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    }

    // 获取所有任务用于显示依赖关系
    // Get all tasks for displaying dependency relationships
    try {
      allTasks = await getAllTasks();
    } catch (error) {
      allTasks = [...createdTasks]; // 如果获取失败，至少使用刚创建的任务
      // If retrieval fails, at least use the newly created tasks
    }

    // 使用prompt生成器获取最终prompt
    // Use prompt generator to get the final prompt
    const prompt = await getSplitTasksPrompt({
      updateMode,
      createdTasks,
      allTasks,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: prompt,
        },
      ],
      ephemeral: {
        taskCreationResult: {
          success: actionSuccess,
          message,
          backupFilePath: backupFile,
        },
      },
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text:
            "运行任务拆分时发生错误: " +
            // Error occurred when executing task splitting: " +
            (error instanceof Error ? error.message : String(error)),
        },
      ],
    };
  }
}
