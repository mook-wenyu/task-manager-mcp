import { z } from "zod";
import { UUID_V4_REGEX } from "../../utils/regex.js";
import {
  getTaskById,
  updateTaskContent as modelUpdateTaskContent,
} from "../../models/taskModel.js";
import { RelatedFileType } from "../../types/index.js";
import { getUpdateTaskContentPrompt } from "../../prompts/index.js";

// 更新任务内容工具
// Update task content tool
export const updateTaskContentSchema = z.object({
  taskId: z
    .string()
    .regex(UUID_V4_REGEX, {
      message: "任务ID格式无效，请提供有效的UUID v4格式",
      // Task ID format is invalid, please provide a valid UUID v4 format
    })
    .describe("待更新任务的唯一标识符，必须是系统中存在且未完成的任务ID"),
    // Unique identifier of the task to be updated, must be a task ID that exists in the system and is not completed
  name: z.string().optional().describe("任务的新名称（选填）"),
  // New name of the task (optional)
  description: z.string().optional().describe("任务的新描述内容（选填）"),
  // New description content of the task (optional)
  notes: z.string().optional().describe("任务的新补充说明（选填）"),
  // New additional notes of the task (optional)
  dependencies: z
    .array(z.string())
    .optional()
    .describe("任务的新依赖关系（选填）"),
    // New dependency relationships of the task (optional)
  relatedFiles: z
    .array(
      z.object({
        path: z
          .string()
          .min(1, { message: "文档路径不能为空，请提供有效的文档路径" })
          // File path cannot be empty, please provide a valid file path
          .describe("文档路径，可以是相对于项目根目录的路径或绝对路径"),
          // File path, can be a path relative to the project root directory or an absolute path
        type: z
          .nativeEnum(RelatedFileType)
          .describe(
            "文档与任务的关系类型 (TO_MODIFY, REFERENCE, CREATE, DEPENDENCY, OTHER)"
            // File relationship type with task (TO_MODIFY, REFERENCE, CREATE, DEPENDENCY, OTHER)
          ),
        description: z.string().optional().describe("文档的补充描述（选填）"),
        // Additional description of the file (optional)
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
      "与任务相关的文档列表，用于记录与任务相关的代码文档、参考数据、要创建的文件等（选填）"
      // List of files related to the task, used to record code files, reference materials, files to be created, etc. related to the task (optional)
    ),
  implementationGuide: z
    .string()
    .optional()
    .describe("任务的新实现指南（选填）"),
    // New implementation guide for the task (optional)
  verificationCriteria: z
    .string()
    .optional()
    .describe("任务的新验证标准（选填）"),
    // New verification criteria for the task (optional)
});

export async function updateTaskContent({
  taskId,
  name,
  description,
  notes,
  relatedFiles,
  dependencies,
  implementationGuide,
  verificationCriteria,
}: z.infer<typeof updateTaskContentSchema>) {
  if (relatedFiles) {
    for (const file of relatedFiles) {
      if (
        (file.lineStart && !file.lineEnd) ||
        (!file.lineStart && file.lineEnd) ||
        (file.lineStart && file.lineEnd && file.lineStart > file.lineEnd)
      ) {
        return {
          content: [
            {
              type: "text" as const,
              text: await getUpdateTaskContentPrompt({
                taskId,
                validationError:
                  "行号设置无效：必须同时设置起始行和结束行，且起始行必须小于结束行",
                  // Invalid line number settings: start line and end line must be set simultaneously, and start line must be less than end line
              }),
            },
          ],
        };
      }
    }
  }

  if (
    !(
      name ||
      description ||
      notes ||
      dependencies ||
      implementationGuide ||
      verificationCriteria ||
      relatedFiles
    )
  ) {
    return {
      content: [
        {
          type: "text" as const,
          text: await getUpdateTaskContentPrompt({
            taskId,
            emptyUpdate: true,
          }),
        },
      ],
    };
  }

  // 获取任务以检查它是否存在
  // Get task to check if it exists
  const task = await getTaskById(taskId);

  if (!task) {
    return {
      content: [
        {
          type: "text" as const,
          text: await getUpdateTaskContentPrompt({
            taskId,
          }),
        },
      ],
      isError: true,
    };
  }

  // 记录要更新的任务和内容
  // Record the task and content to be updated
  let updateSummary = `准备更新任务：${task.name} (ID: ${task.id})`;
  // Preparing to update task: ${task.name} (ID: ${task.id})
  if (name) updateSummary += `，新名称：${name}`;
  // , new name: ${name}
  if (description) updateSummary += `，更新描述`;
  // , update description
  if (notes) updateSummary += `，更新注记`;
  // , update notes
  if (relatedFiles)
    updateSummary += `，更新相关文档 (${relatedFiles.length} 个)`;
    // , update related files (${relatedFiles.length} files)
  if (dependencies)
    updateSummary += `，更新依赖关系 (${dependencies.length} 个)`;
    // , update dependencies (${dependencies.length} items)
  if (implementationGuide) updateSummary += `，更新实现指南`;
  // , update implementation guide
  if (verificationCriteria) updateSummary += `，更新验证标准`;
  // , update verification criteria

  // 运行更新操作
  // Execute update operation
  const result = await modelUpdateTaskContent(taskId, {
    name,
    description,
    notes,
    relatedFiles,
    dependencies,
    implementationGuide,
    verificationCriteria,
  });

  return {
    content: [
      {
        type: "text" as const,
        text: await getUpdateTaskContentPrompt({
          taskId,
          task,
          success: result.success,
          message: result.message,
          updatedTask: result.task,
        }),
      },
    ],
    isError: !result.success,
  };
}
