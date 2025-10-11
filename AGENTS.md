# Repository Guidelines

## 项目结构与模块组织
- 核心入口：`src/index.ts` 负责注册所有 MCP 工具与传输层。
- 业务模块：`src/tools/` 按任务、项目、研究、思维分类；`src/models/` 与 `data/` 管理持久化；`src/prompts/` 存放 Markdown 模板。
- 前端与服务：`src/web/` 承载可选 GUI，`public/`、`dist/` 为构建产物；`tests/` 与 `src/tools/utils/__tests__/` 收录单测样例。

## 构建、测试与开发命令
- `npm run build`：使用 TypeScript 编译并复制静态资源，生成可发布的 `dist/`。
- `npm run dev`：以 ts-node 启动开发模式，适合验证工具注册。
- `npm test -- --run`：运行 Vitest 全量测试；若仅验证结构化输出，可执行 `npx vitest run src/tools/utils/__tests__/structuredContent.test.ts`。
- `npm run handshake`：使用 SDK 官方 Client 连接 `dist/index.js` 完成 MCP 握手，输出能力声明用于回归备案。

## 代码风格与命名约定
- 语言：TypeScript/ES 模块，统一使用 2 空格缩进与 UTF-8 无 BOM。
- 命名：文件与目录采用 kebab-case；类型、枚举使用 PascalCase；函数与变量保持 camelCase。
- 工具结构化输出需经 `validateStructuredContent` 校验，新增工具请同步在 `src/tools/schemas/` 定义 Zod schema。

## 测试指引
- 测试框架：Vitest；确保新增工具至少覆盖成功与错误路径。
- 测试文件命名：与源模块同名，位于 `__tests__` 或 `tests/` 目录，扩展名 `.test.ts`。
- 覆盖要求：关键数据序列化、工具调用路径需具备断言，提交前运行 `npm test -- --run` 并记录结果至 `.codex/testing.md`。

## 提交与合并请求规范
- Commit 建议采用祈使句并指出模块，如 `feat(tools): add structuredContent schema`。
- PR 描述需包含：变更摘要、受影响的工具或文档、测试结果（命令 + 结论）、关联 Issue 或风险编号。
- 如果改动涉及文档或日志，务必同步更新 `.codex/operations-log.md`、`PLAN.md`、`RISKS.md` 等长程文件。

## 配置与安全提示
- 通过 `.env` 控制 `ENABLE_GUI`、端口等参数，示例见 `.env.example`，生产环境避免提交敏感值。
- 升级 MCP SDK 时请先对照 `docs/UPGRADE-SDK-1.20.0.md` 与 `docs/TOOL-OUTPUT-CONTRACTS.md`，确认结构化输出契约已满足再发布。
