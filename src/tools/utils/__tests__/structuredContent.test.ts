import { describe, expect, it } from "vitest";
import {
  countTasksByStatus,
  serializeTaskDetail,
  serializeTaskSummaries,
  validateTask,
} from "../structuredContent.js";
import {
  RelatedFileType,
  TaskStatus,
  type Task,
} from "../../../types/index.js";

describe("structuredContent utils", () => {
  it("serializes task detail with optional fields", () => {
    const baseDate = new Date("2025-10-11T10:20:30Z");
    const task: Task = {
      id: "task-1",
      name: "测试任务",
      description: "需要验证 structuredContent 序列化",
      notes: "补充说明",
      status: TaskStatus.PENDING,
      dependencies: [{ taskId: "dep-1" }],
      createdAt: baseDate,
      updatedAt: baseDate,
      relatedFiles: [
        {
          path: "docs/spec.md",
          type: RelatedFileType.REFERENCE,
          description: "参考文档",
          lineStart: 1,
          lineEnd: 10,
        },
      ],
      implementationGuide: "按步骤执行",
      verificationCriteria: "全部测试通过",
      summary: "输出已生成",
    };

    const detail = serializeTaskDetail(task);

    expect(detail).toMatchObject({
      id: task.id,
      name: task.name,
      status: task.status,
      description: task.description,
      notes: task.notes,
      implementationGuide: task.implementationGuide,
      verificationCriteria: task.verificationCriteria,
      summary: task.summary,
    });
    expect(detail.dependencies).toEqual([{ taskId: "dep-1" }]);
    expect(detail.relatedFiles).toEqual([
      {
        path: "docs/spec.md",
        type: RelatedFileType.REFERENCE,
        description: "参考文档",
        lineStart: 1,
        lineEnd: 10,
      },
    ]);
    expect(typeof detail.createdAt).toBe("string");
    expect(typeof detail.updatedAt).toBe("string");
  });

  it("counts tasks by status and returns summaries", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        name: "待办任务",
        description: "待处理任务，验证计数逻辑",
        status: TaskStatus.PENDING,
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "task-2",
        name: "进行中任务",
        description: "处理中任务，验证计数逻辑",
        status: TaskStatus.IN_PROGRESS,
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const counts = countTasksByStatus(tasks);
    expect(counts[TaskStatus.PENDING]).toBe(1);
    expect(counts[TaskStatus.IN_PROGRESS]).toBe(1);
    expect(counts.total).toBe(tasks.length);

    const summaries = serializeTaskSummaries(tasks);
    expect(summaries).toEqual([
      { id: "task-1", name: "待办任务", status: TaskStatus.PENDING },
      { id: "task-2", name: "进行中任务", status: TaskStatus.IN_PROGRESS },
    ]);
  });

  it("validates task structure before serialization", () => {
    const validTask: Task = {
      id: "task-validate",
      name: "合法任务",
      description: "用于验证任务结构的合法示例",
      status: TaskStatus.COMPLETED,
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(() => validateTask(validTask)).not.toThrow();

    const missingName: Task = {
      id: "invalid",
      name: "",
      description: "缺失名称的任务用于触发校验错误",
      status: TaskStatus.PENDING,
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(() => validateTask(missingName)).toThrow("Task 'invalid' is missing required field: name");
  });
});
