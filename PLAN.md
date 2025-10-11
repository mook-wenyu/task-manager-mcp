# 长程更新路线图（modelcontextprotocol/typescript-sdk）

## 阶段概览
- 阶段0：已完成初步上下文扫描并记录疑问。
- 阶段1：制定长程更新策略、拆分任务、建立检查点。
- 阶段2：分批实现 SDK 更新、同步文档与测试。
- 阶段3：完成质量验证、风险复核与总结。

## 当前目标
1. 同步官方仓库现状：拉取最新 `typescript-sdk` 代码并审阅改动历史。
2. 对齐规范：根据 MCP 官方文档梳理必须支持的 API、工具和最佳实践。
3. 设计更新方案：识别需要调整的模块（类型声明、客户端、示例等），确定迭代顺序。
4. 执行与验证：逐步提交实现、补充测试、更新文档，保持可回滚。

## 近期里程碑
- M1（调研完成）：掌握官方仓库结构、核心模块与发布流程。
- M2（方案冻结）：完成任务拆分、估算工作量并补齐风险台账。
- M3（实现阶段）：按照任务顺序完成代码与文档更新，阶段性通过测试。
- M4（收尾验收）：完成全量测试、更新版本信息并生成总结报告。

## 检查点文件
- `TASKS.md`：维护任务队列与状态。
- `RISKS.md`：记录潜在风险与缓解措施。
- `METRICS.md`：跟踪测试覆盖率、构建状态。
- `.codex/operations-log.md`：持续登记动作与失败重试情况。

## 下一步
- 重构 `src/index.ts` 以采用 SDK v1.20.0 的 `registerTool` 与能力声明流程，移除旧版 `server.tool` 调用。
- 审查并更新 `src/tools/**` 的输入/输出 schema 与返回结构，确保与新版 `CallToolResult` 兼容（必要时补充 `structuredContent`）。
- 升级/校验依赖与构建脚本，执行 `npm run build`、`npm test` 并记录在 `.codex/testing.md`。
- 同步长程文件（`TASKS.md`、`RISKS.md`、`METRICS.md`、`.codex/operations-log.md`）状态，准备阶段 3 验证。