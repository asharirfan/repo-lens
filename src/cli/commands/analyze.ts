import ora from 'ora';
import pc from 'picocolors';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { AnalyzeOptions } from '../types.js';
import type { AnalysisResult, ProjectInfo } from '../../models/index.js';
import { isGitHubUrl, parseGitHubUrl } from '../../utils/urlUtils.js';
import { getRepoName, resolveRepoPath } from '../../utils/pathUtils.js';
import { fileExists } from '../../utils/fileUtils.js';
import { logger, setSilent, setVerbose } from '../../utils/logger.js';
import { scanFiles } from '../../scanners/fileScanner.js';
import { analyzeStructure } from '../../scanners/structureScanner.js';
import { detectDependencyFiles } from '../../scanners/dependencyScanner.js';
import { parseDependencies } from '../../parsers/index.js';
import { createDefaultRegistry } from '../../analyzers/index.js';
import { cloneRepository } from '../../services/gitService.js';
import { GitHubService } from '../../services/githubService.js';
import { generateDiagram } from '../../output/diagramGenerator.js';
import { renderOutput, type OutputFormat } from '../../output/index.js';

function getVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pkgPath = path.resolve(__dirname, '../../../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string };
    return pkg.version;
  } catch {
    return '0.0.0';
  }
}

function generateArchitectureSummary(result: Omit<AnalysisResult, 'architectureSummary' | 'diagram' | 'metadata'>): string {
  const { detectedStacks, structure, dependencyGroups } = result;
  const notes: string[] = [];

  const primaryStack = detectedStacks.find((s) => s.confidence === 'high');
  if (primaryStack) {
    notes.push(`This repository appears to be a ${primaryStack.displayName} project.`);
  }

  const frameworks = detectedStacks.filter(
    (s) => ['nextjs', 'react', 'vue', 'fastapi', 'django', 'flask'].includes(s.name) && s.confidence !== 'low',
  );
  if (frameworks.length > 0) {
    const names = frameworks.map((f) => f.displayName).join(', ');
    notes.push(`It uses ${names} as the primary framework(s).`);
  }

  const hasTs = dependencyGroups.some(
    (g) => g.runtime.some((d) => d.name === 'typescript') || g.dev.some((d) => d.name === 'typescript'),
  );
  if (hasTs) {
    notes.push('The codebase is written in TypeScript.');
  }

  const styling = detectedStacks.find((s) => s.name === 'tailwind');
  if (styling) {
    notes.push('Tailwind CSS is used for styling.');
  }

  const db = detectedStacks.find((s) => ['postgresql', 'mongodb'].includes(s.name));
  if (db) {
    notes.push(`${db.displayName} is used as the database.`);
  }

  const docker = detectedStacks.find((s) => s.name === 'docker');
  if (docker) {
    notes.push('The project is containerized with Docker.');
  }

  if (structure.testDirs.length > 0) {
    notes.push(`Tests are located in: ${structure.testDirs.join(', ')}.`);
  }

  if (structure.moduleBoundaries.length > 0) {
    const boundaries = structure.moduleBoundaries.slice(0, 5).join(', ');
    notes.push(`Key module boundaries include: ${boundaries}.`);
  }

  return notes.join(' ') || 'No architecture summary could be generated for this repository.';
}

function printHighlights(result: AnalysisResult, silent: boolean): void {
  if (silent) return;

  const { detectedStacks, structure, architectureSummary, metadata } = result;

  console.log();
  console.log(pc.bold(pc.white('  Highlights')));
  console.log(pc.gray('  ' + '─'.repeat(40)));

  if (detectedStacks.length > 0) {
    const stackNames = detectedStacks
      .filter((s) => s.confidence !== 'low')
      .map((s) => (s.version ? `${s.displayName} ${pc.gray(s.version)}` : s.displayName))
      .join(pc.gray(', '));
    console.log(`  ${pc.gray('Stack:')}    ${stackNames}`);
  }

  if (structure.totalFiles > 0) {
    console.log(`  ${pc.gray('Files:')}    ${structure.totalFiles}`);
  }

  if (structure.testDirs.length > 0) {
    console.log(`  ${pc.gray('Tests:')}    ${structure.testDirs.join(', ')}`);
  }

  if (architectureSummary) {
    console.log(`  ${pc.gray('Summary:')}  ${architectureSummary}`);
  }

  console.log(pc.gray(`\n  Analyzed in ${metadata.durationMs}ms · repo-lens v${metadata.repolensVersion}`));
  console.log();
}

export async function runAnalyze(repo: string, options: AnalyzeOptions): Promise<void> {
  setSilent(options.silent);
  setVerbose(options.verbose);

  const startTime = Date.now();
  let cleanup: (() => Promise<void>) | undefined;

  const spinner = ora({
    text: 'Initializing analysis...',
    color: 'cyan',
    isSilent: options.silent || options.json,
  });

  try {
    let localPath: string;
    let repoName: string;
    let projectInfo: ProjectInfo;

    const isGitHub = isGitHubUrl(repo);

    if (isGitHub) {
      spinner.start('Cloning repository...');
      const cloneResult = await cloneRepository(repo);
      localPath = cloneResult.localPath;
      repoName = cloneResult.repoName;
      cleanup = cloneResult.cleanup;

      const parsed = parseGitHubUrl(repo);
      let ghMeta = null;
      if (parsed) {
        const ghService = new GitHubService(process.env['GITHUB_TOKEN']);
        ghMeta = await ghService.getRepoMeta(parsed.owner, parsed.repo);
      }

      projectInfo = {
        repoName,
        repoUrl: repo,
        localPath,
        isGitHub: true,
        description: ghMeta?.description ?? undefined,
        stars: ghMeta?.stars,
        topics: ghMeta?.topics,
        defaultBranch: ghMeta?.defaultBranch,
      };

      spinner.succeed(`Cloned ${pc.cyan(repoName)}`);
    } else {
      localPath = resolveRepoPath(repo);
      if (!fileExists(localPath)) {
        spinner.fail(`Path not found: ${localPath}`);
        process.exit(1);
      }
      repoName = getRepoName(localPath);
      projectInfo = {
        repoName,
        localPath,
        isGitHub: false,
      };
    }

    spinner.start('Scanning files...');
    const files = await scanFiles(localPath);
    spinner.succeed(`Scanned ${pc.cyan(String(files.length))} files`);

    spinner.start('Analyzing structure...');
    const structure = analyzeStructure(files);
    spinner.succeed('Structure analyzed');

    spinner.start('Detecting dependencies...');
    const depFiles = detectDependencyFiles(files);
    const dependencyGroups = await parseDependencies(depFiles, localPath);
    spinner.succeed(`Found ${pc.cyan(String(dependencyGroups.length))} dependency file(s)`);

    spinner.start('Running analyzers...');
    const registry = createDefaultRegistry();
    const analyzerResults = await registry.runAll(localPath, files);

    const detectedStacks = analyzerResults.flatMap((r) => r.stacks);
    const uniqueStacks = detectedStacks.filter(
      (stack, index, self) => index === self.findIndex((s) => s.name === stack.name),
    );

    spinner.succeed(`Detected ${pc.cyan(String(uniqueStacks.length))} stack(s)`);

    const partialResult = {
      projectInfo,
      detectedStacks: uniqueStacks,
      structure,
      dependencyGroups,
    };

    const architectureSummary = generateArchitectureSummary(partialResult);
    const diagram = generateDiagram({ ...partialResult, architectureSummary, diagram: '', metadata: { analyzedAt: '', durationMs: 0, repolensVersion: '' } });

    const result: AnalysisResult = {
      ...partialResult,
      architectureSummary,
      diagram,
      metadata: {
        analyzedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        repolensVersion: getVersion(),
      },
    };

    let format: OutputFormat = 'cli';
    let outputFile: string | undefined;

    if (options.json) {
      format = 'json';
      outputFile = options.output;
    } else if (options.markdown) {
      format = 'markdown';
      const safeName = repoName.replace(/\//g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
      outputFile = options.output ?? `repolens-report-${safeName}.md`;
    } else if (options.output) {
      outputFile = options.output;
    }

    if (format !== 'cli') spinner.stop();

    await renderOutput(result, format, { outputFile });

    if (outputFile && !options.silent) {
      logger.success(`Report saved to ${pc.cyan(outputFile)}`);
      printHighlights(result, options.silent);
    }
  } catch (error) {
    spinner.fail('Analysis failed');
    const message = error instanceof Error ? error.message : String(error);
    logger.error(message);
    if (options.verbose && error instanceof Error && error.stack) {
      console.error(pc.gray(error.stack));
    }
    process.exit(1);
  } finally {
    if (cleanup) {
      await cleanup();
    }
  }
}
