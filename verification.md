## 2025-10-08 繁体转简体验证
- 已运行 `py scripts/traditional_scan.py --root . --output reports/traditional_scan.md`，确认 `files_with_traditional=0`。
- 抽检转换文件：`src/public/style.css`、`system.md`、`tools/task-viewer` 相关组件均为简体。
- 剩余风险：若后续新增内容含繁体，需重新执行扫描脚本。

## 2025-10-11 SDK v1.20.0 工具注册改造自检
- 已运行 `npm run build`，TypeScript 编译通过并生成最新 `dist` 产物。
- 尝试执行 `npm test -- --run`，`src/utils/agentMatcher.test.ts` 仍有 3 项历史断言失败（记录于 `.codex/testing.md` 和 `RISKS.md` 的 R5）。
- 经人工检查 `src/index.ts`，工具注册已切换为 `server.registerTool` 并加载描述模版，无旧版 `server.tool` 调用残留。
- 剩余风险：需后续修复 agentMatcher 测试以恢复完整回归。

## 2025-10-11 结构化输出自检
- 通过 `TOOL_STRUCTURED_SCHEMAS` 校验所有工具 `structuredContent` 输出，新增 `validateStructuredContent` 包装。
- 工具端已引入 `structuredContent` 字段，手工抽测 plan/list/execute/verify/query/clear 流程输出符合契约。
- 新增 Vitest `structuredContent.test.ts` 验证序列化辅助方法；完整回归仍受 agentMatcher 历史用例阻塞。

## 2025-10-11 MCP 握手验证
- 运行 `npm run handshake`，脚本使用 SDK Client + Stdio 传输完成 `initialize` 与 `notifications/initialized`。
- 服务器返回 `Shrimp Task Manager 1.0.0`，能力包含 `tools.listChanged=true`、`logging`、`prompts`、`resources`。
- 未观察到 stderr 异常输出；结果已登记 `.codex/testing.md`。

## 2025-10-11 MCP Inspector 验证
- 运行 `npm run inspect`（默认 `tools/list`），CLI 输出结构化工具清单并与 schema 校验结果一致。
- 结果已登记 `.codex/testing.md`，后续可根据需要增加 `--method` 参数验证其它接口。

## 2025-10-11 结构化日志策略
- 工具执行日志以 `tool_invocation` JSON 结构输出，包含 `toolName`、`status`、`durationMs`、可选 `errorCode`。
- 新增日志模块位于 `src/utils/structuredLogger.ts`，由 `src/index.ts` 在每次工具调用后写入。
- 评估结果：当前部署环境以本地 stdio 为主，暂不接入外部日志管道；后续若需集中监控，可直接采集标准输出 JSON 并接入 APM/ELK。

## 2025-10-11 structuredContent 校验复盘
- 现有 `validateTask` 确保任务具备 id/name/status，并校验状态在枚举范围内。
- 暂未发现必须补充的约束；若未来需要，可新增对依赖 ID、相关文件路径与时间戳格式的校验并扩展 Vitest 覆盖。

## 2025-10-11 Stdio-only 战略复盘
- 联网调研确认：项目坚持本地 stdio 运行模式，远程 MCP 服务器仅作为行业参考，不纳入当前迭代。
- 后续重点：T8 推进 structuredContent 解耦；T9 设计日志策略并补充指标。
- 验收条件：完成 T8-T9 后，在本文件新增相应验证记录，并确保 `.codex/testing.md` 与 `METRICS.md` 反映闭环数据。

## 2025-10-12 agentMatcher 回归确认
- 运行 `npm test -- --run`，历史断言全部通过，`.codex/testing.md` 已记录结果，`RISKS.md` 中 R5 标记为已缓解。
- 审查 `src/utils/agentMatcher.ts`，确认匹配顺序先比较 `agent.type`，再以 `capabilities` 补充判断。
- 未再观察到握手或工具注册异常，后续保持例行回归。

## 2025-10-12 MemoryStore & 回放工具自检
- 新增 `FileSystemMemoryStore`，分别将短期记忆写入 `data/memory/short-term/entries.json`，高优先级记忆同步至 `long-term`。
- 运行 `npm test -- --run`，新增 `memoryStore.test.ts` 覆盖裁剪、长短期写入与标签过滤，结果通过并记录在 `.codex/testing.md`。
- 新增 `memory_replay` 工具返回结构化记忆条目，schema 已在 `TOOL_STRUCTURED_SCHEMAS` 注册并通过 Vitest 校验。

## 2025-10-12 MCP 能力回归
- 运行 `npm run handshake`，确认新增 `memory_replay` 工具后能力声明更新，`tools.listChanged` 返回 `true`。
- 运行 `npm run inspect`，Inspector 输出包含 `taskManager.memoryReplay` schema，结构化校验通过。
- 结果同步至 `.codex/testing.md`，作为 T10/T11 后续迭代的基础基线。
