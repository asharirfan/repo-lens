import path from 'node:path';
import { parse as parseToml } from 'smol-toml';
import type { DependencyGroup, ParsedDependency } from '../models/index.js';
import { readTextFile } from '../utils/fileUtils.js';

interface CargoToml {
  dependencies?: Record<string, string | { version?: string }>;
  'dev-dependencies'?: Record<string, string | { version?: string }>;
}

function extractVersion(value: string | { version?: string }): string {
  if (typeof value === 'string') return value;
  return value.version ?? '*';
}

export async function parseCargoToml(filePath: string, repoPath: string): Promise<DependencyGroup> {
  const content = await readTextFile(path.join(repoPath, filePath));
  const cargo = parseToml(content) as CargoToml;

  const runtime: ParsedDependency[] = Object.entries(cargo.dependencies ?? {}).map(
    ([name, value]) => ({
      name,
      version: extractVersion(value),
      isDev: false,
    }),
  );

  const dev: ParsedDependency[] = Object.entries(cargo['dev-dependencies'] ?? {}).map(
    ([name, value]) => ({
      name,
      version: extractVersion(value),
      isDev: true,
    }),
  );

  return {
    source: filePath,
    ecosystem: 'rust',
    runtime,
    dev,
  };
}
