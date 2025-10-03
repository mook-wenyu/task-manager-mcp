import { z } from "zod";
import { searchTasksWithCommand } from "../../models/taskModel.js";
import { getQueryTaskPrompt } from "../../prompts/index.js";

// 查找任务工具
// Query task tool
export const queryTaskSchema = z.object({
  query: z
    .string()
    .min(1, {
      message: "查找内容不能为空，请提供任务ID或搜索关键字",
      // Query content cannot be empty, please provide task ID or search keywords
    })
    .describe("搜索查找文本，可以是任务ID或多个关键字（空格分隔）"),
    // Search query text, can be task ID or multiple keywords (space-separated)
  isId: z
    .boolean()
    .optional()
    .default(false)
    .describe("指定是否为ID查找模式，默认为否（关键字模式）"),
    // Specify whether it is ID query mode, default is false (keyword mode)
  page: z
    .number()
    .int()
    .positive()
    .optional()
    .default(1)
    .describe("分页页码，默认为第1页"),
    // Page number, default is page 1
  pageSize: z
    .number()
    .int()
    .positive()
    .min(1)
    .max(20)
    .optional()
    .default(5)
    .describe("每页显示的任务数量，默认为5笔，最大20笔"),
    // Number of tasks displayed per page, default is 5, maximum is 20
});

export async function queryTask({
  query,
  isId = false,
  page = 1,
  pageSize = 3,
}: z.infer<typeof queryTaskSchema>) {
  try {
    // 使用系统指令搜索函数
    // Use system command search function
    const results = await searchTasksWithCommand(query, isId, page, pageSize);

    // 使用prompt生成器获取最终prompt
    // Use prompt generator to get the final prompt
    const prompt = await getQueryTaskPrompt({
      query,
      isId,
      tasks: results.tasks,
      totalTasks: results.pagination.totalResults,
      page: results.pagination.currentPage,
      pageSize,
      totalPages: results.pagination.totalPages,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: prompt,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `## 系统错误\n\n查找任务时发生错误: ${
          // ## System Error\n\nAn error occurred while querying tasks: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}
