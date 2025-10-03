// 任务状态枚举：定义任务在工作流程中的当前阶段
// Task status enumeration: Defines the current stage of tasks in the workflow
export enum TaskStatus {
  PENDING = "pending", // 已创建但尚未开始运行的任务
  // PENDING = "pending", // Created but not yet started tasks
  IN_PROGRESS = "in_progress", // 当前正在运行的任务
  // IN_PROGRESS = "in_progress", // Currently executing tasks
  COMPLETED = "completed", // 已成功完成并通过验证的任务
  // COMPLETED = "completed", // Successfully completed and verified tasks
  BLOCKED = "blocked", // 由于依赖关系而暂时无法运行的任务
  // BLOCKED = "blocked", // Tasks temporarily unable to execute due to dependencies
}

// 任务依赖关系：定义任务之间的前置条件关系
// Task dependency: Defines prerequisite relationships between tasks
export interface TaskDependency {
  taskId: string; // 前置任务的唯一标识符，当前任务运行前必须完成此依赖任务
  // taskId: string; // Unique identifier of prerequisite task, must be completed before current task execution
}

// 相关文档类型：定义文档与任务的关系类型
// Related file type: Defines the relationship type between files and tasks
export enum RelatedFileType {
  TO_MODIFY = "TO_MODIFY", // 需要在任务中修改的文档
  // TO_MODIFY = "TO_MODIFY", // Files that need to be modified in the task
  REFERENCE = "REFERENCE", // 任务的参考数据或相关文档
  // REFERENCE = "REFERENCE", // Reference materials or related documents for the task
  CREATE = "CREATE", // 需要在任务中创建的文档
  // CREATE = "CREATE", // Files that need to be created in the task
  DEPENDENCY = "DEPENDENCY", // 任务依赖的组件或库文档
  // DEPENDENCY = "DEPENDENCY", // Components or library files that the task depends on
  OTHER = "OTHER", // 其他类型的相关文档
  // OTHER = "OTHER", // Other types of related files
}

// 相关文档：定义任务相关的文档信息
// Related file: Defines file information related to tasks
export interface RelatedFile {
  path: string; // 文档路径，可以是相对于项目根目录的路径或绝对路径
  // path: string; // File path, can be relative to project root or absolute path
  type: RelatedFileType; // 文档与任务的关系类型
  // type: RelatedFileType; // Relationship type between file and task
  description?: string; // 文档的补充描述，说明其与任务的具体关系或用途
  // description?: string; // Supplementary description of the file, explaining its specific relationship or purpose with the task
  lineStart?: number; // 相关代码区块的起始行（选填）
  // lineStart?: number; // Starting line of related code block (optional)
  lineEnd?: number; // 相关代码区块的结束行（选填）
  // lineEnd?: number; // Ending line of related code block (optional)
}

// 任务接口：定义任务的完整数据结构
// Task interface: Defines the complete data structure of tasks
export interface Task {
  id: string; // 任务的唯一标识符
  // id: string; // Unique identifier of the task
  name: string; // 简洁明确的任务名称
  // name: string; // Concise and clear task name
  description: string; // 详细的任务描述，包含实施要点和验收标准
  // description: string; // Detailed task description, including implementation points and acceptance criteria
  notes?: string; // 补充说明、特殊处理要求或实施建议（选填）
  // notes?: string; // Supplementary notes, special handling requirements or implementation suggestions (optional)
  status: TaskStatus; // 任务当前的运行状态
  // status: TaskStatus; // Current execution status of the task
  dependencies: TaskDependency[]; // 任务的前置依赖关系列表
  // dependencies: TaskDependency[]; // List of prerequisite dependencies for the task
  createdAt: Date; // 任务创建的时间戳
  // createdAt: Date; // Timestamp when the task was created
  updatedAt: Date; // 任务最后更新的时间戳
  // updatedAt: Date; // Timestamp of last task update
  completedAt?: Date; // 任务完成的时间戳（仅适用于已完成的任务）
  // completedAt?: Date; // Timestamp when task was completed (only for completed tasks)
  summary?: string; // 任务完成摘要，简洁描述实施结果和重要决策（仅适用于已完成的任务）
  // summary?: string; // Task completion summary, briefly describing implementation results and important decisions (only for completed tasks)
  relatedFiles?: RelatedFile[]; // 与任务相关的文档列表（选填）
  // relatedFiles?: RelatedFile[]; // List of files related to the task (optional)

  // 添加字段：保存完整的技术分析结果
  // New field: Save complete technical analysis results
  analysisResult?: string; // 来自 analyze_task 和 reflect_task 阶段的完整分析结果
  // analysisResult?: string; // Complete analysis results from analyze_task and reflect_task stages
  
  // 代理系统相关字段
  // Agent system related fields
  agent?: string; // 最适合处理此任务的代理类型
  // agent?: string; // The most suitable agent type to handle this task

  // 添加字段：保存具体的实现指南
  // New field: Save specific implementation guide
  implementationGuide?: string; // 具体的实现方法、步骤和建议
  // implementationGuide?: string; // Specific implementation methods, steps and recommendations

  // 添加字段：保存验证标准和检验方法
  // New field: Save verification standards and inspection methods
  verificationCriteria?: string; // 明确的验证标准、测试要点和验收条件
  // verificationCriteria?: string; // Clear verification standards, test points and acceptance conditions
}

// 任务复杂度级别：定义任务的复杂程度分类
// Task complexity level: Defines task complexity classification
export enum TaskComplexityLevel {
  LOW = "低复杂度", // 简单且直接的任务，通常不需要特殊处理
  // LOW = "Low Complexity", // Simple and straightforward tasks, usually no special handling required
  MEDIUM = "中等复杂度", // 具有一定复杂性但仍可管理的任务
  // MEDIUM = "Medium Complexity", // Tasks with some complexity but still manageable
  HIGH = "高复杂度", // 复杂且耗时的任务，需要特别关注
  // HIGH = "High Complexity", // Complex and time-consuming tasks that require special attention
  VERY_HIGH = "极高复杂度", // 极其复杂的任务，建议拆分处理
  // VERY_HIGH = "Very High Complexity", // Extremely complex tasks, recommended to be split for processing
}

// 任务复杂度阈值：定义任务复杂度评估的参考标准
// Task complexity thresholds: Defines reference standards for task complexity assessment
export const TaskComplexityThresholds = {
  DESCRIPTION_LENGTH: {
    MEDIUM: 500, // 超过此字数判定为中等复杂度
    // MEDIUM: 500, // Above this word count is classified as medium complexity
    HIGH: 1000, // 超过此字数判定为高复杂度
    // HIGH: 1000, // Above this word count is classified as high complexity
    VERY_HIGH: 2000, // 超过此字数判定为极高复杂度
    // VERY_HIGH: 2000, // Above this word count is classified as very high complexity
  },
  DEPENDENCIES_COUNT: {
    MEDIUM: 2, // 超过此依赖数量判定为中等复杂度
    // MEDIUM: 2, // Above this dependency count is classified as medium complexity
    HIGH: 5, // 超过此依赖数量判定为高复杂度
    // HIGH: 5, // Above this dependency count is classified as high complexity
    VERY_HIGH: 10, // 超过此依赖数量判定为极高复杂度
    // VERY_HIGH: 10, // Above this dependency count is classified as very high complexity
  },
  NOTES_LENGTH: {
    MEDIUM: 200, // 超过此字数判定为中等复杂度
    // MEDIUM: 200, // Above this word count is classified as medium complexity
    HIGH: 500, // 超过此字数判定为高复杂度
    // HIGH: 500, // Above this word count is classified as high complexity
    VERY_HIGH: 1000, // 超过此字数判定为极高复杂度
    // VERY_HIGH: 1000, // Above this word count is classified as very high complexity
  },
};

// 任务复杂度评估结果：记录任务复杂度分析的详细结果
// Task complexity assessment result: Records detailed results of task complexity analysis
export interface TaskComplexityAssessment {
  level: TaskComplexityLevel; // 整体复杂度级别
  // level: TaskComplexityLevel; // Overall complexity level
  metrics: {
    // 各项评估指针的详细数据
    // Detailed data of various assessment metrics
    descriptionLength: number; // 描述长度
    // descriptionLength: number; // Description length
    dependenciesCount: number; // 依赖数量
    // dependenciesCount: number; // Dependencies count
    notesLength: number; // 注记长度
    // notesLength: number; // Notes length
    hasNotes: boolean; // 是否有注记
    // hasNotes: boolean; // Whether there are notes
  };
  recommendations: string[]; // 处理建议列表
  // recommendations: string[]; // List of processing recommendations
}
