type ToolLogStatus = "success" | "error";

export type ToolLogEntry = {
  toolName: string;
  status: ToolLogStatus;
  durationMs: number;
  hasStructuredContent?: boolean;
  errorMessage?: string;
  errorCode?: string;
};

const LOG_TYPE = "tool_invocation";

export function logToolInvocation(entry: ToolLogEntry) {
  const payload = {
    type: LOG_TYPE,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // 保持标准 JSON 输出，记录到 stderr 以符合 MCP stdio 约束
  process.stderr.write(`${JSON.stringify(payload)}\n`);
}
