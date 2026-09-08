import { useEffect, useRef } from 'react';
import {
  Brain,
  ClipboardList,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Circle,
  Activity,
} from 'lucide-react';
import type { NovaState, ExecutionPhase } from '../types';
import { agentRegistry } from '../agents';

interface ExecutionPanelProps {
  state: NovaState;
}

const PHASE_ICONS: Record<ExecutionPhase, typeof Brain> = {
  idle: Circle,
  understanding: Brain,
  planning: ClipboardList,
  selecting: Users,
  executing: Loader2,
  combining: Activity,
  verifying: CheckCircle2,
  complete: CheckCircle2,
  error: AlertCircle,
};

const PHASE_LABELS: Record<ExecutionPhase, string> = {
  idle: 'Idle',
  understanding: 'Understanding request',
  planning: 'Creating execution plan',
  selecting: 'Selecting agents',
  executing: 'Executing tasks',
  combining: 'Combining results',
  verifying: 'Verifying output',
  complete: 'Task completed',
  error: 'Error occurred',
};

export function ExecutionPanel({ state }: ExecutionPanelProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.log]);

  const phases: ExecutionPhase[] = ['understanding', 'planning', 'selecting', 'executing', 'verifying'];
  const currentPhaseIdx = phases.indexOf(state.phase);

  // Active agents from plan
  const planAgents = state.plan
    ? state.plan.steps.map((s) => ({
        agentId: s.agentId,
        agentName: s.agentName,
        status: state.agentStates[s.agentId]?.status || 'waiting',
      }))
    : [];
  // Deduplicate
  const seenAgents = new Set<string>();
  const uniquePlanAgents = planAgents.filter((a) => {
    if (seenAgents.has(a.agentId)) return false;
    seenAgents.add(a.agentId);
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Phase tracker */}
      <div className="px-4 py-3 border-b border-indigo-500/10">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Live Execution</h2>

        {state.phase === 'idle' && state.log.length === 0 ? (
          <div className="text-center py-6">
            <Activity className="w-6 h-6 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-600">Waiting for a task...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {phases.map((phase, idx) => {
              const Icon = PHASE_ICONS[phase];
              const isDone = currentPhaseIdx > idx || state.phase === 'complete';
              const isActive = state.phase === phase;
              const isPending = currentPhaseIdx < idx && state.phase !== 'complete';

              return (
                <div key={phase} className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isDone ? 'bg-green-500/15' :
                    isActive ? 'bg-indigo-500/15' :
                    'bg-slate-800/50'
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    ) : isActive ? (
                      <Icon className={`w-3.5 h-3.5 text-indigo-400 ${isActive ? 'animate-spin' : ''}`} />
                    ) : (
                      <Circle className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    isDone ? 'text-slate-400' :
                    isActive ? 'text-white' :
                    'text-slate-600'
                  }`}>
                    {PHASE_LABELS[phase]}
                  </span>
                  {isDone && <CheckCircle2 className="w-3 h-3 text-green-400 ml-auto" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active agents */}
      {uniquePlanAgents.length > 0 && (
        <div className="px-4 py-3 border-b border-indigo-500/10">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Selected Agents</h3>
          <div className="space-y-1.5">
            {uniquePlanAgents.map((agent) => (
              <div key={agent.agentId} className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  agent.status === 'running' ? 'bg-amber-400 animate-pulse' :
                  agent.status === 'completed' ? 'bg-green-400' :
                  agent.status === 'error' ? 'bg-red-400' :
                  agent.status === 'waiting' ? 'bg-blue-400' :
                  'bg-slate-600'
                }`} />
                <span className={`text-xs flex-1 ${
                  agent.status === 'running' ? 'text-amber-300 font-medium' :
                  agent.status === 'completed' ? 'text-slate-400' :
                  agent.status === 'waiting' ? 'text-blue-300' :
                  'text-slate-500'
                }`}>
                  {agent.agentName}
                </span>
                {agent.status === 'running' && (
                  <span className="text-[10px] text-amber-400 font-medium animate-pulse">Running</span>
                )}
                {agent.status === 'completed' && (
                  <span className="text-[10px] text-green-400 font-medium">Done</span>
                )}
                {agent.status === 'waiting' && (
                  <span className="text-[10px] text-blue-400 font-medium">Waiting</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution log */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 sticky top-0 bg-[#05060f]/80 backdrop-blur-sm py-1">
          Execution Log
        </h3>
        {state.log.length === 0 ? (
          <p className="text-xs text-slate-600 italic">No activity yet.</p>
        ) : (
          <div className="space-y-1.5">
            {state.log.map((entry) => (
              <div key={entry.id} className="flex items-start gap-2 text-xs animate-slide-in-right">
                <span className="text-slate-600 font-mono text-[10px] shrink-0 tabular-nums mt-0.5">
                  {formatTime(entry.timestamp)}
                </span>
                <span className={`flex-1 ${
                  entry.level === 'success' ? 'text-green-400' :
                  entry.level === 'error' ? 'text-red-400' :
                  entry.level === 'warning' ? 'text-amber-400' :
                  'text-slate-300'
                }`}>
                  {entry.message}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Suppress unused import warning — agentRegistry is used for future lookups
void agentRegistry;
