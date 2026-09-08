// ============================================================================
// NOVA AI — Task Persistence
// ----------------------------------------------------------------------------
// Saves Nova task executions to Supabase so users can revisit past tasks,
// review agent outputs, and export results later.
// ============================================================================

import { supabase } from './db';
import type { NovaState, NovaOutput, AgentExecutionResult, LogEntry } from './types';

export interface SavedTask {
  id: string;
  request: string;
  status: string;
  intent_category: string | null;
  intent_complexity: string | null;
  output_format: string | null;
  detected_domains: string[];
  plan_summary: string | null;
  final_output: NovaOutput | null;
  verified: boolean;
  agents_used: string[];
  created_at: string;
  completed_at: string | null;
}

// ---------------------------------------------------------------------------
// Create a new task record
// ---------------------------------------------------------------------------

export async function createTask(request: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('nova_tasks')
    .insert({ request, status: 'understanding' })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to create task:', error.message);
    return null;
  }
  return data?.id ?? null;
}

// ---------------------------------------------------------------------------
// Update task with intent + plan
// ---------------------------------------------------------------------------

export async function updateTaskPlan(
  taskId: string,
  intent: NonNullable<NovaState['intent']>,
  plan: NonNullable<NovaState['plan']>,
): Promise<void> {
  const { error } = await supabase
    .from('nova_tasks')
    .update({
      status: 'executing',
      intent_category: intent.category,
      intent_complexity: intent.complexity,
      output_format: intent.outputFormat,
      detected_domains: intent.detectedDomains,
      plan_summary: plan.summary,
      plan_reasoning: plan.reasoning,
    })
    .eq('id', taskId);

  if (error) console.error('Failed to update task plan:', error.message);
}

// ---------------------------------------------------------------------------
// Save a completed agent result
// ---------------------------------------------------------------------------

export async function saveAgentResult(taskId: string, result: AgentExecutionResult): Promise<void> {
  const { error } = await supabase.from('nova_task_agents').insert({
    task_id: taskId,
    agent_id: result.agentId,
    agent_name: result.agentName,
    status: result.status,
    output: result.output,
    reasoning: result.reasoning,
    error: result.error,
    started_at: result.startedAt,
    completed_at: result.completedAt,
  });

  if (error) console.error('Failed to save agent result:', error.message);
}

// ---------------------------------------------------------------------------
// Save a log entry
// ---------------------------------------------------------------------------

export async function saveLog(taskId: string, entry: LogEntry): Promise<void> {
  const { error } = await supabase.from('nova_task_logs').insert({
    task_id: taskId,
    phase: entry.phase,
    agent_id: entry.agentId,
    message: entry.message,
    level: entry.level,
  });

  if (error) console.error('Failed to save log:', error.message);
}

// ---------------------------------------------------------------------------
// Finalize a task with output
// ---------------------------------------------------------------------------

export async function finalizeTask(
  taskId: string,
  output: NovaOutput | null,
  status: 'complete' | 'error',
  errorMsg?: string,
): Promise<void> {
  const { error } = await supabase
    .from('nova_tasks')
    .update({
      status,
      final_output: output,
      verified: output?.verified ?? false,
      verification_notes: output?.verificationNotes,
      agents_used: output?.agentsUsed ?? [],
      completed_at: new Date().toISOString(),
      error: errorMsg,
    })
    .eq('id', taskId);

  if (error) console.error('Failed to finalize task:', error.message);
}

// ---------------------------------------------------------------------------
// Fetch task history
// ---------------------------------------------------------------------------

export async function fetchTaskHistory(limit = 20): Promise<SavedTask[]> {
  const { data, error } = await supabase
    .from('nova_tasks')
    .select(
      'id, request, status, intent_category, intent_complexity, output_format, detected_domains, plan_summary, final_output, verified, agents_used, created_at, completed_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch task history:', error.message);
    return [];
  }
  return (data as SavedTask[]) ?? [];
}

// ---------------------------------------------------------------------------
// Fetch a single task with its agents and logs
// ---------------------------------------------------------------------------

export async function fetchTaskDetail(taskId: string) {
  const [taskResult, agentsResult, logsResult] = await Promise.all([
    supabase.from('nova_tasks').select('*').eq('id', taskId).maybeSingle(),
    supabase
      .from('nova_task_agents')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true }),
    supabase
      .from('nova_task_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true }),
  ]);

  if (taskResult.error) console.error('Failed to fetch task:', taskResult.error.message);

  return {
    task: taskResult.data,
    agents: agentsResult.data ?? [],
    logs: logsResult.data ?? [],
  };
}

// ---------------------------------------------------------------------------
// Delete a task and its related data (cascade handles children)
// ---------------------------------------------------------------------------

export async function deleteTask(taskId: string): Promise<boolean> {
  const { error } = await supabase.from('nova_tasks').delete().eq('id', taskId);
  if (error) {
    console.error('Failed to delete task:', error.message);
    return false;
  }
  return true;
}
