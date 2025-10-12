# 质量指标

| 指标 | 当前值 | 目标 | 备注 |
| --- | --- | --- | --- |
| 单元测试通过率 | 通过 | 100% | `npm test -- --run` 全绿，覆盖 agentMatcher 与 structuredContent 套件 |
| 构建状态 | 通过 | 通过 | `npm run build` 成功完成 |
| 版本同步进度 | 100% | 100% | structuredContent、记忆管理与协议新特性已合并，维持例行复查 |
| 文档更新覆盖 | 100% | 100% | 核心文档与治理文件在 2025-10-12 已同步完成，持续按需复核 |
| 验证闭环完整度 | 100% | 100% | 构建/单测/握手/inspect 与 memory 基准均纳入 `.codex/testing.md`，保持例行执行 |
| Stdio 最佳实践固化度 | 100% | 100% | 文档、验证脚本与日志策略均已固化 |
| 结构化日志策略 | 100% | 100% | `tool_invocation` JSON 日志已输出，等待后续监控接入 |
| 记忆管理 PoC 基准 | 压缩率58% / 命中率1.0 | 基线 >= 20% 上下文压缩效率 | `npm run test:memory` 基准：压缩率58%、命中率1.0、写入~111ms、回放~0.32ms |
| 协议新特性完成度 | 已上线（elicitation + resource_link + 校验） | 100% | `plan_task` 触发 elicitation、`research_mode` 输出 resource_link，`npm run handshake`/`inspect` 已验证 |
