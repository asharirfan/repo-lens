import pc from 'picocolors';
import boxen from 'boxen';
import Table from 'cli-table3';
import type { AnalysisResult } from '../models/index.js';
import { formatStructureTree } from '../scanners/structureScanner.js';

type ColorFn = (str: string) => string;

const CONFIDENCE_COLORS: Record<string, ColorFn> = {
  high: pc.green,
  medium: pc.yellow,
  low: pc.gray,
};

const CONFIDENCE_ICONS: Record<string, string> = {
  high: '●',
  medium: '◐',
  low: '○',
};

export function formatCli(result: AnalysisResult): string {
  const { projectInfo, detectedStacks, structure, dependencyGroups, architectureSummary, diagram, metadata } =
    result;

  const sections: string[] = [];

  const header = boxen(
    pc.bold(pc.white('RepoLens Analysis')) +
      '\n' +
      pc.cyan(projectInfo.repoName) +
      (projectInfo.description ? '\n' + pc.gray(projectInfo.description) : ''),
    {
      padding: 1,
      margin: { top: 1, bottom: 0, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: 'cyan',
    },
  );
  sections.push(header);

  if (detectedStacks.length > 0) {
    const stackLines = [pc.bold(pc.white('  Detected Stacks')), pc.gray('  ' + '─'.repeat(40))];
    for (const stack of detectedStacks) {
      const colorFn: ColorFn = CONFIDENCE_COLORS[stack.confidence] ?? pc.white;
      const icon = CONFIDENCE_ICONS[stack.confidence] ?? '○';
      const version = stack.version ? pc.gray(` ${stack.version}`) : '';
      const confidence = pc.gray(` (${stack.confidence})`);
      stackLines.push(`  ${colorFn(icon)} ${pc.white(stack.displayName)}${version}${confidence}`);
    }
    sections.push(stackLines.join('\n'));
  }

  if (structure.entryPoints.length > 0 || structure.majorFolders.length > 0) {
    const structLines = [
      '',
      pc.bold(pc.white('  Project Structure')),
      pc.gray('  ' + '─'.repeat(40)),
    ];

    if (structure.entryPoints.length > 0) {
      structLines.push(pc.gray('  Entry Points:'));
      structure.entryPoints.slice(0, 5).forEach((ep) => {
        structLines.push(`    ${pc.cyan('→')} ${ep}`);
      });
    }

    if (structure.majorFolders.length > 0) {
      structLines.push(pc.gray('\n  Folder Layout:'));
      const tree = formatStructureTree(structure);
      tree.split('\n').forEach((line) => {
        structLines.push(`    ${pc.gray(line)}`);
      });
    }

    if (structure.testDirs.length > 0) {
      structLines.push(pc.gray('\n  Test Directories:'));
      structure.testDirs.forEach((d) => {
        structLines.push(`    ${pc.yellow('⚑')} ${d}/`);
      });
    }

    sections.push(structLines.join('\n'));
  }

  if (dependencyGroups.length > 0) {
    const depLines = ['', pc.bold(pc.white('  Dependencies')), pc.gray('  ' + '─'.repeat(40))];

    for (const group of dependencyGroups) {
      depLines.push(pc.gray(`\n  ${group.source} (${group.ecosystem})`));

      const table = new Table({
        head: [pc.white('Package'), pc.white('Version'), pc.white('Type')],
        style: { head: [], border: ['gray'] },
        colWidths: [35, 20, 10],
      });

      const allDeps = [...group.runtime.slice(0, 8), ...group.dev.slice(0, 4)];
      for (const dep of allDeps) {
        table.push([dep.name, dep.version, dep.isDev ? pc.gray('dev') : pc.cyan('prod')]);
      }

      depLines.push(table.toString());
    }

    sections.push(depLines.join('\n'));
  }

  if (architectureSummary) {
    const summaryLines = [
      '',
      pc.bold(pc.white('  Architecture Summary')),
      pc.gray('  ' + '─'.repeat(40)),
      '',
      `  ${pc.white(architectureSummary)}`,
    ];
    sections.push(summaryLines.join('\n'));
  }

  if (diagram) {
    const diagramLines = [
      '',
      pc.bold(pc.white('  Dependency Diagram')),
      pc.gray('  ' + '─'.repeat(40)),
      '',
    ];
    diagram.split('\n').forEach((line) => {
      diagramLines.push(`  ${pc.gray(line)}`);
    });
    sections.push(diagramLines.join('\n'));
  }

  const footer = [
    '',
    pc.gray(
      `  Analyzed ${structure.totalFiles} files in ${metadata.durationMs}ms · repolens v${metadata.repolensVersion}`,
    ),
    '',
  ];
  sections.push(footer.join('\n'));

  return sections.join('\n');
}
