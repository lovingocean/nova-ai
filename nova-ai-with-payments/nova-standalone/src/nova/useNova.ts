// ============================================================================
// NOVA AI — useNova React Hook
// ----------------------------------------------------------------------------
// Connects the React UI to the NovaMasterAgent. Provides reactive state,
// task submission, stop/retry/reset controls, and agent info lookup.
// ============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { NovaMasterAgent } from './NovaMasterAgent';
import type { NovaState, NovaOutput } from './types';

export interface UseNova {
  state: NovaState;
  submitTask: (request: string) => Promise<NovaOutput | null>;
  stop: () => void;
  retry: () => void;
  reset: () => void;
  getAgentInfo: (agentId: string) => ReturnType<NovaMasterAgent['getAgentInfo']>;
  allAgents: ReturnType<NovaMasterAgent['getAllAgents']>;
  lastRequest: string | null;
}

export function useNova(): UseNova {
  const agentRef = useRef<NovaMasterAgent | null>(null);
  const [state, setState] = useState<NovaState>({
    phase: 'idle',
    isRunning: false,
    intent: null,
    plan: null,
    agentStates: {},
    log: [],
    results: [],
    finalOutput: null,
    error: null,
  });
  const [lastRequest, setLastRequest] = useState<string | null>(null);

  if (!agentRef.current) {
    agentRef.current = new NovaMasterAgent();
  }

  useEffect(() => {
    const agent = agentRef.current!;
    const unsubscribe = agent.subscribe(setState);
    return unsubscribe;
  }, []);

  const submitTask = useCallback(async (request: string) => {
    setLastRequest(request);
    const agent = agentRef.current!;
    return agent.execute(request);
  }, []);

  const stop = useCallback(() => {
    agentRef.current?.stop();
  }, []);

  const retry = useCallback(() => {
    if (lastRequest) {
      agentRef.current?.retry(lastRequest);
    }
  }, [lastRequest]);

  const reset = useCallback(() => {
    agentRef.current?.reset();
  }, []);

  const getAgentInfo = useCallback((agentId: string) => {
    return agentRef.current?.getAgentInfo(agentId);
  }, []);

  const allAgents = agentRef.current?.getAllAgents() || [];

  return {
    state,
    submitTask,
    stop,
    retry,
    reset,
    getAgentInfo,
    allAgents,
    lastRequest,
  };
}
