import { Sparkles, Bell, Search } from 'lucide-react';

export function Header() {
  return (
    <div style={{
      background: '#ffffff',
      borderBottom: '1px solid #e8e4dd',
      padding: '0 20px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
          <Sparkles size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-.02em' }}>
            NOVA <span style={{ color: '#6366f1' }}>AI</span>
          </div>
          <div style={{ fontSize: 9, color: '#9ca3af', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: -1 }}>Your Universal AI Employee</div>
        </div>
      </div>

      {/* Center: status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '4px 12px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#065f46' }}>One Master Agent, Every Task.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 20, padding: '4px 12px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#4338ca' }}>Online</span>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{ width: 34, height: 34, borderRadius: 8, background: '#f9fafb', border: '1px solid #e8e4dd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Search size={15} color="#6b7280" />
        </button>
        <button style={{ width: 34, height: 34, borderRadius: 8, background: '#f9fafb', border: '1px solid #e8e4dd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Bell size={15} color="#6b7280" />
        </button>
      </div>
    </div>
  );
}
