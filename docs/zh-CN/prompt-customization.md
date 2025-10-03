﻿[English](../en/prompt-customization.md) | [中文](../zh-CN/prompt-customization.md)

# Prompt 自定义指南

## 概述

本系统允许用户透过环境变量自定义各个工具函数的指导内容（prompt）。这提供了高度的弹性，使您能够根据特定需求调整 AI 助手的行为表现，而不需要修改代码。有两种自定义方式：

1. **覆盖模式**：完全取代原本的 prompt
2. **追加模式**：在原有 prompt 的基础上增加新内容

## 环境变量命名规则

- 覆盖模式：`MCP_PROMPT_[FUNCTION_NAME]`
- 追加模式：`MCP_PROMPT_[FUNCTION_NAME]_APPEND`

其中 `[FUNCTION_NAME]` 是工具函数的名称，大写形式。例如，对于任务规划功能 `planTask`，相应的环境变量名称为 `MCP_PROMPT_PLAN_TASK`。

## 多语言提示词模板支持

虾米任务管理器支持多种语言的提示词模板，可通过 `TEMPLATES_USE` 环境变量设置：

- 当前支持的语言：`en`（英文）和 `zh`（繁体中文）
- 默认为 `en`（英文）

### 切换语言

在 `mcp.json` 配置中设置：

```json
"env": {
  "TEMPLATES_USE": "zh"  // 使用繁体中文模板
}
```

或在 `.env` 文档中设置：

```
TEMPLATES_USE=zh
```

### 自定义模板

您可以创建自己的模板集：

1. 将现有模板集（如 `src/prompts/templates_en` 或 `src/prompts/templates_zh`）复制到 `DATA_DIR` 指定的目录
2. 重命名复制的目录（例如：`my_templates`）
3. 修改模板文档以符合您的需求
4. 将 `TEMPLATES_USE` 环境变量设置为您的模板目录名称：

```json
"env": {
  "DATA_DIR": "/path/to/project/data",
  "TEMPLATES_USE": "my_templates"
}
```

系统将优先使用您的自定义模板，如果找不到特定模板文档，会回退到内置的英文模板。

## 支持的工具函数

系统中的所有主要功能都支持透过环境变量自定义 prompt：

| 功能名称           | 环境变量前缀                    | 说明           |
| ------------------ | ------------------------------- | -------------- |
| `planTask`         | `MCP_PROMPT_PLAN_TASK`          | 任务规划       |
| `analyzeTask`      | `MCP_PROMPT_ANALYZE_TASK`       | 任务分析       |
| `reflectTask`      | `MCP_PROMPT_REFLECT_TASK`       | 方案评估       |
| `splitTasks`       | `MCP_PROMPT_SPLIT_TASKS`        | 任务拆分       |
| `executeTask`      | `MCP_PROMPT_EXECUTE_TASK`       | 任务执行       |
| `verifyTask`       | `MCP_PROMPT_VERIFY_TASK`        | 任务验证       |
| `listTasks`        | `MCP_PROMPT_LIST_TASKS`         | 列出任务       |
| `queryTask`        | `MCP_PROMPT_QUERY_TASK`         | 查询任务       |
| `getTaskDetail`    | `MCP_PROMPT_GET_TASK_DETAIL`    | 获取任务详情   |
| `processThought`   | `MCP_PROMPT_PROCESS_THOUGHT`    | 思维链处理     |
| `initProjectRules` | `MCP_PROMPT_INIT_PROJECT_RULES` | 初始化项目规则 |

## 环境变量配置方法

有两种主要的配置方式：

### 1. 透过 `.env` 文档设置环境变量

1. 在项目根目录复制 `.env.example` 改名为 `.env` 文档
2. 添加所需的环境变量配置
3. 应用进程启动时会自动载入这些环境变量

```
# .env 文档示例
MCP_PROMPT_PLAN_TASK=自定义的 prompt 内容
MCP_PROMPT_ANALYZE_TASK=自定义的分析 prompt 内容
```

> 注意：确保 `.env` 文档在版本控制中被忽略（添加到 `.gitignore`），特别是当它包含敏感信息时。

### 2. 直接在 mcp.json 配置文档中设置

您也可以直接在 Cursor IDE 的 `mcp.json` 配置文档中设置环境变量，这样无需另外创建 `.env` 文档：

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/project/data",
        "MCP_PROMPT_PLAN_TASK": "自定义的任务规划提示词",
        "MCP_PROMPT_EXECUTE_TASK_APPEND": "额外的任务执行指导"
      }
    }
  }
}
```

这种方式的优点是可以将提示词配置与其他 MCP 配置放在一起管理，特别适合需要针对不同项目使用不同提示词的情况。

## 使用示例

### 覆盖模式示例

```
# .env 文档中完全替换 PLAN_TASK 的 prompt
MCP_PROMPT_PLAN_TASK=## 自定义任务规划\n\n请根据以下信息规划任务：\n\n{description}\n\n要求：{requirements}\n
```

或在 mcp.json 中配置：

```json
"env": {
  "MCP_PROMPT_PLAN_TASK": "## 自定义任务规划\n\n请根据以下信息规划任务：\n\n{description}\n\n要求：{requirements}\n"
}
```

### 追加模式示例

```
# .env 文档中在 PLAN_TASK 原有 prompt 后追加内容
MCP_PROMPT_PLAN_TASK_APPEND=\n\n## 额外指导\n\n请特别注意以下事项：\n1. 优先考虑任务间的依赖关系\n2. 尽量减少任务耦合度
```

或在 mcp.json 中配置：

```json
"env": {
  "MCP_PROMPT_PLAN_TASK_APPEND": "\n\n## 额外指导\n\n请特别注意以下事项：\n1. 优先考虑任务间的依赖关系\n2. 尽量减少任务耦合度"
}
```

## 动态参数支持

自定义 prompt 也可以使用定义的动态参数，方式是使用 `{paramName}` 语法。系统会在处理时将这些占位符替换为实际的参数值。

各个函数支持的参数如下：

### planTask 支持的参数

- `{description}` - 任务描述
- `{requirements}` - 任务要求
- `{existingTasksReference}` - 是否参考现有任务
- `{completedTasks}` - 已完成任务列表
- `{pendingTasks}` - 待处理任务列表
- `{memoryDir}` - 任务记忆储存目录

### analyzeTask 支持的参数

- `{summary}` - 任务摘要
- `{initialConcept}` - 初始概念
- `{previousAnalysis}` - 先前分析结果

### reflectTask 支持的参数

- `{summary}` - 任务摘要
- `{analysis}` - 分析结果

### splitTasks 支持的参数

- `{updateMode}` - 更新模式
- `{createdTasks}` - 创建的任务
- `{allTasks}` - 所有任务

### executeTask 支持的参数

- `{task}` - 任务详情
- `{complexityAssessment}` - 复杂度评估结果
- `{relatedFilesSummary}` - 相关文档摘要
- `{dependencyTasks}` - 依赖任务
- `{potentialFiles}` - 可能相关的文档

### verifyTask 支持的参数

- `{task}` - 任务详情

### listTasks 支持的参数

- `{status}` - 任务状态
- `{tasks}` - 按状态分组的任务
- `{allTasks}` - 所有任务

### queryTask 支持的参数

- `{query}` - 查询内容
- `{isId}` - 是否为 ID 查询
- `{tasks}` - 查询结果
- `{totalTasks}` - 总结果数
- `{page}` - 当前页码
- `{pageSize}` - 每页大小
- `{totalPages}` - 总页数

### getTaskDetail 支持的参数

- `{taskId}` - 任务 ID
- `{task}` - 任务详情
- `{error}` - 错误信息（如有）

## 进阶自定义案例

### 示例 1：添加品牌客制化提示

假设您想要在所有任务执行指南中添加公司特定的品牌信息和指导原则：

```
# 在 .env 文档中配置
MCP_PROMPT_EXECUTE_TASK_APPEND=\n\n## 公司特定指南\n\n在执行任务时，请遵循以下原则：\n1. 保持代码与公司风格指南一致\n2. 所有新功能必须有对应的单元测试\n3. 文档必须使用公司标准模板\n4. 确保所有用户界面元素符合品牌设计规范
```

### 示例 2：调整任务分析风格

假设您想要让任务分析更加偏向安全性考量：

```
# 在 .env 文档中配置
MCP_PROMPT_ANALYZE_TASK=## 安全导向任务分析\n\n请针对以下任务进行全面的安全分析：\n\n**任务摘要:**\n{summary}\n\n**初步概念:**\n{initialConcept}\n\n在分析过程中，请特别关注：\n1. 代码注入风险\n2. 权限管理问题\n3. 资料验证和清理\n4. 第三方依赖的安全风险\n5. 配置错误的可能性\n\n每个潜在问题请提供：\n- 问题描述\n- 影响程度（低/中/高）\n- 建议的解决方案\n\n{previousAnalysis}
```

或在 mcp.json 中配置：

```json
"env": {
  "MCP_PROMPT_ANALYZE_TASK": "## 安全导向任务分析\n\n请针对以下任务进行全面的安全分析：\n\n**任务摘要:**\n{summary}\n\n**初步概念:**\n{initialConcept}\n\n在分析过程中，请特别关注：\n1. 代码注入风险\n2. 权限管理问题\n3. 资料验证和清理\n4. 第三方依赖的安全风险\n5. 配置错误的可能性\n\n每个潜在问题请提供：\n- 问题描述\n- 影响程度（低/中/高）\n- 建议的解决方案\n\n{previousAnalysis}"
}
```

### 示例 3：简化任务列表显示

如果您觉得默认任务列表过于详细，可以简化显示：

```
# 在 .env 文档中配置
MCP_PROMPT_LIST_TASKS=# 任务概览\n\n## 待处理任务\n{tasks.pending}\n\n## 进行中任务\n{tasks.in_progress}\n\n## 已完成任务\n{tasks.completed}
```

或在 mcp.json 中配置：

```json
"env": {
  "MCP_PROMPT_LIST_TASKS": "# 任务概览\n\n## 待处理任务\n{tasks.pending}\n\n## 进行中任务\n{tasks.in_progress}\n\n## 已完成任务\n{tasks.completed}"
}
```

## 最佳实践

1. **逐步调整**：从小的变更开始，确保每次修改后系统仍能正常工作。

2. **保存配置**：将有效的环境变量配置保存到项目的 `.env.example` 文档中，方便团队成员参考。

3. **注意格式**：确保 prompt 中的换行和格式正确，特别是使用引号包裹的环境变量。

4. **测试验证**：在不同的场景下测试自定义的 prompt，确保它们在各种情况下都能正常工作。

5. **考虑任务流**：修改 prompt 时考虑整个任务流程，确保不同阶段的 prompt 保持一致性。

## 故障排除

- **环境变量未生效**：确保您已经正确设置环境变量，并在设置后重新启动应用进程。

- **格式问题**：检查环境变量中的换行符号和特殊字符是否正确转义。

- **参数替换失败**：确保您使用的参数名称与系统支持的一致，包括大小写。

- **还原默认设置**：如果自定义的 prompt 导致问题，可以删除相应的环境变量恢复默认设置。

## 附录：默认 Prompt 参考

为帮助您更好地自定义 prompt，这里提供了部分系统默认 prompt 的参考。您可以在这些基础上进行修改或扩展：

### planTask 默认 prompt 示例

```
## 任务规划指南

基于以下描述和要求，请制定一个详细的任务计划：

描述：
{description}

要求：
{requirements}

...
```

> 注意：完整的默认 prompt 内容可在项目的 `src/prompts/templates` 目录下查看相应的模板文档。



