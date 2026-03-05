import path from 'node:path';

export function getRepoName(repoPath: string): string {
  return path.basename(path.resolve(repoPath));
}

export function resolveRepoPath(input: string): string {
  return path.resolve(process.cwd(), input);
}

export function normalizeSlashes(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

export function relativePath(from: string, to: string): string {
  return normalizeSlashes(path.relative(from, to));
}
