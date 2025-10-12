# 官方 MCP 任务管理连接器评估（参考资料）

> 说明：本项目当前定位为本地 stdio 模式 MCP 服务器。以下内容仅供行业比较与未来评估使用，不构成本迭代的实施计划。

## 调研范围
- 关注具备任务/项目管理能力且由官方或主流厂商托管的远程 MCP 服务器。
- 重点分析 Asana、Atlassian（Jira/Confluence）、Linear、GitHub 四类服务的能力、接入方式与安全态势。
- 输出与 Shrimp Task Manager 现有功能的差距、复用机会与潜在风险。

## 外部连接器综述
| 服务 | 维护方 | 支持能力 | 接入要点 | 安全提示 |
| --- | --- | --- | --- | --- |
| Asana Remote Server | Asana 官方 | 任务增删查、项目视图、评论同步 | 通过 Asana Personal Access Token 与 `asana.setup` 初始化，支持过滤项目 | Beta 阶段曾暴露测试客户数据，需限制访问令牌并监控日志 citeturn0search2turn0search3 |
| Atlassian Remote server | Atlassian 官方 | Jira 问题检索、Confluence 内容查询、Opsgenie 警报 | 采用 OAuth/OIDC，建议在 Atlassian Cloud 创建专用应用与权限范围 | 官方强调以远程服务器降低网络曝露，但仍需审计授权范围 citeturn3search1 |
| Linear Remote Server | Linear 官方 | 工单浏览、评论、状态流转 | 通过 Linear API 密钥触发 `projects.list` 等路由，可指定团队 | 需遵循 Linear 的最小权限策略并启用自动化审计日志 citeturn7view0 |
| GitHub MCP Server | GitHub 官方 | Issues/PR 查询与更新、项目面板字段 | 在 `.claude_desktop_config.json` 中配置 `@modelcontextprotocol/server-github`，支持角色权限分离 | 官方示例强调遵守最小权限与 PAT 轮换策略 citeturn1search0 |

## 与 Shrimp Task Manager 的能力映射
- 本地任务编排：`src/tools/task/*.ts` 提供任务创建、拆分、查询、校验等功能，与 Asana/Jira 的任务操作高度重合。
- 任务持久化：`data/tasks.json`、`data/tasks_v2.json` 及 `src/models/` 负责存储与查询，当前为纯本地 JSON 流程。
- 项目规范与研究：`src/tools/project/`、`src/tools/research/` 提供流程化治理，与外部平台的知识库功能存在互补关系。
- 日志/验证：通过 `scripts/verify-handshake.mjs` 与 `.codex/testing.md` 进行协议验证，但缺少图形化审计与第三方同步能力。

## 参考建议（暂不执行）
- 若未来需要对接外部任务系统，可考虑为 `listTasks`、`executeTask` 等工具抽象 `TaskProvider` 接口，让本地 JSON 与远程实现共存。citeturn3view0turn3view2
- 使用远程评论或知识库功能前，应核实供应商安全记录并配置最小权限授权。citeturn0search3turn3search1

## 风险提示
- 供应商安全事件：Asana Beta 泄露及 Postmark 恶意服务器事件显示需验证来源签名并限制访问令牌作用域。citeturn0search3turn1news12
- 客户端工具漏洞：`mcp-inspector` 早期版本存在沙箱绕过，纳入流程时必须锁定 ≥0.14.1 版本并定期更新。citeturn4search1
- 数据驻留：远程服务器通常位于供应商云端，需确认符合项目数据治理策略，必要时启用企业租户或私有部署。
- 审计留痕：应结合官方日志功能与本地 `.codex/operations-log.md`，确保跨系统操作可追溯。

## 当前策略
- 保持 stdio-only MCP 服务器定位，所有任务管理逻辑在本地执行。
- 外部连接器信息仅作档案留存，后续若战略调整再依据本文件重新评估。
