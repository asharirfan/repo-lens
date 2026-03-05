import type { IAnalyzer, AnalyzerResult } from './base/IAnalyzer.js';

export class AnalyzerRegistry {
  private analyzers: IAnalyzer[] = [];

  register(analyzer: IAnalyzer): this {
    this.analyzers.push(analyzer);
    return this;
  }

  getMatching(files: string[], repoPath: string): IAnalyzer[] {
    return this.analyzers.filter((a) => a.canAnalyze(files, repoPath));
  }

  async runAll(repoPath: string, files: string[]): Promise<AnalyzerResult[]> {
    const matching = this.getMatching(files, repoPath);
    return Promise.all(matching.map((a) => a.analyze(repoPath, files)));
  }
}
