import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  MemoryEntry,
  MemoryEntryInput,
  MemoryImportance,
  MemoryScope,
} from "../types/index.js";
import { getMemoryDir } from "../utils/paths.js";

const SHORT_TERM_SCOPE: MemoryScope = "short-term";
const LONG_TERM_SCOPE: MemoryScope = "long-term";
const ENTRIES_FILE = "entries.json";

export interface AppendOptions {
  scope?: MemoryScope;
  promote?: boolean;
}

export interface ListOptions {
  scope?: MemoryScope;
  limit?: number;
  taskId?: string | null;
  tags?: string[];
}

export interface PruneOptions {
  maxShortTerm?: number;
}

export interface MemoryStoreOptions {
  baseDir?: string;
  shortTermLimit?: number;
}

export interface MemoryStore {
  append(entry: MemoryEntryInput, options?: AppendOptions): Promise<MemoryEntry>;
  listRecent(options?: ListOptions): Promise<MemoryEntry[]>;
  prune(options?: PruneOptions): Promise<void>;
}

function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined;
  }
  try {
    return JSON.parse(JSON.stringify(metadata));
  } catch {
    return undefined;
  }
}

export class FileSystemMemoryStore implements MemoryStore {
  private readonly baseDir?: string;
  private readonly shortTermLimit: number;

  constructor(options: MemoryStoreOptions = {}) {
    this.baseDir = options.baseDir;
    this.shortTermLimit = options.shortTermLimit ?? 50;
  }

  private async resolveBaseDir(): Promise<string> {
    if (this.baseDir) {
      await fs.mkdir(this.baseDir, { recursive: true });
      return this.baseDir;
    }
    const dir = await getMemoryDir();
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  private async resolveScopeDir(scope: MemoryScope): Promise<string> {
    const base = await this.resolveBaseDir();
    const scopeDir = path.join(base, scope);
    await fs.mkdir(scopeDir, { recursive: true });
    return scopeDir;
  }

  private async getEntriesFile(scope: MemoryScope): Promise<string> {
    const scopeDir = await this.resolveScopeDir(scope);
    return path.join(scopeDir, ENTRIES_FILE);
  }

  private sortEntries(entries: MemoryEntry[]): MemoryEntry[] {
    return [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private async loadEntries(scope: MemoryScope): Promise<MemoryEntry[]> {
    const filePath = await this.getEntriesFile(scope);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as MemoryEntry[];
      }
      return [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  private async writeEntries(scope: MemoryScope, entries: MemoryEntry[]): Promise<void> {
    const filePath = await this.getEntriesFile(scope);
    const ordered = this.sortEntries(entries);
    await fs.writeFile(filePath, JSON.stringify(ordered, null, 2), "utf-8");
  }

  private applyShortTermLimit(entries: MemoryEntry[]): MemoryEntry[] {
    if (entries.length <= this.shortTermLimit) {
      return entries;
    }

    const sorted = this.sortEntries(entries);
    const retained: MemoryEntry[] = [];

    for (const entry of sorted) {
      if (retained.length < this.shortTermLimit) {
        retained.push(entry);
        continue;
      }

      if (entry.importance === "high") {
        // 尽量保留高价值记忆，将最低优先级的 normal 替换掉
        const indexToReplace = retained.findIndex((item) => item.importance === "normal");
        if (indexToReplace >= 0) {
          retained.splice(indexToReplace, 1);
          retained.push(entry);
        }
      }
    }

    return this.sortEntries(retained);
  }

  private prepareEntry(input: MemoryEntryInput): MemoryEntry {
    const id = uuidv4();
    const createdAt = input.createdAt ?? new Date().toISOString();
    const tags = Array.from(new Set((input.tags ?? []).filter(Boolean)));

    const importance: MemoryImportance = input.importance ?? (tags.some((tag) => tag.startsWith("milestone")) ? "high" : "normal");

    return {
      id,
      createdAt,
      importance,
      summary: input.summary.trim(),
      taskId: input.taskId ?? null,
      toolName: input.toolName,
      tags,
      metadata: sanitizeMetadata(input.metadata),
    };
  }

  private dedupe(entries: MemoryEntry[]): MemoryEntry[] {
    const map = new Map<string, MemoryEntry>();
    for (const entry of entries) {
      map.set(entry.id, entry);
    }
    return Array.from(map.values());
  }

  async append(entryInput: MemoryEntryInput, options: AppendOptions = {}): Promise<MemoryEntry> {
    const scope = options.scope ?? SHORT_TERM_SCOPE;
    const entry = this.prepareEntry(entryInput);

    const currentEntries = await this.loadEntries(scope);
    currentEntries.push(entry);
    const deduped = this.dedupe(currentEntries);

    const finalEntries = scope === SHORT_TERM_SCOPE ? this.applyShortTermLimit(deduped) : deduped;
    await this.writeEntries(scope, finalEntries);

    const shouldPromote = options.promote ?? entry.importance === "high";
    if (shouldPromote && scope !== LONG_TERM_SCOPE) {
      const longTermEntries = await this.loadEntries(LONG_TERM_SCOPE);
      longTermEntries.push(entry);
      await this.writeEntries(LONG_TERM_SCOPE, this.dedupe(longTermEntries));
    }

    return entry;
  }

  async listRecent(options: ListOptions = {}): Promise<MemoryEntry[]> {
    const scope = options.scope ?? SHORT_TERM_SCOPE;
    const limit = Math.max(1, options.limit ?? 10);
    const entries = await this.loadEntries(scope);

    const filtered = entries.filter((entry) => {
      const taskMatch = options.taskId === undefined || options.taskId === null
        ? true
        : entry.taskId === options.taskId;
      const tagMatch = options.tags && options.tags.length > 0
        ? options.tags.every((tag) => entry.tags.includes(tag))
        : true;
      return taskMatch && tagMatch;
    });

    return this.sortEntries(filtered).slice(0, limit);
  }

  async prune(options: PruneOptions = {}): Promise<void> {
    const maxShortTerm = options.maxShortTerm ?? this.shortTermLimit;
    const entries = await this.loadEntries(SHORT_TERM_SCOPE);
    if (entries.length <= maxShortTerm) {
      return;
    }

    const truncated = this.applyShortTermLimit(entries).slice(0, maxShortTerm);
    await this.writeEntries(SHORT_TERM_SCOPE, truncated);
  }
}

export const memoryStore = new FileSystemMemoryStore();
