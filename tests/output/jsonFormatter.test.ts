import { describe, it, expect } from 'vitest';
import { formatJson } from '../../src/output/jsonFormatter.js';
import type { AnalysisResult } from '../../src/models/index.js';

const mockResult: AnalysisResult = {
  projectInfo: {
    repoName: 'test-repo',
    localPath: '/tmp/test-repo',
    isGitHub: false,
  },
  detectedStacks: [
    {
      name: 'nodejs',
      displayName: 'Node.js',
      confidence: 'high',
      evidence: ['package.json found'],
    },
  ],
  structure: {
    entryPoints: ['src/index.ts'],
    majorFolders: ['src', 'tests'],
    testDirs: ['tests'],
    configFiles: ['tsconfig.json'],
    moduleBoundaries: ['components', 'utils'],
    totalFiles: 42,
  },
  dependencyGroups: [],
  architectureSummary: 'This is a Node.js project.',
  diagram: 'test-repo\n└── Stack\n    └── Node.js',
  metadata: {
    analyzedAt: '2024-01-01T00:00:00.000Z',
    durationMs: 123,
    repolensVersion: '0.1.0',
  },
};

describe('jsonFormatter', () => {
  it('produces valid JSON', () => {
    const output = formatJson(mockResult);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('contains projectInfo', () => {
    const output = formatJson(mockResult);
    const parsed = JSON.parse(output) as AnalysisResult;
    expect(parsed.projectInfo.repoName).toBe('test-repo');
  });

  it('contains detectedStacks', () => {
    const output = formatJson(mockResult);
    const parsed = JSON.parse(output) as AnalysisResult;
    expect(parsed.detectedStacks).toHaveLength(1);
    expect(parsed.detectedStacks[0]?.name).toBe('nodejs');
  });

  it('contains metadata', () => {
    const output = formatJson(mockResult);
    const parsed = JSON.parse(output) as AnalysisResult;
    expect(parsed.metadata.repolensVersion).toBe('0.1.0');
  });

  it('is pretty-printed with 2-space indentation', () => {
    const output = formatJson(mockResult);
    expect(output).toContain('  "projectInfo"');
  });
});
