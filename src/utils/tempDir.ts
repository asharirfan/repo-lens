import os from 'node:os';
import path from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';

export interface TempDirResult {
  path: string;
  cleanup: () => Promise<void>;
}

export async function createTempDir(prefix = 'repolens-'): Promise<TempDirResult> {
  const tmpBase = path.join(os.tmpdir(), prefix);
  const dirPath = await mkdtemp(tmpBase);

  return {
    path: dirPath,
    cleanup: async () => {
      await rm(dirPath, { recursive: true, force: true });
    },
  };
}
