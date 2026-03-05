import type { AnalysisResult } from '../models/index.js';

export function formatJson(result: AnalysisResult): string {
  return JSON.stringify(result, null, 2);
}
