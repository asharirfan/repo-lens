import { Octokit } from '@octokit/rest';

export interface RepoMeta {
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  stars: number;
  topics: string[];
  language: string | null;
}

export class GitHubService {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async getRepoMeta(owner: string, repo: string): Promise<RepoMeta | null> {
    try {
      const { data } = await this.octokit.repos.get({ owner, repo });
      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description ?? null,
        defaultBranch: data.default_branch,
        stars: data.stargazers_count,
        topics: data.topics ?? [],
        language: data.language ?? null,
      };
    } catch {
      return null;
    }
  }
}
