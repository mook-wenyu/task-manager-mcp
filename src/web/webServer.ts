import express, { Request, Response } from "express";
import getPort from "get-port";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import { fileURLToPath } from "url";
import {
  getDataDir,
  getTasksFilePath,
  getWebGuiFilePath,
} from "../utils/paths.js";

export async function createWebServer() {
  // 创建 Express 应用
  // Create Express application
  const app = express();

  // 保存 SSE 客户端的列表
  // Store list of SSE clients
  let sseClients: Response[] = [];

  // 发送 SSE 事件的辅助函数
  // Helper function to send SSE events
  function sendSseUpdate() {
    sseClients.forEach((client) => {
      // 检查客户端是否仍然连接
      // Check if client is still connected
      if (!client.writableEnded) {
        client.write(
          `event: update\ndata: ${JSON.stringify({
            timestamp: Date.now(),
          })}\n\n`
        );
      }
    });
    // 清理已断开的客户端 (可选，但建议)
    // Clean up disconnected clients (optional, but recommended)
    sseClients = sseClients.filter((client) => !client.writableEnded);
  }

  // 设置静态文档目录
  // Set up static file directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const publicPath = path.join(__dirname, "..", "..", "src", "public");
  const TASKS_FILE_PATH = await getTasksFilePath(); // 使用工具函数取得文件路径
  // Use utility function to get file path

  app.use(express.static(publicPath));

  // 设置 API 路由
  // Set up API routes
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      // 使用 fsPromises 保持异步读取
      // Use fsPromises to maintain async reading
      const tasksData = await fsPromises.readFile(TASKS_FILE_PATH, "utf-8");
      res.json(JSON.parse(tasksData));
    } catch (error) {
      // 确保文件不存在时返回空任务列表
      // Ensure empty task list is returned when file doesn't exist
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        res.json({ tasks: [] });
      } else {
        res.status(500).json({ error: "Failed to read tasks data" });
      }
    }
  });

  // 添加：SSE 端点
  // Add: SSE endpoint
  app.get("/api/tasks/stream", (req: Request, res: Response) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      // 可选: CORS 头，如果前端和后端不在同一个 origin
      // Optional: CORS headers if frontend and backend are not on the same origin
      // "Access-Control-Allow-Origin": "*",
    });

    // 发送一个初始事件或保持连接
    // Send an initial event or maintain connection
    res.write("data: connected\n\n");

    // 将客户端添加到列表
    // Add client to the list
    sseClients.push(res);

    // 当客户端断开连接时，将其从列表中移除
    // When client disconnects, remove it from the list
    req.on("close", () => {
      sseClients = sseClients.filter((client) => client !== res);
    });
  });

  // 定义 writeWebGuiFile 函数
  // Define writeWebGuiFile function
  async function writeWebGuiFile(port: number | string) {
    try {
      // 读取 TEMPLATES_USE 环境变量并转换为语言代码
      // Read TEMPLATES_USE environment variable and convert to language code
      const templatesUse = process.env.TEMPLATES_USE || "en";
      const getLanguageFromTemplate = (template: string): string => {
        if (template === "zh") return "zh-CN";
        if (template === "en") return "en";
        // 自订范本缺省使用英文
        // Custom templates default to English
        return "en";
      };
      const language = getLanguageFromTemplate(templatesUse);

      const websiteUrl = `[Task Manager UI](http://localhost:${port}?lang=${language})`;
      const websiteFilePath = await getWebGuiFilePath();
      const DATA_DIR = await getDataDir();
      try {
        await fsPromises.access(DATA_DIR);
      } catch (error) {
        await fsPromises.mkdir(DATA_DIR, { recursive: true });
      }
      await fsPromises.writeFile(websiteFilePath, websiteUrl, "utf-8");
    } catch (error) {
      // Silently handle error - console not supported in MCP
    }
  }

  return {
    app,
    sendSseUpdate,
    async startServer() {
      // 获取可用端口
      // Get available port
      const port = process.env.WEB_PORT || (await getPort());

      // 启动 HTTP 服务器
      // Start HTTP server
      const httpServer = app.listen(port, () => {
        // 在服务器启动后开始监听文件变化
        // Start monitoring file changes after server starts
        try {
          // 检查文件是否存在，如果不存在则不监听 (避免 watch 报错)
          // Check if file exists, don't monitor if it doesn't exist (to avoid watch errors)
          if (fs.existsSync(TASKS_FILE_PATH)) {
            fs.watch(TASKS_FILE_PATH, (eventType, filename) => {
              if (
                filename &&
                (eventType === "change" || eventType === "rename")
              ) {
                // 稍微延迟发送，以防短时间内多次触发 (例如编辑器保存)
                // Slightly delay sending to prevent multiple triggers in a short time (e.g., editor saves)
                // debounce sendSseUpdate if needed
                // Debounce sendSseUpdate if needed
                sendSseUpdate();
              }
            });
          }
        } catch (watchError) {}

        // 将 URL 写入 WebGUI.md
        // Write URL to WebGUI.md
        writeWebGuiFile(port).catch((error) => {});
      });

      // 设置进程终止事件处理 (确保移除 watcher)
      // Set up process termination event handling (ensure watcher removal)
      const shutdownHandler = async () => {
        // 关闭所有 SSE 连接
        // Close all SSE connections
        sseClients.forEach((client) => client.end());
        sseClients = [];

        // 关闭 HTTP 服务器
        // Close HTTP server
        await new Promise<void>((resolve) => httpServer.close(() => resolve()));
      };

      process.on("SIGINT", shutdownHandler);
      process.on("SIGTERM", shutdownHandler);

      return httpServer;
    },
  };
}
