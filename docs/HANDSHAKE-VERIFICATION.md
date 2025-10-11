# MCP 握手验证指南

## 适用场景
- 发布前确认 `dist/index.js` 通过 MCP 初始化，能力声明与注册工具一致。
- 排查工具或能力声明变更后，客户端无法完成 `initialize` 的问题。

## 准备工作
1. 执行 `npm run build` 生成最新 `dist/` 产物。
2. 确保本地 Node.js ≥ 18，并安装依赖 (`npm install`)。

## 快速验证
```bash
npm run handshake
```

默认命令会执行：
- 通过 `node scripts/verify-handshake.mjs` 启动 `dist/index.js`（禁用 GUI）。
- 使用 `@modelcontextprotocol/sdk` 提供的 `Client` + `StdioClientTransport` 完成初始化流程。
- 成功时打印服务器名称、版本与能力；失败时输出错误与服务器 stderr。

## 自定义参数
```bash
npm run handshake -- dist/index.js --some-flag
npm run handshake -- node_modules/.bin/tsx src/index.ts
```
- 第一个位置参数为服务器可执行入口（默认为 `dist/index.js`）。
- 提供多个参数时，第一个视为命令，其余为传入参数。
- 所有环境变量默认继承当前 shell，并强制设置 `ENABLE_GUI=false`。

## 结果判定
- 成功：终端输出 `✅ MCP handshake succeeded`，并列出 `Capabilities` JSON。
- 失败：输出 `❌ MCP handshake failed`，`process.exitCode=1`；根据 stderr 与异常堆栈排查。

## 记录要求
- 在 `.codex/testing.md` 中登记命令、时间与结果。
- 若失败，更新 `RISKS.md` 并附上修复计划；修复后重新执行直至成功。
