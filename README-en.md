[中文版](README.md)

# MCP Shrimp Task Manager

> 🦐 **Local MCP server for intelligent task management** – break down complex requirements into actionable steps, preserve context across sessions, and keep agents aligned with your workflow.

<div align="center">
  
[![Shrimp Task Manager Demo](docs/yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

**[Watch Demo](https://www.youtube.com/watch?v=Arzu0lV09so)** • **[Quick Start](#-quick-start)** • **[Documentation](#-documentation)**

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)
<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager"><img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" /></a>

</div>

## ⚠️ SDK Upgrade Notice (2025-10-11)
- Migrated to Model Context Protocol TypeScript SDK **v1.20.0** using the new `server.registerTool` / `registerPrompt` APIs.
- All tools now expose `structuredContent` with JSON Schemas defined in `docs/TOOL-OUTPUT-CONTRACTS.md`.
- Default capability declaration enables `tools` and `logging`; extend prompts/resources via `server.registerCapabilities` when needed.
- Regression suite: `npm run build`, `npm test -- --run`, `npm run handshake`, `npm run inspect` (see `docs/HANDSHAKE-VERIFICATION.md`).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm (or compatible package manager)
- MCP-enabled AI client (Claude Code, Cline, Claude Desktop, ...)

### Installation
```bash
git clone https://github.com/cjo4m06/mcp-shrimp-task-manager.git
cd mcp-shrimp-task-manager
npm install
npm run build
```

### Configure Claude Code
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
Launch with `claude --dangerously-skip-permissions --mcp-config .mcp.json`.

### Other Clients
- **Cline (VS Code Extension)**: configure `cline.mcpServers` in `settings.json`.
- **Claude Desktop**: add entries in `%APPDATA%/Claude/claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS).

## 💡 Highlights
- **Task Planning** – structured decomposition, dependency tracking, and execution guidance.
- **Closed-loop execution** – plan/execute/verify/reflect tools aligned with `.codex` workflow files.
- **Structured outputs** – every tool returns `structuredContent` validated by shared schemas.
- **Local persistence** – task state stored under `data/`, keeps progress across sessions.
- **Memory cache** – the built-in MemoryStore trims short-term context and exposes the `memory_replay` tool for quick retrospectives.
- **Interactive elicitation** – `plan_task` can prompt for missing constraints via `elicitInput`, keeping plans grounded.
- **Optional UI** – enable `ENABLE_GUI=true` for a lightweight dashboard; Task Viewer offers a richer React interface.

## 🖥️ Visualization
- **Task Viewer**
  ```bash
  cd tools/task-viewer
  npm install
  npm run start:all
  # http://localhost:5173
  ```
- **Lightweight GUI** – toggle via `.env` (`ENABLE_GUI=true`).

## 📚 Documentation
- [📝 Repository Guidelines](AGENTS.md)
- [🖐️ Handshake Verification](docs/HANDSHAKE-VERIFICATION.md)
- [📦 Structured Output Contracts](docs/TOOL-OUTPUT-CONTRACTS.md)
- [⬆️ SDK v1.20.0 Upgrade Notes](docs/UPGRADE-SDK-1.20.0.md)
- [🗃️ Archived Research – External MCP Connectors](docs/archive/OFFICIAL-CONNECTOR-EVALUATION.md)

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
ENABLE_GUI=false                # optional
WEB_PORT=3000                   # optional GUI port
PROMPT_LANGUAGE=en              # template language
```

## 📋 Common Commands
| Command | Description |
|---------|-------------|
| `npm run build` | TypeScript build + asset copy |
| `npm run dev` | ts-node development server |
| `npm test -- --run` | Run all Vitest suites |
| `npm run handshake` | Verify stdio handshake via SDK client |
| `npm run inspect` | Inspect capabilities using the MCP Inspector CLI |

## 🤝 Contributing

Check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Please keep `.codex` files, verification logs, and documentation in sync with any change.

## 📄 License
Licensed under [MIT](LICENSE).

## 🌟 Credits
Created by [cjo4m06](https://github.com/cjo4m06) and the community.

---

<p align="center">
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager">GitHub</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/issues">Issues</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/discussions">Discussions</a>
</p>
