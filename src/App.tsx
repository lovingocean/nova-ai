import { useState, useCallback } from 'react';
import { useNova } from './nova/useNova';
import { Header } from './nova/ui/Header';
import { AgentList } from './nova/ui/AgentList';
import { ChatPanel } from './nova/ui/ChatPanel';
import { ExecutionPanel } from './nova/ui/ExecutionPanel';
import { ResultPanel } from './nova/ui/ResultPanel';
import { Landing } from './Landing';

function App() {
  const { state, submitTask, stop, retry, reset, allAgents } = useNova();
  const [showResult, setShowResult] = useState(false);
  const [showApp, setShowApp] = useState(false);

  const handleSubmit = useCallback(async (request: string) => {
    setShowResult(false);
    await submitTask(request);
    setShowResult(true);
  }, [submitTask]);

  const handleRetry = useCallback(() => {
    setShowResult(false);
    retry();
  }, [retry]);

  const handleCopy = useCallback(() => {
    if (state.finalOutput) {
      navigator.clipboard.writeText(state.finalOutput.content);
    }
  }, [state.finalOutput]);

  const handleExport = useCallback(() => {
    if (!state.finalOutput) return;
    const blob = new Blob([state.finalOutput.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-output-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.finalOutput]);

  if (!showApp) {
    return <Landing onGetStarted={() => setShowApp(true)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-mesh text-slate-100 overflow-hidden">
      <div style={{ position: 'relative' }}>
        <Header />
        <button
          onClick={() => setShowApp(false)}
          style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, padding: '5px 10px', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
          ← Home
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 lg:w-72 shrink-0 border-r border-indigo-500/10 glass-panel-strong hidden md:flex flex-col">
          <AgentList
            agents={allAgents}
            agentStates={state.agentStates}
            masterOnline={true}
            isRunning={state.isRunning}
          />
        </aside>

        <main className="flex-1 flex flex-col min-w-0 border-r border-indigo-500/10">
          {showResult && state.finalOutput ? (
            <ResultPanel
              output={state.finalOutput}
              onRetry={handleRetry}
              onCopy={handleCopy}
              onExport={handleExport}
            />
          ) : (
            <ChatPanel
              state={state}
              onSubmit={handleSubmit}
              onStop={stop}
              onRetry={handleRetry}
              onCopy={handleCopy}
              onExport={handleExport}
            />
          )}
        </main>

        <aside className="w-72 lg:w-80 shrink-0 glass-panel-strong hidden lg:flex flex-col">
          <ExecutionPanel state={state} />
        </aside>
      </div>
    </div>
  );
}

export default App;