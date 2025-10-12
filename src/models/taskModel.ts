import {
  Task,
  TaskStatus,
  TaskDependency,
  TaskComplexityLevel,
  TaskComplexityThresholds,
  TaskComplexityAssessment,
  RelatedFile,
} from "../types/index.js";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { exec } from "child_process";
import { promisify } from "util";
import { getDataDir, getTasksFilePath, getMemoryDir } from "../utils/paths.js";

// Helper function to get current date/time in server's local timezone
function getLocalDate(): Date {
  return new Date();
}

// Helper function to get ISO string in local timezone format
function getLocalISOString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Get timezone offset in hours and minutes
  const offset = -now.getTimezoneOffset();
  const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
  const offsetSign = offset >= 0 ? '+' : '-';
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

// 确保获取项目文件夹路径
// Ensure getting project data folder path

// 数据文档路径（改为异步获取）
// Data file paths (changed to asynchronous acquisition)
// const DATA_DIR = getDataDir();
// const TASKS_FILE = getTasksFilePath();

// 将exec转换为Promise形式
// Convert exec to Promise form
const execPromise = promisify(exec);

// 确保数据目录存在
// Ensure data directory exists
async function ensureDataDir() {
  const DATA_DIR = await getDataDir();
  const TASKS_FILE = await getTasksFilePath();

  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  try {
    await fs.access(TASKS_FILE);
  } catch (error) {
    await fs.writeFile(TASKS_FILE, JSON.stringify({ tasks: [] }));
  }
}

// 读取所有任务
// Read all tasks
async function readTasks(): Promise<Task[]> {
  await ensureDataDir();
  const TASKS_FILE = await getTasksFilePath();
  const data = await fs.readFile(TASKS_FILE, "utf-8");
  const tasks = JSON.parse(data).tasks;

  // 将日期字符串转换回 Date 对象
  // Convert date strings back to Date objects
  return tasks.map((task: any) => ({
    ...task,
    createdAt: task.createdAt ? new Date(task.createdAt) : getLocalDate(),
    updatedAt: task.updatedAt ? new Date(task.updatedAt) : getLocalDate(),
    completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
  }));
}

// 写入所有任务
// Write all tasks
async function writeTasks(tasks: Task[], _commitMessage?: string): Promise<void> {
  await ensureDataDir();
  const TASKS_FILE = await getTasksFilePath();
  await fs.writeFile(TASKS_FILE, JSON.stringify({ tasks }, null, 2));
}

// 获取所有任务
// Get all tasks
export async function getAllTasks(): Promise<Task[]> {
  return await readTasks();
}

// 根据ID获取任务
// Get task by ID
export async function getTaskById(taskId: string): Promise<Task | null> {
  const tasks = await readTasks();
  return tasks.find((task) => task.id === taskId) || null;
}

// 创建新任务
// Create new task
export async function createTask(
  name: string,
  description: string,
  notes?: string,
  dependencies: string[] = [],
  relatedFiles?: RelatedFile[],
  agent?: string
): Promise<Task> {
  const tasks = await readTasks();

  const dependencyObjects: TaskDependency[] = dependencies.map((taskId) => ({
    taskId,
  }));

  const newTask: Task = {
    id: uuidv4(),
    name,
    description,
    notes,
    status: TaskStatus.PENDING,
    dependencies: dependencyObjects,
    createdAt: getLocalDate(),
    updatedAt: getLocalDate(),
    relatedFiles,
    agent,
  };

  tasks.push(newTask);
  await writeTasks(tasks, `Add new task: ${newTask.name}`);

  return newTask;
}

// 更新任务
// Update task
export async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<Task | null> {
  const tasks = await readTasks();
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return null;
  }

  // 检查任务是否已完成
  // Check if task is completed，已完成的任务不允许更新（除非是明确允许的字段）
  // Check if task is completed, completed tasks cannot be updated (unless explicitly allowed fields)
  if (tasks[taskIndex].status === TaskStatus.COMPLETED) {
    // 仅允许更新 summary 字段（任务摘要）和 relatedFiles 字段
    // Only allow updating summary field (task summary) and relatedFiles field
    const allowedFields = ["summary", "relatedFiles"];
    const attemptedFields = Object.keys(updates);

    const disallowedFields = attemptedFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (disallowedFields.length > 0) {
      return null;
    }
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: getLocalDate(),
  };

  await writeTasks(tasks, `Update task: ${tasks[taskIndex].name}`);

  return tasks[taskIndex];
}

// 更新任务
// Update task状态
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<Task | null> {
  const updates: Partial<Task> = { status };

  if (status === TaskStatus.COMPLETED) {
    updates.completedAt = getLocalDate();
  }

  return await updateTask(taskId, updates);
}

// 更新任务
// Update task摘要
export async function updateTaskSummary(
  taskId: string,
  summary: string
): Promise<Task | null> {
  return await updateTask(taskId, { summary });
}

// 更新任务
// Update task内容
export async function updateTaskContent(
  taskId: string,
  updates: {
    name?: string;
    description?: string;
    notes?: string;
    relatedFiles?: RelatedFile[];
    dependencies?: string[];
    implementationGuide?: string;
    verificationCriteria?: string;
    agent?: string;
  }
): Promise<{ success: boolean; message: string; task?: Task }> {
  // 获取任务并检查是否存在
  // Get task and check if it exists
  const task = await getTaskById(taskId);

  if (!task) {
    return { success: false, message: "找不到指定任务" };
  }

  // 检查任务是否已完成
  // Check if task is completed
  if (task.status === TaskStatus.COMPLETED) {
    return { success: false, message: "无法更新已完成的任务" };
  }

  // 构建更新对象，只包含实际需要更新的字段
  // Build update object, only including fields that actually need updating
  const updateObj: Partial<Task> = {};

  if (updates.name !== undefined) {
    updateObj.name = updates.name;
  }

  if (updates.description !== undefined) {
    updateObj.description = updates.description;
  }

  if (updates.notes !== undefined) {
    updateObj.notes = updates.notes;
  }

  if (updates.relatedFiles !== undefined) {
    updateObj.relatedFiles = updates.relatedFiles;
  }

  if (updates.dependencies !== undefined) {
    updateObj.dependencies = updates.dependencies.map((dep) => ({
      taskId: dep,
    }));
  }

  if (updates.implementationGuide !== undefined) {
    updateObj.implementationGuide = updates.implementationGuide;
  }

  if (updates.verificationCriteria !== undefined) {
    updateObj.verificationCriteria = updates.verificationCriteria;
  }

  if (updates.agent !== undefined) {
    updateObj.agent = updates.agent;
  }

  // 如果没有要更新的内容，提前返回
  // If there is no content to update, return early
  if (Object.keys(updateObj).length === 0) {
    return { success: true, message: "没有提供需要更新的内容", task };
  }

  // 运行更新
  // Execute update
  const updatedTask = await updateTask(taskId, updateObj);

  if (!updatedTask) {
    return { success: false, message: "更新任务时发生错误" };
  }

  return {
    success: true,
    message: "任务内容已成功更新",
    task: updatedTask,
  };
}

// 更新任务
// Update task相关文档
export async function updateTaskRelatedFiles(
  taskId: string,
  relatedFiles: RelatedFile[]
): Promise<{ success: boolean; message: string; task?: Task }> {
  // 获取任务并检查是否存在
  // Get task and check if it exists
  const task = await getTaskById(taskId);

  if (!task) {
    return { success: false, message: "找不到指定任务" };
  }

  // 检查任务是否已完成
  // Check if task is completed
  if (task.status === TaskStatus.COMPLETED) {
    return { success: false, message: "无法更新已完成的任务" };
  }

  // 运行更新
  // Execute update
  const updatedTask = await updateTask(taskId, { relatedFiles });

  if (!updatedTask) {
    return { success: false, message: "更新任务相关文档时发生错误" };
  }

  return {
    success: true,
    message: `已成功更新任务相关文档，共 ${relatedFiles.length} 个文档`,
    task: updatedTask,
  };
}

// 批量创建或更新任务
export async function batchCreateOrUpdateTasks(
  taskDataList: Array<{
    name: string;
    description: string;
    notes?: string;
    dependencies?: string[];
    relatedFiles?: RelatedFile[];
    implementationGuide?: string; // 添加：实现指南
    verificationCriteria?: string; // 添加：验证标准
    agent?: string; // 添加：代理分配
  }>,
  updateMode: "append" | "overwrite" | "selective" | "clearAllTasks", // 必填参数，指定任务更新策略
  globalAnalysisResult?: string // 添加：全局分析结果
): Promise<Task[]> {
  // 读取现有的所有任务
  const existingTasks = await readTasks();

  // 根据更新模式处理现有任务
  let tasksToKeep: Task[] = [];

  if (updateMode === "append") {
    // 追加模式：保留所有现有任务
    tasksToKeep = [...existingTasks];
  } else if (updateMode === "overwrite") {
    // 覆盖模式：仅保留已完成的任务，清除所有未完成任务
    tasksToKeep = existingTasks.filter(
      (task) => task.status === TaskStatus.COMPLETED
    );
  } else if (updateMode === "selective") {
    // 选择性更新模式：根据任务名称选择性更新，保留未在更新列表中的任务
    // 1. 提取待更新任务的名称清单
    const updateTaskNames = new Set(taskDataList.map((task) => task.name));

    // 2. 保留所有没有出现在更新列表中的任务
    tasksToKeep = existingTasks.filter(
      (task) => !updateTaskNames.has(task.name)
    );
  } else if (updateMode === "clearAllTasks") {
    // 清除所有任务
// Clear all tasks模式：清空任务列表
    tasksToKeep = [];
  }

  // 这个映射将用于存储名称到任务ID的映射，用于支持通过名称引用任务
  const taskNameToIdMap = new Map<string, string>();

  // 对于选择性更新模式，先将现有任务的名称和ID记录下来
  if (updateMode === "selective") {
    existingTasks.forEach((task) => {
      taskNameToIdMap.set(task.name, task.id);
    });
  }

  // 记录所有任务的名称和ID，无论是要保留的任务还是新建的任务
  // 这将用于稍后解析依赖关系
  tasksToKeep.forEach((task) => {
    taskNameToIdMap.set(task.name, task.id);
  });

  // 创建新任务
  // 创建新任务的列表
  // Create list of new tasks
  const newTasks: Task[] = [];

  for (const taskData of taskDataList) {
    // 检查是否为选择性更新模式且该任务名称已存在
  // Check if it is selective update mode and the task name already exists
    if (updateMode === "selective" && taskNameToIdMap.has(taskData.name)) {
      // 获取现有任务的ID
      // Get the ID of the existing task
      const existingTaskId = taskNameToIdMap.get(taskData.name)!;

      // 查找现有任务
      // Find existing task
      const existingTaskIndex = existingTasks.findIndex(
        (task) => task.id === existingTaskId
      );

      // 如果找到现有任务并且该任务未完成，则更新它
      // If existing task is found and not completed, update it
      if (
        existingTaskIndex !== -1 &&
        existingTasks[existingTaskIndex].status !== TaskStatus.COMPLETED
      ) {
        const taskToUpdate = existingTasks[existingTaskIndex];

        // 更新任务
        // 更新任务的基本信息，但保留原始ID、创建时间等
        // Update basic task information, but preserve original ID, creation time, etc.
        const updatedTask: Task = {
          ...taskToUpdate,
          name: taskData.name,
          description: taskData.description,
          notes: taskData.notes,
          // 后面会处理 dependencies
          // Dependencies will be processed later
          updatedAt: getLocalDate(),
          // 添加：保存实现指南（如果有）
          // New: Save implementation guide (if any)
          implementationGuide: taskData.implementationGuide,
          // 添加：保存验证标准（如果有）
          // New: Save verification criteria (if any)
          verificationCriteria: taskData.verificationCriteria,
          // 添加：保存全局分析结果（如果有）
          // New: Save global analysis result (if any)
          analysisResult: globalAnalysisResult,
          // 添加：保存代理分配（如果有）
          agent: taskData.agent,
        };

        // 处理相关文档（如果有）
        // Process related files (if any)
        if (taskData.relatedFiles) {
          updatedTask.relatedFiles = taskData.relatedFiles;
        }

        // 将更新后的任务添加到新任务列表
        // Add updated task to new task list
        newTasks.push(updatedTask);

        // 从tasksToKeep中移除此任务，因为它已经被更新并添加到newTasks中了
        // Remove this task from tasksToKeep because it has been updated and added to newTasks
        tasksToKeep = tasksToKeep.filter((task) => task.id !== existingTaskId);
      }
    } else {
      // 创建新任务
      // Create new task
// Create new task
      const newTaskId = uuidv4();

      // 将新任务的名称和ID添加到映射中
      // Add new task name and ID to mapping
      taskNameToIdMap.set(taskData.name, newTaskId);

      const newTask: Task = {
        id: newTaskId,
        name: taskData.name,
        description: taskData.description,
        notes: taskData.notes,
        status: TaskStatus.PENDING,
        dependencies: [], // 后面会填充
        createdAt: getLocalDate(),
        updatedAt: getLocalDate(),
        relatedFiles: taskData.relatedFiles,
        // 添加：保存实现指南（如果有）
        implementationGuide: taskData.implementationGuide,
        // 添加：保存验证标准（如果有）
        verificationCriteria: taskData.verificationCriteria,
        // 添加：保存全局分析结果（如果有）
        analysisResult: globalAnalysisResult,
        // 添加：保存代理分配（如果有）
        agent: taskData.agent,
      };

      newTasks.push(newTask);
    }
  }

  // 处理任务之间的依赖关系
  // Handle dependencies between tasks
  for (let i = 0; i < taskDataList.length; i++) {
    const taskData = taskDataList[i];
    const newTask = newTasks[i];

    // 如果存在依赖关系，处理它们
    // If dependencies exist, process them
    if (taskData.dependencies && taskData.dependencies.length > 0) {
      const resolvedDependencies: TaskDependency[] = [];

      for (const dependencyName of taskData.dependencies) {
        // 首先尝试将依赖项解释为任务ID
        // First try to interpret dependency as task ID
        let dependencyTaskId = dependencyName;

        // 如果依赖项看起来不像UUID，则尝试将其解释为任务名称
        // If dependency does not look like UUID, try to interpret it as task name
        if (
          !dependencyName.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          )
        ) {
          // 如果映射中存在此名称，则使用对应的ID
          // If this name exists in mapping, use corresponding ID
          if (taskNameToIdMap.has(dependencyName)) {
            dependencyTaskId = taskNameToIdMap.get(dependencyName)!;
          } else {
            continue; // 跳过此依赖 - Skip this dependency
          }
        } else {
          // 是UUID格式，但需要确认此ID是否对应实际存在的任务
          // Is UUID format, but need to confirm if this ID corresponds to an actually existing task
          const idExists = [...tasksToKeep, ...newTasks].some(
            (task) => task.id === dependencyTaskId
          );
          if (!idExists) {
            continue; // 跳过此依赖 - Skip this dependency
          }
        }

        resolvedDependencies.push({ taskId: dependencyTaskId });
      }

      newTask.dependencies = resolvedDependencies;
    }
  }

  // 合并保留的任务和新任务
  // Merge kept tasks and new tasks
  const allTasks = [...tasksToKeep, ...newTasks];

  // 写入更新后的任务列表
  await writeTasks(allTasks, `Bulk task operation: ${updateMode} mode, ${newTasks.length} tasks`);

  return newTasks;
}

// 检查任务是否可以运行（所有依赖都已完成）
// Check if task can be executed (all dependencies completed)
export async function canExecuteTask(
  taskId: string
): Promise<{ canExecute: boolean; blockedBy?: string[] }> {
  const task = await getTaskById(taskId);

  if (!task) {
    return { canExecute: false };
  }

  if (task.status === TaskStatus.COMPLETED) {
    return { canExecute: false }; // 已完成的任务不需要再运行 - Completed tasks do not need to be executed again
  }

  if (task.dependencies.length === 0) {
    return { canExecute: true }; // 没有依赖的任务可以直接运行 - Tasks without dependencies can be executed directly
  }

  const allTasks = await readTasks();
  const blockedBy: string[] = [];

  for (const dependency of task.dependencies) {
    const dependencyTask = allTasks.find((t) => t.id === dependency.taskId);

    if (!dependencyTask || dependencyTask.status !== TaskStatus.COMPLETED) {
      blockedBy.push(dependency.taskId);
    }
  }

  return {
    canExecute: blockedBy.length === 0,
    blockedBy: blockedBy.length > 0 ? blockedBy : undefined,
  };
}

// 删除任务
// Delete task
export async function deleteTask(
  taskId: string
): Promise<{ success: boolean; message: string }> {
  const tasks = await readTasks();
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return { success: false, message: "找不到指定任务" };
  }

  // 检查任务状态，已完成的任务不允许删除
  // Check task status, completed tasks cannot be deleted
  if (tasks[taskIndex].status === TaskStatus.COMPLETED) {
    return { success: false, message: "无法删除已完成的任务" };
  }

  // 检查是否有其他任务依赖此任务
  // Check if other tasks depend on this task
  const allTasks = tasks.filter((_, index) => index !== taskIndex);
  const dependentTasks = allTasks.filter((task) =>
    task.dependencies.some((dep) => dep.taskId === taskId)
  );

  if (dependentTasks.length > 0) {
    const dependentTaskNames = dependentTasks
      .map((task) => `"${task.name}" (ID: ${task.id})`)
      .join(", ");
    return {
      success: false,
      message: `无法删除此任务，因为以下任务依赖于它: ${dependentTaskNames}`,
    };
  }

  // 运行删除操作
  // Execute delete operation
  const deletedTask = tasks[taskIndex];
  tasks.splice(taskIndex, 1);
  await writeTasks(tasks, `Delete task: ${deletedTask.name}`);

  return { success: true, message: "任务删除成功" };
}

// 评估任务复杂度
// Assess task complexity
export async function assessTaskComplexity(
  taskId: string
): Promise<TaskComplexityAssessment | null> {
  const task = await getTaskById(taskId);

  if (!task) {
    return null;
  }

  // 评估各项指针
  // Assess various indicators
  const descriptionLength = task.description.length;
  const dependenciesCount = task.dependencies.length;
  const notesLength = task.notes ? task.notes.length : 0;
  const hasNotes = !!task.notes;

  // 基于各项指针评估复杂度级别
  // Assess complexity level based on various indicators
  let level = TaskComplexityLevel.LOW;

  // 描述长度评估
  // Description length assessment
  if (
    descriptionLength >= TaskComplexityThresholds.DESCRIPTION_LENGTH.VERY_HIGH
  ) {
    level = TaskComplexityLevel.VERY_HIGH;
  } else if (
    descriptionLength >= TaskComplexityThresholds.DESCRIPTION_LENGTH.HIGH
  ) {
    level = TaskComplexityLevel.HIGH;
  } else if (
    descriptionLength >= TaskComplexityThresholds.DESCRIPTION_LENGTH.MEDIUM
  ) {
    level = TaskComplexityLevel.MEDIUM;
  }

  // 依赖数量评估（取最高级别）
  // Dependencies count assessment (take highest level)
  if (
    dependenciesCount >= TaskComplexityThresholds.DEPENDENCIES_COUNT.VERY_HIGH
  ) {
    level = TaskComplexityLevel.VERY_HIGH;
  } else if (
    dependenciesCount >= TaskComplexityThresholds.DEPENDENCIES_COUNT.HIGH &&
    level !== TaskComplexityLevel.VERY_HIGH
  ) {
    level = TaskComplexityLevel.HIGH;
  } else if (
    dependenciesCount >= TaskComplexityThresholds.DEPENDENCIES_COUNT.MEDIUM &&
    level !== TaskComplexityLevel.HIGH &&
    level !== TaskComplexityLevel.VERY_HIGH
  ) {
    level = TaskComplexityLevel.MEDIUM;
  }

  // 注记长度评估（取最高级别）
  // Notes length assessment (take highest level)
  if (notesLength >= TaskComplexityThresholds.NOTES_LENGTH.VERY_HIGH) {
    level = TaskComplexityLevel.VERY_HIGH;
  } else if (
    notesLength >= TaskComplexityThresholds.NOTES_LENGTH.HIGH &&
    level !== TaskComplexityLevel.VERY_HIGH
  ) {
    level = TaskComplexityLevel.HIGH;
  } else if (
    notesLength >= TaskComplexityThresholds.NOTES_LENGTH.MEDIUM &&
    level !== TaskComplexityLevel.HIGH &&
    level !== TaskComplexityLevel.VERY_HIGH
  ) {
    level = TaskComplexityLevel.MEDIUM;
  }

  // 根据复杂度级别生成处理建议
  // Generate processing suggestions based on complexity level
  const recommendations: string[] = [];

  // 低复杂度任务建议
  // Low complexity task suggestions
  if (level === TaskComplexityLevel.LOW) {
    recommendations.push("此任务复杂度较低，可直接运行");
    recommendations.push("建议设置清晰的完成标准，确保验收有明确依据");
  }
  // 中等复杂度任务建议
  // Medium complexity task suggestions
  else if (level === TaskComplexityLevel.MEDIUM) {
    recommendations.push("此任务具有一定复杂性，建议详细规划运行步骤");
    recommendations.push("可分阶段运行并定期检查进度，确保理解准确且实施完整");
    if (dependenciesCount > 0) {
      recommendations.push("注意检查所有依赖任务的完成状态和输出质量");
    }
  }
  // 高复杂度任务建议
  // High complexity task suggestions
  else if (level === TaskComplexityLevel.HIGH) {
    recommendations.push("此任务复杂度较高，建议先进行充分的分析和规划");
    recommendations.push("考虑将任务拆分为较小的、可独立运行的子任务");
    recommendations.push("创建清晰的里程碑和检查点，便于跟踪进度和品质");
    if (
      dependenciesCount > TaskComplexityThresholds.DEPENDENCIES_COUNT.MEDIUM
    ) {
      recommendations.push(
        "依赖任务较多，建议制作依赖关系图，确保运行顺序正确"
      );
    }
  }
  // 极高复杂度任务建议
  // Very high complexity task suggestions
  else if (level === TaskComplexityLevel.VERY_HIGH) {
    recommendations.push("⚠️ 此任务复杂度极高，强烈建议拆分为多个独立任务");
    recommendations.push(
      "在运行前进行详尽的分析和规划，明确定义各子任务的范围和接口"
    );
    recommendations.push(
      "对任务进行风险评估，识别可能的阻碍因素并制定应对策略"
    );
    recommendations.push("创建具体的测试和验证标准，确保每个子任务的输出质量");
    if (
      descriptionLength >= TaskComplexityThresholds.DESCRIPTION_LENGTH.VERY_HIGH
    ) {
      recommendations.push(
        "任务描述非常长，建议整理关键点并创建结构化的运行清单"
      );
    }
    if (dependenciesCount >= TaskComplexityThresholds.DEPENDENCIES_COUNT.HIGH) {
      recommendations.push(
        "依赖任务数量过多，建议重新评估任务边界，确保任务切分合理"
      );
    }
  }

  return {
    level,
    metrics: {
      descriptionLength,
      dependenciesCount,
      notesLength,
      hasNotes,
    },
    recommendations,
  };
}

// 清除所有任务
// Clear all tasks
export async function clearAllTasks(): Promise<{
  success: boolean;
  message: string;
  backupFile?: string;
}> {
  try {
    // 确保数据目录存在
    // Ensure data directory exists
    await ensureDataDir();

    // 读取现有任务
    // Read existing tasks
    const allTasks = await readTasks();

    // 如果没有任务，直接返回
    // If no tasks, return directly
    if (allTasks.length === 0) {
      return { success: true, message: "没有任务需要清除" };
    }

    // 筛选出已完成的任务
    // Filter out completed tasks
    const completedTasks = allTasks.filter(
      (task) => task.status === TaskStatus.COMPLETED
    );

    // 创建备份文档名
    // Create backup file name
    const timestamp = getLocalISOString()
      .replace(/:/g, "-")
      .replace(/\..+/, "")
      .replace(/[+\-]\d{2}-\d{2}$/, ""); // Remove timezone offset for filename
    const backupFileName = `tasks_memory_${timestamp}.json`;

    // 确保 memory 目录存在
    // Ensure memory directory exists
    const MEMORY_DIR = await getMemoryDir();
    try {
      await fs.access(MEMORY_DIR);
    } catch (error) {
      await fs.mkdir(MEMORY_DIR, { recursive: true });
    }

    // 创建 memory 目录下的备份路径
    // Create backup path under memory directory
    const memoryFilePath = path.join(MEMORY_DIR, backupFileName);

    // 同时写入到 memory 目录 (只包含已完成的任务)
    // Also write to memory directory (only containing completed tasks)
    await fs.writeFile(
      memoryFilePath,
      JSON.stringify({ tasks: completedTasks }, null, 2)
    );

    // 清空任务文档
    // Clear task file
    await writeTasks([], `Clear all tasks (${allTasks.length} tasks removed)`);

    return {
      success: true,
      message: `已成功清除所有任务，共 ${allTasks.length} 个任务被删除，已备份 ${completedTasks.length} 个已完成的任务至 memory 目录`,
      backupFile: backupFileName,
    };
  } catch (error) {
    return {
      success: false,
      message: `清除任务时发生错误: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// 使用系统指令搜索任务记忆
// Use system command to search task memory
export async function searchTasksWithCommand(
  query: string,
  isId: boolean = false,
  page: number = 1,
  pageSize: number = 5
): Promise<{
  tasks: Task[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasMore: boolean;
  };
}> {
  // 读取当前任务文件中的任务
  // Read tasks from current task file
  const currentTasks = await readTasks();
  let memoryTasks: Task[] = [];

  // 搜索记忆文件夹中的任务
  // Search tasks in memory folder
  const MEMORY_DIR = await getMemoryDir();

  try {
    // 确保记忆文件夹存在
    // Ensure memory folder exists
    await fs.access(MEMORY_DIR);

    // 生成搜索命令
    // Generate search command
    const cmd = generateSearchCommand(query, isId, MEMORY_DIR);

    // 如果有搜索命令，运行它
    // If there is a search command, execute it
    if (cmd) {
      try {
        const { stdout } = await execPromise(cmd, {
          maxBuffer: 1024 * 1024 * 10,
        });

        if (stdout) {
          // 解析搜索结果，提取符合的文件路径
          // Parse search results, extract matching file paths
          const matchedFiles = new Set<string>();

          stdout.split("\n").forEach((line) => {
            if (line.trim()) {
              // 格式通常是: 文档路径:匹配内容
              // Format is usually: file path:matching content
              const filePath = line.split(":")[0];
              if (filePath) {
                matchedFiles.add(filePath);
              }
            }
          });

          // 限制读取文件数量
          // Limit number of files to read
          const MAX_FILES_TO_READ = 10;
          const sortedFiles = Array.from(matchedFiles)
            .sort()
            .reverse()
            .slice(0, MAX_FILES_TO_READ);

          // 只处理符合条件的文件
          // Only process files that meet criteria
          for (const filePath of sortedFiles) {
            try {
              const data = await fs.readFile(filePath, "utf-8");
              const tasks = JSON.parse(data).tasks || [];

              // 格式化日期字段
              // Format date fields
              const formattedTasks = tasks.map((task: any) => ({
                ...task,
                createdAt: task.createdAt
                  ? new Date(task.createdAt)
                  : getLocalDate(),
                updatedAt: task.updatedAt
                  ? new Date(task.updatedAt)
                  : getLocalDate(),
                completedAt: task.completedAt
                  ? new Date(task.completedAt)
                  : undefined,
              }));

              // 进一步过滤任务确保符合条件
              // Further filter tasks to ensure criteria are met
              const filteredTasks = isId
                ? formattedTasks.filter((task: Task) => task.id === query)
                : formattedTasks.filter((task: Task) => {
                    const keywords = query
                      .split(/\s+/)
                      .filter((k) => k.length > 0);
                    if (keywords.length === 0) return true;

                    return keywords.every((keyword) => {
                      const lowerKeyword = keyword.toLowerCase();
                      return (
                        task.name.toLowerCase().includes(lowerKeyword) ||
                        task.description.toLowerCase().includes(lowerKeyword) ||
                        (task.notes &&
                          task.notes.toLowerCase().includes(lowerKeyword)) ||
                        (task.implementationGuide &&
                          task.implementationGuide
                            .toLowerCase()
                            .includes(lowerKeyword)) ||
                        (task.summary &&
                          task.summary.toLowerCase().includes(lowerKeyword))
                      );
                    });
                  });

              memoryTasks.push(...filteredTasks);
            } catch (error: unknown) {}
          }
        }
      } catch (error: unknown) {}
    }
  } catch (error: unknown) {}

  // 从当前任务中过滤符合条件的任务
  // Filter qualifying tasks from current tasks
  const filteredCurrentTasks = filterCurrentTasks(currentTasks, query, isId);

  // 合并结果并去重
  // Merge results and deduplicate
  const taskMap = new Map<string, Task>();

  // 当前任务优先
  // Current tasks have priority
  filteredCurrentTasks.forEach((task) => {
    taskMap.set(task.id, task);
  });

  // 加入记忆任务，避免重复
  // Add memory tasks, avoiding duplicates
  memoryTasks.forEach((task) => {
    if (!taskMap.has(task.id)) {
      taskMap.set(task.id, task);
    }
  });

  // 合并后的结果
  // Merged results
  const allTasks = Array.from(taskMap.values());

  // 排序 - 按照更新或完成时间降序排列
  // Sort - by update or completion time in descending order
  allTasks.sort((a, b) => {
    // 优先按完成时间排序
    // Sort by completion time first
    if (a.completedAt && b.completedAt) {
      return b.completedAt.getTime() - a.completedAt.getTime();
    } else if (a.completedAt) {
      return -1; // a完成了但b未完成，a排前面 - a is completed but b is not, a comes first
    } else if (b.completedAt) {
      return 1; // b完成了但a未完成，b排前面 - b is completed but a is not, b comes first
    }

    // 否则按更新时间排序
    // Otherwise sort by update time
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  // 分页处理
  // Pagination processing
  const totalResults = allTasks.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const safePage = Math.max(1, Math.min(page, totalPages || 1)); // 确保页码有效 - Ensure page number is valid
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  const paginatedTasks = allTasks.slice(startIndex, endIndex);

  return {
    tasks: paginatedTasks,
    pagination: {
      currentPage: safePage,
      totalPages: totalPages || 1,
      totalResults,
      hasMore: safePage < totalPages,
    },
  };
}

// 根据平台生成适当的搜索命令
// Generate appropriate search command based on platform
function generateSearchCommand(
  query: string,
  isId: boolean,
  memoryDir: string
): string {
  // 安全地转义用户输入
  // Safely escape user input
  const safeQuery = escapeShellArg(query);
  const keywords = safeQuery.split(/\s+/).filter((k) => k.length > 0);

  // 检测操作系统类型
  // Detect operating system type
  const isWindows = process.platform === "win32";

  if (isWindows) {
    // Windows环境，使用findstr命令
    // Windows environment, use findstr command
    if (isId) {
      // ID搜索
      // ID search
      return `findstr /s /i /c:"${safeQuery}" "${memoryDir}\\*.json"`;
    } else if (keywords.length === 1) {
      // 单一关键字
      // Single keyword
      return `findstr /s /i /c:"${safeQuery}" "${memoryDir}\\*.json"`;
    } else {
      // 多关键字搜索 - Windows中使用PowerShell
      // Multi-keyword search - use PowerShell in Windows
      const keywordPatterns = keywords.map((k) => `'${k}'`).join(" -and ");
      return `powershell -Command "Get-ChildItem -Path '${memoryDir}' -Filter *.json -Recurse | Select-String -Pattern ${keywordPatterns} | ForEach-Object { $_.Path }"`;
    }
  } else {
    // Unix/Linux/MacOS环境，使用grep命令
    // Unix/Linux/MacOS environment, use grep command
    if (isId) {
      return `grep -r --include="*.json" "${safeQuery}" "${memoryDir}"`;
    } else if (keywords.length === 1) {
      return `grep -r --include="*.json" "${safeQuery}" "${memoryDir}"`;
    } else {
      // 多关键字用管道连接多个grep命令
      // Multi-keyword using pipe to connect multiple grep commands
      const firstKeyword = escapeShellArg(keywords[0]);
      const otherKeywords = keywords.slice(1).map((k) => escapeShellArg(k));

      let cmd = `grep -r --include="*.json" "${firstKeyword}" "${memoryDir}"`;
      for (const keyword of otherKeywords) {
        cmd += ` | grep "${keyword}"`;
      }
      return cmd;
    }
  }
}

/**
 * 安全地转义shell参数，防止命令注入
 */
/**
 * Safely escape shell arguments to prevent command injection
 */
function escapeShellArg(arg: string): string {
  if (!arg) return "";

  // 移除所有控制字符和特殊字符
  // Remove all control characters and special characters
  return arg
    .replace(/[\x00-\x1F\x7F]/g, "") // 控制字符
    .replace(/[&;`$"'<>|]/g, ""); // Shell 特殊字符 - Shell special characters
}

// 过滤当前任务列表
// Filter current task list
function filterCurrentTasks(
  tasks: Task[],
  query: string,
  isId: boolean
): Task[] {
  if (isId) {
    return tasks.filter((task) => task.id === query);
  } else {
    const keywords = query.split(/\s+/).filter((k) => k.length > 0);
    if (keywords.length === 0) return tasks;

    return tasks.filter((task) => {
      return keywords.every((keyword) => {
        const lowerKeyword = keyword.toLowerCase();
        return (
          task.name.toLowerCase().includes(lowerKeyword) ||
          task.description.toLowerCase().includes(lowerKeyword) ||
          (task.notes && task.notes.toLowerCase().includes(lowerKeyword)) ||
          (task.implementationGuide &&
            task.implementationGuide.toLowerCase().includes(lowerKeyword)) ||
          (task.summary && task.summary.toLowerCase().includes(lowerKeyword))
        );
      });
    });
  }
}
