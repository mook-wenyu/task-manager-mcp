import { z } from "zod";
import {
  RelatedFileType,
  TaskComplexityLevel,
  TaskStatus,
} from "../../types/index.js";

const MarkdownPayloadSchema = z.object({
  markdown: z.string().min(1, "markdown 内容不能为空"),
  title: z.string().optional(),
  summary: z.string().optional(),
});

const RelatedFileSchema = z.object({
  path: z.string(),
  type: z.nativeEnum(RelatedFileType),
  description: z.string().optional(),
  lineStart: z.number().int().nonnegative().optional(),
  lineEnd: z.number().int().nonnegative().optional(),
});

const TaskDependencySchema = z.object({
  taskId: z.string(),
});

const TaskSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.nativeEnum(TaskStatus),
  agent: z.string().nullable().optional(),
});

const TaskDetailSchema = TaskSummarySchema.extend({
  description: z.string().optional(),
  notes: z.string().optional(),
  implementationGuide: z.string().optional(),
  verificationCriteria: z.string().optional(),
  summary: z.string().optional(),
  dependencies: z.array(TaskDependencySchema).optional(),
  relatedFiles: z.array(RelatedFileSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  completedAt: z.string().optional(),
});
const TaskCountsSchema = z.record(
  z.string(),
  z.number().int().nonnegative()
);

const ComplexityAssessmentSchema = z.object({
  level: z.nativeEnum(TaskComplexityLevel),
  metrics: z.object({
    descriptionLength: z.number().int().nonnegative(),
    dependenciesCount: z.number().int().nonnegative(),
    notesLength: z.number().int().nonnegative(),
    hasNotes: z.boolean(),
  }),
  recommendations: z.array(z.string()),
});

const PaginationSchema = z.object({
  currentPage: z.number().int().min(1),
  totalPages: z.number().int().min(1),
  totalResults: z.number().int().nonnegative(),
  pageSize: z.number().int().min(1),
  hasMore: z.boolean(),
});

const SplitTasksUpdateModeSchema = z.enum([
  "append",
  "overwrite",
  "selective",
  "clearAllTasks",
]);
export const PlanTaskStructuredSchema = z.object({
  kind: z.literal("taskManager.plan"),
  payload: MarkdownPayloadSchema.extend({
    prompt: z.string(),
    existingTaskStats: z
      .object({
        total: z.number().int().nonnegative(),
        completed: z.number().int().nonnegative(),
        pending: z.number().int().nonnegative(),
      })
      .optional(),
  }),
});

export const AnalyzeTaskStructuredSchema = z.object({
  kind: z.literal("taskManager.analyze"),
  payload: MarkdownPayloadSchema.extend({
    summary: z.string(),
    initialConcept: z.string(),
    previousAnalysis: z.string().optional(),
  }),
});

export const ReflectTaskStructuredSchema = z.object({
  kind: z.literal("taskManager.reflect"),
  payload: MarkdownPayloadSchema.extend({
    summary: z.string(),
    analysis: z.string(),
  }),
});

export const SplitTasksStructuredSchema = z.object({
  kind: z.literal("taskManager.split"),
  payload: MarkdownPayloadSchema.extend({
    updateMode: SplitTasksUpdateModeSchema,
    success: z.boolean(),
    message: z.string(),
    createdTasks: z.array(TaskDetailSchema).optional(),
    allTasks: z.array(TaskDetailSchema).optional(),
    backupFilePath: z.string().optional(),
  }),
});

export const ListTasksStructuredSchema = z.object({
  kind: z.literal("taskManager.list"),
  payload: MarkdownPayloadSchema.extend({
    requestedStatus: z.union([
      z.literal("all"),
      z.nativeEnum(TaskStatus),
    ]),
    counts: TaskCountsSchema,
    tasks: z.array(TaskDetailSchema).optional(),
  }),
});
export const ExecuteTaskStructuredSchema = z.object({
  kind: z.literal("taskManager.execute"),
  payload: MarkdownPayloadSchema.extend({
    taskId: z.string(),
    taskName: z.string().optional(),
    statusBefore: z.nativeEnum(TaskStatus).optional(),
    statusAfter: z.nativeEnum(TaskStatus).optional(),
    blockedBy: z.array(z.string()).optional(),
    complexity: ComplexityAssessmentSchema.optional(),
    dependencyTasks: z.array(TaskSummarySchema).optional(),
    relatedFilesSummary: z.string().optional(),
  }),
});

export const VerifyTaskStructuredSchema = z.object({
  kind: z.literal("taskManager.verify"),
  payload: MarkdownPayloadSchema.extend({
    taskId: z.string(),
    taskName: z.string().optional(),
    score: z.number().min(0).max(100),
    statusAfter: z.nativeEnum(TaskStatus).optional(),
    statusChanged: z.boolean(),
  }),
});

export const DeleteTaskStructuredSchema = z.object({
  kind: z.literal("taskManager.delete"),
  payload: MarkdownPayloadSchema.extend({
    taskId: z.string(),
    success: z.boolean(),
    message: z.string(),
  }),
});

export const ClearAllTasksStructuredSchema = z.object({
  kind: z.literal("taskManager.clear"),
  payload: MarkdownPayloadSchema.extend({
    success: z.boolean(),
    message: z.string(),
    backupFilePath: z.string().optional(),
    totalRemoved: z.number().int().nonnegative().optional(),
    completedBackedUp: z.number().int().nonnegative().optional(),
  }),
});

export const UpdateTaskStructuredSchema = z.object({
  kind: z.literal("taskManager.update"),
  payload: MarkdownPayloadSchema.extend({
    taskId: z.string(),
    success: z.boolean(),
    message: z.string(),
    updatedTask: TaskDetailSchema.optional(),
    updatedFields: z.array(z.string()).optional(),
  }),
});
export const QueryTaskStructuredSchema = z.object({
  kind: z.literal("taskManager.query"),
  payload: MarkdownPayloadSchema.extend({
    query: z.string(),
    isId: z.boolean(),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    results: z.array(TaskDetailSchema),
    pagination: PaginationSchema,
  }),
});

export const GetTaskDetailStructuredSchema = z.object({
  kind: z.literal("taskManager.detail"),
  payload: MarkdownPayloadSchema.extend({
    taskId: z.string(),
    task: TaskDetailSchema.optional(),
  }),
});

export const ProcessThoughtStructuredSchema = z.object({
  kind: z.literal("taskManager.thought"),
  payload: MarkdownPayloadSchema.extend({
    thoughtNumber: z.number().int().min(1),
    totalThoughts: z.number().int().min(1),
    nextThoughtNeeded: z.boolean(),
    stage: z.string(),
    tags: z.array(z.string()).optional(),
    axiomsUsed: z.array(z.string()).optional(),
    assumptionsChallenged: z.array(z.string()).optional(),
  }),
});

export const InitProjectRulesStructuredSchema = z.object({
  kind: z.literal("taskManager.projectRules"),
  payload: MarkdownPayloadSchema.extend({
    createdFiles: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional(),
  }),
});

export const ResearchModeStructuredSchema = z.object({
  kind: z.literal("taskManager.research"),
  payload: MarkdownPayloadSchema.extend({
    topic: z.string(),
    previousState: z.string().optional(),
    currentState: z.string(),
    nextSteps: z.string(),
    memoryDir: z.string().optional(),
  }),
});
export const TOOL_STRUCTURED_SCHEMAS = {
  plan_task: PlanTaskStructuredSchema,
  analyze_task: AnalyzeTaskStructuredSchema,
  reflect_task: ReflectTaskStructuredSchema,
  split_tasks: SplitTasksStructuredSchema,
  list_tasks: ListTasksStructuredSchema,
  execute_task: ExecuteTaskStructuredSchema,
  verify_task: VerifyTaskStructuredSchema,
  delete_task: DeleteTaskStructuredSchema,
  clear_all_tasks: ClearAllTasksStructuredSchema,
  update_task: UpdateTaskStructuredSchema,
  query_task: QueryTaskStructuredSchema,
  get_task_detail: GetTaskDetailStructuredSchema,
  process_thought: ProcessThoughtStructuredSchema,
  init_project_rules: InitProjectRulesStructuredSchema,
  research_mode: ResearchModeStructuredSchema,
} as const;

type SchemaMap = typeof TOOL_STRUCTURED_SCHEMAS;
export type ToolStructuredContentName = keyof SchemaMap;
export type ToolStructuredContent<TName extends ToolStructuredContentName> = z.infer<
  SchemaMap[TName]
>;
