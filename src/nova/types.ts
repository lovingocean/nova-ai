// ============================================================================
// NOVA AI — Core Type System
// ============================================================================

export type AgentStatus = 'available' | 'running' | 'completed' | 'error' | 'waiting';

export type ExecutionPhase =
  | 'idle'
  | 'understanding'
  | 'planning'
  | 'selecting'
  | 'executing'
  | 'combining'
  | 'verifying'
  | 'complete'
  | 'error';

export type OutputFormat =
  | 'structured-report'
  | 'document'
  | 'action-plan'
  | 'content'
  | 'code'
  | 'analysis'
  | 'data'
  | 'workflow';

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  execute: (input: ToolInput) => Promise<ToolOutput>;
}

export interface ToolInput {
  query?: string;
  expression?: string;
  data?: unknown;
  language?: string;
  format?: string;
  [key: string]: unknown;
}

export interface ToolOutput {
  success: boolean;
  result: string;
  data?: unknown;
}

// ---------------------------------------------------------------------------
// Sub-Agents
// ---------------------------------------------------------------------------

export interface SubAgent {
  id: string;
  name: string;
  icon: string; // lucide icon name
  description: string;
  capabilities: string[];
  instructions: string;
  toolIds: string[];
  keywords: string[];
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
}

export interface AgentExecutionResult {
  agentId: string;
  agentName: string;
  status: AgentStatus;
  output: string;
  structuredOutput?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
  reasoning?: string;
}

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------

export interface PlanStep {
  id: string;
  agentId: string;
  agentName: string;
  description: string;
  toolIds: string[];
  dependencies: string[]; // step ids this depends on
}

export interface ExecutionPlan {
  intent: string;
  summary: string;
  steps: PlanStep[];
  outputFormat: OutputFormat;
  reasoning: string;
}

// ---------------------------------------------------------------------------
// Intent
// ---------------------------------------------------------------------------

export interface IntentAnalysis {
  category: string;
  primaryGoal: string;
  subGoals: string[];
  outputFormat: OutputFormat;
  complexity: 'low' | 'medium' | 'high';
  detectedDomains: string[];
  confidence: number;
}

// ---------------------------------------------------------------------------
// Log events
// ---------------------------------------------------------------------------

export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  phase: ExecutionPhase;
  agentId?: string;
  message: string;
  level: LogLevel;
}

// ---------------------------------------------------------------------------
// Master agent lifecycle
// ---------------------------------------------------------------------------

export interface AgentState {
  id: string;
  name: string;
  status: AgentStatus;
  lastOutput?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface NovaState {
  phase: ExecutionPhase;
  isRunning: boolean;
  intent: IntentAnalysis | null;
  plan: ExecutionPlan | null;
  agentStates: Record<string, AgentState>;
  log: LogEntry[];
  results: AgentExecutionResult[];
  finalOutput: NovaOutput | null;
  error: string | null;
}

export interface NovaOutput {
  format: OutputFormat;
  title: string;
  content: string;
  sections: OutputSection[];
  agentsUsed: string[];
  verified: boolean;
  verificationNotes?: string;
  createdAt: string;
}

export interface OutputSection {
  heading: string;
  body: string;
  items?: string[];
  type?: 'text' | 'list' | 'metrics' | 'code' | 'table' | 'actions';
}

export interface NovaConfig {
  maxConcurrentAgents: number;
  enableVerification: boolean;
  verbose: boolean;
}
