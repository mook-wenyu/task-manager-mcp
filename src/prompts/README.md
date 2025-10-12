# prompts 目录使用指南

## 目标与背景
- 统一存放所有提示词模板、生成器与装载逻辑，避免散落在 `docs/` 等非核心目录。
- 为 AI Agent 保持可复用、可版本控制的提示词资产，符合 `shrimp-rules.md` 的要求。

## 目录结构
- `generators/`：以 TypeScript 定义的 prompt 生成器，按工具划分文件。
- `templates_zh/` 与 `templates_en/`：Markdown 模板，按语言 + 工具分类。
- `loader.ts`：统一的模板加载与环境变量覆盖入口。
- `index.ts`：导出全部生成器，供工具模块使用。

## 建议实践
1. **模块化模板**：保持模板颗粒度（index/taskDetails 等），便于复用或逐段替换。
2. **文件命名一致**：生成器文件使用小驼峰 + 功能名；模板文件使用 kebab-case。
3. **语言独立**：中英文模板平行维护，如调整需同时更新 `templates_zh` / `templates_en`。
4. **引用资源**：默认引用 `shrimp-rules.md`、工具契约等仓内 Markdown；外部链接需标注来源与用途。
5. **环境覆盖**：通过 `MCP_PROMPT_<KEY>` 或 `_APPEND` 环境变量安全覆写，避免直接改动源码。
6. **版本化流程**：每次模板或生成器改动须同步记录到 `.codex/operations-log.md`，并在任务管理中追踪。

## 模板编写约定
- 使用 Markdown，强调命令式与步骤化指引。
- 避免硬编码时效性强的信息（日期、版本号），改以占位符参数传入。
- 保持参数命名与生成器实现一致，例如 `{description}`、`{tasksTemplate}`。
- 引入新占位符前，应在生成器中提供回退值，防止渲染失败。

## 维护流程
1. 修改前先 `rg` 检索现有模板，确认是否可复用或扩展。
2. 完成改动后运行相关工具/测试验证结构化输出。
3. 若需长期引用外部规则，优先将内容迁移到 `shrimp-rules.md` 或 `src/prompts` 子文档，再在模板内链接。
4. 变更完毕后更新 `PLAN.md`、`.codex/operations-log.md`，并通知使用该提示词的任务。

## 参考资料
- `shrimp-rules.md`
- `src/tools/task/*` 中对 prompt 生成器的调用方式
- `loader.ts` 环境变量覆写示例
