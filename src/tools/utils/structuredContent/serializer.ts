import type {
  RelatedFile,
  Task,
  TaskComplexityAssessment,
  TaskDependency,
} from "../../../types/index.js";
import { TaskStatus } from "../../../types/index.js";
import { validateTask } from "./validators.js";

type SerializedDependency = {
  taskId: string;
};

type SerializedRelatedFile = {
  path: string;
  type: RelatedFile["type"];
  description?: string;
  lineStart?: number;
  lineEnd?: number;
};

const toIsoString = (value?: Date | string | null): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const serializeDependencies = (
  dependencies?: TaskDependency[]
): SerializedDependency[] | undefined => {
  if (!dependencies || dependencies.length === 0) {
    return undefined;
  }

  return dependencies.map((dependency) => ({
    taskId: dependency.taskId,
  }));
};

const serializeRelatedFiles = (
  files?: RelatedFile[]
): SerializedRelatedFile[] | undefined => {
  if (!files || files.length === 0) {
    return undefined;
  }

  return files.map((file) => {
    const result: SerializedRelatedFile = {
      path: file.path,
      type: file.type,
    };

    if (file.description) {
      result.description = file.description;
    }

    if (typeof file.lineStart === "number") {
      result.lineStart = file.lineStart;
    }

    if (typeof file.lineEnd === "number") {
      result.lineEnd = file.lineEnd;
    }

    return result;
  });
};

export function serializeTaskSummary(task: Task) {
  validateTask(task);

  const summary: Record<string, unknown> = {
    id: task.id,
    name: task.name,
    status: task.status,
  };

  if (task.agent) {
    summary.agent = task.agent;
  }

  return summary;
}

export function serializeTaskDetail(task: Task) {
  validateTask(task);

  const detail: Record<string, unknown> = {
    ...serializeTaskSummary(task),
  };

  if (task.description) {
    detail.description = task.description;
  }
  if (task.notes) {
    detail.notes = task.notes;
  }
  if (task.implementationGuide) {
    detail.implementationGuide = task.implementationGuide;
  }
  if (task.verificationCriteria) {
    detail.verificationCriteria = task.verificationCriteria;
  }
  if (task.summary) {
    detail.summary = task.summary;
  }

  const dependencies = serializeDependencies(task.dependencies);
  if (dependencies && dependencies.length > 0) {
    detail.dependencies = dependencies;
  }

  const relatedFiles = serializeRelatedFiles(task.relatedFiles);
  if (relatedFiles && relatedFiles.length > 0) {
    detail.relatedFiles = relatedFiles;
  }

  const createdAt = toIsoString(task.createdAt);
  if (createdAt) {
    detail.createdAt = createdAt;
  }

  const updatedAt = toIsoString(task.updatedAt);
  if (updatedAt) {
    detail.updatedAt = updatedAt;
  }

  const completedAt = toIsoString(task.completedAt);
  if (completedAt) {
    detail.completedAt = completedAt;
  }

  return detail;
}

export function serializeTaskSummaries(tasks: Task[]) {
  return tasks.map(serializeTaskSummary);
}

export function serializeTaskDetails(tasks: Task[]) {
  return tasks.map(serializeTaskDetail);
}

export function serializeComplexity(
  assessment?: TaskComplexityAssessment | null
) {
  if (!assessment) {
    return undefined;
  }

  return {
    level: assessment.level,
    metrics: {
      descriptionLength: assessment.metrics.descriptionLength,
      dependenciesCount: assessment.metrics.dependenciesCount,
      notesLength: assessment.metrics.notesLength,
      hasNotes: assessment.metrics.hasNotes,
    },
    recommendations: [...assessment.recommendations],
  };
}

export const TASK_STATUS_VALUES = new Set(Object.values(TaskStatus));
