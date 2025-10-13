# split_tasks 健康检查步骤

## 目标
- 验证 `split_tasks` 在接收到空任务列表时会返回 `E_VALIDATE`。
- 确认错误信息能引导操作者补充任务数据。
- 记录结果以便后续回顾。

## 前置要求
- 已阅读 `AGENTS.md` 中的「split_tasks 操作守则」。
- 本地具备调用 Task Manager MCP 工具的环境。

## 操作步骤
1. 运行一次空任务测试：
   ```json
   {
     "updateMode": "append",
     "tasksRaw": "[]"
   }
   ```
   - 期望结果：工具返回结构化错误，`errorCode` 为 `E_VALIDATE`，错误信息提示任务数组不能为空。
2. 记录检查结果：在健康检查日志中写明错误码、时间以及处理结论（输入无效，需补齐任务）。
3. 运行一次有效样例确认恢复：
   ```json
   {
     "updateMode": "append",
     "tasksRaw": "[{\"name\":\"health-check\",\"description\":\"确认校验规则\",\"implementationGuide\":\"步骤列示\"}]"
   }
   ```
   - 期望结果：调用成功，返回 `success: true`。

## 处理要求
- 遇到 `E_VALIDATE` 必须视为输入错误，按照错误信息补齐 payload 后重试。
- 若错误信息缺失或与预期不符，立即记录风险并同步到任务系统。
- 健康检查完成后，将结果归档到当日自检记录中。
