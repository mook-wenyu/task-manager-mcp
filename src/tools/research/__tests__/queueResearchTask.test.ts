import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { queueResearchTask } from "../queueResearchTask.js";
import { createTask, getAllTasks } from "../../../models/taskModel.js";

let originalDataDir: string | undefined;
let tempDataDir: string;

describe("queueResearchTask", () => {
  beforeEach(async () => {
    originalDataDir = process.env.DATA_DIR;
    tempDataDir = await mkdtemp(path.join(tmpdir(), "research-"));
    process.env.DATA_DIR = tempDataDir;
  });

  afterEach(async () => {
    if (originalDataDir === undefined) {
      delete process.env.DATA_DIR;
    } else {
      process.env.DATA_DIR = originalDataDir;
    }
    await rm(tempDataDir, { recursive: true, force: true });
  });

  it("writes research files and creates follow-up tasks", async () => {
    const parentTask = await createTask(
      "实现轻量 MCP 调研",
      "需要确认外部依赖的接口行为"
    );

    const result = await queueResearchTask({
      taskId: parentTask.id,
      overwrite: false,
      questions: [
        {
          id: "oq-1",
          question: "目标 API 是否提供错误码？",
          required: true,
        },
        {
          id: "oq-2",
          question: "最新 SLA 指标是什么？",
        },
      ],
    });

    expect(result.structuredContent).toBeDefined();
    const payload = result.structuredContent?.payload as any;
    expect(payload.questions).toHaveLength(2);
    expect(payload.files).toHaveLength(2);
    expect(payload.createdTaskIds).toHaveLength(2);

    const researchDir = path.join(tempDataDir, "specs", parentTask.id);
    const questionsPath = path.join(researchDir, "open-questions.json");
    const researchPath = path.join(researchDir, "research.md");

    const questionsFile = JSON.parse(await readFile(questionsPath, "utf-8"));
    expect(questionsFile).toHaveLength(2);
    const researchContent = await readFile(researchPath, "utf-8");
    expect(researchContent).toContain("调研记录");

    const allTasks = await getAllTasks();
    const researchTasks = allTasks.filter((task) =>
      task.name.startsWith("[调研]")
    );
    expect(researchTasks).toHaveLength(2);
  });

  it("reuses stored questions when not provided and avoids duplicates", async () => {
    const parentTask = await createTask(
      "复查调研依赖",
      "评估外部服务可靠性"
    );

    await queueResearchTask({
      taskId: parentTask.id,
      overwrite: false,
      questions: [
        {
          question: "依赖服务的峰值 TPS 上限是多少？",
          required: true,
        },
      ],
    });

    const secondRun = await queueResearchTask({
      taskId: parentTask.id,
      overwrite: false,
    });

    const payload = secondRun.structuredContent?.payload as any;
    expect(payload.questions).toHaveLength(1);
    expect(payload.createdTaskIds).toHaveLength(0);
  });
});
