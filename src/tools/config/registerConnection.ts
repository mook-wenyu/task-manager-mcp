import { z } from "zod";
import {
  listConnectionReferences,
  upsertConnection,
} from "../../utils/connectionStore.js";

export const registerConnectionSchema = z.object({
  key: z
    .string()
    .min(1, "连接键不能为空")
    .regex(/^[a-zA-Z0-9_-]+$/, "连接键仅能包含字母、数字、连字符与底线"),
  command: z.string().min(1, "连接命令不能为空"),
  args: z.array(z.string()).optional(),
  cwd: z.string().optional(),
  transport: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  envFile: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
  required: z.boolean().optional(),
});

export async function registerConnection(
  args: z.infer<typeof registerConnectionSchema>
) {
  const { connection, isUpdate, storage } = await upsertConnection(args);
  const references = await listConnectionReferences();

  const headline = isUpdate ? "连接已更新" : "连接已注册";
  const summaryLines = [
    `## ${headline}`,
    "",
    `- 键名：\`${connection.key}\``,
    `- 命令：\`${connection.command}\``,
  ];

  if (connection.cwd) {
    summaryLines.push(`- 工作目录：\`${connection.cwd}\``);
  }
  if (connection.transport) {
    summaryLines.push(`- 传输方式：${connection.transport}`);
  }
  if (connection.description) {
    summaryLines.push(`- 描述：${connection.description}`);
  }
  if (connection.tags && connection.tags.length > 0) {
    summaryLines.push(`- 标签：${connection.tags.join(", ")}`);
  }
  if (connection.envFile) {
    summaryLines.push(`- 环境变量文件：${connection.envFile}`);
  }
  if (connection.env && Object.keys(connection.env).length > 0) {
    summaryLines.push(`- 内嵌环境变量：${Object.keys(connection.env).length} 项`);
  }
  summaryLines.push(
    `- 更新时间：${new Date(connection.updatedAt).toLocaleString()}`
  );
  summaryLines.push(`- 当前连接总数：${references.length}`);

  const markdown = `${summaryLines.join("\n")}\n`;

  return {
    content: [
      {
        type: "text" as const,
        text: markdown,
      },
    ],
    structuredContent: {
      kind: "config.registerConnection" as const,
      payload: {
        markdown,
        key: connection.key,
        isUpdate,
        totalConnections: references.length,
        connection: {
          command: connection.command,
          args: connection.args,
          cwd: connection.cwd,
          transport: connection.transport,
          description: connection.description,
          tags: connection.tags,
          envFile: connection.envFile,
          env: connection.env,
          required: connection.required,
          createdAt: connection.createdAt,
          updatedAt: connection.updatedAt,
        },
        connectionsSummary: references,
        storage: {
          version: storage.version,
          updatedAt: storage.updatedAt,
        },
      },
    },
  };
}
