import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { BaseAnalyzer, type AnalyzerResult } from './base/IAnalyzer.js';
import { hasFile } from '../utils/fileUtils.js';

export class GoAnalyzer extends BaseAnalyzer {
  readonly name = 'go';
  readonly displayName = 'Go';

  canAnalyze(files: string[], _repoPath: string): boolean {
    return hasFile(files, 'go.mod') || files.some((f) => f.endsWith('.go'));
  }

  async analyze(repoPath: string, files: string[]): Promise<AnalyzerResult> {
    const result = this.emptyResult();

    result.stacks.push({
      name: 'go',
      displayName: 'Go',
      confidence: 'high',
      evidence: ['go.mod or .go files found'],
    });
    result.architectureNotes.push('This is a Go project.');

    let goModContent = '';
    if (hasFile(files, 'go.mod')) {
      try {
        goModContent = (await readFile(path.join(repoPath, 'go.mod'), 'utf-8')).toLowerCase();
      } catch {
        // ignore
      }
    }

    if (goModContent.includes('gin-gonic/gin')) {
      result.architectureNotes.push('Uses Gin as the HTTP framework.');
    }

    if (goModContent.includes('labstack/echo')) {
      result.architectureNotes.push('Uses Echo as the HTTP framework.');
    }

    if (goModContent.includes('gorm.io/gorm')) {
      result.architectureNotes.push('Uses GORM as the ORM.');
    }

    if (goModContent.includes('go-pg/pg') || goModContent.includes('lib/pq')) {
      result.stacks.push({
        name: 'postgresql',
        displayName: 'PostgreSQL',
        confidence: 'medium',
        evidence: ['go-pg or lib/pq in go.mod'],
      });
    }

    if (goModContent.includes('mongo-driver')) {
      result.stacks.push({
        name: 'mongodb',
        displayName: 'MongoDB',
        confidence: 'medium',
        evidence: ['mongo-driver in go.mod'],
      });
    }

    const entryPoints = files.filter((f) => /^(main\.go|cmd\/[^/]+\/main\.go)$/.test(f));
    result.entryPoints = entryPoints;

    const testDirs = files
      .filter((f) => f.endsWith('_test.go'))
      .map((f) => f.split('/')[0])
      .filter((d): d is string => d !== undefined);
    result.testDirs = [...new Set(testDirs)];

    const goFolders = ['cmd', 'internal', 'pkg', 'api', 'handler', 'service', 'repository'];
    result.configFiles = files.filter((f) => goFolders.some((folder) => f.startsWith(`${folder}/`)));

    return result;
  }
}
