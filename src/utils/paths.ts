import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

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
 * 优先使用支持 listRoots 的 server 返回的第一笔 file:// 根路径
 * Prefer the first file:// root returned by listRoots when a server is available
 * 若无可用 root，则回退至当前工作目录，再回退至模块项目根目录
 * Fallback to process.cwd(), then to the module project root
 * 相对路径会拼接到选定根路径，绝对路径将被直接使用
 * Relative paths are resolved against the chosen base, absolute paths are used directly
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
          try {
            rootPath = fileURLToPath(firstFileRoot.uri);
          } catch {
            // Silently ignore malformed URI
          }
        }
      }
    } catch (error) {
      // Silently handle error - console not supported in MCP
    }
  }

  if (!rootPath) {
    rootPath = process.cwd();
  }

  // 处理 process.env.DATA_DIR
  // Handle process.env.DATA_DIR
  const dataDirEnv = process.env.DATA_DIR?.trim();
  const dataDirSetting = dataDirEnv ? dataDirEnv : ".shrimp";

  if (path.isAbsolute(dataDirSetting)) {
    await mkdir(dataDirSetting, { recursive: true });
    return dataDirSetting;
  }

  const base = rootPath ?? PROJECT_ROOT;
  const resolvedPath = path.resolve(base, dataDirSetting);
  await mkdir(resolvedPath, { recursive: true });
  return resolvedPath;
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
 * 取得项目根目录
 * Get project root directory
 */
export function getProjectRoot(): string {
  return PROJECT_ROOT;
}
