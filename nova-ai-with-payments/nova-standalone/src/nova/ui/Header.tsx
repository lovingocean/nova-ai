import { Bot, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-indigo-500/10">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 flex items-center justify-center nova-glow">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full ring-2 ring-[#05060f] animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            NOVA <span className="text-gradient">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Your Universal AI Employee</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs text-slate-300 font-medium">One Master Agent. Every Task.</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-semibold">Online</span>
        </div>
      </div>
    </header>
  );
}
