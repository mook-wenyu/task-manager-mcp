[中文版](README.md)

# Mook Task Manager MCP

> 🤖 **Local MCP server for intelligent task management** – break down complex requirements into actionable steps, preserve context across sessions, and keep agents aligned with your workflow.

<div align="center">

**[Watch Demo](https://www.youtube.com/watch?v=Arzu0lV09so)** • **[Quick Start](#-quick-start)** • **[References](#-references)**

[![smithery badge](https://smithery.ai/badge/@mook-wenyu/task-manager-mcp)](https://smithery.ai/server/@mook-wenyu/task-manager-mcp)
<a href="https://glama.ai/mcp/servers/@mook-wenyu/task-manager-mcp"><img width="380" height="200" src="https://glama.ai/mcp/servers/@mook-wenyu/task-manager-mcp/badge" alt="Mook Task Manager MCP server" /></a>

</div>

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
- **Stage progress view** – `execute_task` / `verify_task` maintain `.shrimp/status/<taskId>/stages.json`, and `list_tasks` summarizes Spec→Plan→Implementation→Verification states at a glance.
- **Research hooks** – `plan_task` emits `openQuestions`; `queue_research_task` writes research.md/open-questions.json and spins up follow-up research tasks for each pending clarification.

## 🧭 Compatibility & Scope

### MCP Spec Version
- We align with the Model Context Protocol public specification dated 2025-06-18 and mirror the latest fields in `src/tools/schemas/outputSchemas.ts`.
- When upstream standards evolve, validate changes on a feature branch before updating schemas and documentation; capture breaking notes or regression steps in `.codex/testing.md` if needed.

### Lightweight Capability Choices
- The server intentionally keeps to the Spec→Coding→Research toolchain (`plan_task`, `generate_spec_template`, `register_connection`, `generate_workflow`, `render_role_prompt`, `queue_research_task`) while leaving GUI, SSE streaming, and heavy monitoring out of scope to preserve minimal footprint.
- All outputs live under `<DATA_DIR>/.shrimp/`, combining stage progress, role prompts, and research hooks to cover the essentials without duplicating features already handled by external platforms.

### Modular Connection Strategy
- Use `register_connection` (`src/tools/config/registerConnection.ts`) to catalog external MCP providers or Spec Kit services so that aliases flow into `plan_task`, `list_tasks`, and `execute_task` responses.
- Store only the command, arguments, and scope required for each connection; experiment safely via `.shrimp/config/servers.json` before committing integrations into shared environments.

## 📚 References
- [📝 Repository Guidelines](AGENTS.md)
- Structured output contracts: see `src/tools/schemas/outputSchemas.ts`
- SDK v1.20.0 upgrade highlights: documented in this README and commit history
- External MCP connector research: summarized in `PLAN.md` and `RISKS.md`
- End-to-end examples: available under `<DATA_DIR>/.shrimp/examples/`

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

<details>
<summary><b>Clarification & Research</b></summary>

```
Plan: "plan task: audit external dependencies"
Queue research: "queue research task {\"taskId\": \"<TASK_ID>\", \"questions\": [{\"question\": \"Does the upstream API expose error codes?\", \"required\": true}]}"
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
