import path from "path";
import { fileURLToPath } from "url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import fs from "fs";

// 取得项目根目录
// Get project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

// 全局 server 实例
// Global server instance
let globalServer: Server | null = null;

/**
 * 设置全局 server 实例
 * Set global server instance
 */
export function setGlobalServer(server: Server): void {
  globalServer = server;
}

/**
 * 获取全局 server 实例
 * Get global server instance
 */
export function getGlobalServer(): Server | null {
  return globalServer;
}

/**
 * 取得 DATA_DIR 路径
 * Get DATA_DIR path
 * 如果有 server 且支持 listRoots，则使用第一笔 file:// 开头的 root + "/data"
 * If there's a server that supports listRoots, use the first root starting with file:// + "/data"
 * 否则使用环境变量或项目根目录
 * Otherwise use environment variables or project root directory
 */
export async function getDataDir(): Promise<string> {
  const server = getGlobalServer();
  let rootPath: string | null = null;

  if (server) {
    try {
      const roots = await server.listRoots();

      // 找出第一笔 file:// 开头的 root
      // Find the first root starting with file://
      if (roots.roots && roots.roots.length > 0) {
        const firstFileRoot = roots.roots.find((root) =>
          root.uri.startsWith("file://")
        );
        if (firstFileRoot) {
          // 从 file:// URI 中提取实际路径
          // Extract actual path from file:// URI
          // Windows: file:///C:/path -> C:/path
          // Unix: file:///path -> /path
          if (process.platform === 'win32') {
            rootPath = firstFileRoot.uri.replace("file:///", "").replace(/\//g, "\\");
          } else {
            rootPath = firstFileRoot.uri.replace("file://", "");
          }
        }
      }
    } catch (error) {
      // Silently handle error - console not supported in MCP
    }
  }

  // 处理 process.env.DATA_DIR
  // Handle process.env.DATA_DIR
  if (process.env.DATA_DIR) {
    if (path.isAbsolute(process.env.DATA_DIR)) {
      // 如果 DATA_DIR 是绝对路径，直接使用它不做任何修改
      // If DATA_DIR is an absolute path, use it directly without any modification
      return process.env.DATA_DIR;
    } else {
      // 如果 DATA_DIR 是相对路径，返回 "rootPath/DATA_DIR"
      // If DATA_DIR is a relative path, return "rootPath/DATA_DIR"
      if (rootPath) {
        return path.join(rootPath, process.env.DATA_DIR);
      } else {
        // 如果没有 rootPath，使用 PROJECT_ROOT
        // If there's no rootPath, use PROJECT_ROOT
        return path.join(PROJECT_ROOT, process.env.DATA_DIR);
      }
    }
  }

  // 如果没有 DATA_DIR，使用缺省逻辑
  // If there's no DATA_DIR, use default logic
  if (rootPath) {
    return path.join(rootPath, "data");
  }

  // 最后回退到项目根目录
  // Finally fall back to project root directory
  return path.join(PROJECT_ROOT, "data");
}

/**
 * 取得任务文件路径
 * Get task file path
 */
export async function getTasksFilePath(): Promise<string> {
  const dataDir = await getDataDir();
  return path.join(dataDir, "tasks.json");
}

/**
 * 取得内存文件夹路径
 * Get memory directory path
 */
export async function getMemoryDir(): Promise<string> {
  const dataDir = await getDataDir();
  return path.join(dataDir, "memory");
}

/**
 * 取得 WebGUI 文件路径
 * Get WebGUI file path
 */
export async function getWebGuiFilePath(): Promise<string> {
  const dataDir = await getDataDir();
  return path.join(dataDir, "WebGUI.md");
}

/**
 * 取得项目根目录
 * Get project root directory
 */
export function getProjectRoot(): string {
  return PROJECT_ROOT;
}
