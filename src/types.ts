export interface CodeGenerationRequest {
  spec: string;
  language: 'typescript' | 'python' | 'javascript' | 'rust' | 'go' | 'sql';
  framework?: string;
  style?: string;
  context?: string;
}

export interface CodeReview {
  issues: CodeIssue[];
  suggestions: string[];
  score: number; // 0-100
  summary: string;
  approved: boolean;
}

export interface CodeIssue {
  line?: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface SecurityReviewResult {
  vulnerabilities: Vulnerability[];
  score: number;
  recommendations: string[];
  approved: boolean;
}

export interface Vulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  line?: number;
  fix?: string;
}

export interface TestResult {
  passed: number;
  failed: number;
  skipped: number;
  coverage?: number;
  output: string;
  success: boolean;
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: string[];
  unstaged: string[];
  untracked: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  repo_url?: string;
  status?: string;
  notes?: string[];
  created_at: string;
  updated_at: string;
}
