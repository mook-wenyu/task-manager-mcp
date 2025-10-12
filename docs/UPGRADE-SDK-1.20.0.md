# SDK v1.20.0 升级说明（2025-10-11）

> 本文记录将 Shrimp Task Manager 迁移至 Model Context Protocol TypeScript SDK v1.20.0 的关键改动、回归要求与剩余风险，供后续维护参考。

## 适配目标
- 使用 `server.registerTool` / `registerPrompt` 新接口，对齐官方能力声明流程。
- 确保所有工具输入 schema 继续通过 Zod 校验，并满足新版 JSON Schema 序列化要求。
- 建立结构化输出约束，避免旧版 `content` 返回格式造成协议校验失败。

## 关键改动
1. `src/index.ts`
   - 所有工具通过 `registerTool` 注册，描述模板由 `loadPromptFromTemplate` 注入 `description` 字段。
   - 默认公开 `tools` 与 `logging` 能力，如需扩展 prompts/resources，请调用 `server.registerCapabilities`。
   - GUI 初始化失败时输出中文错误日志，便于 MCP 客户端排查。
2. 工具实现
   - 若工具未来定义 `outputSchema`，需返回 `structuredContent`；仅返回文本时保持 `content` 字段即可。
   - 建议在工具模块内补充 `structuredContent` 示例，以便测试复用。

## 结构化输出实现（2025-10-11）
- 新增 `src/tools/schemas/`，集中维护工具 `structuredContent` Zod schema 与 JSON Schema 导出。
- 各业务工具在返回值中补充 `structuredContent`，并使用 `validateStructuredContent` 统一校验。
- 新增 `src/tools/utils/structuredContent/` 拆分序列化、统计、校验模块，并提供对应用例。
- 文档 `docs/TOOL-OUTPUT-CONTRACTS.md` 已更新为“已实现”状态。

## 回归检查
- `npm run build`：TypeScript 编译通过（2025-10-11 已验证）。
- `npm test -- --run`：所有 Vitest 断言通过（含 agentMatcher 套件）。
- MCP 客户端冒烟：执行 `npm run handshake`，确保握手成功并记录服务器能力（详情见 `docs/HANDSHAKE-VERIFICATION.md`）。
- `npm run inspect`：通过 `@modelcontextprotocol/inspector` CLI 校验工具列表与 structuredContent 声明。

## 剩余风险
- 若客户端依赖旧版 `server.tool` 注册结果，需同步更新至 v1.20.0 兼容客户端版本。

## 后续建议
- 增补一个返回 `structuredContent` 的端到端测试样例，保证输出约束长期生效。
- 根据客户端兼容情况，评估是否提供迁移脚本或 FAQ。
