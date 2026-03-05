import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

export async function readTextFile(filePath: string): Promise<string> {
  return readFile(filePath, 'utf-8');
}

export async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
  const content = await readTextFile(filePath);
  return JSON.parse(content) as T;
}

export function getTopLevelDirs(files: string[]): string[] {
  const dirs = new Set<string>();
  for (const file of files) {
    const parts = file.split('/');
    if (parts.length > 1) {
      dirs.add(parts[0]);
    }
  }
  return Array.from(dirs).sort();
}

export function hasFile(files: string[], filename: string): boolean {
  return files.some((f) => path.basename(f) === filename || f === filename);
}

export function hasFileInRoot(files: string[], filename: string): boolean {
  return files.some((f) => f === filename || f === `./${filename}`);
}

export function findFiles(files: string[], pattern: RegExp): string[] {
  return files.filter((f) => pattern.test(f));
}
