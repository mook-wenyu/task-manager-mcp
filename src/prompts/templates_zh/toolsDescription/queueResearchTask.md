## 工具：queue_research_task

- **用途**：根据任务的 openQuestions 生成 `.shrimp/specs/<taskId>/open-questions.json` 与 `research.md`，并为每个问题排队调研子任务。
- **输入字段**：
  - `taskId` (必填)：目标任务的 UUID。
  - `questions` (选填)：待澄清问题列表，若省略则尝试读取既有 `open-questions.json`。
  - `overwrite` (选填)：是否覆盖既有文件，默认 `false`。
- **输出**：返回写入文件路径、新建任务 ID，以及结构化的 question 列表。
- **注意事项**：
  - 建议在执行前先运行 `plan_task` 获取最新 openQuestions。
  - 若重复执行会跳过已存在的同名调研任务。*** End Patch
