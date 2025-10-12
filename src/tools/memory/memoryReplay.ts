import { z } from "zod";
import { memoryStore } from "../../models/memoryStore.js";
import type { MemoryEntry } from "../../types/index.js";

const scopeEnum = z.enum(["short-term", "long-term"]);

export const memoryReplaySchema = z.object({
  scope: scopeEnum.optional().default("short-term"),
  taskId: z.string().min(1).optional(),
  tags: z.array(z.string().min(1)).optional(),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

type MemoryReplayParams = z.infer<typeof memoryReplaySchema>;

function formatEntry(entry: MemoryEntry, index: number): string {
  const header = `${index + 1}. ${entry.toolName} · ${new Date(entry.createdAt).toLocaleString()}`;
  const taskLine = entry.taskId ? `任务 ID: ${entry.taskId}` : undefined;
  const tagsLine = entry.tags.length ? `标签: ${entry.tags.join(", ")}` : undefined;
  return [
    `### ${header}`,
    taskLine,
    tagsLine,
    `优先级: ${entry.importance}`,
    "",
    entry.summary,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildMarkdown(entries: MemoryEntry[]): string {
  if (entries.length === 0) {
    return "未找到匹配的记忆条目。";
  }

  return entries.map((entry, index) => formatEntry(entry, index)).join("\n\n");
}

export async function memoryReplay(params: MemoryReplayParams) {
  const { scope, taskId, tags, limit } = params;
  const normalizedTaskId = taskId ?? null;
  const normalizedTags = tags?.length ? tags : undefined;

  const entries = await memoryStore.listRecent({
    scope,
    limit,
    taskId: normalizedTaskId,
    tags: normalizedTags,
  });

  const markdown = buildMarkdown(entries);

  const structuredContent = {
    kind: "taskManager.memoryReplay" as const,
    payload: {
      markdown,
      scope,
      limit,
      entries,
      filters: {
        ...(normalizedTaskId ? { taskId: normalizedTaskId } : {}),
        ...(normalizedTags ? { tags: normalizedTags } : {}),
      },
    },
  };

  return {
    content: [
      {
        type: "text" as const,
        text: markdown,
      },
    ],
    structuredContent,
  };
}
