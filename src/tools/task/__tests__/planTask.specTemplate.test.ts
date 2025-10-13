import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { planTask } from "../planTask.js";

let originalDataDir: string | undefined;
let tempDataDir: string;

describe("planTask specTemplate blueprint", () => {
  beforeEach(async () => {
    originalDataDir = process.env.DATA_DIR;
    tempDataDir = await mkdtemp(path.join(tmpdir(), "plan-task-"));
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

  it("embeds specTemplate blueprint in structured content", async () => {
    const result = await planTask({
      description: "实现轻量规格模板生成",
      existingTasksReference: false,
    });

    expect(result.structuredContent).toBeDefined();
    const payload = result.structuredContent?.payload as any;
    expect(payload.specTemplate).toBeDefined();
    expect(payload.specTemplate.files).toHaveLength(3);
    expect(payload.specTemplate.files[0].path).toBe(
      "<DATA_DIR>/specs/<taskId>/spec.md"
    );
    expect(payload.specTemplate.sections[0].id).toBe("overview");
    expect(payload.workflowPattern).toBeDefined();
    expect(payload.workflowPattern.default).toBe("serial");
    expect(payload.workflowPattern.options).toHaveLength(3);
    expect(payload.roles).toBeDefined();
    expect(payload.roles).toHaveLength(3);
    expect(payload.roles[0].name).toBe("规格主笔");
    expect(payload.openQuestions).toBeDefined();
    expect(payload.openQuestions[0]).toMatchObject({
      id: "oq-1",
      question: expect.stringContaining("输入"),
    });
  });
});
