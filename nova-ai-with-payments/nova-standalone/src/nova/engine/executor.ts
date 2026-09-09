// ============================================================================
// NOVA AI — Engine: Executor
// ----------------------------------------------------------------------------
// Executes plan steps — runs agents, manages dependencies, collects results.
// Supports parallel execution of independent steps.
// ============================================================================

import type { AgentExecutionResult, ExecutionPlan, PlanStep } from '../types';
import { LocalReasoningProvider } from '../providers';
import { agentRegistry } from '../agents';
import { resolveExecutionOrder } from './planner';

const localProvider = new LocalReasoningProvider();

export interface ExecutorCallbacks {
  onAgentStart?: (agentId: string, agentName: string) => void;
  onAgentComplete?: (agentId: string, agentName: string, result: AgentExecutionResult) => void;
  onAgentError?: (agentId: string, agentName: string, error: string) => void;
}

export async function executePlan(
  plan: ExecutionPlan,
  request: string,
  callbacks: ExecutorCallbacks,
): Promise<AgentExecutionResult[]> {
  const results: AgentExecutionResult[] = [];
  const waves = resolveExecutionOrder(plan.steps);
  const contextMap = new Map<string, string>();

  for (const wave of waves) {
    const waveResults = await Promise.all(
      wave.map((step) => executeStep(step, request, contextMap, callbacks)),
    );
    results.push(...waveResults);
  }

  return results;
}

async function executeStep(
  step: PlanStep,
  request: string,
  contextMap: Map<string, string>,
  callbacks: ExecutorCallbacks,
): Promise<AgentExecutionResult> {
  const agent = agentRegistry.get(step.agentId);
  const agentName = agent?.name || step.agentName;
  const startedAt = new Date().toISOString();

  callbacks.onAgentStart?.(step.agentId, agentName);

  try {
    // Build context from dependencies
    const context = step.dependencies
      .map((depId) => contextMap.get(depId))
      .filter((c): c is string => c !== undefined)
      .join('\n\n');

    const { output, reasoning } = await localProvider.executeAgent(
      step.agentId,
      agentName,
      agent?.instructions || '',
      agent?.capabilities || [],
      request,
      context,
    );

    const completedAt = new Date().toISOString();
    const result: AgentExecutionResult = {
      agentId: step.agentId,
      agentName,
      status: 'completed',
      output,
      reasoning,
      startedAt,
      completedAt,
    };

    contextMap.set(step.id, output);
    callbacks.onAgentComplete?.(step.agentId, agentName, result);
    return result;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    callbacks.onAgentError?.(step.agentId, agentName, errorMsg);
    return {
      agentId: step.agentId,
      agentName,
      status: 'error',
      output: '',
      error: errorMsg,
      startedAt,
    };
  }
}
