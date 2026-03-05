import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { BaseAnalyzer, type AnalyzerResult } from './base/IAnalyzer.js';
import { hasFile } from '../utils/fileUtils.js';

export class PythonAnalyzer extends BaseAnalyzer {
  readonly name = 'python';
  readonly displayName = 'Python';

  canAnalyze(files: string[], _repoPath: string): boolean {
    return (
      hasFile(files, 'requirements.txt') ||
      hasFile(files, 'pyproject.toml') ||
      hasFile(files, 'setup.py') ||
      hasFile(files, 'Pipfile') ||
      files.some((f) => f.endsWith('.py'))
    );
  }

  async analyze(repoPath: string, files: string[]): Promise<AnalyzerResult> {
    const result = this.emptyResult();

    result.stacks.push({
      name: 'python',
      displayName: 'Python',
      confidence: 'high',
      evidence: ['Python source files or dependency files found'],
    });
    result.architectureNotes.push('This is a Python project.');

    const depContent = await this.readDepsContent(repoPath, files);

    if (depContent.includes('fastapi')) {
      result.stacks.push({
        name: 'fastapi',
        displayName: 'FastAPI',
        confidence: 'high',
        evidence: ['fastapi in dependencies'],
      });
      result.architectureNotes.push('Uses FastAPI for building APIs.');
      result.entryPoints.push('app/main.py', 'main.py', 'src/main.py');
    }

    if (depContent.includes('django')) {
      result.stacks.push({
        name: 'django',
        displayName: 'Django',
        confidence: 'high',
        evidence: ['django in dependencies'],
      });
      result.architectureNotes.push('Uses Django as the web framework.');
      result.configFiles.push('manage.py', 'settings.py');
    }

    if (depContent.includes('flask')) {
      result.stacks.push({
        name: 'flask',
        displayName: 'Flask',
        confidence: 'high',
        evidence: ['flask in dependencies'],
      });
      result.architectureNotes.push('Uses Flask as the web framework.');
    }

    if (depContent.includes('psycopg2') || depContent.includes('asyncpg')) {
      result.stacks.push({
        name: 'postgresql',
        displayName: 'PostgreSQL',
        confidence: 'medium',
        evidence: ['psycopg2 or asyncpg in dependencies'],
      });
      result.architectureNotes.push('Uses PostgreSQL as the database.');
    }

    if (depContent.includes('pymongo') || depContent.includes('motor')) {
      result.stacks.push({
        name: 'mongodb',
        displayName: 'MongoDB',
        confidence: 'medium',
        evidence: ['pymongo or motor in dependencies'],
      });
      result.architectureNotes.push('Uses MongoDB as the database.');
    }

    const testDirs = files
      .filter((f) => /^(tests?|__tests__|spec)\//.test(f))
      .map((f) => f.split('/')[0])
      .filter((d): d is string => d !== undefined);
    result.testDirs = [...new Set(testDirs)];

    const entryPoints = files.filter((f) => /^(main|app|run|wsgi|asgi)\.py$/.test(f));
    result.entryPoints = entryPoints;

    return result;
  }

  private async readDepsContent(repoPath: string, files: string[]): Promise<string> {
    const depFiles = ['requirements.txt', 'pyproject.toml', 'Pipfile'];
    const contents: string[] = [];

    for (const depFile of depFiles) {
      if (hasFile(files, depFile)) {
        try {
          const content = await readFile(path.join(repoPath, depFile), 'utf-8');
          contents.push(content.toLowerCase());
        } catch {
          // ignore
        }
      }
    }

    return contents.join('\n');
  }
}
