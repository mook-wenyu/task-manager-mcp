import { splitTasksSchema, performSplitTasks } from "./splitTasksShared.js";

export { splitTasksSchema };

export async function splitTasks(input: Parameters<typeof performSplitTasks>[0]) {
  return performSplitTasks(input);
}
