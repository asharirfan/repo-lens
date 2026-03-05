import type { ProjectInfo } from './ProjectInfo.js';
import type { StackInfo } from './StackInfo.js';
import type { StructureInfo } from './StructureInfo.js';
import type { DependencyGroup } from './DependencyInfo.js';

export interface AnalysisResult {
  projectInfo: ProjectInfo;
  detectedStacks: StackInfo[];
  structure: StructureInfo;
  dependencyGroups: DependencyGroup[];
  architectureSummary: string;
  diagram: string;
  metadata: {
    analyzedAt: string;
    durationMs: number;
    repolensVersion: string;
  };
}
