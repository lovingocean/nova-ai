import { useEffect, useRef } from 'react';
import { Brain, ClipboardList, Users, Loader2, CheckCircle2, AlertCircle, Circle, Activity, ChevronRight } from 'lucide-react';
import type { NovaState, ExecutionPhase } from '../types';

interface ExecutionPanelProps {
  state: NovaState;
}

const PHASES: { id: ExecutionPhase; label: string; icon: any }[] = [
  { id: 'understanding', label: 'Understanding request', icon: Brain },
  { id: 'planning', label: 'Creating plan', icon: ClipboardList },
  { id: 'selecting', label: 'Selecting agents', icon: Users },
  { id: 'executing', label: 'Executing tasks', icon: Loader2 },
  { id: 'combining', label: 'Combining results', icon: Activity },
  { id: 'verifying', label: 'Verifying output', icon: CheckCircle2 },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 },
];

const PHASE_ORDER: ExecutionPhase[] = ['idle','understanding','planning','selecting','executing','combining','verifying','complete','error'];

function getPhaseStatus(phase: ExecutionPhase, currentPhase: ExecutionPhase): 'done' | 'active' | 'idle' | 'error' {
  if (currentPhase === 'error') return phase === 'error' ? 'error' : 'idle';
  const cur = PHASE_ORDER.indexOf(currentPhase);
  const ph = PHASE_ORDER.indexOf(phase);
  if (ph < cur) return 'done';
  if (ph === cur) return 'active';
  return 'idle';
}

export function ExecutionPanel({ state }: ExecutionPanelProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [state.log]);

  const completedAgents = Object.values(state.agentStates).filter(a => a.status === 'completed');
  const errorAgents = Object.values(state.agentStates).filter(a => a.status === 'error');
  const runningAgents = Object.values(state.agentStates).filter(a => a.status === 'running');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>

      {/* Header */}
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #f0ece4' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#9ca3af', textTransform: 'uppercase' }}>Live Execution</div>
      </div>

      {/* Phase tracker */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #f0ece4' }}>
        {state.phase === 'idle' ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#9ca3af', fontSize: 13 }}>
            <Circle size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: .3 }} />
            Waiting for a task...
          </div>
        ) : (
          PHASES.filter(p => p.id !== 'complete' || state.phase === 'complete').map(phase => {
            const status = getPhaseStatus(phase.id, state.phase);
            const Icon = phase.icon;
            return (
              <div key={phase.id} style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px',
                borderRadius: 7, marginBottom: 2,
                background: status === 'active' ? '#ede9fe' : status === 'done' ? '#d1fae5' : status === 'error' ? '#fee2e2' : 'transparent',
              }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: status === 'active' ? '#6366f1' : status === 'done' ? '#10b981' : status === 'error' ? '#ef4444' : '#e5e7eb' }}>
                  <Icon size={12} color={status === 'idle' ? '#9ca3af' : '#fff'}
                    style={{ animation: status === 'active' && phase.id === 'executing' ? 'spin 1s linear infinite' : 'none' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: status === 'active' ? 600 : 400,
                  color: status === 'active' ? '#4338ca' : status === 'done' ? '#065f46' : status === 'error' ? '#991b1b' : '#9ca3af' }}>
                  {phase.label}
                </span>
                {status === 'done' && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#10b981' }}>✓</span>}
                {status === 'active' && <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#6366f1', animation: 'pulse 1s infinite' }} />}
              </div>
            );
          })
        )}
      </div>

      {/* Active agents */}
      {runningAgents.length > 0 && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0ece4' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase' }}>Active Now</div>
          {Object.entries(state.agentStates).filter(([, a]) => a.status === 'running').map(([agentId, a]) => (
            <div key={agentId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', background: '#fef3c7', borderRadius: 7, marginBottom: 3 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1s infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#92400e', fontWeight: 500 }}>{agentId}</span>
            </div>
          ))}
        </div>
      )}

      {/* Execution log */}
      <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase' }}>Execution Log</div>
        {state.log.length === 0 ? (
          <div style={{ fontSize: 12, color: '#d1d5db', textAlign: 'center', padding: '12px 0' }}>No activity yet</div>
        ) : (
          state.log.slice(-20).map((entry, i) => (
            <div key={i} style={{ fontSize: 11, color: '#6b7280', padding: '3px 0', borderBottom: '1px solid #f9fafb', display: 'flex', gap: 6 }}>
              <span style={{ color: '#d1d5db', flexShrink: 0 }}>›</span>
              <span style={{ lineHeight: 1.4 }}>{typeof entry === 'string' ? entry : JSON.stringify(entry)}</span>
            </div>
          ))
        )}
      </div>

      {/* FOOTER: Completed results */}
      {(completedAgents.length > 0 || errorAgents.length > 0) && (
        <div style={{ borderTop: '2px solid #f0ece4', background: '#fafafa' }}>
          <div style={{ padding: '10px 12px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#9ca3af', textTransform: 'uppercase' }}>
              Results Summary
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {completedAgents.length > 0 && (
                <span style={{ background: '#d1fae5', color: '#065f46', borderRadius: 10, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                  ✓ {completedAgents.length} done
                </span>
              )}
              {errorAgents.length > 0 && (
                <span style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 10, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                  ✕ {errorAgents.length} failed
                </span>
              )}
            </div>
          </div>
          <div style={{ maxHeight: 180, overflowY: 'auto', padding: '0 10px 10px' }}>
            {Object.entries(state.agentStates).filter(([, a]) => a.status === 'completed').map(([agentId, a]) => (
              <div key={agentId} style={{ background: '#fff', border: '1px solid #d1fae5', borderLeft: '3px solid #10b981', borderRadius: 8, padding: '8px 10px', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <CheckCircle2 size={12} color="#10b981" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#065f46' }}>{agentId}</span>
                  {a.completedAt && <span style={{ fontSize: 9, color: '#9ca3af', marginLeft: 'auto' }}>{new Date(a.completedAt).toLocaleTimeString()}</span>}
                </div>
                {'output' in a && typeof a.output === 'string' && <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.4 }}>{a.output.substring(0, 120)}{a.output.length > 120 ? '...' : ''}</div>}
              </div>
            ))}
            {Object.entries(state.agentStates).filter(([, a]) => a.status === 'error').map(([agentId, a]) => (
              <div key={agentId} style={{ background: '#fff', border: '1px solid #fecaca', borderLeft: '3px solid #ef4444', borderRadius: 8, padding: '8px 10px', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={12} color="#ef4444" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#991b1b' }}>{agentId}</span>
                </div>
                <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Agent failed to complete.</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
