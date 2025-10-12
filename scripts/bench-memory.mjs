import { performance } from "node:perf_hooks";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const TOTAL_RECORDS = 120;
const FILTER_TASK_ID = "task-20";
const FILTER_TAGS = ["execution"];

function formatMs(ms) {
  return Math.round(ms * 100) / 100;
}

async function ensureTempDir() {
  return fs.mkdtemp(path.join(tmpdir(), "memory-bench-"));
}

async function loadMemoryStore() {
  try {
    const module = await import(new URL("../dist/models/memoryStore.js", import.meta.url));
    return module;
  } catch (error) {
    throw new Error(
      "无法加载 dist/models/memoryStore.js。请先运行 `npm run build` 再执行 `npm run test:memory`。原始错误: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
}

async function runBenchmark() {
  const { FileSystemMemoryStore } = await loadMemoryStore();
  const baseDir = await ensureTempDir();
  const store = new FileSystemMemoryStore({ baseDir, shortTermLimit: 50 });

  const appendStart = performance.now();
  let expectedFilterMatches = 0;
  for (let i = 0; i < TOTAL_RECORDS; i++) {
    const taskId = `task-${i % 40}`;
    const tags = ["log", i % 2 === 0 ? "execution" : "analysis"];
    if (i % 5 === 0) {
      tags.push("milestone");
    }

    if (taskId === FILTER_TASK_ID && tags.includes(FILTER_TAGS[0])) {
      expectedFilterMatches += 1;
    }

    await store.append(
      {
        toolName: i % 3 === 0 ? "execute_task" : "process_thought",
        summary: `记录 ${i}：示例摘要，包含关键信息用于回放。`,
        taskId,
        tags,
      },
      {
        promote: i % 5 === 0,
      }
    );
  }
  const appendDuration = performance.now() - appendStart;

  const shortTerm = await store.listRecent({ scope: "short-term", limit: TOTAL_RECORDS });
  const longTerm = await store.listRecent({ scope: "long-term", limit: TOTAL_RECORDS });

  const compression = (TOTAL_RECORDS - shortTerm.length) / TOTAL_RECORDS;

  const replayStart = performance.now();
  const filtered = await store.listRecent({
    scope: "short-term",
    limit: 20,
    taskId: FILTER_TASK_ID,
    tags: FILTER_TAGS,
  });
  const replayDuration = performance.now() - replayStart;

  const hitRate = expectedFilterMatches === 0 ? 0 : Math.round((filtered.length / expectedFilterMatches) * 100) / 100;

  return {
    baseDir,
    totals: {
      recordsGenerated: TOTAL_RECORDS,
      shortTermRetained: shortTerm.length,
      longTermStored: longTerm.length,
    },
    metrics: {
      appendDurationMs: formatMs(appendDuration),
      replayDurationMs: formatMs(replayDuration),
      compressionRate: Math.round(compression * 100) / 100,
      hitRate: Math.round(hitRate * 100) / 100,
    },
  };
}

const result = await runBenchmark();
console.log("Memory benchmark result:\n", JSON.stringify(result, null, 2));
