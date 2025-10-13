[中文版](README.md)

# Mook Task Manager MCP

> 🤖 **Local MCP server for intelligent task management** – break down complex requirements into actionable steps, preserve context across sessions, and keep agents aligned with your workflow.

<div align="center">

**[Watch Demo](https://www.youtube.com/watch?v=Arzu0lV09so)** • **[Quick Start](#-quick-start)** • **[References](#-references)**

[![smithery badge](https://smithery.ai/badge/@mook-wenyu/task-manager-mcp)](https://smithery.ai/server/@mook-wenyu/task-manager-mcp)
<a href="https://glama.ai/mcp/servers/@mook-wenyu/task-manager-mcp"><img width="380" height="200" src="https://glama.ai/mcp/servers/@mook-wenyu/task-manager-mcp/badge" alt="Mook Task Manager MCP server" /></a>

</div>

## 📦 Release Update (2025-10-13)
- npm package `@mook_wy/mook-task-manager` is live; launch instantly with `npx -y @mook_wy/mook-task-manager@latest`.
- npx fits Claude Code, Codex CLI, and other clients without manual install or updates.
- Use the local build workflow below only when you need offline access or custom modifications.

## 🚀 Quick Start

### Instant Run (npx)
```bash
npx -y @mook_wy/mook-task-manager@latest
```
- Downloads on first launch, then reuses npm cache.
- Configure Claude Code, Codex CLI, etc. by setting `command` to `npx` with the above arguments.

### Local Development

#### Prerequisites
- Node.js 18+
- npm (or compatible package manager)
- MCP-enabled AI client (Claude Code, Cline, Claude Desktop, ...)

#### Steps
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
      "command": "npx",
      "args": ["-y", "@mook_wy/mook-task-manager@latest"],
      "env": {
        "DATA_DIR": "/path/to/your_data_dir",
        "TEMPLATES_USE": "zh"
      }
    }
  }
}
```
Switch to the local build by setting `command` to `node` and pointing `args` to `dist/index.js` when needed.

Launch with `claude --dangerously-skip-permissions --mcp-config .mcp.json`.

### Configure Codex CLI
```toml
[mcp_servers.mook-task-manager]
command = "npx"
args = ["-y", "@mook_wy/mook-task-manager@latest"]

[mcp_servers.mook-task-manager.env]
DATA_DIR = "/path/to/your_data_dir"
TEMPLATES_USE = "zh"
```
Fallback to the local build by switching `command` to `node` and targeting `path/to/task-manager-mcp/dist/index.js`.

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
- Release updates: see “📦 Release Update” above and CHANGELOG
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
