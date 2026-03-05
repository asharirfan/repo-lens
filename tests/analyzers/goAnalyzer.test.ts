import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoAnalyzer } from '../../src/analyzers/goAnalyzer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const goFixture = path.resolve(__dirname, '../fixtures/go-project');

describe('GoAnalyzer', () => {
  const analyzer = new GoAnalyzer();

  it('has correct name and displayName', () => {
    expect(analyzer.name).toBe('go');
    expect(analyzer.displayName).toBe('Go');
  });

  it('canAnalyze returns true when go.mod is present', () => {
    expect(analyzer.canAnalyze(['go.mod', 'main.go'], goFixture)).toBe(true);
  });

  it('canAnalyze returns true when .go files are present', () => {
    expect(analyzer.canAnalyze(['main.go'], goFixture)).toBe(true);
  });

  it('canAnalyze returns false for non-Go projects', () => {
    expect(analyzer.canAnalyze(['package.json', 'src/index.ts'], goFixture)).toBe(false);
  });

  it('detects Go stack', async () => {
    const files = ['go.mod', 'main.go'];
    const result = await analyzer.analyze(goFixture, files);

    const stackNames = result.stacks.map((s) => s.name);
    expect(stackNames).toContain('go');
  });

  it('detects Gin framework from go.mod', async () => {
    const files = ['go.mod', 'main.go'];
    const result = await analyzer.analyze(goFixture, files);
    expect(result.architectureNotes.some((n) => n.includes('Gin'))).toBe(true);
  });

  it('detects GORM from go.mod', async () => {
    const files = ['go.mod', 'main.go'];
    const result = await analyzer.analyze(goFixture, files);
    expect(result.architectureNotes.some((n) => n.includes('GORM'))).toBe(true);
  });

  it('detects main.go as entry point', async () => {
    const files = ['go.mod', 'main.go'];
    const result = await analyzer.analyze(goFixture, files);
    expect(result.entryPoints).toContain('main.go');
  });
});
