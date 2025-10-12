import type { Task } from "../../../types/index.js";
import { TaskStatus } from "../../../types/index.js";

export function countTasksByStatus(tasks: Task[]) {
  const counts: Record<string, number> = {};

  for (const status of Object.values(TaskStatus)) {
    counts[status] = 0;
  }

  for (const task of tasks) {
    counts[task.status] = (counts[task.status] ?? 0) + 1;
  }

  counts.total = tasks.length;
  return counts;
}
