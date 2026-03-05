# RepoLens

> Instantly understand any codebase. Analyze local or remote GitHub repositories and get a clear overview of architecture, dependencies, and structure.

[![npm version](https://img.shields.io/npm/v/repolens?style=flat-square)](https://www.npmjs.com/package/repolens)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-67%20passing-brightgreen?style=flat-square)](#)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange?style=flat-square)](https://pnpm.io/)

---

## What is RepoLens?

RepoLens is a production-quality CLI tool that analyzes any local or remote GitHub repository and generates a clear, structured overview of its architecture, technology stack, dependencies, and folder structure. It helps developers quickly understand unfamiliar codebases without having to manually dig through files.

Point it at a GitHub URL or a local folder — RepoLens does the rest.

---

## Installation

```bash
# Install globally with pnpm
pnpm install -g repolens

# Or run without installing
npx repolens analyze <repo>
```

**Requirements:** Node.js ≥ 18.0.0

---

## Quick Start

```bash
# Analyze a GitHub repository
repolens analyze https://github.com/vercel/next.js

# Analyze a local folder
repolens analyze ./my-project

# Output as JSON
repolens analyze https://github.com/fastapi/fastapi --json

# Generate a Markdown report (saved to repolens-report.md)
repolens analyze https://github.com/supabase/supabase --markdown

# Save JSON to a specific file
repolens analyze ./my-project --json --output analysis.json
```

---

## CLI Reference

```
Usage: repolens analyze <repo> [options]

Arguments:
  repo                  Local path or GitHub URL to analyze

Options:
  --json                Output results as JSON
  --markdown            Generate a Markdown report (saved to repolens-report.md)
  --output <file>       Write output to a specific file
  --silent              Suppress all non-essential output
  --verbose             Enable verbose/debug output
  -v, --version         Output the current version
  -h, --help            Display help
```

---

## Example Outputs

### `vercel/next.js`

```
╭──────────────────────────────────────╮
│                                      │
│   RepoLens Analysis                  │
│   vercel/next.js                     │
│   The React Framework for the Web    │
│                                      │
╰──────────────────────────────────────╯

  Detected Stacks
  ────────────────────────────────────────
  ● Node.js (high)
  ● Next.js 14.2.3 (high)
  ● React 18.3.0 (high)
  ● TypeScript (high)
  ● Tailwind CSS (high)

  Architecture Summary
  ────────────────────────────────────────
  This repository appears to be a Node.js project. It uses Next.js, React as
  the primary frameworks. The codebase is written in TypeScript. Tailwind CSS
  is used for styling. Tests are located in: test.

  Dependency Diagram
  ────────────────────────────────────────
  vercel/next.js
  ├── Stack
  │   ├── Node.js
  │   ├── Next.js (14.2.3)
  │   ├── React (18.3.0)
  │   └── Tailwind CSS
  ├── Structure
  │   ├── packages/
  │   ├── examples/
  │   └── test/
  └── Dependencies (package.json)
      ├── react ^18.0.0
      └── react-dom ^18.0.0

  Analyzed 4821 files in 1243ms · repolens v0.1.0
```

### `fastapi/fastapi`

```
╭──────────────────────────────────────╮
│                                      │
│   RepoLens Analysis                  │
│   fastapi/fastapi                    │
│   FastAPI framework, high performance │
│                                      │
╰──────────────────────────────────────╯

  Detected Stacks
  ────────────────────────────────────────
  ● Python (high)
  ● FastAPI (high)
  ◐ PostgreSQL (medium)

  Architecture Summary
  ────────────────────────────────────────
  This is a Python project. It uses FastAPI for building APIs.
  Tests are located in: tests.
```

### `supabase/supabase` (JSON output)

```json
{
  "projectInfo": {
    "repoName": "supabase/supabase",
    "repoUrl": "https://github.com/supabase/supabase",
    "isGitHub": true,
    "stars": 71000,
    "description": "The open source Firebase alternative."
  },
  "detectedStacks": [
    { "name": "nodejs", "displayName": "Node.js", "confidence": "high" },
    { "name": "nextjs", "displayName": "Next.js", "confidence": "high" },
    { "name": "react", "displayName": "React", "confidence": "high" },
    { "name": "postgresql", "displayName": "PostgreSQL", "confidence": "high" },
    { "name": "docker", "displayName": "Docker", "confidence": "high" }
  ]
}
```

---

## Supported Stacks

| Technology   | Detection Signal                                  |
| ------------ | ------------------------------------------------- |
| Node.js      | `package.json`                                    |
| Next.js      | `next` in dependencies                            |
| React        | `react` in dependencies                           |
| Vue.js       | `vue` in dependencies                             |
| Python       | `.py` files, `requirements.txt`, `pyproject.toml` |
| FastAPI      | `fastapi` in requirements                         |
| Django       | `django` in requirements                          |
| Flask        | `flask` in requirements                           |
| Go           | `go.mod`, `.go` files                             |
| Rust         | `Cargo.toml`, `.rs` files                         |
| Docker       | `Dockerfile`, `docker-compose.yml`                |
| Tailwind CSS | `tailwindcss` in dependencies                     |
| PostgreSQL   | `pg`, `psycopg2`, `lib/pq` in dependencies        |
| MongoDB      | `mongoose`, `pymongo` in dependencies             |

---

## Architecture

RepoLens follows a clean **plugin + pipeline** architecture:

```
repolens analyze <repo>
        │
        ▼
1. URL/Path Resolution
   isGitHubUrl? → clone to temp dir (simple-git)
   local path?  → resolve directly
        │
        ▼
2. File Scanner
   glob all files, respect .gitignore, skip node_modules
        │
        ▼
3. Structure Scanner
   detect entry points, folders, test dirs, config files
        │
        ▼
4. Dependency Scanner + Parsers
   find package.json / requirements.txt / go.mod / Cargo.toml
   parse each into typed DependencyGroup[]
        │
        ▼
5. Analyzer Registry (plugin system)
   each IAnalyzer.canAnalyze() → run matching analyzers
   NodeAnalyzer / PythonAnalyzer / GoAnalyzer / RustAnalyzer / DockerAnalyzer
        │
        ▼
6. Architecture Summary Generator
   synthesize notes from all analyzers into prose
        │
        ▼
7. Diagram Generator
   ASCII dependency tree
        │
        ▼
8. Output Formatter
   CLI (boxen + chalk + cli-table3)
   JSON (JSON.stringify)
   Markdown (GFM with badges + tables)
        │
        ▼
9. Cleanup (always runs, even on error)
   remove temp clone directory
```

### Module Structure

```
src/
├── cli/              # Commander.js entry point + command handlers
├── models/           # Pure TypeScript interfaces (no logic)
├── analyzers/        # IAnalyzer interface + per-stack implementations
│   └── base/         # BaseAnalyzer abstract class
├── scanners/         # File system traversal and structure detection
├── parsers/          # Dependency file parsers (package.json, go.mod, etc.)
├── services/         # Git cloning + GitHub API integration
├── utils/            # Logger, file utils, URL utils, temp dir
└── output/           # CLI, JSON, Markdown formatters + diagram generator
```

---

## Extending RepoLens

Adding support for a new language or framework takes one file. Implement the `IAnalyzer` interface:

```typescript
// src/analyzers/dartAnalyzer.ts
import { BaseAnalyzer, type AnalyzerResult } from './base/IAnalyzer.js';
import { hasFile } from '../utils/fileUtils.js';

export class DartAnalyzer extends BaseAnalyzer {
  readonly name = 'dart';
  readonly displayName = 'Dart / Flutter';

  canAnalyze(files: string[], _repoPath: string): boolean {
    return hasFile(files, 'pubspec.yaml') || files.some((f) => f.endsWith('.dart'));
  }

  async analyze(repoPath: string, files: string[]): Promise<AnalyzerResult> {
    const result = this.emptyResult();

    result.stacks.push({
      name: 'dart', // extend StackName in models/StackInfo.ts
      displayName: 'Dart',
      confidence: 'high',
      evidence: ['pubspec.yaml found'],
    });

    result.architectureNotes.push('This is a Dart/Flutter project.');
    return result;
  }
}
```

Then register it in `src/analyzers/index.ts`:

```typescript
import { DartAnalyzer } from './dartAnalyzer.js';

export function createDefaultRegistry(): AnalyzerRegistry {
  return (
    new AnalyzerRegistry()
      // ... existing analyzers
      .register(new DartAnalyzer())
  );
}
```

That's it. No other files need to change.

---

## Development

```bash
# Clone the repo
git clone https://github.com/repolens/repolens.git
cd repolens

# Install dependencies
pnpm install

# Run in dev mode (no build needed)
pnpm dev analyze ./some-project

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format

# Build for production
pnpm build
```

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feat/my-new-analyzer`
3. **Make your changes** — follow the existing patterns
4. **Add tests** — all new analyzers/parsers need unit tests
5. **Run the full suite**: `pnpm typecheck && pnpm test && pnpm build`
6. **Open a Pull Request** with a clear description

### Guidelines

- Follow the existing TypeScript patterns (strict mode, no `any`)
- New analyzers must implement `IAnalyzer` and be registered in `src/analyzers/index.ts`
- New parsers must be added to `src/parsers/index.ts`
- All public-facing changes should update this README
- Keep PRs focused — one feature or fix per PR

### Reporting Issues

Please open a GitHub issue with:

- The command you ran
- The repository you were analyzing (if public)
- The full error output (use `--verbose` for more detail)

---

## Environment Variables

| Variable       | Description                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `GITHUB_TOKEN` | Optional GitHub personal access token. Increases API rate limits and enables private repo metadata fetching. |

```bash
export GITHUB_TOKEN=ghp_your_token_here
repolens analyze https://github.com/your-org/private-repo
```

---

## License

MIT © RepoLens Contributors

---

_Built with TypeScript, Commander.js, chalk, ora, boxen, simple-git, and @octokit/rest._
