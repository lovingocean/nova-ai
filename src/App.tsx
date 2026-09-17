import { useState, useCallback } from 'react';
import { useNova } from './nova/useNova';
import { Header } from './nova/ui/Header';
import { AgentList } from './nova/ui/AgentList';
import { ChatPanel } from './nova/ui/ChatPanel';
import { ExecutionPanel } from './nova/ui/ExecutionPanel';
import { ResultPanel } from './nova/ui/ResultPanel';
import { Landing } from './Landing';

// Simple auth check without complex hooks
const getStoredUser = () => {
  try {
    const u = localStorage.getItem('nova_current_user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};

const STRIPE_LINKS: Record<string, string> = {
  pro: 'https://buy.stripe.com/your-pro-link',
  business: 'https://buy.stripe.com/your-business-link',
};

function SignupForm({ onLogin }: { onLogin: (u: any) => void }) {
  const [view, setView] = useState<'signup' | 'login' | 'pricing'>('signup');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const P = '#6366f1', T = '#00E5C3';
  const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '11px 14px', color: '#fff', fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none', boxSizing: 'border-box' as const };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const users = JSON.parse(localStorage.getItem('nova_users') || '{}');
      if (view === 'signup') {
        if (users[form.email]) { setError('Email already registered.'); setLoading(false); return; }
        const user = { id: Date.now().toString(), email: form.email, name: form.name, plan: 'free', tasksToday: 0 };
        users[form.email] = { ...user, password: form.password };
        localStorage.setItem('nova_users', JSON.stringify(users));
        localStorage.setItem('nova_current_user', JSON.stringify(user));
        onLogin(user);
      } else {
        const u = users[form.email];
        if (!u || u.password !== form.password) { setError('Invalid email or password.'); setLoading(false); return; }
        const user = { id: u.id, email: u.email, name: u.name, plan: u.plan || 'free', tasksToday: u.tasksToday || 0 };
        localStorage.setItem('nova_current_user', JSON.stringify(user));
        onLogin(user);
      }
    } catch { setError('Something went wrong.'); }
    setLoading(false);
  };

  if (view === 'pricing') return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#fff', fontFamily: 'Inter,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Nova <span style={{ color: P }}>AI</span> Pricing</div>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 40 }}>Upgrade to unlock all 17 agents</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, maxWidth: 700, width: '100%' }}>
        {[
          { id: 'free', name: 'Free', price: '$0', features: ['5 tasks/day', '3 agents', 'Basic output'], color: '#6b7280' },
          { id: 'pro', name: 'Pro', price: '$49/mo', features: ['Unlimited tasks', 'All 17 agents', 'Export MD/PDF', 'Priority'], color: P, popular: true },
          { id: 'business', name: 'Business', price: '$99/mo', features: ['Everything in Pro', 'API access', '5 seats', 'Custom agents'], color: T },
        ].map(plan => (
          <div key={plan.id} style={{ background: (plan as any).popular ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${(plan as any).popular ? P : 'rgba(255,255,255,0.1)'}`, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{plan.name}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: plan.color, marginBottom: 16 }}>{plan.price}</div>
            {plan.features.map((f, i) => <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>✓ {f}</div>)}
            <button onClick={() => plan.id === 'free' ? setView('signup') : window.open(STRIPE_LINKS[plan.id], '_blank')}
              style={{ width: '100%', marginTop: 16, background: (plan as any).popular ? P : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 9, padding: 11, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              {plan.id === 'free' ? 'Start Free' : `Get ${plan.name}`} →
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => setView('login')} style={{ marginTop: 20, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 13 }}>Already have an account? Sign in</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#fff', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: `linear-gradient(135deg,${P},${T})`, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, margin: '0 auto 12px', boxShadow: `0 0 24px ${P}50` }}>✦</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Nova <span style={{ color: P }}>AI</span></div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{view === 'login' ? 'Welcome back' : '5 free tasks daily'}</div>
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#EF4444' }}>{error}</div>}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {view === 'signup' && <input required style={inp} placeholder="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />}
          <input required type="email" style={inp} placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <input required type="password" style={inp} placeholder="Password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          <button type="submit" disabled={loading}
            style={{ background: `linear-gradient(135deg,${P},${T})`, border: 'none', borderRadius: 10, padding: 13, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', marginTop: 4 }}>
            {loading ? 'Please wait...' : view === 'login' ? '→ Sign In' : '→ Create Free Account'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          {view === 'login'
            ? <><span style={{ cursor: 'pointer', color: P }} onClick={() => setView('signup')}>Create account</span> · <span style={{ cursor: 'pointer', color: P }} onClick={() => setView('pricing')}>View pricing</span></>
            : <><span style={{ cursor: 'pointer', color: P }} onClick={() => setView('login')}>Sign in</span> · <span style={{ cursor: 'pointer', color: P }} onClick={() => setView('pricing')}>View pricing</span></>
          }
        </div>
      </div>
    </div>
  );
}

function App() {
  const { state, submitTask, stop, retry, allAgents } = useNova();
  const [showResult, setShowResult] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const [user, setUser] = useState<any>(getStoredUser);

  const handleSubmit = useCallback(async (request: string) => {
    if (user?.plan === 'free' && (user?.tasksToday || 0) >= 5) {
      alert('Daily limit reached! Upgrade to Pro for unlimited tasks.');
      return;
    }
    setShowResult(false);
    await submitTask(request);
    setShowResult(true);
    if (user) {
      const updated = { ...user, tasksToday: (user.tasksToday || 0) + 1 };
      setUser(updated);
      localStorage.setItem('nova_current_user', JSON.stringify(updated));
    }
  }, [submitTask, user]);

  const handleRetry = useCallback(() => { setShowResult(false); retry(); }, [retry]);
  const handleCopy = useCallback(() => { if (state.finalOutput) navigator.clipboard.writeText(state.finalOutput.content); }, [state.finalOutput]);
  const handleExport = useCallback(() => {
    if (!state.finalOutput) return;
    const blob = new Blob([state.finalOutput.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `nova-${Date.now()}.md`; a.click();
    URL.revokeObjectURL(url);
  }, [state.finalOutput]);

  const handleLogout = () => { localStorage.removeItem('nova_current_user'); setUser(null); setShowApp(false); };

  if (!user) return <SignupForm onLogin={setUser} />;

  if (!showApp) return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 300, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{user.name?.split(' ')[0]}</span>
        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, padding: '5px 10px', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Sign out</button>
      </div>
      <Landing onGetStarted={() => setShowApp(true)} />
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-mesh text-slate-100 overflow-hidden">
      <div style={{ position: 'relative' }}>
        <Header />
        <button onClick={() => setShowApp(false)} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, padding: '5px 10px', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer' }}>← Home</button>
        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {user.plan === 'free' && <span style={{ fontSize: 11, color: '#F59E0B' }}>{5 - (user.tasksToday || 0)} tasks left</span>}
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#00E5C3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, cursor: 'pointer' }} onClick={handleLogout} title="Click to sign out">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 lg:w-72 shrink-0 border-r border-indigo-500/10 glass-panel-strong hidden md:flex flex-col">
          <AgentList agents={allAgents} agentStates={state.agentStates} masterOnline={true} isRunning={state.isRunning} />
        </aside>
        <main className="flex-1 flex flex-col min-w-0 border-r border-indigo-500/10">
          {showResult && state.finalOutput ? (
            <ResultPanel output={state.finalOutput} onRetry={handleRetry} onCopy={handleCopy} onExport={handleExport} />
          ) : (
            <ChatPanel state={state} onSubmit={handleSubmit} onStop={stop} onRetry={handleRetry} onCopy={handleCopy} onExport={handleExport} />
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
