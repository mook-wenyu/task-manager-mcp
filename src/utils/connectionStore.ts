import { access, mkdir, readFile } from "fs/promises";
import path from "path";
import { writeJsonFileAtomic } from "./fileWriter.js";
import { getDataDir } from "./paths.js";

const CONFIG_DIR_NAME = "config";
const CONNECTIONS_FILE_NAME = "servers.json";
const STORAGE_VERSION = 1;

type ConnectionsMap = Record<string, StoredConnection>;

export interface StoredConnection {
  key: string;
  command: string;
  args?: string[];
  cwd?: string;
  transport?: string;
  description?: string;
  tags?: string[];
  envFile?: string;
  env?: Record<string, string>;
  required?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionsFile {
  version: number;
  updatedAt: string;
  connections: ConnectionsMap;
}

export interface ConnectionReference {
  key: string;
  description?: string;
  transport?: string;
  required?: boolean;
}

export interface UpsertConnectionInput {
  key: string;
  command: string;
  args?: string[];
  cwd?: string;
  transport?: string;
  description?: string;
  tags?: string[];
  envFile?: string;
  env?: Record<string, string>;
  required?: boolean;
}

function createEmptyStorage(): ConnectionsFile {
  const now = new Date().toISOString();
  return {
    version: STORAGE_VERSION,
    updatedAt: now,
    connections: {},
  };
}

function sanitizeConnectionKey(key: string): string {
  return key.trim();
}

async function ensureConfigDir(): Promise<string> {
  const dataDir = await getDataDir();
  const configDir = path.join(dataDir, CONFIG_DIR_NAME);
  await mkdir(configDir, { recursive: true });
  return configDir;
}

export async function getConnectionsFilePath(): Promise<string> {
  const configDir = await ensureConfigDir();
  return path.join(configDir, CONNECTIONS_FILE_NAME);
}

async function ensureConnectionsFile(): Promise<ConnectionsFile> {
  const filePath = await getConnectionsFilePath();
  try {
    await access(filePath);
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<ConnectionsFile>;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.version === "number" &&
      typeof parsed.updatedAt === "string" &&
      parsed.connections &&
      typeof parsed.connections === "object"
    ) {
      const connections: ConnectionsMap = {};
      for (const [key, value] of Object.entries(parsed.connections)) {
        if (!value || typeof value !== "object") {
          continue;
        }
        const normalizedKey = sanitizeConnectionKey(key);
        const storedValue = normalizeStoredConnection(normalizedKey, value);
        if (storedValue) {
          connections[normalizedKey] = storedValue;
        }
      }
      return {
        version: parsed.version,
        updatedAt: parsed.updatedAt,
        connections,
      };
    }
  } catch (error) {
    // fallthrough to create new storage
  }

  const storage = createEmptyStorage();
  await writeJsonFileAtomic(await getConnectionsFilePath(), storage);
  return storage;
}

function normalizeStoredConnection(
  key: string,
  value: unknown
): StoredConnection | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<StoredConnection & { args?: unknown } & {
    env?: unknown;
    tags?: unknown;
  }>;

  if (typeof record.command !== "string" || record.command.trim().length === 0) {
    return null;
  }

  const now = new Date().toISOString();
  const createdAt = typeof record.createdAt === "string" ? record.createdAt : now;
  const updatedAt = typeof record.updatedAt === "string" ? record.updatedAt : now;

  let args: string[] | undefined;
  if (Array.isArray(record.args)) {
    args = record.args.filter((item): item is string => typeof item === "string");
    if (args.length === 0) {
      args = undefined;
    }
  }

  let tags: string[] | undefined;
  if (Array.isArray(record.tags)) {
    tags = record.tags.filter((item): item is string => typeof item === "string");
    if (tags.length === 0) {
      tags = undefined;
    }
  }

  let env: Record<string, string> | undefined;
  if (record.env && typeof record.env === "object") {
    const entries: [string, string][] = [];
    for (const [envKey, envValue] of Object.entries(record.env)) {
      if (typeof envKey === "string" && typeof envValue === "string") {
        entries.push([envKey, envValue]);
      }
    }
    if (entries.length > 0) {
      env = Object.fromEntries(entries);
    }
  }

  return {
    key,
    command: record.command.trim(),
    args,
    cwd:
      typeof record.cwd === "string" && record.cwd.trim().length > 0
        ? record.cwd.trim()
        : undefined,
    transport:
      typeof record.transport === "string" && record.transport.trim().length > 0
        ? record.transport.trim()
        : undefined,
    description:
      typeof record.description === "string" && record.description.trim().length > 0
        ? record.description.trim()
        : undefined,
    envFile:
      typeof record.envFile === "string" && record.envFile.trim().length > 0
        ? record.envFile.trim()
        : undefined,
    env,
    tags,
    required: typeof record.required === "boolean" ? record.required : undefined,
    createdAt,
    updatedAt,
  };
}

export async function loadConnections(): Promise<ConnectionsFile> {
  return await ensureConnectionsFile();
}

export async function upsertConnection(
  input: UpsertConnectionInput
): Promise<{
  connection: StoredConnection;
  isUpdate: boolean;
  storage: ConnectionsFile;
}> {
  const sanitizedKey = sanitizeConnectionKey(input.key);
  if (sanitizedKey.length === 0) {
    throw new Error("连接键不能为空");
  }

  const storage = await ensureConnectionsFile();
  const previous = storage.connections[sanitizedKey];
  const now = new Date().toISOString();

  const connection: StoredConnection = {
    key: sanitizedKey,
    command: input.command.trim(),
    cwd:
      input.cwd && input.cwd.trim().length > 0 ? input.cwd.trim() : undefined,
    transport:
      input.transport && input.transport.trim().length > 0
        ? input.transport.trim()
        : undefined,
    description:
      input.description && input.description.trim().length > 0
        ? input.description.trim()
        : undefined,
    envFile:
      input.envFile && input.envFile.trim().length > 0
        ? input.envFile.trim()
        : previous?.envFile,
    required: typeof input.required === "boolean" ? input.required : previous?.required,
    args:
      input.args && input.args.length > 0
        ? input.args
        : previous?.args,
    tags:
      input.tags && input.tags.length > 0 ? input.tags : previous?.tags,
    env:
      input.env && Object.keys(input.env).length > 0
        ? input.env
        : previous?.env,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };

  storage.connections[sanitizedKey] = connection;
  storage.updatedAt = now;

  await writeJsonFileAtomic(await getConnectionsFilePath(), storage);

  return {
    connection,
    isUpdate: Boolean(previous),
    storage,
  };
}

export async function listConnectionReferences(): Promise<ConnectionReference[]> {
  const storage = await ensureConnectionsFile();
  const references: ConnectionReference[] = Object.values(storage.connections)
    .map((connection) => ({
      key: connection.key,
      description: connection.description,
      transport: connection.transport,
      required: connection.required,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));

  return references;
}
