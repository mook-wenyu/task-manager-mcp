[🇺🇸 English](../../README.md) | [🇨🇳 中文](README.md)

# MCP 虾米任务管理器

> 🦐 **AI 驱动开发的智能任务管理** - 将复杂项目分解为可管理的任务，跨会话维护上下文，加速您的开发工作流程。

<div align="center">
  
[![Shrimp Task Manager Demo](../yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

**[观看演示视频](https://www.youtube.com/watch?v=Arzu0lV09so)** • **[快速开始](#-快速开始)** • **[文档](#-文档)**

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)
<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager"><img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" /></a>

</div>

## 🚀 快速开始

### 前置要求
- Node.js 18+ 
- npm 或 yarn
- 支持 MCP 的 AI 客户端（Claude Code 等）

### 安装

#### 安装 Claude Code

**Windows 11（使用 WSL2）：**
```bash
# 首先，确保已安装 WSL2（在 PowerShell 中以管理员身份执行）
wsl --install

# 进入 Ubuntu/WSL 环境
wsl -d Ubuntu

# 全域安装 Claude Code
npm install -g @anthropic-ai/claude-code

# 启动 Claude Code
claude
```

**macOS/Linux：**
```bash
# 全域安装 Claude Code
npm install -g @anthropic-ai/claude-code

# 启动 Claude Code
claude
```

#### 安装虾米任务管理器

```bash
# 克隆储存库
git clone https://github.com/cjo4m06/mcp-shrimp-task-manager.git
cd mcp-shrimp-task-manager

# 安装依赖
npm install

# 构建项目
npm run build
```

### 配置 Claude Code

在您的项目目录中创建 `.mcp.json` 文档：

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/your/shrimp_data",
        "TEMPLATES_USE": "zh",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

配置示例：
```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/home/fire/claude/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/home/fire/claude/project/shrimp_data",
        "TEMPLATES_USE": "zh",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

## ✨ 功能特点

### 内核功能
- 🎯 **智能任务规划** - 将复杂项目自动分解为结构化任务
- 🔗 **依赖管理** - 自动追踪和管理任务间的依赖关系
- 🧠 **记忆系统** - 跨会话保持上下文和项目知识
- 🔍 **研究模式** - 系统性技术调查和知识收集
- 📊 **任务查看器** - 现代化网页界面用于任务可视化和管理
- 🌐 **多语言支持** - 支持英文和繁体中文模板
- 🤖 **AI 代理集成** - 与专门的 AI 代理无缝协作

## 📖 使用指南

### 基本工作流程

1. **初始化项目规则**
   ```
   "初始化项目规则"
   ```

2. **规划任务**
   ```
   "规划任务：实现用户认证系统"
   ```

3. **执行任务**
   ```
   "执行任务 [任务 ID]"
   ```

4. **验证完成**
   ```
   "验证任务 [任务 ID]"
   ```

### 高级功能

#### 🔬 研究模式
进行深入的技术调查：
```
"进入研究模式研究 React 性能优化"
```

#### 🔄 连续模式
自动执行所有排队任务：
```
"启用连续模式"
```

#### 🧠 任务记忆
系统自动保存任务历史供未来参考。存储在 `memory/` 目录中，格式为 `tasks_backup_YYYY-MM-DDThh-mm-ss.json`。

## 🖥️ 任务查看器

基于 React 的现代化网页界面，提供：
- 📋 全面的任务列表视图
- 🔍 即时搜寻和过滤
- 🎨 拖放式标签组织
- 🤖 AI 代理管理
- 🔄 可配置的自动刷新
- 📊 项目历史追踪

![任务查看器界面](../../tools/task-viewer/screenshot.png)

### 启动任务查看器

```bash
cd tools/task-viewer
npm install
npm start
```

访问 http://localhost:9998 查看界面。

## 🔧 配置

### 环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `DATA_DIR` | 任务数据存储目录 | `./data` |
| `TEMPLATES_USE` | 语言模板（en/zh） | `en` |
| `ENABLE_GUI` | 启用网页 GUI | `false` |
| `WEB_PORT` | 网页 GUI 端口 | 自动 |

### MCP 客户端配置

#### Cursor IDE

**全域配置（推荐）：**
```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/Users/username/ShrimpData",
        "TEMPLATES_USE": "zh",
        "ENABLE_GUI": "true"
      }
    }
  }
}
```

**项目特定配置：**
在项目根目录创建 `.cursor/mcp.json`：
```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "npx",
      "args": ["-y", "mcp-shrimp-task-manager"],
      "env": {
        "DATA_DIR": ".shrimp",
        "TEMPLATES_USE": "zh",
        "ENABLE_GUI": "true"
      }
    }
  }
}
```

## 🛠️ 可用工具

| 类别 | 工具 | 描述 |
|------|------|------|
| **规划** | `plan_task` | 创建新任务 |
| | `analyze_task` | 深度分析任务需求 |
| | `split_tasks` | 拆分复杂任务 |
| **执行** | `execute_task` | 执行任务并提供指导 |
| | `verify_task` | 验证任务完成 |
| **管理** | `list_tasks` | 列出所有任务 |
| | `query_task` | 搜寻任务 |
| | `get_task_detail` | 获取任务详情 |
| | `update_task` | 更新任务 |
| | `delete_task` | 删除任务 |
| **认知** | `process_thought` | 思维链推理 |
| | `reflect_task` | 反思和改进 |
| | `research_mode` | 系统性研究 |
| **项目** | `init_project_rules` | 初始化项目标准 |

## 🏗️ 架构

### 内核组件

```
mcp-shrimp-task-manager/
├── src/
│   ├── index.ts           # MCP 服务器入口
│   ├── models/            # 任务数据模型
│   ├── tools/             # MCP 工具实现
│   │   ├── task/         # 任务管理工具
│   │   ├── thought/      # 认知工具
│   │   ├── research/     # 研究工具
│   │   └── project/      # 项目工具
│   ├── prompts/          # 多语言提示模板
│   └── web/              # 网页 GUI 服务器
└── tools/task-viewer/    # React 任务查看器
```

### 数据流

```
用户请求 → MCP 工具 → 任务处理 → 数据持久化 → 响应
                ↓
          提示模板生成
                ↓
          AI 代理执行
```

## 🚀 部署选项

### Docker 部署

```bash
# 使用 Docker Compose
docker-compose up -d

# 或使用 Docker 直接运行
docker run -d \
  --name shrimp-task-manager \
  -p 9998:9998 \
  -v $(pwd)/data:/data \
  cjo4m06/shrimp-task-manager:latest
```

### NPX 快速开始

```bash
# 创建新项目
npx create-shrimp-task-manager my-project

# 或全域安装
npm install -g @cjo4m06/mcp-shrimp-task-manager
```

### 一键安装脚本

```bash
curl -sSL https://raw.githubusercontent.com/cjo4m06/mcp-shrimp-task-manager/main/install.sh | bash
```

## 📚 文档

- [提示词自定义指南](prompt-customization.md)
- [更新日志](CHANGELOG.md)
- [部署指南](../../DEPLOYMENT.md)
- [API 文档](../api.md)
- [工具文档](../tools.md)

## 🤝 贡献

欢迎贡献！请查看我们的[贡献指南](../../CONTRIBUTING.md)。

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](../../LICENSE) 文档。

## 🙏 致谢

- [Model Context Protocol](https://modelcontextprotocol.io/) 团队
- [Anthropic](https://www.anthropic.com/) 的 Claude
- 所有贡献者和用户

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cjo4m06/mcp-shrimp-task-manager&type=Timeline)](https://www.star-history.com/#cjo4m06/mcp-shrimp-task-manager&Timeline)



