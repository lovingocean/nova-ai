// ============================================================================
// NOVA AI — NovaMasterAgent
// ----------------------------------------------------------------------------
// The master orchestrator. Receives any task, understands intent, creates a
// plan, selects agents, executes, combines results, verifies, and delivers.
//
// Flow:
//   User Request → Understand Intent → Create Plan → Select Agents
//   → Select Tools → Execute → Combine Results → Verify → Final Output
//
// Emits state updates via a callback so the UI can render live progress.
// ============================================================================

import type {
  NovaState,
  NovaOutput,
  IntentAnalysis,
  ExecutionPlan,
  AgentExecutionResult,
  LogEntry,
  ExecutionPhase,
  AgentState,
  LogLevel,
} from './types';
import { analyzeIntent } from './engine/intentAnalyzer';
import { createPlan } from './engine/planner';
import { executePlan } from './engine/executor';
import { verifyOutput, synthesizeOutput } from './engine/verifier';
import { agentRegistry } from './agents';
import { SUB_AGENTS } from './agents';
import {
  createTask,
  updateTaskPlan,
  saveAgentResult,
  saveLog,
  finalizeTask,
} from './persistence';

export type StateListener = (state: NovaState) => void;

let logCounter = 0;
function makeLog(phase: ExecutionPhase, message: string, level: LogLevel = 'info', agentId?: string): LogEntry {
  return {
    id: `log-${++logCounter}`,
    timestamp: new Date().toISOString(),
    phase,
    message,
    level,
    agentId,
  };
}

function makeAgentStates(): Record<string, AgentState> {
  const states: Record<string, AgentState> = {};
  for (const agent of SUB_AGENTS) {
    states[agent.id] = {
      id: agent.id,
      name: agent.name,
      status: 'available',
    };
  }
  return states;
}

function initialState(): NovaState {
  return {
    phase: 'idle',
    isRunning: false,
    intent: null,
    plan: null,
    agentStates: makeAgentStates(),
    log: [],
    results: [],
    finalOutput: null,
    error: null,
  };
}

export class NovaMasterAgent {
  private state: NovaState = initialState();
  private listeners: Set<StateListener> = new Set();
  private abortFlag = false;
  private currentTaskId: string | null = null;

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): NovaState {
    return this.state;
  }

  private setState(updates: Partial<NovaState>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private addLog(entry: LogEntry) {
    this.state = { ...this.state, log: [...this.state.log, entry] };
    this.notify();
    if (this.currentTaskId) {
      saveLog(this.currentTaskId, entry).catch(() => {});
    }
  }

  private updateAgentStatus(agentId: string, status: AgentState['status'], lastOutput?: string) {
    const current = this.state.agentStates[agentId];
    if (!current) return;
    const updated: AgentState = {
      ...current,
      status,
      lastOutput,
      startedAt: status === 'running' ? new Date().toISOString() : current.startedAt,
      completedAt: status === 'completed' || status === 'error' ? new Date().toISOString() : current.completedAt,
    };
    this.state = {
      ...this.state,
      agentStates: { ...this.state.agentStates, [agentId]: updated },
    };
    this.notify();
  }

  // -----------------------------------------------------------------------
  // Main execution flow
  // -----------------------------------------------------------------------

  async execute(request: string): Promise<NovaOutput | null> {
    this.abortFlag = false;
    this.state = initialState();
    this.setState({ isRunning: true });

    // Create database record for this task
    this.currentTaskId = await createTask(request);

    try {
      // === 1. UNDERSTAND INTENT ===
      this.setState({ phase: 'understanding' });
      this.addLog(makeLog('understanding', 'Task received', 'info'));
      await delay(200);

      if (this.abortFlag) return this.abort();

      const intent: IntentAnalysis = await analyzeIntent(request);
      this.addLog(makeLog('understanding', `Intent detected: ${intent.category} (confidence ${Math.round(intent.confidence * 100)}%)`, 'success'));
      this.addLog(makeLog('understanding', `Domains: ${intent.detectedDomains.join(', ')} | Complexity: ${intent.complexity} | Output: ${intent.outputFormat}`, 'info'));
      this.setState({ intent });

      if (this.abortFlag) return this.abort();

      // === 2. CREATE PLAN ===
      this.setState({ phase: 'planning' });
      this.addLog(makeLog('planning', 'Creating execution plan', 'info'));
      await delay(300);

      const plan: ExecutionPlan = await createPlan(request, intent);
      this.addLog(makeLog('planning', `Execution plan created: ${plan.steps.length} step(s)`, 'success'));
      this.addLog(makeLog('planning', plan.reasoning, 'info'));
      this.setState({ plan });

      if (this.currentTaskId) {
        updateTaskPlan(this.currentTaskId, intent, plan).catch(() => {});
      }

      if (this.abortFlag) return this.abort();

      // === 3. SELECT AGENTS ===
      this.setState({ phase: 'selecting' });
      const selectedAgents = plan.steps.map((s) => s.agentId);
      const uniqueAgents = [...new Set(selectedAgents)];
      this.addLog(makeLog('selecting', `Selected ${uniqueAgents.length} agent(s): ${uniqueAgents.map((id) => agentRegistry.get(id)?.name || id).join(', ')}`, 'success'));

      // Mark waiting agents
      for (const agentId of uniqueAgents) {
        this.updateAgentStatus(agentId, 'waiting');
      }
      await delay(200);

      if (this.abortFlag) return this.abort();

      // === 4. EXECUTE ===
      this.setState({ phase: 'executing' });
      this.addLog(makeLog('executing', 'Execution started', 'info'));

      const results: AgentExecutionResult[] = await executePlan(plan, request, {
        onAgentStart: (agentId, agentName) => {
          this.updateAgentStatus(agentId, 'running');
          this.addLog(makeLog('executing', `${agentName} started`, 'info', agentId));
        },
        onAgentComplete: (agentId, agentName, result) => {
          this.updateAgentStatus(agentId, 'completed', result.output.slice(0, 200));
          this.addLog(makeLog('executing', `${agentName} completed`, 'success', agentId));
          if (this.currentTaskId) {
            saveAgentResult(this.currentTaskId, result).catch(() => {});
          }
        },
        onAgentError: (agentId, agentName, error) => {
          this.updateAgentStatus(agentId, 'error');
          this.addLog(makeLog('executing', `${agentName} error: ${error}`, 'error', agentId));
        },
      });

      this.setState({ results });

      if (this.abortFlag) return this.abort();

      // === 5. COMBINE RESULTS ===
      this.setState({ phase: 'combining' });
      this.addLog(makeLog('combining', 'Combining agent outputs', 'info'));
      await delay(300);

      // === 6. VERIFY ===
      this.setState({ phase: 'verifying' });
      this.addLog(makeLog('verifying', 'QA verification started', 'info'));

      const verification = await verifyOutput(request, results);
      if (verification.verified) {
        this.addLog(makeLog('verifying', `Verification passed`, 'success'));
      } else {
        this.addLog(makeLog('verifying', `Verification issues: ${verification.notes}`, 'warning'));
      }

      // === 7. SYNTHESIZE FINAL OUTPUT ===
      const finalOutput = await synthesizeOutput(request, intent, results, plan);
      finalOutput.verified = verification.verified;
      finalOutput.verificationNotes = verification.notes;

      this.addLog(makeLog('complete', 'Task completed', 'success'));
      this.setState({ phase: 'complete', finalOutput, isRunning: false });

      if (this.currentTaskId) {
        finalizeTask(this.currentTaskId, finalOutput, 'complete').catch(() => {});
      }

      return finalOutput;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      this.addLog(makeLog('error', `Execution failed: ${errorMsg}`, 'error'));
      this.setState({ phase: 'error', error: errorMsg, isRunning: false });
      if (this.currentTaskId) {
        finalizeTask(this.currentTaskId, null, 'error', errorMsg).catch(() => {});
      }
      return null;
    }
  }

  // -----------------------------------------------------------------------
  // Controls
  // -----------------------------------------------------------------------

  stop() {
    this.abortFlag = true;
  }

  async retry(request: string): Promise<NovaOutput | null> {
    return this.execute(request);
  }

  reset() {
    this.abortFlag = false;
    this.state = initialState();
    this.notify();
  }

  private abort(): null {
    this.addLog(makeLog('error', 'Execution stopped by user', 'warning'));
    this.setState({ phase: 'idle', isRunning: false });
    return null;
  }

  // -----------------------------------------------------------------------
  // Agent info for UI
  // -----------------------------------------------------------------------

  getAgentInfo(agentId: string) {
    return agentRegistry.get(agentId);
  }

  getAllAgents() {
    return agentRegistry.getAll();
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
