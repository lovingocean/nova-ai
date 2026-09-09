// ============================================================================
// NOVA AI — Sub-Agent Registry
// ----------------------------------------------------------------------------
// 17 specialized agents. Each has capabilities, instructions, tools, schemas,
// and keywords for dynamic selection. The Master Agent selects from this
// registry automatically based on the user's request.
// ============================================================================

import type { SubAgent } from './types';

export const SUB_AGENTS: SubAgent[] = [
  {
    id: 'business',
    name: 'Business Agent',
    icon: 'Briefcase',
    description: 'Develops business strategy, market positioning, and revenue models',
    capabilities: ['Business model design', 'Market analysis', 'Revenue modeling', 'Competitive positioning', 'Partnership strategy'],
    instructions: 'Analyze the business context, identify market opportunities, and produce actionable business recommendations.',
    toolIds: ['data-analysis', 'web-search'],
    keywords: ['business', 'strategy', 'market', 'revenue', 'company', 'startup', 'enterprise', 'gtm', 'go-to-market'],
    inputSchema: { request: 'string', context: 'string', market: 'string?' },
    outputSchema: { analysis: 'string', recommendations: 'string[]', risks: 'string[]' },
  },
  {
    id: 'marketing',
    name: 'Marketing Agent',
    icon: 'Megaphone',
    description: 'Creates marketing campaigns, content strategies, and brand messaging',
    capabilities: ['Campaign strategy', 'Content marketing', 'Brand positioning', 'Channel optimization', 'Lead generation'],
    instructions: 'Design a comprehensive marketing strategy with channel mix, messaging, and campaign structure.',
    toolIds: ['web-search', 'document-generation'],
    keywords: ['marketing', 'campaign', 'brand', 'advertising', 'funnel', 'lead', 'content marketing', 'email'],
    inputSchema: { request: 'string', audience: 'string?', channels: 'string[]?' },
    outputSchema: { strategy: 'string', channels: 'string[]', kpis: 'string[]' },
  },
  {
    id: 'sales',
    name: 'Sales Agent',
    icon: 'TrendingUp',
    description: 'Builds sales playbooks, outreach sequences, and pipeline strategies',
    capabilities: ['Sales playbook', 'Outreach sequences', 'Pipeline management', 'Objection handling', 'Forecasting'],
    instructions: 'Create a sales strategy with outreach cadence, qualification framework, and closing playbook.',
    toolIds: ['crm', 'document-generation'],
    keywords: ['sales', 'cold email', 'outreach', 'pipeline', 'crm', 'prospecting', 'deal', 'quota', 'conversion'],
    inputSchema: { request: 'string', icp: 'string?', product: 'string?' },
    outputSchema: { playbook: 'string', cadence: 'string', forecast: 'string' },
  },
  {
    id: 'finance',
    name: 'Finance Agent',
    icon: 'DollarSign',
    description: 'Performs financial analysis, projections, and budget planning',
    capabilities: ['Financial modeling', 'Revenue projection', 'Cost analysis', 'Pricing strategy', 'Investment analysis'],
    instructions: 'Build financial projections, analyze costs, and provide investment recommendations.',
    toolIds: ['calculator', 'data-analysis'],
    keywords: ['finance', 'budget', 'cost', 'profit', 'margin', 'cash flow', 'forecast', 'investment', 'roi', 'pricing'],
    inputSchema: { request: 'string', revenue: 'number?', costs: 'number?' },
    outputSchema: { projections: 'string', analysis: 'string', recommendations: 'string[]' },
  },
  {
    id: 'technology',
    name: 'Technology Agent',
    icon: 'Cpu',
    description: 'Designs system architecture, evaluates tech stacks, and plans infrastructure',
    capabilities: ['System architecture', 'Tech stack evaluation', 'Infrastructure planning', 'Security review', 'Scalability analysis'],
    instructions: 'Design technical architecture, recommend technology choices, and identify scalability considerations.',
    toolIds: ['code-generation', 'web-search'],
    keywords: ['technology', 'architecture', 'stack', 'infrastructure', 'api', 'system', 'database', 'cloud', 'security'],
    inputSchema: { request: 'string', requirements: 'string[]?' },
    outputSchema: { architecture: 'string', stack: 'string[]', recommendations: 'string[]' },
  },
  {
    id: 'content',
    name: 'Content Agent',
    icon: 'PenLine',
    description: 'Writes copy, articles, emails, scripts, and all content assets',
    capabilities: ['Copywriting', 'Long-form content', 'Email sequences', 'Script writing', 'Content strategy'],
    instructions: 'Produce high-quality content tailored to the audience, channel, and objective.',
    toolIds: ['document-generation'],
    keywords: ['content', 'blog', 'article', 'copywriting', 'copy', 'writing', 'headline', 'caption', 'post', 'newsletter'],
    inputSchema: { request: 'string', format: 'string?', audience: 'string?' },
    outputSchema: { content: 'string', variants: 'string[]?' },
  },
  {
    id: 'productivity',
    name: 'Productivity Agent',
    icon: 'Zap',
    description: 'Optimizes workflows, processes, and team efficiency',
    capabilities: ['Workflow design', 'Process optimization', 'Task automation', 'Time management', 'Resource allocation'],
    instructions: 'Analyze current workflows and design optimized processes that reduce manual effort.',
    toolIds: ['workflow-engine'],
    keywords: ['productivity', 'workflow', 'process', 'automation', 'schedule', 'task', 'project', 'efficiency'],
    inputSchema: { request: 'string', currentProcess: 'string?' },
    outputSchema: { workflow: 'string', savings: 'string', steps: 'string[]' },
  },
  {
    id: 'research',
    name: 'Research Agent',
    icon: 'Search',
    description: 'Conducts market research, competitive analysis, and data gathering',
    capabilities: ['Market research', 'Competitor analysis', 'Trend identification', 'Data collection', 'Benchmarking'],
    instructions: 'Gather relevant data, identify trends, and produce a structured research report.',
    toolIds: ['web-search', 'data-analysis'],
    keywords: ['research', 'analyze', 'analysis', 'investigate', 'study', 'report', 'data', 'insight', 'benchmark', 'competitor'],
    inputSchema: { request: 'string', scope: 'string?' },
    outputSchema: { findings: 'string', data: 'string', gaps: 'string[]' },
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    icon: 'BarChart3',
    description: 'Analyzes metrics, diagnoses performance issues, and identifies trends',
    capabilities: ['Metrics analysis', 'Funnel diagnostics', 'Trend detection', 'Anomaly identification', 'KPI tracking'],
    instructions: 'Analyze quantitative data, identify patterns and anomalies, and diagnose performance issues.',
    toolIds: ['data-analysis', 'database'],
    keywords: ['analytics', 'metrics', 'kpi', 'dashboard', 'data analysis', 'statistics', 'trend', 'performance', 'tracking'],
    inputSchema: { request: 'string', metrics: 'string[]?' },
    outputSchema: { analysis: 'string', anomalies: 'string[]', recommendations: 'string[]' },
  },
  {
    id: 'coding',
    name: 'Coding Agent',
    icon: 'Code2',
    description: 'Writes, reviews, and debugs production code',
    capabilities: ['Code generation', 'Code review', 'Debugging', 'Architecture patterns', 'Testing'],
    instructions: 'Generate clean, typed, production-ready code that solves the specified problem.',
    toolIds: ['code-generation'],
    keywords: ['code', 'function', 'feature', 'bug', 'api', 'program', 'development', 'app', 'react', 'typescript', 'python'],
    inputSchema: { request: 'string', language: 'string?', framework: 'string?' },
    outputSchema: { code: 'string', explanation: 'string', tests: 'string?' },
  },
  {
    id: 'document',
    name: 'Document Agent',
    icon: 'FileText',
    description: 'Creates structured documents, proposals, specs, and reports',
    capabilities: ['Document creation', 'Proposal writing', 'Specification drafting', 'Template design', 'Formatting'],
    instructions: 'Create a well-structured professional document matching the requested format.',
    toolIds: ['document-generation'],
    keywords: ['document', 'proposal', 'report', 'plan', 'template', 'contract', 'spec', 'documentation', 'pdf', 'pitch', 'investor'],
    inputSchema: { request: 'string', format: 'string?' },
    outputSchema: { document: 'string', sections: 'string[]' },
  },
  {
    id: 'automation',
    name: 'Automation Agent',
    icon: 'Workflow',
    description: 'Designs and implements automated workflows and integrations',
    capabilities: ['Workflow automation', 'Integration design', 'Trigger configuration', 'Process mapping', 'API orchestration'],
    instructions: 'Design automated workflows that reduce manual effort and improve reliability.',
    toolIds: ['workflow-engine'],
    keywords: ['automate', 'automation', 'workflow', 'integration', 'pipeline', 'trigger', 'schedule', 'bot'],
    inputSchema: { request: 'string', systems: 'string[]?' },
    outputSchema: { workflow: 'string', integrations: 'string[]', impact: 'string' },
  },
  {
    id: 'seo',
    name: 'SEO Agent',
    icon: 'Search',
    description: 'Optimizes search visibility with keyword strategy and technical SEO',
    capabilities: ['Keyword research', 'On-page optimization', 'Technical SEO', 'Content strategy', 'Link building'],
    instructions: 'Develop an SEO strategy with keyword targets, content plan, and technical recommendations.',
    toolIds: ['web-search', 'data-analysis'],
    keywords: ['seo', 'search engine', 'keyword', 'ranking', 'organic', 'backlink', 'serp', 'google'],
    inputSchema: { request: 'string', domain: 'string?' },
    outputSchema: { keywords: 'string[]', strategy: 'string', technical: 'string[]' },
  },
  {
    id: 'social-media',
    name: 'Social Media Agent',
    icon: 'Share2',
    description: 'Creates social content calendars, posts, and engagement strategies',
    capabilities: ['Content calendars', 'Platform strategy', 'Engagement tactics', 'Audience growth', 'Content scheduling'],
    instructions: 'Design a social media strategy with content calendar, platform mix, and engagement plan.',
    toolIds: ['web-search', 'document-generation'],
    keywords: ['social media', 'linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'post', 'content calendar', 'follower'],
    inputSchema: { request: 'string', platforms: 'string[]?' },
    outputSchema: { calendar: 'string', strategy: 'string', posts: 'string[]' },
  },
  {
    id: 'support',
    name: 'Customer Support Agent',
    icon: 'Headphones',
    description: 'Analyzes support metrics and designs customer experience improvements',
    capabilities: ['Support analytics', 'Ticket analysis', 'CSAT optimization', 'Process design', 'Self-service strategy'],
    instructions: 'Analyze support data, identify issues, and recommend improvements to customer experience.',
    toolIds: ['crm', 'database'],
    keywords: ['support', 'customer', 'ticket', 'help', 'faq', 'complaint', 'feedback', 'satisfaction', 'response'],
    inputSchema: { request: 'string', metrics: 'string[]?' },
    outputSchema: { analysis: 'string', recommendations: 'string[]', automation: 'string' },
  },
  {
    id: 'strategy',
    name: 'Strategy Agent',
    icon: 'Target',
    description: 'Develops strategic frameworks, roadmaps, and competitive positioning',
    capabilities: ['Strategic planning', 'Competitive analysis', 'Roadmap creation', 'OKR design', 'Risk assessment'],
    instructions: 'Develop a strategic framework with clear priorities, competitive positioning, and roadmap.',
    toolIds: ['web-search', 'data-analysis'],
    keywords: ['strategy', 'plan', 'roadmap', 'vision', 'competitive', 'positioning', 'swot', 'okr', 'goal'],
    inputSchema: { request: 'string', horizon: 'string?' },
    outputSchema: { framework: 'string', priorities: 'string[]', roadmap: 'string' },
  },
  {
    id: 'qa',
    name: 'QA / Verification Agent',
    icon: 'ShieldCheck',
    description: 'Reviews and verifies all outputs against the original request',
    capabilities: ['Quality assurance', 'Output verification', 'Consistency checking', 'Error detection', 'Completeness review'],
    instructions: 'Review all agent outputs against the original request. Verify completeness, accuracy, and quality.',
    toolIds: ['data-analysis'],
    keywords: ['verify', 'check', 'review', 'quality', 'test', 'qa', 'validate', 'audit'],
    inputSchema: { request: 'string', outputs: 'string[]' },
    outputSchema: { verified: 'boolean', notes: 'string', issues: 'string[]' },
  },
];

// ---------------------------------------------------------------------------
// Registry helpers
// ---------------------------------------------------------------------------

class AgentRegistry {
  private agents = new Map<string, SubAgent>();

  constructor(agents: SubAgent[]) {
    for (const a of agents) this.agents.set(a.id, a);
  }

  get(id: string): SubAgent | undefined {
    return this.agents.get(id);
  }

  getAll(): SubAgent[] {
    return [...this.agents.values()];
  }

  register(agent: SubAgent) {
    this.agents.set(agent.id, agent);
  }

  selectByKeywords(request: string): SubAgent[] {
    const lower = request.toLowerCase();
    const scored: { agent: SubAgent; score: number }[] = [];
    for (const agent of this.agents.values()) {
      let score = 0;
      for (const kw of agent.keywords) {
        if (lower.includes(kw)) score += kw.length > 6 ? 2 : 1;
      }
      if (score > 0) scored.push({ agent, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.agent);
  }
}

export const agentRegistry = new AgentRegistry(SUB_AGENTS);
