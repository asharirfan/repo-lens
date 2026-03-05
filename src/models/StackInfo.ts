export type StackName =
  | 'nodejs'
  | 'nextjs'
  | 'react'
  | 'vue'
  | 'python'
  | 'fastapi'
  | 'django'
  | 'flask'
  | 'go'
  | 'rust'
  | 'docker'
  | 'tailwind'
  | 'postgresql'
  | 'mongodb';

export interface StackInfo {
  name: StackName;
  displayName: string;
  version?: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: string[];
}
