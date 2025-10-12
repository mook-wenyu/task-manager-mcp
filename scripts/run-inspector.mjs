#!/usr/bin/env node
import { spawn } from "node:child_process";

const DEFAULT_SERVER_COMMAND = "node";
const DEFAULT_SERVER_ARGS = ["dist/index.js"];
const DEFAULT_METHOD = "tools/list";

function parseArguments() {
  const rawArgs = process.argv.slice(2);
  const commandArgs = [];
  let method = DEFAULT_METHOD;

  for (let index = 0; index < rawArgs.length; index += 1) {
    const current = rawArgs[index];

    if (current === "--method") {
      const next = rawArgs[index + 1];
      if (!next) {
        throw new Error("Expected method value after --method");
      }
      method = next;
      index += 1;
      continue;
    }

    if (current.startsWith("--method=")) {
      method = current.substring("--method=".length);
      continue;
    }

    commandArgs.push(current);
  }

  return {
    method,
    commandArgs,
  };
}

function resolveServerInvocation(commandArgs) {
  if (commandArgs.length === 0) {
    return {
      command: DEFAULT_SERVER_COMMAND,
      args: DEFAULT_SERVER_ARGS,
    };
  }

  if (commandArgs.length === 1) {
    return {
      command: DEFAULT_SERVER_COMMAND,
      args: commandArgs,
    };
  }

  const [command, ...args] = commandArgs;
  return { command, args };
}

async function main() {
  const { method, commandArgs } = parseArguments();
  const { command, args } = resolveServerInvocation(commandArgs);

  const inspectorArgs = [
    "-y",
    "@modelcontextprotocol/inspector",
    "--cli",
    "--method",
    method,
    command,
    ...args,
  ];

  const child = spawn("npx", inspectorArgs, {
    cwd: process.cwd(),
    env: {
      ...process.env,
    },
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });

  child.on("error", (error) => {
    console.error("Failed to launch MCP Inspector", error);
    process.exit(1);
  });
}

main().catch((error) => {
  console.error("Unexpected error during inspector run", error);
  process.exit(1);
});
