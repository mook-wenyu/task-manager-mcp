import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { memoryStore } from "../models/memoryStore.js";
import type { MemoryImportance } from "../types/index.js";

const MAX_SUMMARY_LENGTH = 600;

function truncateSummary(text: string): string {
  const normalized = text.trim();
  if (normalized.length <= MAX_SUMMARY_LENGTH) {
    return normalized;
  }
  return `${normalized.slice(0, MAX_SUMMARY_LENGTH - 1)}…`;
}

function normalizeTags(tags: string[]): string[] {
  return Array.from(new Set(tags.filter((tag) => tag.trim().length > 0)));
}

type StructuredContentPayload = Record<string, unknown> & {
  markdown?: string;
  taskId?: string | null;
  tags?: unknown;
  stage?: unknown;
  summary?: unknown;
  score?: unknown;
  statusAfter?: unknown;
};

interface MemoryDerivationResult {
  summary: string;
  tags: string[];
  importance: MemoryImportance;
  taskId: string | null;
  metadata: Record<string, unknown>;
}

function deriveMemoryFields(
  toolName: string,
  structuredContent: CallToolResult["structuredContent"]
): MemoryDerivationResult | null {
  if (!structuredContent || typeof structuredContent !== "object") {
    return null;
  }

  const { kind, payload } = structuredContent as {
    kind: string;
    payload?: StructuredContentPayload;
  };

  if (!payload) {
    return null;
  }

  const metadata: Record<string, unknown> = {
    kind,
  };

  let summary = "";
  let tags: string[] = [];
  let importance: MemoryImportance = "normal";
  let taskId: string | null = null;

  const markdown = typeof payload.markdown === "string" ? payload.markdown : "";
  const payloadTags = Array.isArray(payload.tags)
    ? (payload.tags.filter((tag): tag is string => typeof tag === "string") ?? [])
    : [];

  switch (kind) {
    case "taskManager.plan": {
      summary = markdown || (typeof payload.summary === "string" ? payload.summary : "");
      tags = ["planning"];
      importance = "high";
      break;
    }
    case "taskManager.analyze": {
      summary =
        (typeof payload.summary === "string" ? payload.summary : "") || markdown;
      tags = ["analysis"];
      importance = "high";
      break;
    }
    case "taskManager.reflect": {
      summary =
        (typeof payload.summary === "string" ? payload.summary : "") || markdown;
      tags = ["retro"];
      importance = "high";
      break;
    }
    case "taskManager.execute": {
      summary = markdown;
      tags = ["execution"];
      if (typeof payload.statusAfter === "string") {
        tags.push(`status:${payload.statusAfter}`);
      }
      if (typeof payload.taskId === "string") {
        taskId = payload.taskId;
      }
      break;
    }
    case "taskManager.verify": {
      summary = markdown ||
        (typeof payload.score === "number"
          ? `验证得分 ${payload.score}`
          : "");
      tags = ["verification"];
      if (typeof payload.taskId === "string") {
        taskId = payload.taskId;
      }
      importance = "high";
      break;
    }
    case "taskManager.thought": {
      summary = markdown;
      tags = ["thought", ...payloadTags.map((tag) => `tag:${tag}`)];
      if (typeof payload.stage === "string") {
        tags.push(`stage:${payload.stage}`);
      }
      break;
    }
    default:
      return null;
  }

  const normalizedSummary = truncateSummary(summary);
  if (!normalizedSummary) {
    return null;
  }

  if (typeof payload.taskId === "string" && !taskId) {
    taskId = payload.taskId;
  }

  metadata.tool = toolName;

  return {
    summary: normalizedSummary,
    tags: normalizeTags(tags),
    importance,
    taskId,
    metadata,
  };
}

export async function recordMemoryFromTool(
  toolName: string,
  result: CallToolResult
): Promise<void> {
  try {
    const derived = deriveMemoryFields(toolName, result.structuredContent);
    if (!derived) {
      return;
    }

    await memoryStore.append(
      {
        toolName,
        summary: derived.summary,
        tags: derived.tags,
        importance: derived.importance,
        taskId: derived.taskId,
        metadata: derived.metadata,
      },
      {
        promote: derived.importance === "high",
      }
    );
  } catch (error) {
    // 仅记录日志，不阻断主流程
    console.warn(
      `[memoryRecorder] 记录工具 ${toolName} 结果时失败:`,
      error instanceof Error ? error.message : error
    );
  }
}
