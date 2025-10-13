import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { registerConnection } from "../registerConnection.js";
import { listConnectionReferences } from "../../../utils/connectionStore.js";

let originalDataDir: string | undefined;
let tempDataDir: string;

describe("registerConnection", () => {
  beforeEach(async () => {
    originalDataDir = process.env.DATA_DIR;
    tempDataDir = await mkdtemp(path.join(tmpdir(), "register-connection-"));
    process.env.DATA_DIR = tempDataDir;
  });

  afterEach(async () => {
    if (originalDataDir === undefined) {
      delete process.env.DATA_DIR;
    } else {
      process.env.DATA_DIR = originalDataDir;
    }

    await rm(tempDataDir, { recursive: true, force: true });
  });

  it("creates and updates connection entries", async () => {
    const result = await registerConnection({
      key: "local-agent",
      command: "npm run agent",
      transport: "stdio",
      description: "本地编排服务器",
      required: true,
    });

    expect(result.structuredContent?.payload?.key).toBe("local-agent");
    expect(result.structuredContent?.payload?.isUpdate).toBe(false);
    expect(result.structuredContent?.payload?.totalConnections).toBe(1);

    const configPath = path.join(tempDataDir, "config", "servers.json");
    const stored = JSON.parse(await readFile(configPath, "utf-8"));
    expect(stored.connections["local-agent"].command).toBe("npm run agent");
    expect(stored.connections["local-agent"].transport).toBe("stdio");

    const references = await listConnectionReferences();
    expect(references).toEqual([
      {
        key: "local-agent",
        description: "本地编排服务器",
        transport: "stdio",
        required: true,
      },
    ]);

    const updated = await registerConnection({
      key: "local-agent",
      command: "npm run agent --watch",
      description: "热重载模式",
    });

    expect(updated.structuredContent?.payload?.isUpdate).toBe(true);
    expect(updated.structuredContent?.payload?.connection.command).toBe(
      "npm run agent --watch"
    );
    expect(updated.structuredContent?.payload?.connection.description).toBe(
      "热重载模式"
    );

    const updatedStored = JSON.parse(await readFile(configPath, "utf-8"));
    expect(updatedStored.connections["local-agent"].command).toBe(
      "npm run agent --watch"
    );
    expect(updatedStored.connections["local-agent"].description).toBe(
      "热重载模式"
    );
  });
});