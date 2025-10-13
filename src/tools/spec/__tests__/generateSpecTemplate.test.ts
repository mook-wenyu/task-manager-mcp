import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { createTask, getTaskById } from "../../../models/taskModel.js";
import { generateSpecTemplate } from "../generateSpecTemplate.js";

let originalDataDir: string | undefined;
let tempDataDir: string;

describe("generateSpecTemplate", () => {
  beforeEach(async () => {
    originalDataDir = process.env.DATA_DIR;
    tempDataDir = await mkdtemp(path.join(tmpdir(), "spec-template-"));
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

  it("creates markdown, json schema and graph files", async () => {
    const task = await createTask("规格生成测试", "用于验证模板生成");

    const result = await generateSpecTemplate({ taskId: task.id });

    expect(result.content?.[0]?.text).toContain("规格模板已生成");

    const specDir = path.join(tempDataDir, "specs", task.id);
    const specMd = await readFile(path.join(specDir, "spec.md"), "utf-8");
    const specJson = await readFile(path.join(specDir, "spec.json"), "utf-8");
    const graphJson = await readFile(path.join(specDir, "graph.json"), "utf-8");

    expect(specMd).toMatch(/任务规格：规格生成测试/);
    const parsedSpec = JSON.parse(specJson);
    expect(parsedSpec.metadata.taskId).toBe(task.id);
    expect(JSON.parse(graphJson).nodes).toHaveLength(3);

    const loadedTask = await getTaskById(task.id);
    expect(loadedTask?.name).toBe("规格生成测试");
  });

  it("requires force flag when template exists", async () => {
    const task = await createTask("规格覆盖测试", "第一次生成");

    await generateSpecTemplate({ taskId: task.id });
    const secondAttempt = await generateSpecTemplate({ taskId: task.id });

    expect(secondAttempt.isError).toBe(true);
    expect(secondAttempt.content?.[0]?.text).toContain("生成终止");

    const forced = await generateSpecTemplate({ taskId: task.id, force: true });
    expect(forced.content?.[0]?.text).toContain("规格模板已生成");
  });
});
