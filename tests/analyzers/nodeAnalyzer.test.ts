import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeAnalyzer } from '../../src/analyzers/nodeAnalyzer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeFixture = path.resolve(__dirname, '../fixtures/node-project');

describe('NodeAnalyzer', () => {
  const analyzer = new NodeAnalyzer();

  it('has correct name and displayName', () => {
    expect(analyzer.name).toBe('node');
    expect(analyzer.displayName).toBe('Node.js / JavaScript');
  });

  it('canAnalyze returns true when package.json is present', () => {
    expect(analyzer.canAnalyze(['package.json', 'src/index.ts'], nodeFixture)).toBe(true);
  });

  it('canAnalyze returns false when package.json is absent', () => {
    expect(analyzer.canAnalyze(['main.go', 'go.mod'], nodeFixture)).toBe(false);
  });

  it('detects Node.js, Next.js, React, Tailwind, and PostgreSQL stacks', async () => {
    const files = ['package.json', 'next.config.js', 'src/app/page.tsx'];
    const result = await analyzer.analyze(nodeFixture, files);

    const stackNames = result.stacks.map((s) => s.name);
    expect(stackNames).toContain('nodejs');
    expect(stackNames).toContain('nextjs');
    expect(stackNames).toContain('react');
    expect(stackNames).toContain('tailwind');
    expect(stackNames).toContain('postgresql');
  });

  it('detects Next.js version from package.json', async () => {
    const files = ['package.json'];
    const result = await analyzer.analyze(nodeFixture, files);
    const nextStack = result.stacks.find((s) => s.name === 'nextjs');
    expect(nextStack?.version).toBe('14.2.3');
  });

  it('returns architecture notes', async () => {
    const result = await analyzer.analyze(nodeFixture, ['package.json']);
    expect(result.architectureNotes.length).toBeGreaterThan(0);
    expect(result.architectureNotes.some((n) => n.includes('Node.js'))).toBe(true);
  });
});
