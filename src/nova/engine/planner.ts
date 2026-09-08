// ============================================================================
// NOVA AI — Engine: Planner
// ----------------------------------------------------------------------------
// Creates an execution plan: selects agents, orders steps by dependency,
// and assigns tools. Produces a structured ExecutionPlan.
// ============================================================================

import type { ExecutionPlan, IntentAnalysis, PlanStep } from '../types';
import { LocalReasoningProvider } from '../providers';
import { agentRegistry } from '../agents';

const localProvider = new LocalReasoningProvider();

export async function createPlan(request: string, intent: IntentAnalysis): Promise<ExecutionPlan> {
  const availableAgentIds = agentRegistry.getAll().map((a) => a.id);
  const plan = await localProvider.createPlan(request, intent, availableAgentIds);
  return plan;
}

// ---------------------------------------------------------------------------
// Dependency resolution — returns steps in execution order
// ---------------------------------------------------------------------------

export function resolveExecutionOrder(steps: PlanStep[]): PlanStep[][] {
  const ordered: PlanStep[][] = [];
  const completed = new Set<string>();
  const remaining = [...steps];

  while (remaining.length > 0) {
    const ready = remaining.filter((s) => s.dependencies.every((d) => completed.has(d)));
    if (ready.length === 0) {
      // circular or unsatisfiable — just take remaining in order
      ordered.push(remaining);
      break;
    }
    ordered.push(ready);
    for (const s of ready) {
      completed.add(s.id);
      const idx = remaining.indexOf(s);
      if (idx >= 0) remaining.splice(idx, 1);
    }
  }

  return ordered;
}
