[English Version](README-en.md)

# Mook Task Manager MCP

> 🤖 **面向智能体的本地任务管理 MCP 服务器** —— 帮助代理将复杂需求拆解成可执行步骤、保留上下文，并在迭代中保持风格一致与流程闭环。

<div align="center">

**[观看演示视频](https://www.youtube.com/watch?v=Arzu0lV09so)** • **[快速上手](#-快速上手)** • **[参考指引](#-参考指引)**

[![smithery badge](https://smithery.ai/badge/@mook-wenyu/task-manager-mcp)](https://smithery.ai/server/@mook-wenyu/task-manager-mcp)
<a href="https://glama.ai/mcp/servers/@mook-wenyu/task-manager-mcp"><img width="380" height="200" src="https://glama.ai/mcp/servers/@mook-wenyu/task-manager-mcp/badge" alt="Mook Task Manager MCP server" /></a>

</div>

## ⚠️ SDK 升级提示（2025-10-11）
- 已完成 Model Context Protocol TypeScript SDK **v1.20.0** 迁移，全面采用 `server.registerTool`/`registerPrompt` 新接口。
- 全部工具输出均提供 `structuredContent` 与 JSON Schema，对应契约定义集中在 `src/tools/schemas/outputSchemas.ts`。
- 默认能力声明含 `tools`、`logging`；如需扩展 prompts/resources，请在 `src/index.ts` 中调用 `server.registerCapabilities`。
- 回归命令：`npm run build`、`npm test -- --run`。

## 🚀 快速上手

### 环境需求
- Node.js 18+
- npm 或其他兼容包管理器
- 支持 MCP 协议的 AI 客户端（Claude Code、Cline、Claude Desktop 等）

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/mook-wenyu/task-manager-mcp.git
cd task-manager-mcp

# 安装依赖
npm install

# 构建产物	npm run build
```

### 客户端配置示例（Claude Code）
```json
{
  "mcpServers": {
    "mook-task-manager": {
      "command": "node",
      "args": ["/path/to/task-manager-mcp/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/your/data_dir",
        "TEMPLATES_USE": "zh"
      }
    }
  }
}
```
在项目目录执行：`claude --dangerously-skip-permissions --mcp-config .mcp.json`

### 客户端配置示例（Codex CLI）
```toml
[mcp_servers.mook-task-manager]
command = "node"
args = ["/path/to/task-manager-mcp/dist/index.js"]

[mcp_servers.mook-task-manager.env]
DATA_DIR = "/path/to/your/data_dir"
TEMPLATES_USE = "zh"
```
将上述片段写入 `~/.codex/config.toml`（或自定义 `--config` 路径），并在首次使用前运行 `npm run build` 生成 `dist/index.js`。请将示例路径替换为本地绝对路径，Codex CLI 会通过 stdio 启动该 MCP 服务器并加载环境变量，详见 [Codex MCP 配置文档](https://developers.openai.com/docs/agents/reference/codex#mcp-server-configuration)。

### 其他客户端
- **Cline (VS Code 插件)**：在 `settings.json` 中配置 `cline.mcpServers`。
- **Claude Desktop**：在 `%APPDATA%/Claude/claude_desktop_config.json` 或 `~/Library/Application Support/Claude/claude_desktop_config.json` 中加入配置。

## 💡 核心特性
- **任务规划**：基于项目上下文自动拆解需求，提供结构化计划与依赖关系。
- **执行闭环**：提供计划、执行、验收、反思等工具，配合 `.codex` 工作流实现随改随测。
- **结构化输出**：所有工具返回 `structuredContent`，便于客户端解析与校验。
- **本地持久化**：任务数据默认存储在当前项目根目录下的 `.shrimp/`，可跨会话保留状态并避免不同仓库互相污染。
- **记忆缓存**：内建 MemoryStore 自动裁剪短期记忆并支持 `memory_replay` 工具回放，便于长程任务复盘。
- **交互补全**：`plan_task` 缺少约束时通过 elicitation 引导补充输入，规划信息更完整。
- **极简交互**：摒弃内置 GUI/Task Viewer，专注 MCP 工具链与命令行工作流。
## 📚 参考指引
- [📝 Repository Guidelines](AGENTS.md)
- 结构化输出契约：详见源码 `src/tools/schemas/outputSchemas.ts`
- SDK v1.20.0 升级说明：参阅 `README.md` 本节与提交历史
- 外部 MCP 连接器调研：可参考 `PLAN.md` 与 `RISKS.md` 中的摘要

## 🎯 常见使用场景
<details>
<summary><b>功能开发</b></summary>

```
Plan: "plan task: add user authentication with JWT"
Execute: "execute task"
```
</details>

<details>
<summary><b>缺陷修复</b></summary>

```
Plan: "plan task: fix memory leak"
Continuous: "continuous mode"
```
</details>

<details>
<summary><b>技术调研</b></summary>

```
Research: "research: compare React vs Vue"
Plan: "plan task: migrate component"
```
</details>

## 🛠️ 环境变量
```bash
# 必填
DATA_DIR=/path/to/data/storage

# 可选
TEMPLATES_USE=zh        # 模板语言（zh、en）
```
- 未显式设置 `DATA_DIR` 时，服务器会默认使用 `<项目根>/.shrimp`。该行为**不再与旧版兼容**：以前写入模块根目录 `./.shrimp` 的数据不会自动迁移，若需保留请手动复制到对应项目目录。

## 📋 常用命令
| 命令 | 说明 |
|------|------|
| `npm run build` | TypeScript 编译与资源复制 |
| `npm run dev` | 以 ts-node 启动开发模式 |
| `npm test -- --run` | 运行所有 Vitest 测试 |

## 🤝 贡献

欢迎通过 Issue、PR 或讨论区参与建设。提交前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 并确保 `.codex` 与文档同步。

## 📄 许可证

项目基于 [MIT License](LICENSE)。

## 🌟 致谢

由 [mook-wenyu](https://github.com/mook-wenyu) 创建并由社区共同维护。

---

<p align="center">
  <a href="https://github.com/mook-wenyu/task-manager-mcp">GitHub</a> •
  <a href="https://github.com/mook-wenyu/task-manager-mcp/issues">Issues</a> •
  <a href="https://github.com/mook-wenyu/task-manager-mcp/discussions">Discussions</a>
</p>
