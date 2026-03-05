import type { AnalysisResult } from '../models/index.js';

export function generateDiagram(result: AnalysisResult): string {
  const { projectInfo, detectedStacks, structure, dependencyGroups } = result;
  const lines: string[] = [];

  lines.push(projectInfo.repoName);

  const stacks = detectedStacks.filter((s) => s.confidence !== 'low');
  if (stacks.length > 0) {
    lines.push('├── Stack');
    stacks.forEach((stack, i) => {
      const isLast = i === stacks.length - 1;
      const version = stack.version ? ` (${stack.version})` : '';
      lines.push(`│   ${isLast ? '└──' : '├──'} ${stack.displayName}${version}`);
    });
  }

  const folders = structure.majorFolders.slice(0, 10);
  if (folders.length > 0) {
    lines.push('├── Structure');
    folders.forEach((folder, i) => {
      const isLast = i === folders.length - 1;
      lines.push(`│   ${isLast ? '└──' : '├──'} ${folder}/`);
    });
  }

  for (const group of dependencyGroups) {
    const topDeps = group.runtime.slice(0, 6);
    if (topDeps.length === 0) continue;

    const label = group.source;
    lines.push(`└── Dependencies (${label})`);
    topDeps.forEach((dep, i) => {
      const isLast = i === topDeps.length - 1;
      lines.push(`    ${isLast ? '└──' : '├──'} ${dep.name} ${dep.version}`);
    });
  }

  return lines.join('\n');
}
