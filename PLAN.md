# 长程更新路线图（modelcontextprotocol/typescript-sdk）

## 阶段概览
- **阶段A（已完成｜2025-10-11）**：完成 SDK v1.20.0 升级、structuredContent 拆分、日志/记忆策略固化，形成本地 stdio-only 运行基线。
- **阶段B（已完成｜2025-10-13）**：恢复被删除的文档与脚本，重新对齐流程文档与风险台账，构建 GA 所需资料库。
- **阶段C（历史归档｜2025-10-13）**：极简上下文引擎稳健化（token 阈值压缩 + `SafeFileWriter` 原子写入）；成果已迁出至独立项目 `D:\TSProjects\context-engine`。

## 当前状态
- 2025-10-13 完成上下文引擎稳健化后，相关源码与文档已迁移至独立项目 `D:\TSProjects\context-engine`，本仓库仅保留任务管理核心功能。
- 任务看板 T31~T33 均已交付，后续如需新目标将另行规划，当前保持看板空闲。
- `RISKS.md`、`verification.md` 等检查点对上下文引擎的记录保留作历史参考，后续变更改在新项目中维护；本仓库指标暂不新增。

## 历史里程碑
1. **基础升级与流程固化（阶段A）**  
   - 对齐 TypeScript SDK v1.20.0。  
   - 引入 structuredContent 体系、握手脚本与日志策略。  
   - 完成第一次全量构建与测试闭环。
2. **仓库恢复与对齐（阶段B）**  
   - 恢复文档、脚本与 GA 验证资料。  
   - 统一 DATA_DIR、日志策略与检查点文件，确保治理文件完备。  
   - 完成多轮构建/测试回归并记录于 `.codex/testing.md`。
3. **极简上下文引擎 MVP（阶段C 历史交付）**  
   - 落地 collector、summarizer、context/rollback MCP 工具及单测（现已迁出本仓）。  
   - 输出 `context-engine/README.md` 架构说明与日志治理草案，并在新项目中持续维护。  
   - 更新风险与指标记录，形成回滚与压缩策略草稿。

## 待决事项
- ~~T31：实现 token 阈值压缩触发器（collector 与 injector 共用），并在 `SummaryBundle` 中标注 `totalTokens` 与 `compressedAt`。~~（已完成｜2025-10-13）  
- ~~T32：封装 `SafeFileWriter` 并替换 collector state、audit 日志、会话重写的写入逻辑。~~（已完成｜2025-10-13）  
- ~~T33：完成回滚演练与文档更新，确保压缩前后可恢复。~~（已完成｜2025-10-13）

## 检查点文件维护约定
- `TASKS.md`：保留 T31~T33 的历史记录；后续上下文引擎事项改在新项目中跟踪。  
- `RISKS.md`：阶段C 相关条目保留为归档；本仓新风险按需新增。  
- `METRICS.md`：维持历史记录，若未来需要统计压缩成功率将转交新项目。  
- `.codex/operations-log.md`：继续记录本仓任务管理相关的规划、实现与验证动作。

## 下一步建议
1. 汇总阶段C 交付成果与测试记录，为后续阶段制定新目标或优化项提供输入。  
2. 若未来需要更高级的记忆策略（主题聚合等），在现有稳健基线基础上另起阶段评审。  
3. 持续同步 `verification.md`、`.codex/testing.md` 与 `RISKS.md`，确保文档与执行闭环保持最新。
