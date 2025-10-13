# 任务队列

| ID | 描述 | 状态 | 负责人 | 依赖 | 验收标准 |
| --- | --- | --- | --- | --- | --- |
| T31 | 实现 token 阈值压缩触发器（collector/injector 共用） | completed | Codex | 既有 collector/summarizer | 当会话 ≥320k token 自动裁剪，并在 SummaryBundle 标注 totalTokens/compressedAt |
| T32 | 封装 SafeFileWriter 并替换所有文件写入 | completed | Codex | T31 | state/audit/会话写入均使用安全写入，异常不破坏原文件 |
| T33 | 压缩回滚演练与文档更新 | completed | Codex | T31、T32 | 完成一次压缩→注入→回滚演练并更新 README/verification |

> 注：T31~T33 为上下文引擎历史任务，当前实现与后续维护已迁移到独立项目 `D:\TSProjects\context-engine`，本仓无需继续跟踪。
