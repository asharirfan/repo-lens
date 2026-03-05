import path from 'node:path';
import type { StructureInfo } from '../models/index.js';
import { getTopLevelDirs } from '../utils/fileUtils.js';

const ENTRY_POINT_PATTERNS = [
  /^(src\/)?index\.(ts|js|tsx|jsx|py|go|rs)$/,
  /^(src\/)?main\.(ts|js|tsx|jsx|py|go|rs)$/,
  /^(src\/)?app\.(ts|js|tsx|jsx|py)$/,
  /^server\.(ts|js)$/,
  /^(src\/)?server\.(ts|js)$/,
  /^cmd\/main\.go$/,
  /^main\.go$/,
];

const TEST_DIR_PATTERNS = [
  /^tests?\//,
  /^__tests__\//,
  /^spec\//,
  /^e2e\//,
  /^integration\//,
  /^cypress\//,
  /^playwright\//,
];

const CONFIG_FILE_PATTERNS = [
  /^(\.env|\.env\..+)$/,
  /^(tsconfig|jsconfig)(\..*)?\.json$/,
  /^(vite|vitest|jest|webpack|rollup|esbuild)\.config\.(ts|js|mjs|cjs)$/,
  /^(next|nuxt|svelte|astro)\.config\.(ts|js|mjs)$/,
  /^(eslint|prettier|babel|postcss|tailwind)\.config\.(ts|js|mjs|cjs|json)$/,
  /^\.(eslintrc|prettierrc|babelrc)(\..*)?$/,
  /^(docker-compose|compose)\.(yml|yaml)$/,
  /^Dockerfile(\..*)?$/,
  /^(pyproject|setup)\.toml$/,
  /^setup\.py$/,
  /^go\.mod$/,
  /^Cargo\.toml$/,
  /^Makefile$/,
  /^\.github\//,
];

const MODULE_BOUNDARY_PATTERNS = [
  /^(src\/)?components\//,
  /^(src\/)?pages\//,
  /^(src\/)?app\//,
  /^(src\/)?api\//,
  /^(src\/)?lib\//,
  /^(src\/)?utils?\//,
  /^(src\/)?hooks?\//,
  /^(src\/)?services?\//,
  /^(src\/)?models?\//,
  /^(src\/)?types?\//,
  /^(src\/)?store\//,
  /^(src\/)?context\//,
  /^(src\/)?middleware\//,
  /^(src\/)?routes?\//,
  /^(src\/)?controllers?\//,
  /^(src\/)?handlers?\//,
  /^(src\/)?repositories?\//,
  /^(src\/)?domain\//,
  /^(src\/)?infrastructure\//,
  /^(src\/)?core\//,
  /^(src\/)?common\//,
  /^(src\/)?shared\//,
  /^(src\/)?features?\//,
  /^(src\/)?modules?\//,
  /^(src\/)?packages?\//,
  /^(src\/)?cmd\//,
  /^(src\/)?internal\//,
  /^(src\/)?pkg\//,
];

export function analyzeStructure(files: string[]): StructureInfo {
  const entryPoints: string[] = [];
  const testDirs = new Set<string>();
  const configFiles: string[] = [];
  const moduleBoundaries = new Set<string>();

  for (const file of files) {
    if (ENTRY_POINT_PATTERNS.some((p) => p.test(file))) {
      entryPoints.push(file);
    }

    for (const pattern of TEST_DIR_PATTERNS) {
      if (pattern.test(file)) {
        const dir = file.split('/')[0];
        if (dir) testDirs.add(dir);
        break;
      }
    }

    if (CONFIG_FILE_PATTERNS.some((p) => p.test(file))) {
      configFiles.push(file);
    }

    for (const pattern of MODULE_BOUNDARY_PATTERNS) {
      if (pattern.test(file)) {
        const parts = file.split('/');
        const boundary = parts.length > 1 ? `${parts[0]}/${parts[1]}` : parts[0];
        if (boundary) moduleBoundaries.add(boundary.replace(/^src\//, ''));
        break;
      }
    }
  }

  const majorFolders = getTopLevelDirs(files).filter(
    (d) => !['node_modules', '.git', 'dist', 'build', '.next', '__pycache__'].includes(d),
  );

  return {
    entryPoints: [...new Set(entryPoints)],
    majorFolders,
    testDirs: Array.from(testDirs),
    configFiles: [...new Set(configFiles)].slice(0, 20),
    moduleBoundaries: Array.from(moduleBoundaries).sort(),
    totalFiles: files.length,
  };
}

export function formatStructureTree(structure: StructureInfo): string {
  const folders = structure.majorFolders.slice(0, 12);
  if (folders.length === 0) return '(no folders detected)';

  const lines: string[] = [];
  folders.forEach((folder, i) => {
    const isLast = i === folders.length - 1;
    lines.push(`${isLast ? '└──' : '├──'} ${folder}/`);
  });

  return lines.join('\n');
}
