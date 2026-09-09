import { useState } from 'react';
import {
  FileText,
  ListChecks,
  FileCode2,
  Code2,
  TrendingUp,
  Database,
  Workflow,
  PenLine,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type { NovaOutput, OutputFormat } from '../types';

interface ResultPanelProps {
  output: NovaOutput;
  onRetry: () => void;
  onCopy: () => void;
  onExport: () => void;
}

const FORMAT_ICONS: Record<OutputFormat, typeof FileText> = {
  'structured-report': FileText,
  document: FileText,
  'action-plan': ListChecks,
  content: PenLine,
  code: Code2,
  analysis: TrendingUp,
  data: Database,
  workflow: Workflow,
};

const FORMAT_LABELS: Record<OutputFormat, string> = {
  'structured-report': 'Structured Report',
  document: 'Document',
  'action-plan': 'Action Plan',
  content: 'Content',
  code: 'Code',
  analysis: 'Analysis',
  data: 'Data Report',
  workflow: 'Workflow',
};

export function ResultPanel({ output, onRetry, onCopy, onExport }: ResultPanelProps) {
  const FormatIcon = FORMAT_ICONS[output.format] || FileText;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-indigo-500/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
            <FormatIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white truncate">{output.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-medium">
                {FORMAT_LABELS[output.format]}
              </span>
              {output.verified ? (
                <span className="flex items-center gap-1 text-[10px] text-green-400 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                  <ShieldAlert className="w-3 h-3" />
                  Needs Review
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        </div>
      </div>

      {/* Agents used */}
      {output.agentsUsed.length > 0 && (
        <div className="px-4 py-2.5 border-b border-indigo-500/10 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Agents Used:</span>
            {output.agentsUsed.map((agent) => (
              <span key={agent} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/50 text-[10px] text-slate-300 font-medium">
                <CheckCircle2 className="w-2.5 h-2.5 text-green-400" />
                {agent}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {output.sections.map((section, idx) => (
            <Section key={idx} section={section} />
          ))}

          {/* Verification notes */}
          {output.verificationNotes && (
            <div className={`p-4 rounded-xl border ${
              output.verified
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-amber-500/5 border-amber-500/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {output.verified ? (
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                )}
                <span className={`text-sm font-semibold ${
                  output.verified ? 'text-green-400' : 'text-amber-400'
                }`}>
                  Self-Verification
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{output.verificationNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ section }: { section: NovaOutput['sections'][number] }) {
  const [expanded, setExpanded] = useState(true);

  const isCode = section.type === 'code' || section.body.includes('```');
  const hasTable = section.body.includes('|---') || section.body.includes('| ---');

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-500/5 transition-colors text-left"
      >
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          {section.heading}
        </h3>
        <span className="text-slate-500 text-xs">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <SectionBody body={section.body} isCode={isCode} hasTable={hasTable} />
          {section.items && section.items.length > 0 && (
            <ul className="mt-2 space-y-1">
              {section.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span>{item.replace(/^\d+\.\s+/, '')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SectionBody({ body, isCode, hasTable }: { body: string; isCode: boolean; hasTable: boolean }) {
  if (isCode) {
    return <CodeBlock body={body} />;
  }
  if (hasTable) {
    return <TableBlock body={body} />;
  }
  return (
    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
      {body}
    </div>
  );
}

function CodeBlock({ body }: { body: string }) {
  const parts = body.split(/```/);
  return (
    <div className="space-y-2">
      {parts.map((part, idx) => {
        if (idx % 2 === 1) {
          const lines = part.split('\n');
          const lang = lines[0].trim();
          const code = lines.slice(1).join('\n').trim();
          return (
            <pre key={idx} className="bg-black/40 rounded-lg p-3 overflow-x-auto border border-slate-700/30">
              {lang && <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">{lang}</div>}
              <code className="text-xs text-green-300 font-mono leading-relaxed">{code}</code>
            </pre>
          );
        }
        const text = part.trim();
        return text ? (
          <div key={idx} className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{text}</div>
        ) : null;
      })}
    </div>
  );
}

function TableBlock({ body }: { body: string }) {
  const lines = body.split('\n').filter((l) => l.trim());
  const tableLines = lines.filter((l) => l.includes('|'));
  if (tableLines.length < 2) return <div className="text-sm text-slate-300 whitespace-pre-wrap">{body}</div>;

  const parseRow = (line: string) =>
    line.split('|').map((c) => c.trim()).filter((c, i, arr) => !(i === 0 && c === '') && !(i === arr.length - 1 && c === ''));

  const header = parseRow(tableLines[0]);
  const rows = tableLines.slice(2).map(parseRow); // skip separator line
  const nonTableLines = lines.filter((l) => !l.includes('|') && l.trim());

  return (
    <div className="space-y-2">
      {nonTableLines.length > 0 && (
        <div className="text-sm text-slate-300 leading-relaxed">{nonTableLines.join('\n')}</div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-indigo-500/20">
              {header.map((cell, idx) => (
                <th key={idx} className="text-left py-2 px-3 text-slate-400 font-semibold">{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-800/50">
                {row.map((cell, idx2) => (
                  <td key={idx2} className="py-2 px-3 text-slate-300">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Suppress unused import
void FileCode2;
