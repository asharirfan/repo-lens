import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePackageJson } from '../../src/parsers/packageJsonParser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeFixture = path.resolve(__dirname, '../fixtures/node-project');

describe('parsePackageJson', () => {
  it('parses runtime dependencies', async () => {
    const result = await parsePackageJson('package.json', nodeFixture);
    const names = result.runtime.map((d) => d.name);
    expect(names).toContain('next');
    expect(names).toContain('react');
    expect(names).toContain('react-dom');
    expect(names).toContain('pg');
  });

  it('parses dev dependencies', async () => {
    const result = await parsePackageJson('package.json', nodeFixture);
    const names = result.dev.map((d) => d.name);
    expect(names).toContain('typescript');
    expect(names).toContain('tailwindcss');
    expect(names).toContain('vitest');
  });

  it('marks runtime deps as isDev=false', async () => {
    const result = await parsePackageJson('package.json', nodeFixture);
    const next = result.runtime.find((d) => d.name === 'next');
    expect(next?.isDev).toBe(false);
  });

  it('marks dev deps as isDev=true', async () => {
    const result = await parsePackageJson('package.json', nodeFixture);
    const ts = result.dev.find((d) => d.name === 'typescript');
    expect(ts?.isDev).toBe(true);
  });

  it('parses scripts', async () => {
    const result = await parsePackageJson('package.json', nodeFixture);
    expect(result.scripts?.['dev']).toBe('next dev');
    expect(result.scripts?.['build']).toBe('next build');
  });

  it('sets ecosystem to node', async () => {
    const result = await parsePackageJson('package.json', nodeFixture);
    expect(result.ecosystem).toBe('node');
  });

  it('sets correct version for next', async () => {
    const result = await parsePackageJson('package.json', nodeFixture);
    const next = result.runtime.find((d) => d.name === 'next');
    expect(next?.version).toBe('14.2.3');
  });
});
