import type { StackInfo, DependencyGroup } from '../../models/index.js';

export interface AnalyzerResult {
  stacks: StackInfo[];
  dependencies: DependencyGroup[];
  entryPoints: string[];
  configFiles: string[];
  testDirs: string[];
  architectureNotes: string[];
}

export interface IAnalyzer {
  readonly name: string;
  readonly displayName: string;
  canAnalyze(files: string[], repoPath: string): boolean;
  analyze(repoPath: string, files: string[]): Promise<AnalyzerResult>;
}

export abstract class BaseAnalyzer implements IAnalyzer {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract canAnalyze(files: string[], repoPath: string): boolean;
  abstract analyze(repoPath: string, files: string[]): Promise<AnalyzerResult>;

  protected emptyResult(): AnalyzerResult {
    return {
      stacks: [],
      dependencies: [],
      entryPoints: [],
      configFiles: [],
      testDirs: [],
      architectureNotes: [],
    };
  }
}
