[中文版](README.md)

# Mook Task Manager MCP

> 🤖 **Local MCP server for intelligent task management** – break down complex requirements into actionable steps, preserve context across sessions, and keep agents aligned with your workflow.

<div align="center">

**[Watch Demo](https://www.youtube.com/watch?v=Arzu0lV09so)** • **[Quick Start](#-quick-start)** • **[References](#-references)**

[![smithery badge](https://smithery.ai/badge/@mook-wenyu/task-manager-mcp)](https://smithery.ai/server/@mook-wenyu/task-manager-mcp)
<a href="https://glama.ai/mcp/servers/@mook-wenyu/task-manager-mcp"><img width="380" height="200" src="https://glama.ai/mcp/servers/@mook-wenyu/task-manager-mcp/badge" alt="Mook Task Manager MCP server" /></a>

</div>

## ⚠️ SDK Upgrade Notice (2025-10-11)
- Migrated to Model Context Protocol TypeScript SDK **v1.20.0** using the new `server.registerTool` / `registerPrompt` APIs.
- All tools now expose `structuredContent`; the canonical schemas live in `src/tools/schemas/outputSchemas.ts`.
- Default capability declaration enables `tools` and `logging`; extend prompts/resources via `server.registerCapabilities` when needed.
- Regression suite: `npm run build`, `npm test -- --run`.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm (or compatible package manager)
- MCP-enabled AI client (Claude Code, Cline, Claude Desktop, ...)

### Installation
```bash
git clone https://github.com/mook-wenyu/task-manager-mcp.git
cd task-manager-mcp
npm install
npm run build
```

### Configure Claude Code
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
Launch with `claude --dangerously-skip-permissions --mcp-config .mcp.json`.

### Other Clients
- **Cline (VS Code Extension)**: configure `cline.mcpServers` in `settings.json`.
- **Claude Desktop**: add entries in `%APPDATA%/Claude/claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS).

## 💡 Highlights
- **Task Planning** – structured decomposition, dependency tracking, and execution guidance.
- **Closed-loop execution** – plan/execute/verify/reflect tools aligned with `.codex` workflow files.
- **Structured outputs** – every tool returns `structuredContent` validated by shared schemas.
- **Local persistence** – task state now lives under `.shrimp/` inside the active project root, keeping workspaces isolated.
- **Memory cache** – the built-in MemoryStore trims short-term context and exposes the `memory_replay` tool for quick retrospectives.
- **Interactive elicitation** – `plan_task` can prompt for missing constraints via `elicitInput`, keeping plans grounded.
- **Minimal interaction surface** – internal GUI/Task Viewer have been retired; the workflow focuses on MCP tooling and CLI automation.
## 📚 References
- [📝 Repository Guidelines](AGENTS.md)
- Structured output contracts: see `src/tools/schemas/outputSchemas.ts`
- SDK v1.20.0 upgrade highlights: documented in this README and commit history
- External MCP connector research: summarized in `PLAN.md` and `RISKS.md`

## 🎯 Typical Scenarios
<details>
<summary><b>Feature Development</b></summary>

```
Plan: "plan task: add user authentication with JWT"
Execute: "execute task"
```
</details>

<details>
<summary><b>Bug Fixing</b></summary>

```
Plan: "plan task: fix memory leak"
Continuous: "continuous mode"
```
</details>

<details>
<summary><b>Research & Learning</b></summary>

```
Research: "research: compare React vs Vue"
Plan: "plan task: migrate component"
```
</details>

## 🛠️ Environment Variables
```bash
DATA_DIR=/path/to/data/storage  # required
TEMPLATES_USE=zh                # optional template set (zh, en)
```
- If `DATA_DIR` is omitted, the server defaults to `<project root>/.shrimp`. This is a **breaking change**—legacy installs that wrote to `./.shrimp` at the module root will not be auto-migrated; copy data manually if you still need it.

## 📋 Common Commands
| Command | Description |
|---------|-------------|
| `npm run build` | TypeScript build + asset copy |
| `npm run dev` | ts-node development server |
| `npm test -- --run` | Run all Vitest suites |

## 🤝 Contributing

Check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Please keep `.codex` files, verification logs, and documentation in sync with any change.

## 📄 License
Licensed under [MIT](LICENSE).

## 🌟 Credits
Created by [mook-wenyu](https://github.com/mook-wenyu) and the community.

---

<p align="center">
  <a href="https://github.com/mook-wenyu/task-manager-mcp">GitHub</a> •
  <a href="https://github.com/mook-wenyu/task-manager-mcp/issues">Issues</a> •
  <a href="https://github.com/mook-wenyu/task-manager-mcp/discussions">Discussions</a>
</p>
