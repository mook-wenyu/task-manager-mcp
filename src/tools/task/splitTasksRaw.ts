import { z } from "zod";
import {
  splitTasksSchema,
  performSplitTasks,
  createStructuredErrorResponse,
} from "./splitTasksShared.js";
import { getGlobalServer } from "../../utils/paths.js";

export const splitTasksRawSchema = z.object({
  updateMode: splitTasksSchema.shape.updateMode,
  tasksRaw: z
    .string()
    .describe(
      "结构化的任务清单，每个任务应保持原子性且有明确的完成标准，避免过于简单的任务，简单修改可与其他任务集成，避免任务过多，范例：[{name: '任务1', description: '...', implementationGuide: '...'}]",
    ),
  globalAnalysisResult: splitTasksSchema.shape.globalAnalysisResult,
});

type ElicitedContent = {
  tasksRaw?: string;
};

async function requestCorrectedTasksRaw(reason: string): Promise<string | null> {
  const server = getGlobalServer();
  if (!server?.elicitInput) {
    return null;
  }

  try {
    const elicitation = await server.elicitInput({
      message: `${reason}\n如果可以，请提供修正后的 tasksRaw JSON。`,
      requestedSchema: {
        type: "object",
        properties: {
          tasksRaw: {
            type: "string",
            title: "修正后的 tasksRaw",
            description:
              "提供合法的 JSON 数组，每个任务需包含 name、description、implementationGuide 等字段。",
          },
        },
        required: ["tasksRaw"],
      },
    });

    if (elicitation.action === "accept") {
      const content = elicitation.content as ElicitedContent | undefined;
      const next = content?.tasksRaw?.trim();
      if (next) {
        return next;
      }
    }
  } catch (error) {
    console.warn(
      "splitTasksRaw elicitation failed",
      error instanceof Error ? error.message : error,
    );
  }

  return null;
}

export async function splitTasksRaw({
  updateMode,
  tasksRaw,
  globalAnalysisResult,
}: z.infer<typeof splitTasksRawSchema>) {
  let currentTasksRaw = tasksRaw;

  for (let attempt = 0; attempt < 2; attempt++) {
    let parsedTasks: unknown;
    try {
      parsedTasks = JSON.parse(currentTasksRaw);
    } catch (error) {
      const message =
        "tasksRaw 参数格式错误，请确保提供合法的 JSON 字符串，错误信息：" +
        (error instanceof Error ? error.message : String(error));

      const replacement = await requestCorrectedTasksRaw(message);
      if (replacement) {
        currentTasksRaw = replacement;
        continue;
      }

      return createStructuredErrorResponse(updateMode, message, {
        errorCode: "E_PARSE",
      });
    }

    const validation = splitTasksSchema.safeParse({
      updateMode,
      tasks: parsedTasks,
      globalAnalysisResult,
    });

    if (!validation.success) {
      const formattedError = validation.error.errors
        .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
        .join("; ");
      const message = "tasks 参数格式错误，请修正后重试：" + formattedError;

      const replacement = await requestCorrectedTasksRaw(message);
      if (replacement) {
        currentTasksRaw = replacement;
        continue;
      }

      return createStructuredErrorResponse(updateMode, message, {
        errorCode: "E_VALIDATE",
        errors: validation.error.errors.map((issue) => issue.message),
      });
    }

    return performSplitTasks(validation.data);
  }

  return createStructuredErrorResponse(
    updateMode,
    "多次尝试后仍无法解析或验证 tasksRaw，请检查输入格式并重试。",
    { errorCode: "E_INVALID_RETRY" },
  );
}
