import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanFiles } from '../../src/scanners/fileScanner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('scanFiles', () => {
  it('scans node fixture and finds package.json', async () => {
    const fixture = path.resolve(__dirname, '../fixtures/node-project');
    const files = await scanFiles(fixture);
    expect(files).toContain('package.json');
  });

  it('scans python fixture and finds requirements.txt', async () => {
    const fixture = path.resolve(__dirname, '../fixtures/python-project');
    const files = await scanFiles(fixture);
    expect(files).toContain('requirements.txt');
  });

  it('scans go fixture and finds go.mod', async () => {
    const fixture = path.resolve(__dirname, '../fixtures/go-project');
    const files = await scanFiles(fixture);
    expect(files).toContain('go.mod');
  });

  it('returns normalized forward-slash paths', async () => {
    const fixture = path.resolve(__dirname, '../fixtures/node-project');
    const files = await scanFiles(fixture);
    expect(files.every((f) => !f.includes('\\'))).toBe(true);
  });

  it('returns sorted results', async () => {
    const fixture = path.resolve(__dirname, '../fixtures/node-project');
    const files = await scanFiles(fixture);
    const sorted = [...files].sort();
    expect(files).toEqual(sorted);
  });
});
