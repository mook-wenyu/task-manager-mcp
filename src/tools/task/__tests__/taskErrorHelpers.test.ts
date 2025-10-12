import { describe, expect, it } from "vitest";

import {
  createPlanTaskErrorResponse,
  createAnalyzeTaskErrorResponse,
  createReflectTaskErrorResponse,
} from "../taskErrorHelpers.js";

describe("taskErrorHelpers", () => {
  it("createPlanTaskErrorResponse 提供完整结构化字段", () => {
    const error = createPlanTaskErrorResponse({
      message: "plan_task 执行失败：mock error",
      errorCode: "E_UNEXPECTED",
      details: ["mock stack"],
      requirements: "额外约束",
      existingTaskStats: {
        total: 2,
        completed: 1,
        pending: 1,
      },
    });

    const payload = error.structuredContent.payload as Record<string, unknown>;
    expect(payload.errorCode).toBe("E_UNEXPECTED");
    expect(payload.errors).toEqual(["mock stack"]);
    expect(payload.requirements).toBe("额外约束");
    expect(payload.existingTaskStats).toEqual({
      total: 2,
      completed: 1,
      pending: 1,
    });
    expect(error.content[0]?.text).toContain("plan_task 执行失败：mock error");
  });

  it("createAnalyzeTaskErrorResponse 保留摘要与构想", () => {
    const error = createAnalyzeTaskErrorResponse({
      message: "analyze_task 执行失败：mock error",
      errorCode: "E_UNEXPECTED",
      details: ["trace"],
      summary: "任务摘要",
      initialConcept: "初步构想",
      previousAnalysis: "前次分析",
    });

    const payload = error.structuredContent.payload as Record<string, unknown>;
    expect(payload.errorCode).toBe("E_UNEXPECTED");
    expect(payload.errors).toEqual(["trace"]);
    expect(payload.summary).toBe("任务摘要");
    expect(payload.initialConcept).toBe("初步构想");
    expect(payload.previousAnalysis).toBe("前次分析");
    expect(error.content[0]?.text).toContain("analyze_task 执行失败：mock error");
  });

  it("createReflectTaskErrorResponse 回传分析内容", () => {
    const error = createReflectTaskErrorResponse({
      message: "reflect_task 执行失败：mock error",
      errorCode: "E_UNEXPECTED",
      details: ["trace"],
      summary: "任务摘要",
      analysis: "详尽技术分析",
    });

    const payload = error.structuredContent.payload as Record<string, unknown>;
    expect(payload.errorCode).toBe("E_UNEXPECTED");
    expect(payload.errors).toEqual(["trace"]);
    expect(payload.summary).toBe("任务摘要");
    expect(payload.analysis).toBe("详尽技术分析");
    expect(error.content[0]?.text).toContain(
      "reflect_task 执行失败：mock error",
    );
  });
});
