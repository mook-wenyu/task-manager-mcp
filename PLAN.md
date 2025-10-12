# 长程更新路线图（modelcontextprotocol/typescript-sdk）

## 阶段概览
- **阶段A（已完成｜2025-10-11）**：完成 SDK v1.20.0 升级、structuredContent 拆分、日志/记忆策略固化，形成本地 stdio-only 运行基线。
- **阶段B（进行中｜2025-10-12）**：恢复被删除的文档与脚本，重新对齐 Task Manager 与文档体系，确保 GA 任务具备可执行依据。
- **阶段C（待规划）**：聚焦命令行工作流稳健性、日志/验证体系与长程记忆治理，摒弃 GUI/Task Viewer 相关交付，收敛为极简 MCP 形态。

## 阶段B：仓库基线恢复
1. **文档/脚本恢复（完成）**：从 `origin/main` 还原 `docs/*`、`reports/traditional_scan.md`、`scripts/*.mjs|.ts|.py`，确保结构化契约、协议升级、握手验证、记忆管理等资料齐备。
2. **任务体系对齐（进行中）**：
   - 审核 Task Manager 中的 2025-10-12-94~97 任务链，补充描述、验收标准与依赖文档链接。
   - 更新 `PLAN.md`/`TASKS.md`/`RISKS.md`/`METRICS.md` 使其与 Task Manager 一致，并反映文档恢复结果。
   - 清点脚本与文档新旧差异，记录需重写或补充的章节。
3. **迭代拆分（待执行）**：输出 Stage C 的首批可执行迭代（例如 GUI 端 Plan 编辑验收脚本、事件总线 Schema 校验等）。

## 阶段C：GA 交付准备（待启动）
- **核心工作流稳健性**：持续完善计划/执行/验证闭环的提示词与错误处理，确保存储与日志策略可追溯。
- **事件总线治理 GA（Task 2025-10-12-95）**：补齐 Schema/背压/告警文档与压测脚本，刷新 Prometheus 指标与 Runbook。
- **Golden Path 门户（Task 2025-10-12-96）**：基于调研结论产出门户结构、文档入口与采用度指标。
- **MVP 闭环 + Day-2 运维（Task 2025-10-12-97）**：整理验收包、回滚 Runbook、OPS 指标及测试记录。

## 检查点文件
- `TASKS.md`：维护阶段B/B后的任务状态（新增 T12~T15 以映射 Task Manager 任务链）。
- `RISKS.md`：跟踪“基线缺失”“GA 验收脚本漂移”等新风险，并更新缓解策略。
- `METRICS.md`：记录 lint/build/test 结果、GA 准备指标（GUI 覆盖率、事件总线延迟、Golden Path 采用率、运维演练频次）。
- `docs/`、`scripts/`：恢复后的文档与脚本需与最新流程一致，修改后同步到上述检查点文件。
- `.codex/operations-log.md`：持续登记恢复与迭代拆分动作。

## 下一步
1. 更新 `TASKS.md` 与 Task Manager，使阶段B/B后的任务条目一致（新增/标记 T12~T15），并移除 GUI/Task Viewer 相关迭代。
2. 在 `RISKS.md` 新增“文档恢复后仍存在信息缺口”的风险，并拟定补救措施。
3. 补写 `METRICS.md` 与 `verification.md` 中关于文档恢复与 lint/build/test 成功的记录。
4. 拆解 Stage C 首个迭代（聚焦日志、记忆与 CLI 流程），并在 Task Manager 中创建对应子任务。
