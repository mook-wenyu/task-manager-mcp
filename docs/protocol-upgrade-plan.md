# 协议新特性实施计划（T11）

## 目标概述
- 对齐 MCP 2025-06-18 规范：实现 `elicitation/create`、`resource_link`、`MCP-Protocol-Version` 头校验。
- 确保所有新能力在握手（`npm run handshake`）与 inspector（`npm run inspect`）中正确上报，并通过结构化契约校验。
- 保持 STDIO 模式运作，确认无需引入 OAuth；若未来切换 HTTP，再按规范实施资源服务器安全策略。

## 待实现能力
1. **Elicitation API**
   - Server 端实现 `server.on("elicitation.create")` 处理器，允许工具在执行过程中请求额外输入。
   - 更新工具层：`task-manager` 套件在缺少关键参数时触发 elicitation，定义交互协议（提示语、需要字段）。
2. **Resource Link 响应**
   - 在适合返回外部参考的工具（如 `researchMode`）增加 `resource_link` 输出，提供 `uri`、`mimeType`、`title` 字段。
   - 更新 `docs/TOOL-OUTPUT-CONTRACTS.md` 描述新结构。
3. **协议头校验**
   - 在传输层（`src/index.ts`）增加 `MCP-Protocol-Version` 检查逻辑，与 SDK 版本比对；不匹配时返回明确错误信息。

## 实施步骤
| 步骤 | 内容 | 产出 |
| --- | --- | --- |
| S1 | 设计接口与 schema：在 `src/tools/schemas/` 扩充 elicitation 输入、resource_link 输出 | Schema 更新与单测 |
| S2 | 实现 server 端监听与工具适配 | 代码改动 + 新工具用例 |
| S3 | 更新握手脚本：`scripts/verify-handshake.mjs` 输出新能力字段 | 脚本改动与说明文档 |
| S4 | 扩展 inspector 检查：新增对 `resource_link`、`elicitation` 的断言 | `npm run inspect` 结果截图/日志 |
| S5 | 回归测试：运行构建、单测、handshake、inspect，记录结果 | `.codex/testing.md` 更新 |

## 验证策略
- 单元测试：覆盖新 schema 与处理器逻辑。
- 集成测试：模拟客户端调用触发 elicitation 与 resource_link，验证响应结构。
- 手动验证：通过官方 MCP Client（Claude Code 或 Cline）进行一次冒烟流程，确认交互体验。

## 风险与预案
- **客户端兼容性**：旧客户端可能忽略新能力 ⇒ 在文档中说明最小客户端版本。
- **协议头错误**：若第三方客户端缺失协议头 ⇒ 提供回退提示但允许继续（警告级别）。
- **资源链接安全**：限制允许返回的协议（https/file），并在资源描述中注明来源。

## 时间表
- M6.1：完成 schema 与接口设计（2025-10-16 前）。
- M6.2：实现处理器与工具适配，完成单测（2025-10-20 前）。
- M6.3：握手/inspector 扩展发布并更新文档（2025-10-22 前）。

## 当前进度
- 2025-10-12：在 `plan_task` 引入 `elicitInput` 交互逻辑；`research_mode` 支持 `resource_link` 输出并更新 schema。
- 2025-10-12：`validateProtocolVersion` 校验头信息，缺失或不支持版本时报错；新增单元测试与回归脚本记录。
- 2025-10-12：`npm run handshake`、`npm run inspect` 已验证新能力，结果记录于 `.codex/testing.md` 与 `verification.md`。
