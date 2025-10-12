# 任务队列

| ID | 描述 | 状态 | 负责人 | 依赖 | 验收标准 |
| --- | --- | --- | --- | --- | --- |
| T1 | 拉取并审阅 `modelcontextprotocol/typescript-sdk` 最新代码、发布历史 | 已完成 | Codex | 无 | 本地存在仓库副本，梳理主要模块与版本更新点 |
| T2 | 收集官方 MCP TypeScript SDK 最新规范与变更 | 已完成 | Codex | T1 | 形成变更清单并在 `PLAN.md` 引用官方来源 |
| T3 | 拆分并设计代码更新计划（类型、API、示例、测试） | 已完成 | Codex | T1,T2 | 在 PLAN.md 中补齐子任务并评估风险 |
| T4 | 实施更新与测试闭环 | 已完成 | Codex | T3 | 所有目标模块完成更新且测试通过 |
| T5 | 文档与验证收尾 | 已完成 | Codex | T4 | 文档、版本日志、验证报告更新完毕 |
| T6 | 梳理 stdio-only MCP 服务器最佳实践并更新 AGENTS/文档 | 已完成 | Codex | T2,T3 | 文档明确本地运行策略、工具顺序与验证要求 |
| T7 | 将 `mcp-inspector` 纳入回归流程并脚本化握手+检查 | 已完成 | Codex | T3 | `.codex/testing.md` 记录组合命令及通过结果 |
| T8 | 拆分 `structuredContent` 工具为序列化/统计/校验模块 | 已完成 | Codex | T3 | 代码完成拆分并新增单元测试覆盖关键分支 |
| T9 | 设计结构化日志与指标输出方案 | 已完成 | Codex | T3 | `METRICS.md` 与 `RISKS.md` 更新日志策略及监控指标 |
| T10 | 记忆管理优化设计与 PoC（详见 `docs/memory-management-plan.md`） | 已完成 | Codex | T6,T8 | 基准脚本产出压缩率58%、命中率1.0，并更新文档与指标 |
| T11 | 协议新特性对齐（elicitation、resource_link、协议头，见 `docs/protocol-upgrade-plan.md`） | 已完成 | Codex | T2,T7 | `plan_task` 支持 elicitation、`research_mode` 输出 resource_link，新增协议校验及测试 |
