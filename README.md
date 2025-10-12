[English Version](README-en.md)

# MCP Shrimp 任务管理器

> 🦐 **面向智能体的本地任务管理 MCP 服务器** —— 帮助代理将复杂需求拆解成可执行步骤、保留上下文，并在迭代中保持风格一致与流程闭环。

<div align="center">
  
[![Shrimp Task Manager Demo](docs/yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

**[观看演示视频](https://www.youtube.com/watch?v=Arzu0lV09so)** • **[快速上手](#-快速上手)** • **[文档索引](#-文档索引)**

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)
<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager"><img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" /></a>

</div>

## ⚠️ SDK 升级提示（2025-10-11）
- 已完成 Model Context Protocol TypeScript SDK **v1.20.0** 迁移，全面采用 `server.registerTool`/`registerPrompt` 新接口。
- 全部工具输出均提供 `structuredContent` 与 JSON Schema，对应契约收录于 `docs/TOOL-OUTPUT-CONTRACTS.md`。
- 默认能力声明含 `tools`、`logging`；如需扩展 prompts/resources，请在 `src/index.ts` 中调用 `server.registerCapabilities`。
- 回归命令：`npm run build`、`npm test -- --run`、`npm run handshake`、`npm run inspect`。详情见 `docs/HANDSHAKE-VERIFICATION.md`。

## 🚀 快速上手

### 环境需求
- Node.js 18+
- npm 或其他兼容包管理器
- 支持 MCP 协议的 AI 客户端（Claude Code、Cline、Claude Desktop 等）

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/cjo4m06/mcp-shrimp-task-manager.git
cd mcp-shrimp-task-manager

# 安装依赖
npm install

# 构建产物	npm run build
```

### 客户端配置示例（Claude Code）
```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/your/shrimp_data",
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```
在项目目录执行：`claude --dangerously-skip-permissions --mcp-config .mcp.json`

### 其他客户端
- **Cline (VS Code 插件)**：在 `settings.json` 中配置 `cline.mcpServers`。
- **Claude Desktop**：在 `%APPDATA%/Claude/claude_desktop_config.json` 或 `~/Library/Application Support/Claude/claude_desktop_config.json` 中加入配置。

## 💡 核心特性
- **任务规划**：基于项目上下文自动拆解需求，提供结构化计划与依赖关系。
- **执行闭环**：提供计划、执行、验收、反思等工具，配合 `.codex` 工作流实现随改随测。
- **结构化输出**：所有工具返回 `structuredContent`，便于客户端解析与校验。
- **本地持久化**：任务数据默认存储在 `data/` 目录，可跨会话保留状态。
- **记忆缓存**：内建 MemoryStore 自动裁剪短期记忆并支持 `memory_replay` 工具回放，便于长程任务复盘。
- **交互补全**：`plan_task` 缺少约束时通过 elicitation 引导补充输入，规划信息更完整。
- **可选 GUI**：启用 `ENABLE_GUI=true` 后可访问轻量级 Web 面板或 Task Viewer。

## 🖥️ Web 与可视化
- **Task Viewer**（React 应用）
  ```bash
  cd tools/task-viewer
  npm install
  npm run start:all
  # 浏览器访问 http://localhost:5173
  ```
- **轻量 GUI**：在 `.env` 设置 `ENABLE_GUI=true`，运行服务器后自动开启。

## 📚 文档索引
- [📝 Repository Guidelines](AGENTS.md)
- [🖐️ Handshake Verification](docs/HANDSHAKE-VERIFICATION.md)
- [📦 Structured Output Contracts](docs/TOOL-OUTPUT-CONTRACTS.md)
- [⬆️ SDK v1.20.0 Upgrade Notes](docs/UPGRADE-SDK-1.20.0.md)
- [🗃️ Archived Research – External MCP Connectors](docs/archive/OFFICIAL-CONNECTOR-EVALUATION.md)

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
ENABLE_GUI=false        # 是否开启 Web GUI
WEB_PORT=3000           # GUI 服务端口
PROMPT_LANGUAGE=en      # 模板语言（en、zh 等）
```

## 📋 常用命令
| 命令 | 说明 |
|------|------|
| `npm run build` | TypeScript 编译与资源复制 |
| `npm run dev` | 以 ts-node 启动开发模式 |
| `npm test -- --run` | 运行所有 Vitest 测试 |
| `npm run handshake` | 验证握手流程（Stdio 客户端） |
| `npm run inspect` | 使用 MCP Inspector CLI 检查能力声明 |

## 🤝 贡献

欢迎通过 Issue、PR 或讨论区参与建设。提交前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 并确保 `.codex` 与文档同步。

## 📄 许可证

项目基于 [MIT License](LICENSE)。

## 🌟 致谢

由 [cjo4m06](https://github.com/cjo4m06) 创建并由社区共同维护。

---

<p align="center">
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager">GitHub</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/issues">Issues</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/discussions">Discussions</a>
</p>
