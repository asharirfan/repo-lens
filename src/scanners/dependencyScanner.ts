const DEP_FILE_PATTERNS: RegExp[] = [
  /^package\.json$/,
  /^requirements\.txt$/,
  /^go\.mod$/,
  /^Cargo\.toml$/,
  /^pyproject\.toml$/,
  /^setup\.py$/,
  /^Pipfile$/,
];

export function detectDependencyFiles(files: string[]): string[] {
  return files.filter((f) => {
    const basename = f.split('/').pop() ?? f;
    return DEP_FILE_PATTERNS.some((p) => p.test(basename)) && f.split('/').length <= 2;
  });
}
