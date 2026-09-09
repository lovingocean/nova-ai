import { useState, useEffect } from 'react';

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, period: '/month',
    features: ['5 tasks per day', '3 agents per task', 'Basic output formats', 'Community support'],
    color: '#6b7280', cta: 'Start Free',
  },
  {
    id: 'pro', name: 'Pro', price: 49, period: '/month',
    features: ['Unlimited tasks', 'All 17 agents', 'All output formats', 'Priority processing', 'Export to PDF/MD', 'Email support'],
    color: '#6366f1', cta: 'Get Pro', popular: true,
  },
  {
    id: 'business', name: 'Business', price: 99, period: '/month',
    features: ['Everything in Pro', 'API access', 'Custom agents', 'Team workspace (5 seats)', 'Priority support', 'White label option'],
    color: '#00E5C3', cta: 'Get Business',
  },
];

// Stripe payment links - replace with your actual Stripe payment links

const STRIPE_LINKS: Record<string, string> = {
  pro: 'https://buy.stripe.com/test_00w00i21k1JB4SIbhF6g800',
  business: 'https://buy.stripe.com/test_aFa7sK6hA3RJ0Cs99x6g801',
};

interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'business';
  tasksToday: number;
  tasksLimit: number;
  createdAt: string;
}

interface AuthPaymentProps {
  onLogin: (user: User) => void;
  initialView?: 'login' | 'signup' | 'pricing';
}

export function AuthPayment({ onLogin, initialView = 'signup' }: AuthPaymentProps) {
  const [view, setView] = useState<'login' | 'signup' | 'pricing'>(initialView);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const P = '#6366f1', T = '#00E5C3', G = '#10B981';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Store user in localStorage (simple auth without backend)
      const userId = Math.random().toString(36).substring(2);
      const users = JSON.parse(localStorage.getItem('nova_users') || '{}');

      if (view === 'signup') {
        if (users[form.email]) { setError('Email already registered. Please log in.'); setLoading(false); return; }
        const newUser: User = {
          id: userId, email: form.email, name: form.name,
          plan: 'free', tasksToday: 0, tasksLimit: 5, createdAt: new Date().toISOString(),
        };
        users[form.email] = { ...newUser, password: form.password };
        localStorage.setItem('nova_users', JSON.stringify(users));
        localStorage.setItem('nova_current_user', JSON.stringify(newUser));
        onLogin(newUser);
      } else {
        const user = users[form.email];
        if (!user || user.password !== form.password) { setError('Invalid email or password.'); setLoading(false); return; }
        const loggedIn = { id: user.id, email: user.email, name: user.name, plan: user.plan, tasksToday: user.tasksToday || 0, tasksLimit: user.plan === 'free' ? 5 : 999, createdAt: user.createdAt };
        localStorage.setItem('nova_current_user', JSON.stringify(loggedIn));
        onLogin(loggedIn);
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '11px 14px', color: '#fff', fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none', boxSizing: 'border-box' as const };

  if (view === 'pricing') {
    return (
      <div style={{ minHeight: '100vh', background: '#030712', color: '#fff', fontFamily: "'Inter',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: 34, height: 34, background: `linear-gradient(135deg,${P},${T})`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 16 }}>✦</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>Choose Your Plan</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 40, textAlign: 'center' }}>Upgrade to unlock all 17 agents and unlimited tasks</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20, maxWidth: 800, width: '100%' }}>
          {PLANS.map((plan) => (
            <div key={plan.id} style={{ background: (plan as any).popular ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${(plan as any).popular ? P : 'rgba(255,255,255,0.1)'}`, borderRadius: 14, padding: 24, position: 'relative' }}>
              {(plan as any).popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: P, borderRadius: 12, padding: '3px 14px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: plan.color }}>${plan.price}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{plan.period}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  if (plan.id === 'free') { setView('signup'); }
                  else { window.open(STRIPE_LINKS[plan.id], '_blank'); }
                }}
                style={{ width: '100%', background: (plan as any).popular ? P : 'rgba(255,255,255,0.08)', border: `1px solid ${(plan as any).popular ? P : 'rgba(255,255,255,0.15)'}`, borderRadius: 9, padding: '11px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                {plan.cta} →
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setView('login')} style={{ marginTop: 24, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
          Already have an account? Sign in
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#fff', fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: `linear-gradient(135deg,${P},${T})`, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, margin: '0 auto 12px', boxShadow: `0 0 24px ${P}50` }}>✦</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>Nova <span style={{ color: P }}>AI</span></h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>{view === 'login' ? 'Welcome back' : 'Start with 5 free tasks daily'}</p>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#EF4444' }}>{error}</div>}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {view === 'signup' && (
            <div>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 5, display: 'block' }}>Full Name</label>
              <input required style={inp} placeholder="John Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 5, display: 'block' }}>Email</label>
            <input required type="email" style={inp} placeholder="you@company.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 5, display: 'block' }}>Password</label>
            <input required type="password" style={inp} placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          <button type="submit" disabled={loading}
            style={{ background: loading ? 'rgba(99,102,241,0.5)' : `linear-gradient(135deg,${P},${T})`, border: 'none', borderRadius: 10, padding: '13px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter,sans-serif', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? (
              <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />Processing...</>
            ) : view === 'login' ? '→ Sign In' : '→ Create Free Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          {view === 'login' ? (
            <>Don't have an account? <span onClick={() => setView('signup')} style={{ color: P, cursor: 'pointer', fontWeight: 600 }}>Sign up free</span></>
          ) : (
            <>Already have an account? <span onClick={() => setView('login')} style={{ color: P, cursor: 'pointer', fontWeight: 600 }}>Sign in</span></>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <span onClick={() => setView('pricing')} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>View pricing plans</span>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// Profile/Account component
interface ProfileProps {
  user: User;
  onLogout: () => void;
  onUpgrade: () => void;
}

export function Profile({ user, onLogout, onUpgrade }: ProfileProps) {
  const P = '#6366f1', T = '#00E5C3', G = '#10B981';
  const plan = PLANS.find(p => p.id === user.plan) || PLANS[0];
  const usagePercent = user.plan === 'free' ? Math.round((user.tasksToday / 5) * 100) : 0;

  return (
    <div style={{ background: 'rgba(3,7,18,0.98)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: 20, width: 280, position: 'absolute', top: 60, right: 16, zIndex: 200, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${P},${T})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {user.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{user.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{user.email}</div>
        </div>
      </div>

      {/* Plan badge */}
      <div style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}35`, borderRadius: 8, padding: '8px 12px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Current Plan</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: plan.color }}>{plan.name}</div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: plan.color }}>${plan.price}<span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>/mo</span></div>
      </div>

      {/* Usage */}
      {user.plan === 'free' && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Daily Tasks</span>
            <span style={{ color: usagePercent >= 80 ? '#EF4444' : '#fff', fontWeight: 600 }}>{user.tasksToday}/5</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${usagePercent}%`, background: usagePercent >= 80 ? '#EF4444' : P, borderRadius: 2, transition: 'width .3s' }} />
          </div>
          {usagePercent >= 80 && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 4 }}>Running low — upgrade for unlimited tasks</div>}
        </div>
      )}

      {/* Plan features */}
      <div style={{ marginBottom: 14 }}>
        {plan.features.slice(0, 3).map((f, i) => (
          <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ color: G }}>✓</span> {f}
          </div>
        ))}
      </div>

      {/* Upgrade button */}
      {user.plan !== 'business' && (
        <button onClick={onUpgrade}
          style={{ width: '100%', background: `linear-gradient(135deg,${P},${T})`, border: 'none', borderRadius: 9, padding: '10px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', marginBottom: 8 }}>
          ⚡ Upgrade to {user.plan === 'free' ? 'Pro ($49/mo)' : 'Business ($99/mo)'}
        </button>
      )}

      <button onClick={onLogout}
        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '10px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
        Sign Out
      </button>
    </div>
  );
}

export type { User };