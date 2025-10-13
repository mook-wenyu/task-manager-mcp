> 说明：以下记录包含上下文引擎相关验证，2025-10-13 后的持续维护已迁移至独立项目 `D:\TSProjects\context-engine`，本仓内容保留为历史参考。

## 2025-10-08 繁体转简体验证
- 历史记录：曾使用 `py scripts/traditional_scan.py --root . --output reports/traditional_scan.md` 确认 `files_with_traditional=0`，该脚本现已移除，如需复验需另行执行扫描。
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

## 2025-10-11 MCP 互操作验证
- 手动使用官方 SDK Client + Stdio 连接服务器，完成 `initialize` 与 `notifications/initialized`，确认返回 `Mook Task Manager MCP 1.0.0` 及 `tools.listChanged=true`、`logging`、`prompts`、`resources` 能力。
- 同日使用 `@modelcontextprotocol/inspector` CLI（`tools/list`）比对结构化工具清单与 schema，结果一致。
- 相关输出均已登记 `.codex/testing.md`，脚本化流程已在 2025-10-12 移除，未来需按需手动复核。

## 2025-10-12 日志策略精简复盘
- 工具执行时仅在错误场景写入精简 stderr 文本 "[tool] error | 123ms | message"，成功路径不再输出 JSON。
- `src/utils/structuredLogger.ts` 保留统一入口，兼容后续扩展开关；如需详细追踪可在外部脚本包裹重建结构化日志。
- 评估结果：降低 stdout/stderr 噪音，满足极简 MCP 定位。若未来需要集中监控，可在部署层添加可选日志适配器。

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
- 手动复核握手日志，确认新增 `memory_replay` 工具后能力声明更新，`tools.listChanged` 返回 `true`。
- 使用 `@modelcontextprotocol/inspector` CLI（`tools/list`）再次比对 schema，结构化校验通过。
- 结果同步至 `.codex/testing.md`，作为 T10/T11 后续迭代的基础基线。

## 2025-10-12 ESLint 与 DATA_DIR 自检
- 新增 `.eslintrc.cjs` 与 `npm run lint`，执行结果通过（参见 `.codex/testing.md`），确保现有代码与历史例外规则兼容。
- `src/models/taskModel.ts` 去除 Git 初始化逻辑，`.shrimp/` 目录清理 `.git` 与 `.gitignore`，并在 `shrimp-rules.md` 补充数据目录规范。
- 运行 `npm run build` 与 `npm test -- --run` 均通过，验证 lint/构建/测试闭环无回归。

## 2025-10-12 极简工作流回归
- 在移除 GUI/Task Viewer 与精简日志后再次执行 `npm run lint`、`npm run build`、`npm test -- --run`，结果均通过。
- `.codex/testing.md` 已记录最新命令输出，作为后续极简形态的基线数据。

## 2025-10-12 README Codex 配置验证
- 运行 `npm run build`，确认新增 Codex CLI 配置示例后 TypeScript 构建通过，产物已刷新。
- 运行 `npm test -- --run`，全量 Vitest 46 项断言通过，确保文档更新未引入回归。
- 测试记录已追加至 `.codex/testing.md`，用于追踪文档更新后的验证轨迹。
