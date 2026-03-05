# repolens

A fast, extensible CLI tool for analyzing any local or remote GitHub repository — understand architecture, stack, and dependencies in seconds.

## Features

- **GitHub & local support** — pass a GitHub URL or a local folder path.
- **Stack detection** — identifies Node.js, Next.js, React, Vue, Python, FastAPI, Django, Go, Rust, Docker, Tailwind, PostgreSQL, MongoDB, and more.
- **Dependency analysis** — parses `package.json`, `requirements.txt`, `go.mod`, and `Cargo.toml`.
- **Structure analysis** — detects entry points, module boundaries, test directories, and config files.
- **Architecture summary** — generates a human-readable prose summary of the codebase.
- **ASCII dependency diagram** — visual tree of stacks, folders, and dependencies.
- **Three output formats** — rich CLI output, JSON, and Markdown report.
- **Extensible analyzer system** — add a new language by implementing one interface in one file.
- **Auto-cleanup** — GitHub repos are cloned to a temp dir and deleted after analysis, even on error.
- **TypeScript strict mode** — `strict: true`, zero `any`.

## Install

```bash
pnpm install -g @asharirfan/repolens
```

Or run without installing:

```bash
npx @asharirfan/repolens analyze <repo>
```

**Requirements:** Node.js ≥ 18.0.0

## Quick Start

```bash
# Analyze a GitHub repository
repolens analyze https://github.com/vercel/next.js

# Analyze a local folder
repolens analyze ./my-project

# Output as JSON
repolens analyze https://github.com/fastapi/fastapi --json

# Generate a Markdown report
repolens analyze https://github.com/supabase/supabase --markdown

# Save JSON to a specific file
repolens analyze ./my-project --json --output analysis.json
```

## CLI Reference

```
Usage: repolens analyze <repo> [options]

Arguments:
  repo                  Local path or GitHub URL to analyze

Options:
  --json                Output results as JSON
  --markdown            Generate a Markdown report
  --output <file>       Write output to a specific file
  --silent              Suppress all non-essential output
  --verbose             Enable verbose/debug output
  -v, --version         Output the current version
  -h, --help            Display help
```

## Example Output

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
  This repository appears to be a Node.js project. It uses Next.js and React
  as the primary frameworks. The codebase is written in TypeScript. Tailwind
  CSS is used for styling. Tests are located in: test.

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

  Analyzed 4821 files in 1243ms · repolens v0.0.1
```

### `fastapi/fastapi`

```
╭──────────────────────────────────────╮
│                                      │
│   RepoLens Analysis                  │
│   fastapi/fastapi                    │
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

### `supabase/supabase` — JSON output

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

## Extending

Adding a new language takes one file. Implement `IAnalyzer`:

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
      name: 'dart',
      displayName: 'Dart',
      confidence: 'high',
      evidence: ['pubspec.yaml found'],
    });
    result.architectureNotes.push('This is a Dart/Flutter project.');
    return result;
  }
}
```

Register it in `src/analyzers/index.ts`:

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

No other files need to change.

## Architecture

```
repolens analyze <repo>
        │
        ▼
1. URL/Path Resolution
   isGitHubUrl? → shallow clone to temp dir (simple-git)
   local path?  → resolve directly
        │
        ▼
2. File Scanner        glob all files, skip node_modules/dist
3. Structure Scanner   entry points, folders, test dirs, config files
4. Dependency Parsers  package.json / requirements.txt / go.mod / Cargo.toml
        │
        ▼
5. Analyzer Registry (plugin system)
   NodeAnalyzer / PythonAnalyzer / GoAnalyzer / RustAnalyzer / DockerAnalyzer
        │
        ▼
6. Architecture Summary + ASCII Diagram
        │
        ▼
7. Output  →  CLI  |  JSON  |  Markdown
        │
        ▼
8. Cleanup (always runs, even on error)
```

### Module Structure

```
src/
├── cli/          Commander.js entry point + command handlers
├── models/       Pure TypeScript interfaces (no logic)
├── analyzers/    IAnalyzer interface + per-stack implementations
├── scanners/     File system traversal and structure detection
├── parsers/      Dependency file parsers
├── services/     Git cloning + GitHub API (Octokit)
├── utils/        Logger, file utils, URL utils, temp dir
└── output/       CLI, JSON, Markdown formatters + diagram generator
```

## Dev

```bash
pnpm install
pnpm dev analyze ./some-project   # run without building
pnpm test                         # vitest
pnpm test:coverage
pnpm typecheck                    # tsc --noEmit
pnpm lint
pnpm format
pnpm build                        # tsup → dist/
```

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/my-new-analyzer`
3. Make your changes and add tests
4. Run `pnpm typecheck && pnpm test && pnpm build`
5. Open a Pull Request

New analyzers must implement `IAnalyzer` and be registered in `src/analyzers/index.ts`. New parsers must be added to `src/parsers/index.ts`.

For bugs, open an issue with the command you ran, the repo you analyzed, and the full error output (`--verbose` for stack traces).

## Environment Variables

| Variable       | Description                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN` | Optional GitHub personal access token. Increases API rate limits and enables private repo metadata. |

```bash
export GITHUB_TOKEN=ghp_your_token_here
repolens analyze https://github.com/your-org/private-repo
```

## Stack

- TypeScript (strict mode)
- Commander.js (CLI)
- picocolors + boxen + ora (terminal output)
- simple-git (cloning)
- @octokit/rest (GitHub API)
- Vitest (tests)
- tsup (bundling)
- pnpm (package manager)

## License

Apache-2.0 © [Ashar Irfan](https://x.com/MrAsharIrfan) built with [Command Code](https://commandcode.ai).
