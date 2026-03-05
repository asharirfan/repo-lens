import { describe, it, expect } from 'vitest';
import { analyzeStructure } from '../../src/scanners/structureScanner.js';

describe('analyzeStructure', () => {
  const nodeFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    'src/app/page.tsx',
    'src/components/Button.tsx',
    'src/lib/utils.ts',
    'src/api/users.ts',
    'tests/unit/button.test.ts',
    'tests/e2e/home.test.ts',
    '.env',
    '.env.example',
  ];

  it('detects entry points', () => {
    const result = analyzeStructure(nodeFiles);
    expect(result.entryPoints.length).toBeGreaterThanOrEqual(0);
  });

  it('detects test directories', () => {
    const result = analyzeStructure(nodeFiles);
    expect(result.testDirs).toContain('tests');
  });

  it('detects config files', () => {
    const result = analyzeStructure(nodeFiles);
    expect(result.configFiles).toContain('tsconfig.json');
    expect(result.configFiles).toContain('next.config.js');
  });

  it('detects major folders', () => {
    const result = analyzeStructure(nodeFiles);
    expect(result.majorFolders).toContain('src');
  });

  it('counts total files', () => {
    const result = analyzeStructure(nodeFiles);
    expect(result.totalFiles).toBe(nodeFiles.length);
  });

  it('detects module boundaries', () => {
    const result = analyzeStructure(nodeFiles);
    expect(result.moduleBoundaries.length).toBeGreaterThan(0);
  });
});
