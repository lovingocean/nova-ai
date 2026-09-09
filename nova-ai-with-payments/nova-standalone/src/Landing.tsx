import { useState } from 'react';

const AGENTS = [
  { icon: '💼', name: 'Business Agent', desc: 'Strategy, market analysis, revenue models' },
  { icon: '📣', name: 'Marketing Agent', desc: 'Campaigns, content strategy, brand messaging' },
  { icon: '📈', name: 'Sales Agent', desc: 'Playbooks, outreach sequences, pipeline' },
  { icon: '💰', name: 'Finance Agent', desc: 'Projections, budgets, investment analysis' },
  { icon: '🖥️', name: 'Technology Agent', desc: 'Architecture, tech stack, infrastructure' },
  { icon: '✍️', name: 'Content Agent', desc: 'Copy, articles, emails, scripts' },
  { icon: '⚡', name: 'Productivity Agent', desc: 'Workflows, process optimization' },
  { icon: '🔍', name: 'Research Agent', desc: 'Market research, competitor analysis' },
  { icon: '📊', name: 'Analytics Agent', desc: 'Metrics, performance, trend detection' },
  { icon: '💻', name: 'Coding Agent', desc: 'Write, review & debug production code' },
  { icon: '📄', name: 'Document Agent', desc: 'Proposals, specs, reports' },
  { icon: '🔄', name: 'Automation Agent', desc: 'Workflow automation, integrations' },
  { icon: '🔎', name: 'SEO Agent', desc: 'Keywords, rankings, technical SEO' },
  { icon: '📱', name: 'Social Media Agent', desc: 'Content calendars, platform strategy' },
  { icon: '🎧', name: 'Support Agent', desc: 'Customer experience optimization' },
  { icon: '🎯', name: 'Strategy Agent', desc: 'Frameworks, roadmaps, competitive positioning' },
  { icon: '✅', name: 'QA Agent', desc: 'Verification, quality assurance' },
];

const EXAMPLES = [
  'Create a complete go-to-market strategy for my SaaS startup',
  'Write a 5-email cold outreach sequence for enterprise prospects',
  'Analyze why my revenue dropped 20% last quarter',
  'Build a 30-day LinkedIn content calendar',
  'Create an investor pitch document for my Series A',
  'Design a workflow automation for lead follow-up',
  'Write production-ready TypeScript code for my API',
];

interface LandingProps {
  onGetStarted: () => void;
}

export function Landing({ onGetStarted }: LandingProps) {
  const [email, setEmail] = useState('');

  return (
    <div style={{ background: '#030712', minHeight: '100vh', color: '#fff', fontFamily: "'Inter', sans-serif" }}>

      {/* NAV */}
      <nav style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(99,102,241,0.15)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(3,7,18,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#6366f1,#00E5C3)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}>✦</div>
          <span style={{ fontSize: 18, fontWeight: 800 }}>Nova <span style={{ color: '#6366f1' }}>AI</span></span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="#agents" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none' }}>Agents</a>
          <a href="#pricing" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none' }}>Pricing</a>
          <button onClick={onGetStarted} style={{ background: '#6366f1', border: 'none', borderRadius: 8, padding: '8px 18px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            Try Free →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '4px 14px', fontSize: 12, color: '#818cf8', fontWeight: 600, marginBottom: 24 }}>
          ✦ 17 Specialized AI Agents · Master Orchestration
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, margin: '0 0 20px', lineHeight: 1.1 }}>
          One AI Brain.<br />
          <span style={{ background: 'linear-gradient(135deg,#6366f1,#00E5C3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>17 Specialists.</span>
          <br />Any Business Task.
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', margin: '0 0 36px', lineHeight: 1.7 }}>
          Nova AI orchestrates 17 specialized agents — business, marketing, sales, finance, coding, SEO, and more — to complete any task with professional-grade output.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <button onClick={onGetStarted} style={{ background: 'linear-gradient(135deg,#6366f1,#00E5C3)', border: 'none', borderRadius: 10, padding: '14px 28px', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', boxShadow: '0 4px 24px rgba(99,102,241,0.4)' }}>
            Start for Free →
          </button>
          <a href="#pricing" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '14px 28px', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', textDecoration: 'none', display: 'inline-block' }}>
            View Pricing
          </a>
        </div>

        {/* Example prompts */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {EXAMPLES.map((ex, i) => (
            <div key={i} onClick={onGetStarted} style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all .2s' }}>
              "{ex.substring(0, 40)}..."
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 48 }}>How Nova Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 }}>
          {[
            { step: '01', title: 'You describe your task', desc: 'Tell Nova what you need — in plain English, no prompting skills required' },
            { step: '02', title: 'Nova analyzes intent', desc: 'Master agent detects domains, complexity, and optimal output format' },
            { step: '03', title: 'Specialists execute', desc: '17 agents work in parallel — each a domain expert on your task' },
            { step: '04', title: 'QA verifies output', desc: 'Verification agent ensures quality before delivering results' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 8, fontFamily: 'monospace' }}>{s.step}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AGENTS */}
      <div id="agents" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 12 }}>17 Specialized Agents</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: 48, fontSize: 15 }}>Each agent is an expert in their domain. Nova selects the right ones automatically.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
          {AGENTS.map((a, i) => (
            <div key={i} style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div id="pricing" style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Simple Pricing</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: 48, fontSize: 15 }}>Start free. Upgrade when you need more.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
          {[
            {
              name: 'Free', price: '$0', period: '/month', color: '#6b7280',
              features: ['5 tasks per day', '3 agents per task', 'Basic output formats', 'Community support'],
              cta: 'Start Free', popular: false,
            },
            {
              name: 'Pro', price: '$49', period: '/month', color: '#6366f1',
              features: ['Unlimited tasks', 'All 17 agents', 'All output formats', 'Priority processing', 'Export to PDF/MD', 'Email support'],
              cta: 'Get Pro', popular: true,
            },
            {
              name: 'Business', price: '$99', period: '/month', color: '#00E5C3',
              features: ['Everything in Pro', 'API access', 'Custom agents', 'Team workspace (5 seats)', 'Priority support', 'Custom integrations'],
              cta: 'Get Business', popular: false,
            },
          ].map((plan, i) => (
            <div key={i} style={{ background: plan.popular ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${plan.popular ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, borderRadius: 14, padding: 24, position: 'relative' }}>
              {plan.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#6366f1', borderRadius: 12, padding: '3px 14px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: plan.color }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{plan.period}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button onClick={onGetStarted} style={{ width: '100%', background: plan.popular ? '#6366f1' : 'rgba(255,255,255,0.08)', border: `1px solid ${plan.popular ? '#6366f1' : 'rgba(255,255,255,0.15)'}`, borderRadius: 9, padding: '11px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                {plan.cta} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 32px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 26, height: 26, background: 'linear-gradient(135deg,#6366f1,#00E5C3)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✦</div>
          <span style={{ fontWeight: 700 }}>Nova AI</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          Built by FlowMind AI · 17 Specialized Agents · Powered by AI
        </p>
      </div>
    </div>
  );
}
