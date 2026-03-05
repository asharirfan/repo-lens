export interface ProjectInfo {
  repoName: string;
  repoUrl?: string;
  localPath: string;
  isGitHub: boolean;
  defaultBranch?: string;
  description?: string;
  stars?: number;
  topics?: string[];
}
