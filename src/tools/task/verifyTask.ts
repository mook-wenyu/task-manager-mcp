import { z } from "zod";
import { UUID_V4_REGEX } from "../../utils/regex.js";
import {
  getTaskById,
  updateTaskStatus,
  updateTaskSummary,
} from "../../models/taskModel.js";
import { TaskStatus } from "../../types/index.js";
import { getVerifyTaskPrompt } from "../../prompts/index.js";

// 检验任务工具
// Task verification tool
export const verifyTaskSchema = z.object({
  taskId: z
    .string()
    .regex(UUID_V4_REGEX, {
      message: "任务ID格式无效，请提供有效的UUID v4格式",
      // message: "Invalid task ID format, please provide a valid UUID v4 format",
    })
    .describe("待验证任务的唯一标识符，必须是系统中存在的有效任务ID"),
    // .describe("Unique identifier of the task to be verified, must be a valid task ID that exists in the system")
  summary: z
    .string()
    .min(30, {
      message: "最少30个字",
      // message: "Minimum 30 characters",
    })
    .describe(
      "当分数高于或等于 80分时代表任务完成摘要，简洁描述实施结果和重要决策，当分数低于 80分时代表缺失或需要修正的部分说明，最少30个字"
      // "When score is 80 or above, this represents task completion summary, briefly describing implementation results and important decisions. When score is below 80, this represents missing or parts that need correction, minimum 30 characters"
    ),
  score: z
    .number()
    .min(0, { message: "分数不能小于0" })
    // .min(0, { message: "Score cannot be less than 0" })
    .max(100, { message: "分数不能大于100" })
    // .max(100, { message: "Score cannot be greater than 100" })
    .describe("针对任务的评分，当评分等于或超过80分时自动完成任务"),
    // .describe("Score for the task, automatically completes task when score equals or exceeds 80")
});

export async function verifyTask({
  taskId,
  summary,
  score,
}: z.infer<typeof verifyTaskSchema>) {
  const buildResponse = (
    markdown: string,
    options: {
      taskName?: string;
      statusAfter?: TaskStatus;
      statusChanged?: boolean;
      isError?: boolean;
    } = {}
  ) => {
    const payload: Record<string, unknown> = {
      markdown,
      taskId,
      score,
      statusChanged: options.statusChanged ?? false,
    };

    if (options.taskName) {
      payload.taskName = options.taskName;
    }

    if (options.statusAfter) {
      payload.statusAfter = options.statusAfter;
    }

    return {
      content: [
        {
          type: "text" as const,
          text: markdown,
        },
      ],
      structuredContent: {
        kind: "taskManager.verify" as const,
        payload,
      },
      ...(options.isError ? { isError: true } : {}),
    };
  };

  const task = await getTaskById(taskId);

  if (!task) {
    const message = `## 系统错误\n\n找不到ID为 \`${taskId}\` 的任务。请使用「list_tasks」工具确认有效的任务ID后再试。`;
    return buildResponse(message, {
      statusChanged: false,
      isError: true,
    });
  }

  if (task.status !== TaskStatus.IN_PROGRESS) {
    const message = `## 状态错误\n\n任务 "${task.name}" (ID: \`${task.id}\`) 当前状态为 "${task.status}"，不处于进行中状态，无法进行检验。\n\n只有状态为「进行中」的任务才能进行检验。请先使用「execute_task」工具开始任务运行。`;
    return buildResponse(message, {
      taskName: task.name,
      statusAfter: task.status,
      statusChanged: false,
      isError: true,
    });
  }

  let statusAfter: TaskStatus = task.status;
  let statusChanged = false;

  if (score >= 80) {
    await updateTaskSummary(taskId, summary);
    await updateTaskStatus(taskId, TaskStatus.COMPLETED);
    statusAfter = TaskStatus.COMPLETED;
    statusChanged = true;
    task.status = statusAfter;
  }

  const prompt = await getVerifyTaskPrompt({ task, score, summary });

  return buildResponse(prompt, {
    taskName: task.name,
    statusAfter,
    statusChanged,
  });
}
