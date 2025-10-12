#!/usr/bin/env node
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const DEFAULT_COMMAND = process.platform === "win32" ? "node" : "node";
const DEFAULT_ARGS = ["dist/index.js"];

function resolveServerInvocation() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    return { command: DEFAULT_COMMAND, args: DEFAULT_ARGS };
  }

  if (args.length === 1) {
    return { command: DEFAULT_COMMAND, args: args };
  }

  const [command, ...rest] = args;
  return { command, args: rest };
}

async function main() {
  const { command, args } = resolveServerInvocation();

  const transport = new StdioClientTransport({
    command,
    args,
    cwd: process.cwd(),
    env: {
      ...process.env,
    },
    stderr: "pipe",
  });

  let stderrBuffer = "";
  const stderrStream = transport.stderr;
  if (stderrStream) {
    stderrStream.on("data", (chunk) => {
      stderrBuffer += chunk.toString();
    });
  }

  const client = new Client({
    name: "HandshakeVerifier",
    version: "1.0.0",
  });

  client.registerCapabilities({
    tools: {},
    logging: {},
  });

  try {
    await client.connect(transport);

    const serverInfo = client.getServerVersion();
    const capabilities = client.getServerCapabilities();

    console.log("✅ MCP handshake succeeded");
    if (serverInfo) {
      console.log(`Server: ${serverInfo.name} ${serverInfo.version ?? ""}`.trim());
    }
    console.log("Capabilities:", JSON.stringify(capabilities ?? {}, null, 2));
  } catch (error) {
    console.error("❌ MCP handshake failed", error);
    if (stderrBuffer) {
      console.error("Server stderr:\n", stderrBuffer.trim());
    }
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => {});
    await transport.close().catch(() => {});
  }
}

main().catch((error) => {
  console.error("Unexpected error during handshake verification", error);
  process.exit(1);
});
