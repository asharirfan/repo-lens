import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { BaseAnalyzer, type AnalyzerResult } from './base/IAnalyzer.js';
import { hasFile } from '../utils/fileUtils.js';

export class DockerAnalyzer extends BaseAnalyzer {
  readonly name = 'docker';
  readonly displayName = 'Docker';

  canAnalyze(files: string[], _repoPath: string): boolean {
    return (
      hasFile(files, 'Dockerfile') ||
      hasFile(files, 'docker-compose.yml') ||
      hasFile(files, 'docker-compose.yaml') ||
      files.some((f) => /^Dockerfile(\..+)?$/.test(f.split('/').pop() ?? ''))
    );
  }

  async analyze(repoPath: string, files: string[]): Promise<AnalyzerResult> {
    const result = this.emptyResult();

    result.stacks.push({
      name: 'docker',
      displayName: 'Docker',
      confidence: 'high',
      evidence: ['Dockerfile or docker-compose.yml found'],
    });
    result.architectureNotes.push('Project is containerized with Docker.');

    const dockerfiles = files.filter((f) => /Dockerfile/.test(f));
    result.configFiles = dockerfiles;

    for (const dockerfile of dockerfiles.slice(0, 3)) {
      try {
        const content = await readFile(path.join(repoPath, dockerfile), 'utf-8');
        const stages = (content.match(/^FROM\s+/gim) ?? []).length;
        if (stages > 1) {
          result.architectureNotes.push(`Uses multi-stage Docker build (${stages} stages).`);
        }
      } catch {
        // ignore
      }
    }

    const composeFile =
      files.find((f) => f === 'docker-compose.yml') ??
      files.find((f) => f === 'docker-compose.yaml');

    if (composeFile) {
      try {
        const content = await readFile(path.join(repoPath, composeFile), 'utf-8');
        const serviceMatches = content.match(/^\s{2}[a-zA-Z][a-zA-Z0-9_-]+:/gm) ?? [];
        if (serviceMatches.length > 0) {
          result.architectureNotes.push(
            `Docker Compose defines ${serviceMatches.length} service(s).`,
          );
        }
      } catch {
        // ignore
      }
    }

    return result;
  }
}
