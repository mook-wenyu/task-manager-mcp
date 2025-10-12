# 工具输出契约规划（SDK v1.20.0）

## 统一约定
- structuredContent 顶层采用 `kind` + `payload` 结构，`kind` 以 `taskManager.*` 前缀区分用途。
- 所有工具仍保留 Markdown 文本输出，`payload.markdown` 同步写入 `content[0].text`，用于旧客户端阅读。
- 输出 schema 统一由 `src/tools/schemas/outputSchemas.ts` 定义并在 `src/tools/schemas/index.ts` 汇出；注册时传入 `outputSchema`。
- structuredContent 中的 ID、路径、状态遵循现有模型类型（如 `TaskStatus`、`RelatedFileType`）。

## 工具明细
| 工具名 | kind | 关键字段 | 数据来源 | 校验/测试 | 状态 |
| --- | --- | --- | --- | --- | --- |
| plan_task | taskManager.plan | prompt, requirements, existingTaskStats | getPlanTaskPrompt, getAllTasks | schema + 快照 | 已实现 |
| analyze_task | taskManager.analyze | summary, concept, previousAnalysis | 入参 + prompt | schema + 快照 | 已实现 |
| reflect_task | taskManager.reflect | reflections, followUps | getReflectTaskPrompt, 入参 | schema + 快照 | 已实现 |
| split_tasks | taskManager.split | updateMode, createdTasks, backupFile, message | batchCreateOrUpdateTasks 等 | schema + 数据断言 | 已实现 |
| list_tasks | taskManager.list | requestedStatus, counts, tasks | getAllTasks | schema + 快照 | 已实现 |
| execute_task | taskManager.execute | taskId, statusBefore, complexity, dependencies | getTaskById, assessTaskComplexity | schema + 单元测试 | 已实现 |
| verify_task | taskManager.verify | taskId, score, statusAfter, summary | getVerifyTaskPrompt, updateTaskStatus | schema + 单元测试 | 已实现 |
| delete_task | taskManager.delete | success, message | deleteTask 模型层 | schema + 单元测试 | 已实现 |
| clear_all_tasks | taskManager.clear | backupFilePath, totalRemoved, completedBackedUp | modelClearAllTasks | schema + 单元测试 | 已实现 |
| update_task | taskManager.update | taskId, updatedFields, updatedTask | updateTaskContent | schema + 单元测试 | 已实现 |
| query_task | taskManager.query | query, isId, results, pagination | searchTasksWithCommand | schema + 数据断言 | 已实现 |
| get_task_detail | taskManager.detail | task | getTaskDetail | schema + 数据断言 | 已实现 |
| process_thought | taskManager.thought | stage, totalThoughts, summary | processThoughtSchema 入参 | schema + 快照 | 已实现 |
| init_project_rules | taskManager.projectRules | createdFiles, warnings | initProjectRules | schema + 文件断言 | 已实现 |
| research_mode | taskManager.research | topic, currentState, nextSteps, resourceLinks | researchMode | schema + 快照 | 已实现 |
| memory_replay | taskManager.memoryReplay | scope, limit, entries, filters | memoryStore.listRecent | schema + 单元测试 | 已实现 |

## 后续行动
- 针对客户端联调补充握手示例，记录于 `docs/UPGRADE-SDK-1.20.0.md`。
- 跟进历史失败的 `agentMatcher` 测试，恢复回归绿灯。
- 为 structuredContent 输出提供实际客户端示例（CLI/UI），并在发布前完成验收。