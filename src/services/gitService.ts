import path from 'node:path';
import { simpleGit } from 'simple-git';
import { createTempDir } from '../utils/tempDir.js';
import { parseGitHubUrl, buildCloneUrl } from '../utils/urlUtils.js';

export interface CloneResult {
  localPath: string;
  repoName: string;
  cleanup: () => Promise<void>;
}

export async function cloneRepository(url: string): Promise<CloneResult> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }

  const { owner, repo, ref } = parsed;
  const cloneUrl = buildCloneUrl(owner, repo);

  const tempDir = await createTempDir('repolens-');
  const clonePath = path.join(tempDir.path, repo);

  const git = simpleGit();
  const cloneOptions: string[] = ['--depth', '1'];
  if (ref) {
    cloneOptions.push('--branch', ref);
  }

  await git.clone(cloneUrl, clonePath, cloneOptions);

  return {
    localPath: clonePath,
    repoName: `${owner}/${repo}`,
    cleanup: tempDir.cleanup,
  };
}
