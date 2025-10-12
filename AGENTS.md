# Repository Guidelines

## 项目结构与模块组织
- 核心入口：`src/index.ts` 负责注册所有 MCP 工具与传输层，默认通过 `StdioServerTransport` 运行。
- 业务模块：`src/tools/` 按任务、项目、研究、思维分类；`src/models/` 搭配运行时的 `DATA_DIR`（默认 `<项目根>/.shrimp`）负责持久化；`src/prompts/` 存放 Markdown 模板。
- 前端与服务：`src/web/` 承载可选 GUI；`public/`、`dist/` 为构建产物；`tests/` 与 `src/tools/utils/__tests__/` 收录单测样例。

## 运行模式与验证流程
- 所有环境默认使用 stdio 接入，禁止直接暴露远程网络端口。
- 发布前最小验证顺序：`npm run build` → `npm test -- --run`。
- 测试结果手动记录到 `.codex/testing.md`，若出现错误同步更新 `RISKS.md` 与 `verification.md`。
- `plan_task` 在缺失约束时会触发 `elicitInput` 询问，请根据提示补充或显式跳过。

## 构建、测试与开发命令
- `npm run build`：使用 TypeScript 编译并复制静态资源，生成可发布的 `dist/`。
- `npm run dev`：以 ts-node 启动开发模式，适合验证工具注册。
- `npm test -- --run`：运行 Vitest 全量测试；若仅验证结构化输出，可执行 `npx vitest run src/tools/utils/__tests__/structuredContent.test.ts`。

## 日志与监控
- 工具执行默认仅在错误时输出精简 stderr 文本（`[tool] error | 123ms | message`），确保日志噪音最低。
- 失败日志包含 `errorMessage` 与可选 `errorCode` 字段，建议在外部管道或脚本中解析。
- `durationMs` 采用 `performance.now()` 计算，可用于监控慢调用。
- 记忆缓存通过 MemoryStore 写入 `DATA_DIR/memory/short-term|long-term/entries.json`，可用 `memory_replay` 工具回放，设计细节见 `src/tools/memory/` 相关实现与注释。

## 代码风格与命名约定
- 语言：TypeScript/ES 模块，统一使用 2 空格缩进与 UTF-8 无 BOM。
- 命名：文件与目录采用 kebab-case；类型、枚举使用 PascalCase；函数与变量保持 camelCase。
- 工具结构化输出需经 `validateStructuredContent` 校验，新增工具请同步在 `src/tools/schemas/` 定义 Zod schema。

## 测试指引
- 测试框架：Vitest；确保新增工具覆盖成功与错误路径。
- 测试文件命名：与源模块同名，位于 `__tests__` 或 `tests/` 目录，扩展名 `.test.ts`。
- 覆盖要求：关键数据序列化、工具调用路径需具备断言，提交前运行 `npm test -- --run` 并记录结果至 `.codex/testing.md`。

## 提交与合并请求规范
- Commit 建议采用祈使句并指出模块，如 `feat(tools): add structuredContent schema`。
- PR 描述需包含：变更摘要、受影响的工具或文档、测试结果（命令 + 结论）、关联 Issue 或风险编号。
- 若改动涉及文档或日志，务必同步更新 `.codex/operations-log.md`、`PLAN.md`、`RISKS.md` 等长程文件。

## 配置与安全提示
- 通过 `.env` 控制 `DATA_DIR`、`TEMPLATES_USE` 等参数，示例见 `.env.example`，生产环境避免提交敏感值。
- 升级 MCP SDK 时请先对照 `src/tools/schemas/outputSchemas.ts` 与本文件的契约说明，确认结构化输出契约已满足再发布。
