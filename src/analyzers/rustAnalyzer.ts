import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { BaseAnalyzer, type AnalyzerResult } from './base/IAnalyzer.js';
import { hasFile } from '../utils/fileUtils.js';

export class RustAnalyzer extends BaseAnalyzer {
  readonly name = 'rust';
  readonly displayName = 'Rust';

  canAnalyze(files: string[], _repoPath: string): boolean {
    return hasFile(files, 'Cargo.toml') || files.some((f) => f.endsWith('.rs'));
  }

  async analyze(repoPath: string, files: string[]): Promise<AnalyzerResult> {
    const result = this.emptyResult();

    result.stacks.push({
      name: 'rust',
      displayName: 'Rust',
      confidence: 'high',
      evidence: ['Cargo.toml or .rs files found'],
    });
    result.architectureNotes.push('This is a Rust project.');

    let cargoContent = '';
    if (hasFile(files, 'Cargo.toml')) {
      try {
        cargoContent = (await readFile(path.join(repoPath, 'Cargo.toml'), 'utf-8')).toLowerCase();
      } catch {
        // ignore
      }
    }

    if (cargoContent.includes('actix-web')) {
      result.architectureNotes.push('Uses Actix-web as the HTTP framework.');
    }

    if (cargoContent.includes('tokio')) {
      result.architectureNotes.push('Uses Tokio for async runtime.');
    }

    if (cargoContent.includes('sqlx')) {
      result.architectureNotes.push('Uses SQLx for database access.');
    }

    if (cargoContent.includes('diesel')) {
      result.architectureNotes.push('Uses Diesel as the ORM.');
    }

    if (cargoContent.includes('serde')) {
      result.architectureNotes.push('Uses Serde for serialization.');
    }

    const entryPoints = files.filter((f) => /^src\/main\.rs$/.test(f));
    result.entryPoints = entryPoints;

    const testDirs = files
      .filter((f) => /^tests\//.test(f))
      .map((f) => f.split('/')[0])
      .filter((d): d is string => d !== undefined);
    result.testDirs = [...new Set(testDirs)];

    return result;
  }
}
