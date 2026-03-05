import { describe, it, expect } from 'vitest';
import { formatMarkdown } from '../../src/output/markdownFormatter.js';
import type { AnalysisResult } from '../../src/models/index.js';

const mockResult: AnalysisResult = {
  projectInfo: {
    repoName: 'vercel/next.js',
    repoUrl: 'https://github.com/vercel/next.js',
    localPath: '/tmp/next.js',
    isGitHub: true,
    description: 'The React Framework',
  },
  detectedStacks: [
    { name: 'nodejs', displayName: 'Node.js', confidence: 'high', evidence: ['package.json'] },
    { name: 'nextjs', displayName: 'Next.js', version: '14.2.3', confidence: 'high', evidence: ['next in deps'] },
    { name: 'react', displayName: 'React', confidence: 'high', evidence: ['react in deps'] },
  ],
  structure: {
    entryPoints: ['src/index.ts'],
    majorFolders: ['src', 'packages', 'examples', 'test'],
    testDirs: ['test'],
    configFiles: ['tsconfig.json', 'package.json'],
    moduleBoundaries: ['packages', 'examples'],
    totalFiles: 1500,
  },
  dependencyGroups: [
    {
      source: 'package.json',
      ecosystem: 'node',
      runtime: [
        { name: 'react', version: '^18.0.0', isDev: false },
        { name: 'react-dom', version: '^18.0.0', isDev: false },
      ],
      dev: [
        { name: 'typescript', version: '^5.0.0', isDev: true },
      ],
    },
  ],
  architectureSummary: 'This is a Next.js project using React and TypeScript.',
  diagram: 'vercel/next.js\n├── Stack\n│   └── Next.js (14.2.3)',
  metadata: {
    analyzedAt: '2024-01-01T00:00:00.000Z',
    durationMs: 456,
    repolensVersion: '0.1.0',
  },
};

describe('markdownFormatter', () => {
  it('starts with an H1 heading containing the repo name', () => {
    const output = formatMarkdown(mockResult);
    expect(output).toMatch(/^# RepoLens Report: vercel\/next\.js/);
  });

  it('contains Detected Stacks section', () => {
    const output = formatMarkdown(mockResult);
    expect(output).toContain('## Detected Stacks');
  });

  it('contains stack names in the table', () => {
    const output = formatMarkdown(mockResult);
    expect(output).toContain('Node.js');
    expect(output).toContain('Next.js');
    expect(output).toContain('React');
  });

  it('contains Architecture Summary section', () => {
    const output = formatMarkdown(mockResult);
    expect(output).toContain('## Architecture Summary');
    expect(output).toContain('This is a Next.js project');
  });

  it('contains Project Structure section', () => {
    const output = formatMarkdown(mockResult);
    expect(output).toContain('## Project Structure');
  });

  it('contains Dependencies section', () => {
    const output = formatMarkdown(mockResult);
    expect(output).toContain('## Dependencies');
    expect(output).toContain('react');
  });

  it('contains Architecture Diagram section', () => {
    const output = formatMarkdown(mockResult);
    expect(output).toContain('## Architecture Diagram');
  });

  it('contains metadata footer', () => {
    const output = formatMarkdown(mockResult);
    expect(output).toContain('repolens v0.1.0');
  });
});
