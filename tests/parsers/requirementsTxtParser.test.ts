import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRequirementsTxt } from '../../src/parsers/requirementsTxtParser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pythonFixture = path.resolve(__dirname, '../fixtures/python-project');

describe('parseRequirementsTxt', () => {
  it('parses all packages', async () => {
    const result = await parseRequirementsTxt('requirements.txt', pythonFixture);
    const names = result.runtime.map((d) => d.name);
    expect(names).toContain('fastapi');
    expect(names).toContain('uvicorn');
    expect(names).toContain('sqlalchemy');
    expect(names).toContain('psycopg2-binary');
    expect(names).toContain('pydantic');
  });

  it('parses versions correctly', async () => {
    const result = await parseRequirementsTxt('requirements.txt', pythonFixture);
    const fastapi = result.runtime.find((d) => d.name === 'fastapi');
    expect(fastapi?.version).toBe('==0.111.0');
  });

  it('sets ecosystem to python', async () => {
    const result = await parseRequirementsTxt('requirements.txt', pythonFixture);
    expect(result.ecosystem).toBe('python');
  });

  it('has empty dev array', async () => {
    const result = await parseRequirementsTxt('requirements.txt', pythonFixture);
    expect(result.dev).toHaveLength(0);
  });

  it('marks all deps as isDev=false', async () => {
    const result = await parseRequirementsTxt('requirements.txt', pythonFixture);
    expect(result.runtime.every((d) => d.isDev === false)).toBe(true);
  });
});
