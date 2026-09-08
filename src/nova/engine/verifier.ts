// ============================================================================
// NOVA AI — Engine: Verifier
// ----------------------------------------------------------------------------
// Self-verification: reviews the combined output against the original request.
// Uses the QA agent's output if present, otherwise runs an independent check.
// ============================================================================

import type { AgentExecutionResult, IntentAnalysis, ExecutionPlan, NovaOutput } from '../types';
import { LocalReasoningProvider } from '../providers';

const localProvider = new LocalReasoningProvider();

export async function verifyOutput(
  request: string,
  results: AgentExecutionResult[],
): Promise<{ verified: boolean; notes: string }> {
  const combinedOutput = results.map((r) => r.output).join('\n\n');
  const agentsUsed = results.map((r) => r.agentName);
  return localProvider.verify(request, combinedOutput, agentsUsed);
}

export async function synthesizeOutput(
  request: string,
  intent: IntentAnalysis,
  results: AgentExecutionResult[],
  plan: ExecutionPlan,
): Promise<NovaOutput> {
  return localProvider.synthesize(request, intent, results, plan);
}
