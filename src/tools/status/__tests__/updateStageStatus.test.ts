import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import {
  loadStageStatus,
  updateStageStatus,
  getStageStatusFilePath,
  STAGE_SEQUENCE,
} from "../updateStageStatus.js";

let originalDataDir: string | undefined;
let tempDataDir: string;

describe("updateStageStatus", () => {
  beforeEach(async () => {
    originalDataDir = process.env.DATA_DIR;
    tempDataDir = await mkdtemp(path.join(tmpdir(), "stage-status-"));
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

  it("creates default stage file and applies updates", async () => {
    const taskId = "00000000-0000-0000-0000-000000000001";

    const initialStages = await loadStageStatus(taskId);
    expect(initialStages).toHaveLength(STAGE_SEQUENCE.length);
    expect(initialStages[0]).toMatchObject({
      stage: "spec",
      status: "pending",
    });

    const updated = await updateStageStatus(taskId, [
      { stage: "spec", status: "completed" },
      { stage: "plan", status: "completed" },
      { stage: "implementation", status: "in_progress" },
    ]);

    const implementation = updated.find(
      (stage) => stage.stage === "implementation"
    );
    expect(implementation?.status).toBe("in_progress");

    const filePath = await getStageStatusFilePath(taskId);
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    expect(parsed.stages).toHaveLength(STAGE_SEQUENCE.length);
  });

  it("merges notes without overwriting unspecified fields", async () => {
    const taskId = "00000000-0000-0000-0000-000000000002";
    await updateStageStatus(taskId, [
      { stage: "verification", status: "in_progress", notes: "第一次验证" },
    ]);

    const secondUpdate = await updateStageStatus(taskId, [
      { stage: "verification", status: "completed" },
    ]);

    const verification = secondUpdate.find(
      (stage) => stage.stage === "verification"
    );
    expect(verification?.status).toBe("completed");
    expect(verification?.notes).toBe("第一次验证");
  });
});
