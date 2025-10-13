import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { createTask } from "../../../models/taskModel.js";
import {
  loadRoleTemplates,
  renderRolePrompt,
} from "../renderRolePrompt.js";

let originalDataDir: string | undefined;
let tempDataDir: string;

describe("renderRolePrompt", () => {
  beforeEach(async () => {
    originalDataDir = process.env.DATA_DIR;
    tempDataDir = await mkdtemp(path.join(tmpdir(), "roles-"));
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

  it("writes roles.json and returns summary", async () => {
    const task = await createTask("角色提示测试", "验证角色提示生成工具");

    const result = await renderRolePrompt({ taskId: task.id });

    expect(result.structuredContent).toBeDefined();
    const payload = result.structuredContent?.payload as any;
    expect(payload.roles).toHaveLength(3);
    expect(payload.file.path).toContain("roles.json");

    const rolesPath = path.join(tempDataDir, "specs", task.id, "roles.json");
    const raw = await readFile(rolesPath, "utf-8");
    const parsed = JSON.parse(raw);

    expect(parsed.roles).toHaveLength(3);
    expect(parsed.pattern).toBe("serial");

    const loaded = await loadRoleTemplates(task.id);
    expect(loaded?.[0]?.name).toBe("规格主笔");
  });

  it("requires force flag when roles file exists", async () => {
    const task = await createTask("角色覆盖测试", "验证覆盖行为");

    await renderRolePrompt({ taskId: task.id });
    const second = await renderRolePrompt({ taskId: task.id });
    expect(second).toMatchObject({ isError: true });

    const forced = await renderRolePrompt({ taskId: task.id, force: true });
    expect(forced.content?.[0]?.text).toContain("角色提示已生成");
  });
});
