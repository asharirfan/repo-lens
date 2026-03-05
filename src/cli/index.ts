#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { runAnalyze } from './commands/analyze.js';
import type { AnalyzeOptions } from './types.js';

function getVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pkgPath = path.resolve(__dirname, '../../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string };
    return pkg.version;
  } catch {
    return '0.0.0';
  }
}

const program = new Command();

program
  .name('repo-lens')
  .description('Analyze any local or remote GitHub repository and generate a clear architecture overview.')
  .version(getVersion(), '-v, --version', 'Output the current version');

program
  .command('analyze <repo>')
  .description('Analyze a repository (local path or GitHub URL)')
  .option('--json', 'Output results as JSON', false)
  .option('--markdown', 'Generate a Markdown report', false)
  .option('--output <file>', 'Write output to a file')
  .option('--silent', 'Suppress all non-essential output', false)
  .option('--verbose', 'Enable verbose/debug output', false)
  .action(async (repo: string, options: AnalyzeOptions) => {
    await runAnalyze(repo, options);
  });

if (process.argv.length <= 2) {
  program.help();
}

program.parse(process.argv);
