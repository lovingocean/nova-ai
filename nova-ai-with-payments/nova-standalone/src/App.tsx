import { useState, useCallback } from 'react';
import { useNova } from './nova/useNova';
import { Header } from './nova/ui/Header';
import { AgentList } from './nova/ui/AgentList';
import { ChatPanel } from './nova/ui/ChatPanel';
import { ExecutionPanel } from './nova/ui/ExecutionPanel';
import { ResultPanel } from './nova/ui/ResultPanel';
import { Landing } from './Landing';
import { AuthPayment, Profile, User } from './AuthPayment';

function App() {
  const { state, submitTask, stop, retry, reset, allAgents } = useNova();
  const [showResult, setShowResult] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('nova_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleSubmit = useCallback(async (request: string) => {
    // Check free plan limit
    if (user && user.plan === 'free' && user.tasksToday >= 5) {
      setShowPricing(true);
      return;
    }
    setShowResult(false);
    await submitTask(request);
    setShowResult(true);
    // Update task count
    if (user) {
      const updated = { ...user, tasksToday: user.tasksToday + 1 };
      setUser(updated);
      localStorage.setItem('nova_current_user', JSON.stringify(updated));
    }
  }, [submitTask, user]);

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

  const handleLogout = () => {
    localStorage.removeItem('nova_current_user');
    setUser(null);
    setShowProfile(false);
    setShowApp(false);
  };

  const handleUpgrade = () => {
    setShowPricing(true);
    setShowProfile(false);
  };

  // Show auth if not logged in
  if (!user) {
    return <AuthPayment onLogin={setUser} initialView={showPricing ? 'pricing' : 'signup'} />;
  }

  // Show pricing
  if (showPricing) {
    return <AuthPayment onLogin={setUser} initialView="pricing" />;
  }

  // Show landing
  if (!showApp) {
    return (
      <div style={{ position: 'relative' }}>
        {/* Profile button on landing */}
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 300 }}>
          <button onClick={() => setShowProfile(!showProfile)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#00E5C3)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 15, boxShadow: '0 0 16px rgba(99,102,241,0.5)' }}>
            {user.name?.[0]?.toUpperCase() || 'U'}
          </button>
          {showProfile && (
            <Profile user={user} onLogout={handleLogout} onUpgrade={handleUpgrade} />
          )}
        </div>
        <Landing onGetStarted={() => setShowApp(true)} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-mesh text-slate-100 overflow-hidden">
      {/* Header with profile button */}
      <div style={{ position: 'relative' }}>
        <Header />
        <button
          onClick={() => setShowApp(false)}
          style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, padding: '5px 10px', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
          ← Home
        </button>
        {/* Profile button */}
        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 200 }}>
          <button onClick={() => setShowProfile(!showProfile)}
            style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#00E5C3)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            {user.name?.[0]?.toUpperCase() || 'U'}
          </button>
          {showProfile && (
            <Profile user={user} onLogout={handleLogout} onUpgrade={handleUpgrade} />
          )}
        </div>
        {/* Task limit warning */}
        {user.plan === 'free' && user.tasksToday >= 4 && (
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '50%', marginTop: -10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#EF4444', whiteSpace: 'nowrap' }}>
            {5 - user.tasksToday} free task{5 - user.tasksToday !== 1 ? 's' : ''} remaining today
            <span onClick={handleUpgrade} style={{ color: '#6366f1', fontWeight: 600, cursor: 'pointer', marginLeft: 6 }}>Upgrade →</span>
          </div>
        )}
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

      <div className="md:hidden glass-panel-strong border-t border-indigo-500/10 px-4 py-2 flex items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Master Online</span>
        </div>
        <div className="w-px h-4 bg-slate-700 shrink-0" />
        <span className="text-xs text-slate-400 shrink-0">
          {Object.values(state.agentStates).filter((a: any) => a.status === 'running').length} running
        </span>
        <span className="text-xs text-slate-400 shrink-0">
          {Object.values(state.agentStates).filter((a: any) => a.status === 'completed').length} completed
        </span>
      </div>
    </div>
  );
}

export default App;
