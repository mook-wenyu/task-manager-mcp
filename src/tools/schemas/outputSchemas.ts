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
  errorCode: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

const SpecTemplateFileSchema = z.object({
  path: z.string(),
  format: z.enum(["markdown", "json", "graph", "yaml", "other"]).optional(),
  description: z.string().optional(),
  required: z.boolean().optional(),
});

const SpecTemplateSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
});

const SpecTemplateSchema = z.object({
  files: z.array(SpecTemplateFileSchema).min(1),
  sections: z.array(SpecTemplateSectionSchema).optional(),
  questions: z.array(z.string()).optional(),
});

const ConnectionReferenceSchema = z.object({
  key: z.string(),
  description: z.string().optional(),
  transport: z.string().optional(),
  required: z.boolean().optional(),
});

const RegisterConnectionDetailsSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  cwd: z.string().optional(),
  transport: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  envFile: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
  required: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ConnectionsStorageSchema = z.object({
  version: z.number().int().nonnegative(),
  updatedAt: z.string(),
});

const WorkflowOptionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

const WorkflowStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  stage: z.string().optional(),
});

const WorkflowPatternSchema = z.object({
  default: z.string(),
  options: z.array(WorkflowOptionSchema).optional(),
  suggestedSteps: z.array(WorkflowStepSchema).optional(),
});

const RoleTemplateSchema = z.object({
  name: z.string(),
  summary: z.string().optional(),
  responsibilities: z.string().optional(),
  prompt: z.string().optional(),
  defaultTools: z.array(z.string()).optional(),
});

const OpenQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  required: z.boolean().optional(),
  rationale: z.string().optional(),
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

const StageStatusSchema = z.enum(["pending", "in_progress", "completed"]);

const StageProgressSchema = z.object({
  stage: z.string(),
  status: StageStatusSchema,
  updatedAt: z.string().optional(),
  notes: z.string().optional(),
});

const WorkflowSummarySchema = z.object({
  pattern: z.string(),
  currentStepId: z.string().optional(),
  steps: z
    .array(
      WorkflowStepSchema.extend({
        status: StageStatusSchema.optional(),
      })
    )
    .optional(),
});

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
    requirements: z.string().optional(),
    specTemplate: SpecTemplateSchema.optional(),
    connections: z.array(ConnectionReferenceSchema).optional(),
    workflowPattern: WorkflowPatternSchema.optional(),
    roles: z.array(RoleTemplateSchema).optional(),
    openQuestions: z.array(OpenQuestionSchema).optional(),
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
    errorCode: z.string().optional(),
    errors: z.array(z.string()).optional(),
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
    connections: z.array(ConnectionReferenceSchema).optional(),
    progress: z.array(StageProgressSchema).optional(),
    roles: z.array(RoleTemplateSchema).optional(),
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
    connections: z.array(ConnectionReferenceSchema).optional(),
    workflow: WorkflowSummarySchema.optional(),
    roles: z.array(RoleTemplateSchema).optional(),
    stageProgress: z.array(StageProgressSchema).optional(),
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
    stageUpdates: z.array(StageProgressSchema).optional(),
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

const MemoryReplayEntrySchema = z.object({
  id: z.string(),
  toolName: z.string(),
  summary: z.string(),
  taskId: z.string().nullable(),
  tags: z.array(z.string()),
  importance: z.literal("high").or(z.literal("normal")),
  createdAt: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const MemoryReplayStructuredSchema = z.object({
  kind: z.literal("taskManager.memoryReplay"),
  payload: MarkdownPayloadSchema.extend({
    scope: z.union([z.literal("short-term"), z.literal("long-term")]),
    limit: z.number().int().min(1),
    entries: z.array(MemoryReplayEntrySchema),
    filters: z
      .object({
        taskId: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

export const RegisterConnectionStructuredSchema = z.object({
  kind: z.literal("config.registerConnection"),
  payload: MarkdownPayloadSchema.extend({
    key: z.string(),
    isUpdate: z.boolean(),
    totalConnections: z.number().int().nonnegative().optional(),
    connection: RegisterConnectionDetailsSchema,
    connectionsSummary: z.array(ConnectionReferenceSchema).optional(),
    storage: ConnectionsStorageSchema.optional(),
  }),
});

const WorkflowGeneratedFileSchema = z.object({
  name: z.string(),
  path: z.string(),
  format: z.enum(["json", "markdown", "graph", "yaml", "other"]).optional(),
});

export const GenerateWorkflowStructuredSchema = z.object({
  kind: z.literal("workflow.generate"),
  payload: MarkdownPayloadSchema.extend({
    taskId: z.string(),
    pattern: z.string(),
    directory: z.string(),
    files: z.array(WorkflowGeneratedFileSchema).min(1),
    workflow: z
      .object({
        pattern: z.string(),
        summary: z.string().optional(),
        steps: z.array(WorkflowStepSchema).optional(),
      })
      .optional(),
  }),
});

const RolePromptFileSchema = z.object({
  path: z.string(),
  format: z.enum(["json", "markdown", "other"]).optional(),
});

export const RenderRolePromptStructuredSchema = z.object({
  kind: z.literal("roles.renderPrompt"),
  payload: MarkdownPayloadSchema.extend({
    taskId: z.string(),
    pattern: z.string().optional(),
    file: RolePromptFileSchema.optional(),
    roles: z.array(RoleTemplateSchema),
  }),
});

const ResearchFileSchema = z.object({
  path: z.string(),
  format: z.enum(["json", "markdown", "other"]).optional(),
});

export const QueueResearchStructuredSchema = z.object({
  kind: z.literal("research.queue"),
  payload: MarkdownPayloadSchema.extend({
    taskId: z.string(),
    questions: z.array(OpenQuestionSchema).optional(),
    files: z.array(ResearchFileSchema).optional(),
    createdTaskIds: z.array(z.string()).optional(),
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
  memory_replay: MemoryReplayStructuredSchema,
  register_connection: RegisterConnectionStructuredSchema,
  generate_workflow: GenerateWorkflowStructuredSchema,
  render_role_prompt: RenderRolePromptStructuredSchema,
  queue_research_task: QueueResearchStructuredSchema,
} as const;

type SchemaMap = typeof TOOL_STRUCTURED_SCHEMAS;
export type ToolStructuredContentName = keyof SchemaMap;
export type ToolStructuredContent<TName extends ToolStructuredContentName> = z.infer<
  SchemaMap[TName]
>;
