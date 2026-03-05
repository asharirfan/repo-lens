import path from 'node:path';
import type { DependencyGroup, ParsedDependency } from '../models/index.js';
import { readTextFile } from '../utils/fileUtils.js';

export async function parseGoMod(filePath: string, repoPath: string): Promise<DependencyGroup> {
  const content = await readTextFile(path.join(repoPath, filePath));
  const lines = content.split('\n');

  const runtime: ParsedDependency[] = [];
  let inRequireBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === 'require (') {
      inRequireBlock = true;
      continue;
    }
    if (inRequireBlock && trimmed === ')') {
      inRequireBlock = false;
      continue;
    }

    if (inRequireBlock || trimmed.startsWith('require ')) {
      const depLine = inRequireBlock ? trimmed : trimmed.replace(/^require\s+/, '');
      const parts = depLine.split(/\s+/);
      if (parts.length >= 2 && parts[0] && !parts[0].startsWith('//')) {
        runtime.push({
          name: parts[0],
          version: parts[1] ?? '*',
          isDev: false,
        });
      }
    }
  }

  return {
    source: filePath,
    ecosystem: 'go',
    runtime,
    dev: [],
  };
}
