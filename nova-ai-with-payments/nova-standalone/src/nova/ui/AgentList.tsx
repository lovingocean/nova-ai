import { useState } from 'react';
import { Bot, ChevronRight, X } from 'lucide-react';
import type { SubAgent, AgentState } from '../types';
import { ICON_MAP } from './IconMap';

interface AgentListProps {
  agents: SubAgent[];
  agentStates: Record<string, AgentState>;
  masterOnline: boolean;
  isRunning: boolean;
}

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  available: { dot: 'bg-slate-500', text: 'text-slate-400', label: 'Available' },
  running: { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400', label: 'Running' },
  completed: { dot: 'bg-green-400', text: 'text-green-400', label: 'Completed' },
  error: { dot: 'bg-red-400', text: 'text-red-400', label: 'Error' },
  waiting: { dot: 'bg-blue-400 animate-pulse', text: 'text-blue-400', label: 'Waiting' },
};

export function AgentList({ agents, agentStates, masterOnline, isRunning }: AgentListProps) {
  const [selectedAgent, setSelectedAgent] = useState<SubAgent | null>(null);

  return (
    <div className="flex flex-col h-full">
      {/* Master Agent */}
      <div className="px-4 py-3 border-b border-indigo-500/10">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Master Agent</h2>
        <div className="flex items-center gap-3 p-3 rounded-xl glass-panel nova-glow">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Nova Master</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${masterOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className={`text-[11px] font-medium ${masterOnline ? 'text-green-400' : 'text-slate-500'}`}>
                {isRunning ? 'Working' : 'Online'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Specialized Agents */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Specialized Agents</h2>
        <div className="space-y-1">
          {agents.map((agent) => {
            const state = agentStates[agent.id];
            const status = state?.status || 'available';
            const style = STATUS_STYLES[status] || STATUS_STYLES.available;
            const Icon = ICON_MAP[agent.icon] || Bot;

            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-indigo-500/5 transition-colors group text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  status === 'running' ? 'bg-amber-500/15' :
                  status === 'completed' ? 'bg-green-500/15' :
                  status === 'error' ? 'bg-red-500/15' :
                  status === 'waiting' ? 'bg-blue-500/15' :
                  'bg-slate-700/40'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    status === 'running' ? 'text-amber-400' :
                    status === 'completed' ? 'text-green-400' :
                    status === 'error' ? 'text-red-400' :
                    status === 'waiting' ? 'text-blue-400' :
                    'text-slate-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate group-hover:text-white transition-colors">
                    {agent.name.replace(' Agent', '')}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <span className={`text-[10px] font-medium ${style.text} hidden lg:inline`}>{style.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Agent detail modal */}
      {selectedAgent && (
        <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  );
}

function AgentDetailModal({ agent, onClose }: { agent: SubAgent; onClose: () => void }) {
  const Icon = ICON_MAP[agent.icon] || Bot;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md glass-panel-strong rounded-2xl p-6 animate-slide-up nova-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center">
            <Icon className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{agent.name}</h3>
            <p className="text-xs text-slate-400">{agent.description}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Capabilities</p>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((cap) => (
                <span key={cap} className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                  {cap}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Tools</p>
            <div className="flex flex-wrap gap-2">
              {agent.toolIds.map((tool) => (
                <span key={tool} className="px-2.5 py-1 rounded-md bg-slate-700/40 border border-slate-600/30 text-xs text-slate-300">
                  {tool.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Instructions</p>
            <p className="text-sm text-slate-300 leading-relaxed">{agent.instructions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
