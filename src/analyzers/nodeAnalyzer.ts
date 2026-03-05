import path from 'node:path';
import { BaseAnalyzer, type AnalyzerResult } from './base/IAnalyzer.js';
import type { StackInfo, DependencyGroup } from '../models/index.js';
import { readJsonFile } from '../utils/fileUtils.js';
import { hasFile } from '../utils/fileUtils.js';

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
}

function detectVersion(deps: Record<string, string>, key: string): string | undefined {
  const val = deps[key];
  if (!val) return undefined;
  return val.replace(/^[\^~>=<]/, '').split(' ')[0];
}

export class NodeAnalyzer extends BaseAnalyzer {
  readonly name = 'node';
  readonly displayName = 'Node.js / JavaScript';

  canAnalyze(files: string[], _repoPath: string): boolean {
    return hasFile(files, 'package.json');
  }

  async analyze(repoPath: string, files: string[]): Promise<AnalyzerResult> {
    const result = this.emptyResult();

    let pkg: PackageJson = {};
    try {
      pkg = await readJsonFile<PackageJson>(path.join(repoPath, 'package.json'));
    } catch {
      return result;
    }

    const allDeps: Record<string, string> = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    };

    result.stacks.push({
      name: 'nodejs',
      displayName: 'Node.js',
      confidence: 'high',
      evidence: ['package.json found'],
    });

    result.architectureNotes.push('This is a Node.js project.');

    if ('next' in allDeps) {
      const version = detectVersion(allDeps, 'next');
      result.stacks.push({
        name: 'nextjs',
        displayName: 'Next.js',
        version,
        confidence: 'high',
        evidence: ['next in dependencies'],
      });
      result.architectureNotes.push('Uses Next.js for server-side rendering and routing.');
      result.configFiles.push('next.config.js', 'next.config.ts', 'next.config.mjs');
    }

    if ('react' in allDeps || 'react-dom' in allDeps) {
      const version = detectVersion(allDeps, 'react');
      result.stacks.push({
        name: 'react',
        displayName: 'React',
        version,
        confidence: 'high',
        evidence: ['react in dependencies'],
      });
      result.architectureNotes.push('Uses React for UI components.');
    }

    if ('vue' in allDeps) {
      const version = detectVersion(allDeps, 'vue');
      result.stacks.push({
        name: 'vue',
        displayName: 'Vue.js',
        version,
        confidence: 'high',
        evidence: ['vue in dependencies'],
      });
      result.architectureNotes.push('Uses Vue.js for UI components.');
    }

    if ('tailwindcss' in allDeps) {
      const version = detectVersion(allDeps, 'tailwindcss');
      result.stacks.push({
        name: 'tailwind',
        displayName: 'Tailwind CSS',
        version,
        confidence: 'high',
        evidence: ['tailwindcss in dependencies'],
      });
      result.architectureNotes.push('Uses Tailwind CSS for styling.');
    }

    if ('pg' in allDeps || '@prisma/client' in allDeps || 'postgres' in allDeps) {
      result.stacks.push({
        name: 'postgresql',
        displayName: 'PostgreSQL',
        confidence: 'medium',
        evidence: ['pg or @prisma/client in dependencies'],
      });
      result.architectureNotes.push('Uses PostgreSQL as the database.');
    }

    if ('mongoose' in allDeps || 'mongodb' in allDeps) {
      result.stacks.push({
        name: 'mongodb',
        displayName: 'MongoDB',
        confidence: 'medium',
        evidence: ['mongoose or mongodb in dependencies'],
      });
      result.architectureNotes.push('Uses MongoDB as the database.');
    }

    const testDirs = files
      .filter((f) => /^(tests?|__tests__|spec|e2e)\//.test(f))
      .map((f) => f.split('/')[0])
      .filter((d): d is string => d !== undefined);
    result.testDirs = [...new Set(testDirs)];

    const entryPoints = files.filter((f) =>
      /^(src\/)?(index|main|app|server)\.(ts|js|tsx|jsx)$/.test(f),
    );
    result.entryPoints = entryPoints;

    return result;
  }
}
