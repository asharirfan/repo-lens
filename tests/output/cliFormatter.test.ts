import { describe, it, expect } from 'vitest';
import { formatCli } from '../../src/output/cliFormatter.js';
import type { AnalysisResult } from '../../src/models/index.js';

const mockResult: AnalysisResult = {
  projectInfo: {
    repoName: 'my-app',
    localPath: '/tmp/my-app',
    isGitHub: false,
  },
  detectedStacks: [
    { name: 'nodejs', displayName: 'Node.js', confidence: 'high', evidence: ['package.json'] },
    { name: 'react', displayName: 'React', version: '18.3.0', confidence: 'high', evidence: ['react in deps'] },
  ],
  structure: {
    entryPoints: ['src/index.ts'],
    majorFolders: ['src', 'tests', 'public'],
    testDirs: ['tests'],
    configFiles: ['tsconfig.json'],
    moduleBoundaries: ['components', 'utils'],
    totalFiles: 25,
  },
  dependencyGroups: [
    {
      source: 'package.json',
      ecosystem: 'node',
      runtime: [
        { name: 'react', version: '^18.0.0', isDev: false },
      ],
      dev: [
        { name: 'typescript', version: '^5.0.0', isDev: true },
      ],
    },
  ],
  architectureSummary: 'This is a Node.js project using React.',
  diagram: 'my-app\n└── Stack\n    └── Node.js',
  metadata: {
    analyzedAt: '2024-01-01T00:00:00.000Z',
    durationMs: 99,
    repolensVersion: '0.1.0',
  },
};

describe('cliFormatter', () => {
  it('renders without throwing', () => {
    expect(() => formatCli(mockResult)).not.toThrow();
  });

  it('contains the repo name', () => {
    const output = formatCli(mockResult);
    expect(output).toContain('my-app');
  });

  it('contains detected stack names', () => {
    const output = formatCli(mockResult);
    expect(output).toContain('Node.js');
    expect(output).toContain('React');
  });

  it('contains architecture summary', () => {
    const output = formatCli(mockResult);
    expect(output).toContain('This is a Node.js project');
  });

  it('contains file count in footer', () => {
    const output = formatCli(mockResult);
    expect(output).toContain('25');
  });

  it('contains version in footer', () => {
    const output = formatCli(mockResult);
    expect(output).toContain('0.1.0');
  });
});
