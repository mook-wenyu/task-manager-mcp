import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { createTask } from "../../../models/taskModel.js";
import {
  generateWorkflow,
  loadWorkflowDefinition,
} from "../generateWorkflow.js";

let originalDataDir: string | undefined;
let tempDataDir: string;

describe("generateWorkflow", () => {
  beforeEach(async () => {
    originalDataDir = process.env.DATA_DIR;
    tempDataDir = await mkdtemp(path.join(tmpdir(), "workflow-"));
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

  it("creates workflow files and structured content", async () => {
    const task = await createTask("工作流测试", "验证工作流生成工具");

    const result = await generateWorkflow({ taskId: task.id });

    expect(result.structuredContent).toBeDefined();
    const payload = result.structuredContent?.payload as any;
    expect(payload.files).toHaveLength(2);
    expect(payload.workflow.pattern).toBe("serial");

    const workflowDir = path.join(tempDataDir, "specs", task.id);
    const jsonPath = path.join(workflowDir, "workflow.json");
    const markdownPath = path.join(workflowDir, "workflow.md");

    const jsonContent = await readFile(jsonPath, "utf-8");
    const markdownContent = await readFile(markdownPath, "utf-8");

    expect(markdownContent).toContain("## 工作流模板已生成");
    const parsed = JSON.parse(jsonContent);
    expect(parsed.pattern).toBe("serial");
    expect(parsed.steps).toHaveLength(3);

    const loaded = await loadWorkflowDefinition(task.id);
    expect(loaded?.pattern).toBe("serial");
  });

  it("requires force flag when workflow exists", async () => {
    const task = await createTask("工作流覆盖", "验证 force 行为");

    await generateWorkflow({ taskId: task.id });
    const second = await generateWorkflow({ taskId: task.id });
    expect(second).toMatchObject({ isError: true });

    const forced = await generateWorkflow({ taskId: task.id, force: true });
    expect(forced.content?.[0]?.text).toContain("工作流模板已生成");
  });
});
