export interface GitHubUrlInfo {
  owner: string;
  repo: string;
  ref?: string;
}

const GITHUB_URL_PATTERN =
  /^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?(?:\/tree\/([^/]+))?(?:\/.*)?$/;

export function isGitHubUrl(input: string): boolean {
  return GITHUB_URL_PATTERN.test(input);
}

export function parseGitHubUrl(url: string): GitHubUrlInfo | null {
  const match = GITHUB_URL_PATTERN.exec(url);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    ref: match[3],
  };
}

export function buildCloneUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}.git`;
}
