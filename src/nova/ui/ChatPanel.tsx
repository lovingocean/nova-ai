'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Square, RefreshCw, Copy, Download, Sparkles } from 'lucide-react';
import type { NovaState } from '../types';

interface ChatPanelProps {
  state: NovaState;
  onSubmit: (request: string) => void;
  onStop: () => void;
  onRetry: () => void;
  onCopy: () => void;
  onExport: () => void;
}

const EXAMPLES = [
  'Create a go-to-market strategy for my SaaS startup',
  'Write a 5-email cold outreach sequence for enterprise clients',
  'Analyze why my revenue dropped 20% last quarter',
  'Build a 30-day LinkedIn content calendar',
  'Create an investor pitch for my Series A',
  'Design a workflow automation for lead follow-up',
  'Write production-ready TypeScript code for my API',
  'Create a complete SEO strategy for my website',
];

export function ChatPanel({ state, onSubmit, onStop, onRetry, onCopy, onExport }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [state.log, state.finalOutput]);

  const handleSubmit = () => {
    if (!input.trim() || state.isRunning) return;
    onSubmit(input.trim());
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const isIdle = state.phase === 'idle';
  const isRunning = state.isRunning;
  const isDone = state.phase === 'complete' || state.phase === 'error';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f4f0' }}>

      {/* Messages area */}
      <div ref={messagesRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Welcome state */}
        {isIdle && !state.finalOutput && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
              <Sparkles size={26} color="#fff" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 6, textAlign: 'center' }}>What do you want Nova to do?</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, textAlign: 'center' }}>17 specialized agents work together to complete any business task</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 600 }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setInput(ex)}
                  style={{ background: '#fff', border: '1px solid #e8e4dd', borderRadius: 20, padding: '7px 14px', fontSize: 12, color: '#374151', cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all .15s' }}
                  onMouseOver={e => { (e.target as HTMLElement).style.borderColor = '#6366f1'; (e.target as HTMLElement).style.color = '#6366f1'; (e.target as HTMLElement).style.background = '#ede9fe'; }}
                  onMouseOut={e => { (e.target as HTMLElement).style.borderColor = '#e8e4dd'; (e.target as HTMLElement).style.color = '#374151'; (e.target as HTMLElement).style.background = '#fff'; }}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Running state */}
        {isRunning && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={15} color="#fff" />
            </div>
            <div style={{ background: '#fff', border: '1px solid #e8e4dd', borderRadius: '4px 16px 16px 16px', padding: '14px 16px', maxWidth: '75%', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', animation: `bounce .9s ease-in-out ${i * .15}s infinite` }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>Nova is working...</span>
              </div>
              {state.log.length > 0 && (
                <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                  {typeof state.log[state.log.length - 1] === 'string'
                    ? String(state.log[state.log.length - 1])
                    : 'Processing...'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final output */}
        {state.finalOutput && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={15} color="#fff" />
            </div>
            <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e4dd', borderRadius: '4px 16px 16px 16px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #f0ece4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#065f46' }}>Nova completed your task</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={onCopy} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 7, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', gap: 4, color: '#374151' }}>
                    <Copy size={11} /> Copy
                  </button>
                  <button onClick={onExport} style={{ background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 7, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', gap: 4, color: '#6366f1', fontWeight: 600 }}>
                    <Download size={11} /> Export
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: '#1a1a2e', whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto' }}>
                {state.finalOutput.content}
              </div>
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f0ece4', display: 'flex', gap: 8 }}>
                <button onClick={onRetry} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif', color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <RefreshCw size={12} /> Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {state.phase === 'error' && !state.finalOutput && (
          <div style={{ background: '#fff', border: '1px solid #fecaca', borderLeft: '3px solid #ef4444', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#991b1b', marginBottom: 6 }}>Something went wrong</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>Nova encountered an error processing your request.</div>
            <button onClick={onRetry} style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 7, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif', color: '#991b1b', display: 'flex', alignItems: 'center', gap: 5 }}>
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}
      </div>

      {/* Input area */}
      <div style={{ background: '#fff', borderTop: '1px solid #e8e4dd', padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={isRunning}
            placeholder="Ask Nova anything — business strategy, marketing, code, research..."
            rows={2}
            style={{ flex: 1, background: '#f9fafb', border: '1.5px solid #e8e4dd', borderRadius: 12, padding: '11px 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', color: '#1a1a2e', resize: 'none', outline: 'none', transition: 'border-color .2s', lineHeight: 1.5 }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#e8e4dd'}
          />
          {isRunning ? (
            <button onClick={onStop} style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '11px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <Square size={14} /> Stop
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!input.trim()}
              style={{ background: input.trim() ? '#6366f1' : '#e5e7eb', border: 'none', borderRadius: 10, padding: '11px 18px', fontSize: 13, fontWeight: 600, cursor: input.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Inter,sans-serif', color: input.trim() ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, transition: 'all .2s' }}>
              <Send size={14} /> Send
            </button>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
          Press Enter to send · Shift+Enter for new line · 17 agents ready
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}
