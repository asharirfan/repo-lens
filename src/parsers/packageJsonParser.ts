import path from 'node:path';
import type { DependencyGroup, ParsedDependency } from '../models/index.js';
import { readJsonFile } from '../utils/fileUtils.js';

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  engines?: Record<string, string>;
  packageManager?: string;
}

function mapDeps(deps: Record<string, string>, isDev: boolean): ParsedDependency[] {
  return Object.entries(deps).map(([name, version]) => ({ name, version, isDev }));
}

export async function parsePackageJson(filePath: string, repoPath: string): Promise<DependencyGroup> {
  const pkg = await readJsonFile<PackageJson>(path.join(repoPath, filePath));

  const runtime = mapDeps(pkg.dependencies ?? {}, false);
  const dev = mapDeps(pkg.devDependencies ?? {}, true);

  return {
    source: filePath,
    ecosystem: 'node',
    runtime,
    dev,
    scripts: pkg.scripts,
  };
}
