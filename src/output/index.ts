import { writeFile } from 'node:fs/promises';
import type { AnalysisResult } from '../models/index.js';
import { formatCli } from './cliFormatter.js';
import { formatJson } from './jsonFormatter.js';
import { formatMarkdown } from './markdownFormatter.js';

export type OutputFormat = 'cli' | 'json' | 'markdown';

export interface IFormatter {
  format(result: AnalysisResult): string;
}

export interface RenderOptions {
  outputFile?: string;
}

export async function renderOutput(
  result: AnalysisResult,
  format: OutputFormat,
  options: RenderOptions = {},
): Promise<void> {
  let content: string;

  switch (format) {
    case 'json':
      content = formatJson(result);
      break;
    case 'markdown':
      content = formatMarkdown(result);
      break;
    default:
      content = formatCli(result);
  }

  if (options.outputFile) {
    await writeFile(options.outputFile, content, 'utf-8');
  } else {
    process.stdout.write(content + '\n');
  }
}
