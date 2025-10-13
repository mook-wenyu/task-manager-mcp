## 工具：render_role_prompt

- **用途**：为指定任务生成角色分工提示，写入 `<DATA_DIR>/specs/<taskId>/roles.json`。
- **输入字段**：
  - `taskId` (必填)：目标任务的 UUID。
  - `pattern` (选填)：与工作流匹配的模式，默认 `serial`。
  - `force` (选填)：是否覆盖已存在的角色文件，默认 `false`。
- **输出**：返回角色摘要与 structuredContent，其中包含角色数组及文件位置。
- **注意事项**：
  - 角色提示与工作流模式相互呼应，建议先生成工作流再生成角色。
  - 若已有自定义角色定义，使用 `force=true` 才会覆盖旧内容。
