import { glob } from 'glob';
import path from 'node:path';
import { normalizeSlashes } from '../utils/pathUtils.js';

const IGNORE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.next/**',
  '__pycache__/**',
  '*.pyc',
  '.venv/**',
  'venv/**',
  'vendor/**',
  'target/**',
  'coverage/**',
  '.nyc_output/**',
];

export async function scanFiles(repoPath: string): Promise<string[]> {
  const files = await glob('**/*', {
    cwd: repoPath,
    nodir: true,
    dot: true,
    ignore: IGNORE_PATTERNS,
    maxDepth: 10,
  });

  return files.map((f) => normalizeSlashes(path.normalize(f))).sort();
}
