import { describe, expect, it } from "vitest";
import {
  ExecuteTaskStructuredSchema,
  ListTasksStructuredSchema,
  PlanTaskStructuredSchema,
  VerifyTaskStructuredSchema,
  RegisterConnectionStructuredSchema,
  GenerateWorkflowStructuredSchema,
  RenderRolePromptStructuredSchema,
  QueueResearchStructuredSchema,
} from "../outputSchemas.js";

describe("outputSchemas optional enhancements", () => {
  it("accepts plan task payload with enhancement fields", () => {
    const payload = {
      markdown: "# 规划结果",
      prompt: "# 规划结果",
      specTemplate: {
        files: [
          {
            path: "/tmp/specs/task-1/spec.md",
            format: "markdown",
            description: "规格正文",
            required: true,
          },
          {
            path: "/tmp/specs/task-1/spec.json",
            format: "json",
          },
        ],
        sections: [
          {
            id: "overview",
            title: "任务背景",
            description: "说明业务上下文",
          },
        ],
        questions: ["待确认接口依赖"],
      },
      connections: [
        {
          key: "local-task-manager",
          description: "默认本地服务器",
          transport: "stdio",
          required: true,
        },
      ],
      workflowPattern: {
        default: "serial",
        options: [
          { name: "serial", description: "顺序执行" },
          { name: "parallel" },
        ],
        suggestedSteps: [
          { id: "spec", title: "编写规格" },
          { id: "code", title: "实现代码", stage: "implementation" },
        ],
      },
      roles: [
        {
          name: "Architect",
          summary: "负责拆解需求",
          responsibilities: "输出规格模板",
          prompt: "你是 Architect",
          defaultTools: ["plan_task"],
        },
      ],
      openQuestions: [
        {
          id: "rq-1",
          question: "接口返回是否包含错误码？",
          required: true,
          rationale: "决定测试覆盖范围",
        },
      ],
    };

    expect(() =>
      PlanTaskStructuredSchema.parse({
        kind: "taskManager.plan",
        payload,
      })
    ).not.toThrow();
  });

  it("accepts execute task payload with optional workflow and progress", () => {
    const payload = {
      markdown: "## 执行阶段",
      taskId: "task-1",
      taskName: "实现规格模板",
      stageProgress: [
        {
          stage: "spec",
          status: "completed",
          updatedAt: new Date().toISOString(),
        },
      ],
      connections: [{ key: "local-task-manager" }],
      workflow: {
        pattern: "serial",
        currentStepId: "code",
        steps: [
          { id: "spec", title: "编写规格", status: "completed" },
          { id: "code", title: "实现代码", status: "in_progress" },
        ],
      },
      roles: [
        {
          name: "Implementer",
          summary: "根据规格实现",
          prompt: "关注最小可行实现",
        },
      ],
    };

    expect(() =>
      ExecuteTaskStructuredSchema.parse({
        kind: "taskManager.execute",
        payload,
      })
    ).not.toThrow();
  });

  it("accepts verify task payload with stage updates", () => {
    const payload = {
      markdown: "## 验证结果",
      taskId: "task-1",
      taskName: "实现规格模板",
      score: 95,
      statusChanged: true,
      stageUpdates: [
        {
          stage: "code",
          status: "completed",
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    expect(() =>
      VerifyTaskStructuredSchema.parse({
        kind: "taskManager.verify",
        payload,
      })
    ).not.toThrow();
  });

  it("accepts list tasks payload with progress and roles", () => {
    const payload = {
      markdown: "## 列表",
      requestedStatus: "all" as const,
      counts: {
        total: 1,
        completed: 0,
        pending: 1,
      },
      tasks: [],
      progress: [
        {
          stage: "spec",
          status: "completed",
        },
      ],
      roles: [
        {
          name: "Architect",
          summary: "负责规格",
        },
      ],
      connections: [{ key: "local-task-manager" }],
    };

    expect(() =>
      ListTasksStructuredSchema.parse({
        kind: "taskManager.list",
        payload,
      })
    ).not.toThrow();
  });

  it("accepts register connection payload with metadata", () => {
    const payload = {
      markdown: "## 连接已注册",
      key: "local-agent",
      isUpdate: false,
      totalConnections: 2,
      connection: {
        command: "npm run agent",
        args: ["--stdio"],
        cwd: ".",
        transport: "stdio",
        description: "本地任务编排 MCP",
        tags: ["local", "default"],
        envFile: ".env.local",
        env: {
          API_KEY: "sk-xxx",
        },
        required: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      connectionsSummary: [
        {
          key: "local-agent",
          description: "本地任务编排 MCP",
          transport: "stdio",
          required: true,
        },
      ],
      storage: {
        version: 1,
        updatedAt: new Date().toISOString(),
      },
    };

    expect(() =>
      RegisterConnectionStructuredSchema.parse({
        kind: "config.registerConnection",
        payload,
      })
    ).not.toThrow();
  });

  it("accepts generate workflow payload", () => {
    const payload = {
      markdown: "## 工作流模板已生成",
      taskId: "00000000-0000-0000-0000-000000000001",
      pattern: "serial",
      directory: "/tmp/.shrimp/specs/0001",
      files: [
        { name: "workflow.json", path: "/tmp/workflow.json", format: "json" },
        { name: "workflow.md", path: "/tmp/workflow.md", format: "markdown" },
      ],
      workflow: {
        pattern: "serial",
        summary: "串行模式",
        steps: [
          { id: "spec", title: "规格整理", description: "梳理范围" },
          { id: "implementation", title: "实现执行" },
        ],
      },
    };

    expect(() =>
      GenerateWorkflowStructuredSchema.parse({
        kind: "workflow.generate",
        payload,
      })
    ).not.toThrow();
  });

  it("accepts render role prompt payload", () => {
    const payload = {
      markdown: "## 角色提示已生成",
      taskId: "00000000-0000-0000-0000-000000000002",
      pattern: "serial",
      file: {
        path: "/tmp/roles.json",
        format: "json",
      },
      roles: [
        {
          name: "规格主笔",
          summary: "整理需求",
          responsibilities: "产出规格模板",
          prompt: "请维护规格与风险",
          defaultTools: ["plan_task"],
        },
      ],
    };

    expect(() =>
      RenderRolePromptStructuredSchema.parse({
        kind: "roles.renderPrompt",
        payload,
      })
    ).not.toThrow();
  });

  it("accepts queue research payload", () => {
    const payload = {
      markdown: "## 调研任务已排队",
      taskId: "00000000-0000-0000-0000-000000000003",
      questions: [
        {
          id: "oq-1",
          question: "接口返回是否包含错误码？",
          required: true,
        },
      ],
      files: [
        { path: "/tmp/specs/task/research.md", format: "markdown" },
        { path: "/tmp/specs/task/open-questions.json", format: "json" },
      ],
      createdTaskIds: ["11111111-1111-1111-1111-111111111111"],
    };

    expect(() =>
      QueueResearchStructuredSchema.parse({
        kind: "research.queue",
        payload,
      })
    ).not.toThrow();
  });

  it("maintains backward compatibility with minimal payloads", () => {
    expect(() =>
      PlanTaskStructuredSchema.parse({
        kind: "taskManager.plan",
        payload: {
          markdown: "# plan",
          prompt: "# plan",
        },
      })
    ).not.toThrow();

    expect(() =>
      ExecuteTaskStructuredSchema.parse({
        kind: "taskManager.execute",
        payload: {
          markdown: "# execute",
          taskId: "task-legacy",
        },
      })
    ).not.toThrow();

    expect(() =>
      VerifyTaskStructuredSchema.parse({
        kind: "taskManager.verify",
        payload: {
          markdown: "# verify",
          taskId: "task-legacy",
          score: 80,
          statusChanged: false,
        },
      })
    ).not.toThrow();

    expect(() =>
      ListTasksStructuredSchema.parse({
        kind: "taskManager.list",
        payload: {
          markdown: "# list",
          requestedStatus: "all",
          counts: {
            total: 0,
            completed: 0,
            pending: 0,
          },
        },
      })
    ).not.toThrow();
  });
});
