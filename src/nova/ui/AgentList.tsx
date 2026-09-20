import { useState } from 'react';
import { Bot, ChevronRight, X, Zap } from 'lucide-react';
import type { SubAgent, AgentState } from '../types';
import { ICON_MAP } from './IconMap';

interface AgentListProps {
  agents: SubAgent[];
  agentStates: Record<string, AgentState>;
  masterOnline: boolean;
  isRunning: boolean;
}

const STATUS_CONFIG: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  available: { dot: '#d1d5db', bg: 'transparent', text: '#6b7280', label: 'Available' },
  running:   { dot: '#f59e0b', bg: '#fef3c7', text: '#92400e', label: 'Running' },
  completed: { dot: '#10b981', bg: '#d1fae5', text: '#065f46', label: 'Done' },
  error:     { dot: '#ef4444', bg: '#fee2e2', text: '#991b1b', label: 'Error' },
  waiting:   { dot: '#3b82f6', bg: '#dbeafe', text: '#1e40af', label: 'Waiting' },
};

export function AgentList({ agents, agentStates, masterOnline, isRunning }: AgentListProps) {
  const [selectedAgent, setSelectedAgent] = useState<SubAgent | null>(null);

  const runningAgents = agents.filter(a => agentStates[a.id]?.status === 'running');
  const completedAgents = agents.filter(a => agentStates[a.id]?.status === 'completed');
  const errorAgents = agents.filter(a => agentStates[a.id]?.status === 'error');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>

      {/* Master Agent */}
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #f0ece4' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase' }}>Master Agent</div>
        <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bot size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Nova Master</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: masterOnline ? '#4ade80' : '#9ca3af' }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{isRunning ? 'Orchestrating...' : 'Online'}</span>
            </div>
          </div>
          {isRunning && (
            <div style={{ marginLeft: 'auto' }}>
              <Zap size={14} color="#fde68a" />
            </div>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {isRunning && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, padding: '8px 14px', borderBottom: '1px solid #f0ece4' }}>
          {[
            { label: 'Running', count: runningAgents.length, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Done', count: completedAgents.length, color: '#10b981', bg: '#d1fae5' },
            { label: 'Error', count: errorAgents.length, color: '#ef4444', bg: '#fee2e2' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 7, padding: '5px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 9, color: s.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Agent list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#9ca3af', padding: '8px 14px 4px', textTransform: 'uppercase' }}>
          Specialized Agents ({agents.length})
        </div>
        {agents.map(agent => {
          const state = agentStates[agent.id];
          const status = state?.status || 'available';
          const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available;
          const Icon = ICON_MAP[agent.icon] || Bot;

          return (
            <div key={agent.id}
              onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px',
                margin: '1px 6px', borderRadius: 8, cursor: 'pointer', transition: 'all .15s',
                background: cfg.bg !== 'transparent' ? cfg.bg : selectedAgent?.id === agent.id ? '#f3f4f6' : 'transparent',
                borderLeft: cfg.bg !== 'transparent' ? `3px solid ${cfg.dot}` : '3px solid transparent',
              }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={14} color="#6366f1" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</div>
                <div style={{ fontSize: 10, color: cfg.text, marginTop: 1 }}>{cfg.label}</div>
              </div>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, flexShrink: 0, animation: (status === 'running' || status === 'waiting') ? 'pulse 1s infinite' : 'none' }} />
            </div>
          );
        })}
      </div>

      {/* Agent detail drawer */}
      {selectedAgent && (
        <div style={{ borderTop: '1px solid #f0ece4', padding: 14, background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e' }}>{selectedAgent.name}</div>
            <button onClick={() => setSelectedAgent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={14} /></button>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5, marginBottom: 8 }}>{selectedAgent.description}</div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}
