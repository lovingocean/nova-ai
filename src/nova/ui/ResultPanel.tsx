import { Copy, Download, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import type { NovaOutput } from '../types';

interface ResultPanelProps {
  output: NovaOutput;
  onRetry: () => void;
  onCopy: () => void;
  onExport: () => void;
}

export function ResultPanel({ output, onRetry, onCopy, onExport }: ResultPanelProps) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f5f4f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Task Complete</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <CheckCircle2 size={12} color="#10b981" />
              <span style={{ fontSize: 12, color: '#065f46', fontWeight: 600 }}>All agents succeeded</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onRetry} style={{ background: '#fff', border: '1px solid #e8e4dd', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif', color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
            <RefreshCw size={12} /> New task
          </button>
          <button onClick={onCopy} style={{ background: '#fff', border: '1px solid #e8e4dd', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif', color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Copy size={12} /> Copy
          </button>
          <button onClick={onExport} style={{ background: '#6366f1', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Download size={12} /> Export MD
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: '#fff', border: '1px solid #e8e4dd', borderRadius: 14, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', fontSize: 14, lineHeight: 1.8, color: '#1a1a2e', whiteSpace: 'pre-wrap' }}>
        {output.content}
      </div>
    </div>
  );
}
