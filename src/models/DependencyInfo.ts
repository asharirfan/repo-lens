export interface ParsedDependency {
  name: string;
  version: string;
  isDev: boolean;
}

export interface DependencyGroup {
  source: string;
  ecosystem: 'node' | 'python' | 'go' | 'rust' | 'unknown';
  runtime: ParsedDependency[];
  dev: ParsedDependency[];
  scripts?: Record<string, string>;
}
