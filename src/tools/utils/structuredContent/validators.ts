import type { Task } from "../../../types/index.js";
import { TaskStatus } from "../../../types/index.js";

const STATUS_SET = new Set(Object.values(TaskStatus));

export function validateTask(task: Task) {
  if (!task.id) {
    throw new Error("Task is missing required field: id");
  }

  if (!task.name) {
    throw new Error(`Task '${task.id}' is missing required field: name`);
  }

  if (!STATUS_SET.has(task.status)) {
    throw new Error(
      `Task '${task.id}' has invalid status '${task.status}'. Expected one of ${Array.from(
        STATUS_SET
      ).join(", ")}`
    );
  }
}
