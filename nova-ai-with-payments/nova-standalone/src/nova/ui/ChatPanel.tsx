import { useState, useRef, useEffect } from 'react';
import { Send, Square, RotateCcw, Copy, Download, Paperclip, Sparkles, Check } from 'lucide-react';
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
  'Create a marketing strategy for an FMCG company in Pakistan.',
  'Analyze why sales dropped last quarter.',
  'Write a cold email sequence for Pakistani SME owners.',
  'Build a 30-day LinkedIn content calendar.',
  'Create an investor pitch for an AI startup.',
  'Build a landing page for a SaaS product.',
  'Write the code for a user authentication feature.',
  'Create a complete go-to-market strategy for my SaaS.',
];

export function ChatPanel({ state, onSubmit, onStop, onRetry, onCopy, onExport }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [showExamples, setShowExamples] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRunning = state.isRunning;
  const hasOutput = state.finalOutput !== null;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isRunning) return;
    setShowExamples(false);
    onSubmit(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExample = (example: string) => {
    setInput(example);
    setShowExamples(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Input area */}
      <div className="p-4 border-b border-indigo-500/10">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">
          Nova Chat
        </label>
        <div className="glass-panel rounded-2xl p-3 focus-within:border-indigo-500/30 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want Nova to do?"
            disabled={isRunning}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm leading-relaxed resize-none outline-none disabled:opacity-50"
            rows={3}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <button
                className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-colors"
                title="Attach file"
                disabled={isRunning}
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {hasOutput && !isRunning && (
                <>
                  <button
                    onClick={onRetry}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors"
                    title="Retry"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                  <button
                    onClick={onCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors"
                    title="Copy output"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                  <button
                    onClick={onExport}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors"
                    title="Export"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </button>
                </>
              )}
              {isRunning ? (
                <button
                  onClick={onStop}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all nova-glow"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Task
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5 px-1">
          Press ⌘/Ctrl + Enter to submit
        </p>
      </div>

      {/* Examples / status */}
      {showExamples && !isRunning && !hasOutput && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <p className="text-sm font-semibold text-slate-300">Try an example</p>
          </div>
          <div className="grid gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => handleExample(example)}
                className="text-left p-3 rounded-xl glass-panel hover:border-indigo-500/30 transition-all group"
              >
                <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{example}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Running status */}
      {isRunning && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 mb-4">
              <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-semibold text-white capitalize">
              {state.phase === 'understanding' && 'Understanding your request...'}
              {state.phase === 'planning' && 'Creating execution plan...'}
              {state.phase === 'selecting' && 'Selecting agents...'}
              {state.phase === 'executing' && 'Executing tasks...'}
              {state.phase === 'combining' && 'Combining results...'}
              {state.phase === 'verifying' && 'Verifying output...'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Nova is working on your task</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
