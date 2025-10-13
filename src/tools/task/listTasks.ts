import { z } from "zod";
import { getAllTasks } from "../../models/taskModel.js";
import { TaskStatus } from "../../types/index.js";
import { getListTasksPrompt } from "../../prompts/index.js";
import {
  countTasksByStatus,
  serializeTaskDetails,
} from "../utils/structuredContent.js";
import { listConnectionReferences } from "../../utils/connectionStore.js";
import {
  loadRoleTemplates,
  type RoleTemplate,
} from "../roles/renderRolePrompt.js";
import { loadWorkflowDefinition } from "../workflow/generateWorkflow.js";
import {
  loadStageStatus,
  STAGE_SEQUENCE,
  type StageId,
  type StageStatus,
} from "../status/updateStageStatus.js";

export const listTasksSchema = z.object({
  status: z
    .enum(["all", "pending", "in_progress", "completed"])
    .describe("要列出的任务状态，可选择 'all' 列出所有任务，或指定具体状态"),
    // Task status to list, choose 'all' to list all tasks, or specify a specific status
});

// 列出任务工具
// List tasks tool
export async function listTasks({ status }: z.infer<typeof listTasksSchema>) {
  const tasks = await getAllTasks();
  let filteredTasks = tasks;
  switch (status) {
    case "all":
      break;
    case "pending":
      filteredTasks = tasks.filter(
        (task) => task.status === TaskStatus.PENDING
      );
      break;
    case "in_progress":
      filteredTasks = tasks.filter(
        (task) => task.status === TaskStatus.IN_PROGRESS
      );
      break;
    case "completed":
      filteredTasks = tasks.filter(
        (task) => task.status === TaskStatus.COMPLETED
      );
      break;
  }

  const counts = countTasksByStatus(tasks);
  counts.filtered = filteredTasks.length;

  if (filteredTasks.length === 0) {
    const message = `## 系统通知\n\n目前系统中没有${
      status === "all" ? "任何" : `任何 ${status} 的`
    }任务。请查找其他状态任务或先使用「split_tasks」工具创建任务结构，再进行后续操作。`;

    return {
      content: [
        {
          type: "text" as const,
          text: message,
        },
      ],
      structuredContent: {
        kind: "taskManager.list" as const,
        payload: {
          markdown: message,
          requestedStatus: status,
          counts,
          tasks: [],
        },
      },
    };
  }

  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  // 使用prompt生成器获取最终prompt
  // Use prompt generator to get the final prompt
  const prompt = await getListTasksPrompt({
    status,
    tasks: tasksByStatus,
    allTasks: filteredTasks,
  });

  const connections = await listConnectionReferences();
  let promptWithConnections = prompt;
  if (connections.length > 0) {
    const connectionLines = connections
      .map((connection) => {
        const descriptionParts = [connection.key];
        if (connection.transport) {
          descriptionParts.push(`传输：${connection.transport}`);
        }
        if (connection.description) {
          descriptionParts.push(`说明：${connection.description}`);
        }
        if (connection.required) {
          descriptionParts.push("必需");
        }
        return `- ${descriptionParts.join(" · ")}`;
      })
      .join("\n");
    promptWithConnections = `${prompt}\n\n## 注册连接\n${connectionLines}`;
  }

  const aggregatedRoles = new Map<string, RoleTemplate>();
  const roleSummaries: string[] = [];
  const workflowSummaries: string[] = [];
  const stageSummaries: string[] = [];
  const aggregatedStageStats = new Map<
    StageId,
    {
      completed: number;
      inProgress: number;
      pending: number;
      latestUpdatedAt?: string;
    }
  >();

  const stageNameMap: Record<StageId, string> = {
    spec: "规格",
    plan: "规划",
    implementation: "实现",
    verification: "验证",
  };

  const statusSymbolMap: Record<StageStatus, string> = {
    pending: "⏳",
    in_progress: "🔄",
    completed: "✅",
  };

  for (const task of filteredTasks) {
    const [roles, workflow, stageStates] = await Promise.all([
      loadRoleTemplates(task.id),
      loadWorkflowDefinition(task.id),
      loadStageStatus(task.id),
    ]);

    if (roles && roles.length > 0) {
      const names = roles.map((role) => role.name).join(" / ");
      roleSummaries.push(`- ${task.name}：${names}`);
      for (const role of roles) {
        if (!aggregatedRoles.has(role.name)) {
          aggregatedRoles.set(role.name, role);
        }
      }
    }

    if (workflow) {
      workflowSummaries.push(
        `- ${task.name}：${workflow.pattern}${workflow.summary ? ` · ${workflow.summary}` : ""}`
      );
    }

    if (stageStates && stageStates.length > 0) {
      const hasEffectiveStage = stageStates.some(
        (state) => state.status !== "pending"
      );
      if (hasEffectiveStage) {
        const stageLine = stageStates
          .map(
            (state) =>
              `${stageNameMap[state.stage]}${statusSymbolMap[state.status]}`
          )
          .join(" / ");
        stageSummaries.push(`- ${task.name}：${stageLine}`);
      }

      for (const state of stageStates) {
        const stats =
          aggregatedStageStats.get(state.stage) ?? ({
            completed: 0,
            inProgress: 0,
            pending: 0,
          } as {
            completed: number;
            inProgress: number;
            pending: number;
            latestUpdatedAt?: string;
          });
        switch (state.status) {
          case "completed":
            stats.completed += 1;
            break;
          case "in_progress":
            stats.inProgress += 1;
            break;
          default:
            stats.pending += 1;
            break;
        }
        if (state.updatedAt) {
          if (
            !stats.latestUpdatedAt ||
            new Date(state.updatedAt).getTime() >
              new Date(stats.latestUpdatedAt).getTime()
          ) {
            stats.latestUpdatedAt = state.updatedAt;
          }
        }
        aggregatedStageStats.set(state.stage, stats);
      }
    }
  }

  const aggregatedStageProgress = STAGE_SEQUENCE.map((stage) => {
    const stats = aggregatedStageStats.get(stage);
    if (!stats) {
      return {
        stage,
        status: "pending" as StageStatus,
      };
    }
    const totalCount =
      stats.completed + stats.inProgress + stats.pending;
    const baseTotal = totalCount > 0 ? totalCount : filteredTasks.length;
    let status: StageStatus = "pending";
    if (stats.completed === baseTotal && baseTotal > 0) {
      status = "completed";
    } else if (stats.completed > 0 || stats.inProgress > 0) {
      status = "in_progress";
    }
    const notes = `完成 ${stats.completed}/${baseTotal}，进行中 ${stats.inProgress}`;
    return {
      stage,
      status,
      updatedAt: stats.latestUpdatedAt,
      notes,
    };
  });

  const hasStageProgress = aggregatedStageProgress.some(
    (entry) => entry.status !== "pending"
  );

  let finalPrompt = promptWithConnections;
  if (workflowSummaries.length > 0) {
    finalPrompt = `${finalPrompt}\n\n## 工作流概览\n${workflowSummaries.join("\n")}`;
  }
  if (hasStageProgress || stageSummaries.length > 0) {
    const aggregatedStageLines = aggregatedStageProgress.map((entry) => {
      const symbol = statusSymbolMap[entry.status];
      const label = stageNameMap[entry.stage];
      const notes = entry.notes ? `（${entry.notes}）` : "";
      return `- ${label}：${symbol} ${notes}`.trim();
    });
    finalPrompt = `${finalPrompt}\n\n## 阶段进度\n${aggregatedStageLines.join(
      "\n"
    )}`;
    if (stageSummaries.length > 0) {
      finalPrompt = `${finalPrompt}\n${stageSummaries.join("\n")}`;
    }
  }
  if (roleSummaries.length > 0) {
    finalPrompt = `${finalPrompt}\n\n## 角色概览\n${roleSummaries.join("\n")}`;
  }

  return {
    content: [
      {
        type: "text" as const,
        text: finalPrompt,
      },
    ],
    structuredContent: {
      kind: "taskManager.list" as const,
      payload: {
        markdown: finalPrompt,
        requestedStatus: status,
        counts,
        tasks: serializeTaskDetails(filteredTasks),
        ...(connections.length > 0 ? { connections } : {}),
        ...(aggregatedRoles.size > 0
          ? { roles: Array.from(aggregatedRoles.values()) }
          : {}),
        ...(hasStageProgress ? { stageProgress: aggregatedStageProgress } : {}),
      },
    },
  };
}
