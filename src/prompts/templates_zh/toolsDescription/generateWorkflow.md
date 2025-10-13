## 工具：generate_workflow

- **用途**：根据任务 ID 生成轻量工作流模板，输出 `workflow.json` 与 `workflow.md`，用于指导 Spec→Coding 执行节奏。
- **输入字段**：
  - `taskId` (必填)：目标任务的 UUID。
  - `pattern` (选填)：`serial`、`parallel` 或 `evaluator`，默认 `serial`。
  - `force` (选填)：若已存在文件时允许覆盖，默认 `false`。
- **输出**：返回生成结果摘要以及 structuredContent（含目录、文件列表与步骤概览）。
- **注意事项**：
  - 工具会在 `<DATA_DIR>/specs/<taskId>/` 下写入文件，确保目录可写。
  - 若需重复生成请带上 `force=true`，避免误覆盖现有内容。
