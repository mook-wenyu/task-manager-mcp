import { randomUUID } from "crypto";
import { mkdir, rename, rm, writeFile } from "fs/promises";
import path from "path";

async function writeFileAtomicInternal(
  targetPath: string,
  data: string | Buffer
): Promise<void> {
  const directory = path.dirname(targetPath);
  await mkdir(directory, { recursive: true });

  const tempFile = path.join(
    directory,
    `.tmp-${randomUUID()}-${path.basename(targetPath)}`
  );

  await writeFile(tempFile, data);
  await rm(targetPath, { force: true });
  await rename(tempFile, targetPath);
}

export async function writeTextFileAtomic(
  targetPath: string,
  content: string
): Promise<void> {
  await writeFileAtomicInternal(targetPath, content);
}

export async function writeJsonFileAtomic(
  targetPath: string,
  value: unknown,
  space = 2
): Promise<void> {
  const serialized = `${JSON.stringify(value, null, space)}\n`;
  await writeFileAtomicInternal(targetPath, serialized);
}
