import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PythonAnalyzer } from '../../src/analyzers/pythonAnalyzer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pythonFixture = path.resolve(__dirname, '../fixtures/python-project');

describe('PythonAnalyzer', () => {
  const analyzer = new PythonAnalyzer();

  it('has correct name and displayName', () => {
    expect(analyzer.name).toBe('python');
    expect(analyzer.displayName).toBe('Python');
  });

  it('canAnalyze returns true when requirements.txt is present', () => {
    expect(analyzer.canAnalyze(['requirements.txt', 'app/main.py'], pythonFixture)).toBe(true);
  });

  it('canAnalyze returns true when .py files are present', () => {
    expect(analyzer.canAnalyze(['app/main.py'], pythonFixture)).toBe(true);
  });

  it('canAnalyze returns false for non-Python projects', () => {
    expect(analyzer.canAnalyze(['package.json', 'src/index.ts'], pythonFixture)).toBe(false);
  });

  it('detects Python and FastAPI stacks', async () => {
    const files = ['requirements.txt', 'app/main.py'];
    const result = await analyzer.analyze(pythonFixture, files);

    const stackNames = result.stacks.map((s) => s.name);
    expect(stackNames).toContain('python');
    expect(stackNames).toContain('fastapi');
  });

  it('detects PostgreSQL from psycopg2', async () => {
    const files = ['requirements.txt', 'app/main.py'];
    const result = await analyzer.analyze(pythonFixture, files);

    const stackNames = result.stacks.map((s) => s.name);
    expect(stackNames).toContain('postgresql');
  });

  it('returns architecture notes mentioning FastAPI', async () => {
    const result = await analyzer.analyze(pythonFixture, ['requirements.txt', 'app/main.py']);
    expect(result.architectureNotes.some((n) => n.includes('FastAPI'))).toBe(true);
  });
});
