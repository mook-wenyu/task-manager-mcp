import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import {
  FileSystemMemoryStore,
} from "../../../models/memoryStore.js";

const TMP_PREFIX = "memory-store-test-";

describe("FileSystemMemoryStore", () => {
  let tempDir: string;
  let store: FileSystemMemoryStore;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), TMP_PREFIX));
    store = new FileSystemMemoryStore({ baseDir: tempDir, shortTermLimit: 3 });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("stores entries and enforces short-term limit", async () => {
    for (let i = 0; i < 5; i++) {
      await store.append({
        toolName: "process_thought",
        summary: `thought ${i}`,
        tags: ["thought"],
        createdAt: new Date(Date.now() + i * 1000).toISOString(),
      });
    }

    const entries = await store.listRecent({ scope: "short-term", limit: 10 });
    expect(entries).toHaveLength(3);
    expect(entries[0].summary).toContain("thought 4");
    expect(entries[entries.length - 1].summary).toContain("thought 2");
  });

  it("promotes high importance entries to long-term scope", async () => {
    const entry = await store.append(
      {
        toolName: "plan_task",
        summary: "关键里程碑",
        tags: ["planning", "milestone"],
        importance: "high",
      },
      { promote: true }
    );

    const longTermEntries = await store.listRecent({ scope: "long-term", limit: 5 });
    expect(longTermEntries).toHaveLength(1);
    expect(longTermEntries[0].id).toBe(entry.id);
    expect(longTermEntries[0].tags).toContain("planning");
  });

  it("filters by taskId and tags when listing", async () => {
    await store.append({
      toolName: "execute_task",
      summary: "执行 A",
      taskId: "task-1",
      tags: ["execution"],
    });

    await store.append({
      toolName: "execute_task",
      summary: "执行 B",
      taskId: "task-2",
      tags: ["execution", "risk"],
    });

    const filtered = await store.listRecent({
      taskId: "task-2",
      tags: ["execution", "risk"],
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].taskId).toBe("task-2");
  });
});
