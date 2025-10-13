import { access, readFile } from "fs/promises";
import path from "path";
import { writeJsonFileAtomic } from "../../utils/fileWriter.js";
import { getDataDir } from "../../utils/paths.js";

export const STAGE_SEQUENCE = [
  "spec",
  "plan",
  "implementation",
  "verification",
] as const;

export type StageId = (typeof STAGE_SEQUENCE)[number];

export type StageStatus = "pending" | "in_progress" | "completed";

export interface StageState {
  stage: StageId;
  status: StageStatus;
  updatedAt?: string;
  notes?: string;
}

interface StageStatusFile {
  taskId: string;
  updatedAt: string;
  stages: StageState[];
}

export interface StageUpdateInput {
  stage: StageId;
  status: StageStatus;
  notes?: string;
}

const STATUS_DIR_NAME = "status";

async function getStageDir(taskId: string) {
  const dataDir = await getDataDir();
  return path.join(dataDir, STATUS_DIR_NAME, taskId);
}

async function getStageFilePath(taskId: string) {
  const dir = await getStageDir(taskId);
  return path.join(dir, "stages.json");
}

function createDefaultStages(): StageState[] {
  return STAGE_SEQUENCE.map((stage) => ({
    stage,
    status: "pending",
  }));
}

function createDefaultStageFile(taskId: string): StageStatusFile {
  const now = new Date().toISOString();
  return {
    taskId,
    updatedAt: now,
    stages: createDefaultStages(),
  };
}

function mergeStageStates(
  existing: StageState[],
  updates: StageUpdateInput[]
): StageState[] {
const map = new Map<StageId, StageState>();
  for (const state of existing) {
    map.set(state.stage, { ...state });
  }

  const now = new Date().toISOString();
  for (const update of updates) {
    const prev = map.get(update.stage);
    map.set(update.stage, {
      stage: update.stage,
      status: update.status,
      updatedAt: now,
      notes: update.notes ?? prev?.notes,
    });
  }

  // Ensure all stages exist and keep order
  return STAGE_SEQUENCE.map((stage) => {
    return (
      map.get(stage) ?? {
        stage,
        status: "pending",
      }
    );
  });
}

async function ensureStageFile(taskId: string): Promise<StageStatusFile> {
  const filePath = await getStageFilePath(taskId);
  try {
    await access(filePath);
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as StageStatusFile;
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.taskId &&
      Array.isArray(parsed.stages)
    ) {
      const knownStages = new Set(STAGE_SEQUENCE);
      const stages = parsed.stages
        .filter(
          (item): item is StageState =>
            item &&
            typeof item.stage === "string" &&
            knownStages.has(item.stage as StageId) &&
            (item.status === "pending" ||
              item.status === "in_progress" ||
              item.status === "completed")
        )
        .map((item) => ({ ...item }));

      return {
        taskId: parsed.taskId,
        updatedAt: parsed.updatedAt ?? new Date().toISOString(),
        stages: mergeStageStates(createDefaultStages(), stages),
      };
    }
  } catch {
    // fallthrough to create default
  }

  const fallback = createDefaultStageFile(taskId);
  await writeJsonFileAtomic(await getStageFilePath(taskId), fallback);
  return fallback;
}

export async function updateStageStatus(
  taskId: string,
  updates: StageUpdateInput[]
): Promise<StageState[]> {
  if (updates.length === 0) {
    return loadStageStatus(taskId);
  }

  const stageFile = await ensureStageFile(taskId);
  const merged = mergeStageStates(stageFile.stages, updates);
  const next: StageStatusFile = {
    taskId,
    updatedAt: new Date().toISOString(),
    stages: merged,
  };

  await writeJsonFileAtomic(await getStageFilePath(taskId), next);
  return merged;
}

export async function loadStageStatus(taskId: string): Promise<StageState[]> {
  const stageFile = await ensureStageFile(taskId);
  return stageFile.stages;
}

export async function getStageStatusFilePath(taskId: string): Promise<string> {
  return await getStageFilePath(taskId);
}
