import path from 'node:path';
import type { DependencyGroup, ParsedDependency } from '../models/index.js';
import { readTextFile } from '../utils/fileUtils.js';

function parseRequirementsLine(line: string): ParsedDependency | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) return null;

  const match = /^([A-Za-z0-9_.-]+)\s*([><=!~^]+\s*[\d.*]+)?/.exec(trimmed);
  if (!match) return null;

  return {
    name: match[1].toLowerCase(),
    version: match[2]?.trim() ?? '*',
    isDev: false,
  };
}

export async function parseRequirementsTxt(
  filePath: string,
  repoPath: string,
): Promise<DependencyGroup> {
  const content = await readTextFile(path.join(repoPath, filePath));
  const lines = content.split('\n');

  const runtime: ParsedDependency[] = [];
  for (const line of lines) {
    const dep = parseRequirementsLine(line);
    if (dep) runtime.push(dep);
  }

  return {
    source: filePath,
    ecosystem: 'python',
    runtime,
    dev: [],
  };
}
