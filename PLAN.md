# 长程更新路线图（modelcontextprotocol/typescript-sdk）

## 阶段概览
- 阶段0：已完成初步上下文扫描并记录疑问。
- 阶段1：制定长程更新策略、拆分任务、建立检查点。
- 阶段2：分批实现 SDK 更新、同步文档与测试。
- 阶段3：完成质量验证、风险复核与总结。

## 当前目标
1. 巩固基于 `StdioServerTransport` 的本地运行模式，确保所有工具与日志均在本地可控环境完成。
2. 将官方 MCP 最佳实践（结构化输出、自检脚本、速率控制、日志分级）映射到现有实现，并保持模块高内聚低耦合。
3. 构建统一的验证闭环：`npm run build`、`npm test -- --run`、`npm run handshake` 与 `mcp-inspector` 组合输出进入 `.codex/testing.md`。
4. 维持长程文档、风险台账与指标的实时同步，支持不向后兼容的局部重构。

## 近期里程碑
- M1（调研巩固）：梳理 stdio-only MCP 服务器的行业最佳实践并固化在 AGENTS/文档中。
- M2（方案冻结）：完成本地任务管理器的模块拆分方案（structuredContent、日志、服务层）。
- M3（实现阶段）：落地验证脚本、模块解耦与日志策略，确保回归通过。
- M4（收尾验收）：更新发布文档与质量指标，保证所有检查点绿灯。
- M5（记忆管理优化）：设计记忆缓存、日志裁剪与回放接口，形成 PoC 与测试方案。
- M6（协议特性对齐）：补全 `elicitation/create`、`resource_link` 支持与协议头处理，扩展握手与 inspector 检查。

## 记忆与协议工作流
- 记忆管理优化（优先级高）：完成存储策略评估、任务缓存 API 设计、回放脚本与回归测试；需要更新文档、指标与风险台账。
- 协议新特性对齐（优先级中）：实现 `elicitation` 对话扩展、资源链接响应、`MCP-Protocol-Version` 头校验；同步更新握手/inspector 脚本及契约文档。

## 检查点文件
- `TASKS.md`：维护任务队列与状态。
- `RISKS.md`：记录潜在风险与缓解措施。
- `METRICS.md`：跟踪测试覆盖率、构建状态与验证闭环进展。
- `.codex/operations-log.md`：持续登记动作与失败重试情况。

## 下一步
- 维持记忆管理基准脚本运行频率：重大改动后执行 `npm run test:memory`，并将结果同步到 `.codex/testing.md` 与 `METRICS.md`。
- 定期复核协议契约：若官方 SDK 更新或工具输出调整，更新 `docs/TOOL-OUTPUT-CONTRACTS.md` 与握手/inspect 脚本记录。
- 每月复查治理文档（AGENTS、PLAN、TASKS、RISKS），若新增需求再建立对应任务条目，当前无待办。
