type ToolLogStatus = "success" | "error";

export type ToolLogEntry = {
  toolName: string;
  status: ToolLogStatus;
  durationMs: number;
  hasStructuredContent?: boolean;
  errorMessage?: string;
  errorCode?: string;
};

export function logToolInvocation(entry: ToolLogEntry) {
  if (entry.status === "success") {
    return;
  }

  const segments = [
    `[${entry.toolName}]`,
    `${entry.status}`,
    `${entry.durationMs}ms`,
  ];

  if (entry.errorCode) {
    segments.push(`code=${entry.errorCode}`);
  }

  if (entry.errorMessage) {
    segments.push(entry.errorMessage);
  }

  process.stderr.write(`${segments.join(" | ")}\n`);
}
