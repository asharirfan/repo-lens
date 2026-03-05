import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGoMod } from '../../src/parsers/goModParser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const goFixture = path.resolve(__dirname, '../fixtures/go-project');

describe('parseGoMod', () => {
  it('parses all required modules', async () => {
    const result = await parseGoMod('go.mod', goFixture);
    const names = result.runtime.map((d) => d.name);
    expect(names).toContain('github.com/gin-gonic/gin');
    expect(names).toContain('github.com/gorm.io/gorm');
    expect(names).toContain('github.com/lib/pq');
  });

  it('parses versions correctly', async () => {
    const result = await parseGoMod('go.mod', goFixture);
    const gin = result.runtime.find((d) => d.name === 'github.com/gin-gonic/gin');
    expect(gin?.version).toBe('v1.10.0');
  });

  it('sets ecosystem to go', async () => {
    const result = await parseGoMod('go.mod', goFixture);
    expect(result.ecosystem).toBe('go');
  });

  it('has empty dev array', async () => {
    const result = await parseGoMod('go.mod', goFixture);
    expect(result.dev).toHaveLength(0);
  });
});
