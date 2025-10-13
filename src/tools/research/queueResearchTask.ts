import { readFile } from "fs/promises";
import path from "path";
import { z } from "zod";
import { getDataDir } from "../../utils/paths.js";
import {
  writeJsonFileAtomic,
  writeTextFileAtomic,
} from "../../utils/fileWriter.js";
import {
  createTask,
  getAllTasks,
  getTaskById,
} from "../../models/taskModel.js";
import type { Task } from "../../types/index.js";

const OpenQuestionInputSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, "问题内容不能为空"),
  required: z.boolean().optional(),
  rationale: z.string().optional(),
});

export const queueResearchTaskSchema = z.object({
  taskId: z
    .string()
    .uuid({ message: "任务 ID 必须为有效的 UUID v4" })
    .describe("待写入调研文档的任务 ID"),
  questions: z
    .array(OpenQuestionInputSchema)
    .optional()
    .describe("待澄清问题列表，若缺省则尝试读取既有 open-questions.json"),
  overwrite: z
    .boolean()
    .optional()
    .default(false)
    .describe("是否覆盖已有的 open-questions.json 与 research.md"),
});

type QueueResearchTaskArgs = z.infer<typeof queueResearchTaskSchema>;
type OpenQuestionInput = z.infer<typeof OpenQuestionInputSchema>;

interface ResearchFilePaths {
  questionsPath: string;
  researchPath: string;
  directory: string;
}

async function getResearchPaths(taskId: string): Promise<ResearchFilePaths> {
  const dataDir = await getDataDir();
  const directory = path.join(dataDir, "specs", taskId);
  return {
    directory,
    questionsPath: path.join(directory, "open-questions.json"),
    researchPath: path.join(directory, "research.md"),
  };
}

async function loadExistingQuestions(filePath: string): Promise<
  OpenQuestionInput[] | null
> {
  try {
    const existing = JSON.parse(await readFile(filePath, "utf-8"));
    if (Array.isArray(existing)) {
      return existing.filter(
        (item): item is OpenQuestionInput =>
          item &&
          typeof item === "object" &&
          typeof item.question === "string" &&
          item.question.trim().length > 0
      );
    }
  } catch {
    // ignore
  }
  return null;
}

function deduplicateQuestions(questions: OpenQuestionInput[]): OpenQuestionInput[] {
  const seen = new Set<string>();
  const results: OpenQuestionInput[] = [];
  for (const question of questions) {
    const normalized = question.question.trim();
    if (normalized.length === 0) {
      continue;
    }
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    results.push({
      ...question,
      question: normalized,
    });
  }
  return results;
}

function buildResearchMarkdown(task: Task, questions: OpenQuestionInput[]): string {
  const lines: string[] = [
    `# 调研记录：${task.name}`,
    "",
    "## 任务背景",
    task.description ?? "（未提供任务背景，请在此补充）",
    "",
    "## 待澄清问题",
  ];

  questions.forEach((item, index) => {
    lines.push(`### Q${index + 1} ${item.question}`);
    lines.push(
      `- 必需：${item.required ? "是" : "否"}`,
      item.rationale ? `- 备注：${item.rationale}` : "- 备注：—",
      ""
    );
  });

  lines.push(
    "## 建议下一步",
    "- 使用 `research_mode` 或外部检索工具确认答案",
    "- 调研完成后更新 open-questions.json，并在 verify 记录中补充结论",
    ""
  );

  return lines.join("\n");
}

async function createFollowupTasks(
  parentTask: Task,
  questions: OpenQuestionInput[]
) {
  if (questions.length === 0) {
    return [];
  }

  const existingTasks = await getAllTasks();
  const existingNames = new Set(
    existingTasks.map((task) => task.name.trim())
  );

  const created: Task[] = [];
  for (const question of questions) {
    const name = `[调研] ${question.question.slice(0, 50)}`;
    if (existingNames.has(name)) {
      continue;
    }

    const descriptionLines = [
      `源任务：${parentTask.name} (${parentTask.id})`,
      `待澄清问题：${question.question}`,
    ];
    if (question.rationale) {
      descriptionLines.push(`备注：${question.rationale}`);
    }
    const description = descriptionLines.join("\n");

    const newTask = await createTask(name, description, undefined, [parentTask.id]);
    created.push(newTask);
    existingNames.add(name);
  }
  return created;
}

export async function queueResearchTask({
  taskId,
  questions,
  overwrite = false,
}: QueueResearchTaskArgs) {
  const task = await getTaskById(taskId);
  if (!task) {
    const message = `找不到 ID 为 \`${taskId}\` 的任务，请确认后重试。`;
    return {
      content: [
        {
          type: "text" as const,
          text: `## 生成失败\n\n${message}`,
        },
      ],
      isError: true as const,
    };
  }

  const paths = await getResearchPaths(taskId);
  let questionList = questions ?? [];

  if (questionList.length === 0 && !overwrite) {
    const existing = await loadExistingQuestions(paths.questionsPath);
    if (existing) {
      questionList = existing;
    }
  }

  questionList = deduplicateQuestions(questionList);

  if (questionList.length === 0) {
    const message = `任务 \`${task.name}\` 当前没有待澄清问题，已跳过调研排队。`;
    return {
      content: [
        {
          type: "text" as const,
          text: `## 无需调研\n\n${message}`,
        },
      ],
      structuredContent: {
        kind: "research.queue" as const,
        payload: {
          markdown: message,
          taskId,
          questions: [],
          files: [],
          createdTaskIds: [],
        },
      },
    };
  }

  await writeJsonFileAtomic(paths.questionsPath, questionList);
  const researchMarkdown = buildResearchMarkdown(task, questionList);
  await writeTextFileAtomic(paths.researchPath, researchMarkdown);

  const createdTasks = await createFollowupTasks(task, questionList);

  const summaryLines = [
    "## 调研任务已排队",
    "",
    `- 目标任务：${task.name} (\`${taskId}\`)`,
    `- 待澄清问题：${questionList.length} 条`,
    `- 新建调研任务：${createdTasks.length} 条`,
    "",
    "### 文件位置",
    `- ${path.relative(await getDataDir(), paths.questionsPath)} (JSON)`,
    `- ${path.relative(await getDataDir(), paths.researchPath)} (Markdown)`,
  ];

  if (createdTasks.length > 0) {
    summaryLines.push(
      "",
      "### 新建任务列表",
      ...createdTasks.map(
        (created) => `- ${created.name} (\`${created.id}\`)`
      )
    );
  }

  const markdown = `${summaryLines.join("\n")}\n`;

  return {
    content: [
      {
        type: "text" as const,
        text: markdown,
      },
    ],
    structuredContent: {
      kind: "research.queue" as const,
      payload: {
        markdown,
        taskId,
        questions: questionList,
        files: [
          { path: paths.questionsPath, format: "json" },
          { path: paths.researchPath, format: "markdown" },
        ],
        createdTaskIds: createdTasks.map((item) => item.id),
      },
    },
  };
}
