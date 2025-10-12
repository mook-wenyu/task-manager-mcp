import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../models/taskModel.js", () => ({
  getAllTasks: vi.fn(async () => [
    {
      id: "existing",
      name: "Existing Task",
      status: "pending",
    },
  ]),
  batchCreateOrUpdateTasks: vi.fn(async (tasks: Array<Record<string, unknown>>) =>
    tasks.map((task, index: number) => ({
      id: `created-${index}`,
      status: "pending",
      ...task,
    })),
  ),
  clearAllTasks: vi.fn(async () => ({
    success: true,
    message: "已清除所有任务",
    backupFile: null,
  })),
}));

vi.mock("../../prompts/index.js", () => ({
  getSplitTasksPrompt: vi.fn(async ({ updateMode, createdTasks }) => {
    return `模式:${updateMode}, 新任务:${createdTasks.length}`;
  }),
}));

vi.mock("../../utils/agentLoader.js", () => ({
  getAllAvailableAgents: vi.fn(async () => []),
}));

vi.mock("../../utils/agentMatcher.js", () => ({
  matchAgentToTask: vi.fn(() => undefined),
}));

vi.mock("../utils/structuredContent.js", () => ({
  serializeTaskDetails: (tasks: Array<Record<string, unknown>>) =>
    tasks.map((task) => ({
      id: task.id ?? task.name,
      name: task.name,
      status: task.status ?? "pending",
    })),
}));

import { splitTasksRaw } from "../splitTasksRaw.js";

describe("splitTasksRaw", () => {
  const validTask = {
    name: "Task A",
    description: "Do something important",
    implementationGuide: "Step 1 -> Step 2",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns structured error when JSON 解析失败", async () => {
    const result = await splitTasksRaw({
      updateMode: "append",
      tasksRaw: "{invalid json",
      globalAnalysisResult: undefined,
    });

    expect(result.structuredContent.payload.success).toBe(false);
    expect(result.structuredContent.payload.errorCode).toBe("E_PARSE");
  });

  it("returns structured error on schema 校验失败", async () => {
    const tasksRaw = JSON.stringify([{ ...validTask, description: "short" }]);
    const result = await splitTasksRaw({
      updateMode: "append",
      tasksRaw,
      globalAnalysisResult: undefined,
    });

    expect(result.structuredContent.payload.success).toBe(false);
    expect(result.structuredContent.payload.errorCode).toBe("E_VALIDATE");
    expect(Array.isArray(result.structuredContent.payload.errors)).toBe(true);
  });

  it("returns structured error on duplicate task names", async () => {
    const tasksRaw = JSON.stringify([
      validTask,
      { ...validTask, description: "Another important task" },
    ]);
    const result = await splitTasksRaw({
      updateMode: "append",
      tasksRaw,
      globalAnalysisResult: undefined,
    });

    expect(result.structuredContent.payload.success).toBe(false);
    expect(result.structuredContent.payload.errorCode).toBe("E_DUPLICATE_NAME");
  });

  it("creates tasks successfully with structuredContent", async () => {
    const tasksRaw = JSON.stringify([validTask]);
    const result = await splitTasksRaw({
      updateMode: "append",
      tasksRaw,
      globalAnalysisResult: "overall goal",
    });

    expect(result.structuredContent.payload.success).toBe(true);
    expect(result.structuredContent.payload.createdTasks).toHaveLength(1);
    expect(result.structuredContent.payload.message).toContain("成功追加了");
    expect(result.structuredContent.payload.errorCode).toBeUndefined();
  });
});
