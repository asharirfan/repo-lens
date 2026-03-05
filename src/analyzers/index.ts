import { AnalyzerRegistry } from './registry.js';
import { NodeAnalyzer } from './nodeAnalyzer.js';
import { PythonAnalyzer } from './pythonAnalyzer.js';
import { GoAnalyzer } from './goAnalyzer.js';
import { RustAnalyzer } from './rustAnalyzer.js';
import { DockerAnalyzer } from './dockerAnalyzer.js';

export { AnalyzerRegistry } from './registry.js';
export type { IAnalyzer, AnalyzerResult } from './base/IAnalyzer.js';

export function createDefaultRegistry(): AnalyzerRegistry {
  return new AnalyzerRegistry()
    .register(new NodeAnalyzer())
    .register(new PythonAnalyzer())
    .register(new GoAnalyzer())
    .register(new RustAnalyzer())
    .register(new DockerAnalyzer());
}
