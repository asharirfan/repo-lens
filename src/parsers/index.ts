import type { DependencyGroup } from '../models/index.js';
import { parsePackageJson } from './packageJsonParser.js';
import { parseRequirementsTxt } from './requirementsTxtParser.js';
import { parseGoMod } from './goModParser.js';
import { parseCargoToml } from './cargoTomlParser.js';

export async function parseDependencies(
  depFiles: string[],
  repoPath: string,
): Promise<DependencyGroup[]> {
  const results: DependencyGroup[] = [];

  for (const file of depFiles) {
    const basename = file.split('/').pop() ?? file;

    try {
      if (basename === 'package.json') {
        results.push(await parsePackageJson(file, repoPath));
      } else if (basename === 'requirements.txt') {
        results.push(await parseRequirementsTxt(file, repoPath));
      } else if (basename === 'go.mod') {
        results.push(await parseGoMod(file, repoPath));
      } else if (basename === 'Cargo.toml') {
        results.push(await parseCargoToml(file, repoPath));
      }
    } catch {
      // Skip unparseable files silently
    }
  }

  return results;
}
