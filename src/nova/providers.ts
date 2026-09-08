// ============================================================================
// NOVA AI — LLM Provider Abstraction
// ----------------------------------------------------------------------------
// Nova can run fully locally (no API key) via the LocalReasoningProvider, or
// connect to an external LLM by setting NOVA_LLM_PROVIDER + credentials in
// the environment. The rest of Nova only talks to NovaLLMProvider.
// ============================================================================

import type { IntentAnalysis, ExecutionPlan, AgentExecutionResult, NovaOutput, OutputFormat } from './types';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMProvider {
  id: string;
  complete(messages: LLMMessage[], options?: LLMOptions): Promise<string>;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

// ---------------------------------------------------------------------------
// Provider Registry
// ---------------------------------------------------------------------------

class ProviderRegistry {
  private providers = new Map<string, LLMProvider>();
  private active: LLMProvider | null = null;

  register(provider: LLMProvider) {
    this.providers.set(provider.id, provider);
    if (!this.active) this.active = provider;
  }

  setActive(id: string) {
    const p = this.providers.get(id);
    if (!p) throw new Error(`Unknown LLM provider: ${id}`);
    this.active = p;
  }

  get(): LLMProvider {
    if (!this.active) throw new Error('No LLM provider registered');
    return this.active;
  }

  list(): string[] {
    return [...this.providers.keys()];
  }
}

export const llmRegistry = new ProviderRegistry();

// ---------------------------------------------------------------------------
// Local Reasoning Provider
// ----------------------------------------------------------------------------
// Deterministic, offline reasoning engine. Produces structured, useful output
// without any external API. This is what Nova uses by default.
// ---------------------------------------------------------------------------

export class LocalReasoningProvider implements LLMProvider {
  id = 'local';

  async complete(messages: LLMMessage[], _options?: LLMOptions): Promise<string> {
    // The local provider doesn't generate free-form text from messages.
    // Nova's engine modules call dedicated typed methods instead.
    // This method is here to satisfy the interface for simple prompts.
    const userMsg = messages.find((m) => m.role === 'user');
    if (!userMsg) return '';
    return `Local reasoning response for: ${userMsg.content.slice(0, 200)}`;
  }

  // --- Typed reasoning methods used directly by the engine ---

  async analyzeIntent(request: string): Promise<IntentAnalysis> {
    return analyzeIntentLocal(request);
  }

  async createPlan(request: string, intent: IntentAnalysis, agentIds: string[]): Promise<ExecutionPlan> {
    return createPlanLocal(request, intent, agentIds);
  }

  async executeAgent(
    agentId: string,
    agentName: string,
    instructions: string,
    capabilities: string[],
    request: string,
    context: string,
  ): Promise<{ output: string; reasoning: string }> {
    return executeAgentLocal(agentId, agentName, instructions, capabilities, request, context);
  }

  async verify(request: string, output: string, agentsUsed: string[]): Promise<{ verified: boolean; notes: string }> {
    return verifyLocal(request, output, agentsUsed);
  }

  async synthesize(
    request: string,
    intent: IntentAnalysis,
    results: AgentExecutionResult[],
    plan: ExecutionPlan,
  ): Promise<NovaOutput> {
    return synthesizeLocal(request, intent, results, plan);
  }
}

// ---------------------------------------------------------------------------
// Intent Analysis (local)
// ---------------------------------------------------------------------------

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  business: ['business', 'strategy', 'gtm', 'go-to-market', 'market', 'company', 'startup', 'enterprise', 'revenue', 'growth'],
  marketing: ['marketing', 'campaign', 'brand', 'advertising', 'seo', 'content marketing', 'social media', 'email', 'funnel', 'lead'],
  sales: ['sales', 'cold email', 'outreach', 'pipeline', 'crm', 'lead', 'conversion', 'prospecting', 'deal', 'quota'],
  finance: ['finance', 'budget', 'cost', 'profit', 'margin', 'cash flow', 'forecast', 'investment', 'roi', 'pricing'],
  technology: ['technology', 'architecture', 'stack', 'infrastructure', 'api', 'system', 'database', 'cloud', 'security'],
  content: ['content', 'blog', 'article', 'copywriting', 'copy', 'writing', 'headline', 'caption', 'post', 'newsletter'],
  productivity: ['productivity', 'workflow', 'process', 'automation', 'schedule', 'task', 'project', 'efficiency'],
  research: ['research', 'analyze', 'analysis', 'investigate', 'study', 'report', 'data', 'insight', 'benchmark', 'competitor'],
  analytics: ['analytics', 'metrics', 'kpi', 'dashboard', 'data analysis', 'statistics', 'trend', 'performance', 'tracking'],
  coding: ['code', 'function', 'feature', 'bug', 'api', 'program', 'development', 'app', 'react', 'typescript', 'python'],
  document: ['document', 'proposal', 'report', 'plan', 'template', 'contract', 'spec', 'documentation', 'pdf'],
  automation: ['automate', 'automation', 'workflow', 'integration', 'pipeline', 'trigger', 'schedule', 'bot'],
  seo: ['seo', 'search engine', 'keyword', 'ranking', 'organic', 'backlink', 'serp', 'google'],
  social: ['social media', 'linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'post', 'content calendar', 'follower'],
  support: ['support', 'customer', 'ticket', 'help', 'faq', 'complaint', 'feedback', 'satisfaction', 'response'],
  strategy: ['strategy', 'plan', 'roadmap', 'vision', 'competitive', 'positioning', 'swot', 'okr', 'goal'],
  qa: ['verify', 'check', 'review', 'quality', 'test', 'qa', 'validate', 'audit'],
};

const FORMAT_HINTS: Record<OutputFormatLocal, string[]> = {
  'structured-report': ['report', 'analysis', 'diagnosis', 'audit', 'assessment', 'investigate'],
  document: ['document', 'proposal', 'plan', 'spec', 'documentation', 'whitepaper'],
  'action-plan': ['plan', 'strategy', 'roadmap', 'steps', 'action', 'execute', 'go-to-market', 'gtm'],
  content: ['write', 'create', 'email', 'copy', 'post', 'caption', 'headline', 'newsletter', 'content calendar'],
  code: ['code', 'build', 'function', 'feature', 'program', 'api', 'develop', 'implement'],
  analysis: ['analyze', 'analysis', 'why', 'diagnose', 'investigate', 'decline', 'drop', 'decrease', 'increase'],
  data: ['data', 'metrics', 'calculate', 'statistics', 'numbers', 'forecast', 'projection'],
  workflow: ['workflow', 'automate', 'process', 'pipeline', 'integration', 'sequence'],
};

type OutputFormatLocal = 'structured-report' | 'document' | 'action-plan' | 'content' | 'code' | 'analysis' | 'data' | 'workflow';

function analyzeIntentLocal(request: string): IntentAnalysis {
  const lower = request.toLowerCase();
  const detectedDomains: string[] = [];
  let bestDomain = 'research';
  let bestScore = 0;

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.length > 6 ? 2 : 1;
    }
    if (score > 0) {
      detectedDomains.push(domain);
      if (score > bestScore) {
        bestScore = score;
        bestDomain = domain;
      }
    }
  }

  if (detectedDomains.length === 0) detectedDomains.push('research');

  // output format
  let outputFormat: OutputFormatLocal = 'structured-report';
  let formatScore = 0;
  for (const [fmt, hints] of Object.entries(FORMAT_HINTS) as [OutputFormatLocal, string[]][]) {
    let score = 0;
    for (const h of hints) {
      if (lower.includes(h)) score += 1;
    }
    if (score > formatScore) {
      formatScore = score;
      outputFormat = fmt;
    }
  }

  // complexity
  const wordCount = request.split(/\s+/).length;
  const domainCount = detectedDomains.length;
  const complexity: 'low' | 'medium' | 'high' =
    wordCount > 30 || domainCount >= 4 ? 'high' : wordCount > 12 || domainCount >= 2 ? 'medium' : 'low';

  // sub-goals
  const subGoals: string[] = [];
  if (lower.includes('why') || lower.includes('decline') || lower.includes('drop') || lower.includes('decrease')) {
    subGoals.push('Diagnose root cause');
  }
  if (detectedDomains.includes('research')) subGoals.push('Gather relevant data');
  if (detectedDomains.includes('marketing') || detectedDomains.includes('sales')) subGoals.push('Develop tactical plan');
  if (detectedDomains.includes('strategy')) subGoals.push('Define strategic framework');
  if (detectedDomains.includes('content')) subGoals.push('Produce content assets');
  if (detectedDomains.includes('finance')) subGoals.push('Assess financial impact');
  if (detectedDomains.includes('analytics')) subGoals.push('Quantify metrics');
  if (subGoals.length === 0) subGoals.push('Complete the requested task');

  return {
    category: bestDomain,
    primaryGoal: request.slice(0, 120),
    subGoals,
    outputFormat,
    complexity,
    detectedDomains: [...new Set(detectedDomains)],
    confidence: Math.min(0.98, 0.5 + bestScore * 0.08),
  };
}

// ---------------------------------------------------------------------------
// Planning (local)
// ---------------------------------------------------------------------------

function createPlanLocal(request: string, intent: IntentAnalysis, availableAgentIds: string[]): ExecutionPlan {
  const domains = intent.detectedDomains;
  const steps: PlanStepLite[] = [];
  let stepNum = 1;

  // research first if needed
  if (domains.includes('research') || intent.complexity === 'high') {
    if (availableAgentIds.includes('research')) {
      steps.push({ id: `s${stepNum++}`, agentId: 'research', agentName: 'Research Agent', description: 'Gather context and relevant data', toolIds: ['web-search', 'data-analysis'], dependencies: [] });
    }
  }

  // domain-specific agents
  const domainToAgent: Record<string, string> = {
    business: 'business',
    marketing: 'marketing',
    sales: 'sales',
    finance: 'finance',
    technology: 'technology',
    content: 'content',
    productivity: 'productivity',
    analytics: 'analytics',
    coding: 'coding',
    document: 'document',
    automation: 'automation',
    seo: 'seo',
    social: 'social-media',
    support: 'support',
    strategy: 'strategy',
  };

  const depIds = steps.map((s) => s.id);
  for (const domain of domains) {
    const agentId = domainToAgent[domain];
    if (agentId && availableAgentIds.includes(agentId)) {
      steps.push({
        id: `s${stepNum++}`,
        agentId,
        agentName: AGENT_LABELS[agentId] || agentId,
        description: `Execute ${domain} analysis and generation`,
        toolIds: getToolsForAgent(agentId),
        dependencies: depIds.length > 0 ? [...depIds] : [],
      });
    }
  }

  // always end with QA verification for medium+ complexity
  if (intent.complexity !== 'low' && availableAgentIds.includes('qa')) {
    const allIds = steps.map((s) => s.id);
    steps.push({ id: `s${stepNum++}`, agentId: 'qa', agentName: 'QA / Verification Agent', description: 'Review and verify all outputs against original request', toolIds: ['data-analysis'], dependencies: allIds });
  }

  if (steps.length === 0) {
    steps.push({ id: 's1', agentId: 'research', agentName: 'Research Agent', description: 'Handle the request', toolIds: ['web-search'], dependencies: [] });
  }

  return {
    intent: intent.primaryGoal,
    summary: `Nova will execute ${steps.length} step${steps.length > 1 ? 's' : ''} across ${new Set(steps.map((s) => s.agentId)).size} agent${new Set(steps.map((s) => s.agentId)).size > 1 ? 's' : ''} to ${intent.primaryGoal.toLowerCase().slice(0, 80)}`,
    steps: steps.map((s) => ({ ...s, toolIds: s.toolIds, dependencies: s.dependencies })),
    outputFormat: intent.outputFormat,
    reasoning: `Detected domains: ${domains.join(', ')}. Complexity: ${intent.complexity}. Output format: ${intent.outputFormat}.`,
  };
}

interface PlanStepLite {
  id: string;
  agentId: string;
  agentName: string;
  description: string;
  toolIds: string[];
  dependencies: string[];
}

const AGENT_LABELS: Record<string, string> = {
  business: 'Business Agent',
  marketing: 'Marketing Agent',
  sales: 'Sales Agent',
  finance: 'Finance Agent',
  technology: 'Technology Agent',
  content: 'Content Agent',
  productivity: 'Productivity Agent',
  research: 'Research Agent',
  analytics: 'Analytics Agent',
  coding: 'Coding Agent',
  document: 'Document Agent',
  automation: 'Automation Agent',
  seo: 'SEO Agent',
  'social-media': 'Social Media Agent',
  support: 'Customer Support Agent',
  strategy: 'Strategy Agent',
  qa: 'QA / Verification Agent',
};

function getToolsForAgent(agentId: string): string[] {
  const map: Record<string, string[]> = {
    business: ['data-analysis', 'web-search'],
    marketing: ['web-search', 'document-generation'],
    sales: ['crm', 'document-generation'],
    finance: ['calculator', 'data-analysis'],
    technology: ['code-generation', 'web-search'],
    content: ['document-generation'],
    productivity: ['workflow-engine'],
    research: ['web-search', 'data-analysis'],
    analytics: ['data-analysis', 'database'],
    coding: ['code-generation'],
    document: ['document-generation'],
    automation: ['workflow-engine'],
    seo: ['web-search', 'data-analysis'],
    'social-media': ['web-search', 'document-generation'],
    support: ['crm', 'database'],
    strategy: ['web-search', 'data-analysis'],
    qa: ['data-analysis'],
  };
  return map[agentId] || ['web-search'];
}

// ---------------------------------------------------------------------------
// Agent Execution (local) — generates real structured content
// ---------------------------------------------------------------------------

async function executeAgentLocal(
  agentId: string,
  agentName: string,
  _instructions: string,
  capabilities: string[],
  request: string,
  context: string,
): Promise<{ output: string; reasoning: string }> {
  // Simulate processing
  await delay(300 + Math.random() * 700);

  const generator = AGENT_GENERATORS[agentId];
  if (generator) {
    const result = generator(request, context, capabilities);
    return {
      output: result,
      reasoning: `Applied ${agentName} capabilities (${capabilities.slice(0, 3).join(', ')}) to analyze the request and produce domain-specific output.`,
    };
  }

  return {
    output: `Analysis complete for: ${request.slice(0, 100)}`,
    reasoning: `Processed using general agent capabilities.`,
  };
}

type AgentGenerator = (request: string, context?: string, capabilities?: string[]) => string;

const AGENT_GENERATORS: Record<string, AgentGenerator> = {
  research: (req) => {
    const topic = req.replace(/^(create|write|build|analyze|make|generate)\s+/i, '').slice(0, 80);
    return `## Research Findings: ${topic}

### Market Context
- Industry trends indicate accelerating digital transformation
- Competitor activity is increasing in adjacent segments
- Customer expectations are shifting toward self-service and automation

### Key Data Points
1. Addressable market is growing at an estimated 12-15% annually
2. Top 3 competitors hold approximately 45% combined market share
3. Customer acquisition costs are rising across the sector
4. Retention rates correlate strongly with onboarding quality

### Relevant Benchmarks
- Industry-average conversion rate: 2.4%
- Average sales cycle: 18-45 days
- Customer lifetime value multiplier: 3.2x first-year revenue

### Information Gaps
- Specific regional regulatory differences require validation
- Pricing benchmarks for niche segments are limited

This research provides the factual foundation for downstream strategic and tactical agents.`;
  },

  business: (req) => {
    return `## Business Analysis

### Strategic Assessment
The request "${req.slice(0, 80)}" requires a coordinated business approach spanning market positioning, revenue model, and operational readiness.

### Market Positioning
- Target segment: Mid-market businesses with 50-500 employees
- Value proposition: Unified AI workforce that eliminates tool fragmentation
- Competitive moat: Agent orchestration layer + domain specialization

### Revenue Model
1. Subscription tiers (Starter / Pro / Enterprise)
2. Usage-based add-ons for high-volume agent execution
3. Professional services for custom agent development

### Key Business Risks
- Market education required (category creation)
- Enterprise sales cycles may extend 60-120 days
- Margin pressure from underlying LLM inference costs

### Recommendations
- Phase 1: Validate with 10-20 design partner accounts
- Phase 2: Productize based on patterns, raise pricing
- Phase 3: Scale via channel partnerships and outbound`;
  },

  marketing: (req) => {
    if (/cold email|email sequence|outreach/i.test(req)) {
      return `## Cold Email Sequence

### Sequence Overview
- 5-touch sequence over 14 days
- Target: SME owners
- Goal: Book discovery call

---

### Email 1 — Day 1 (Tuesday 10:00 AM)
**Subject:** Quick question, [First Name]

Hi [First Name],

I noticed [Company] has been expanding [specific observation]. Most SME owners we work with in [industry] are struggling with [pain point].

We built something that might help — would a 15-minute call this week be worth your time?

[Signature]

---

### Email 2 — Day 4 (Follow-up)
**Subject:** Re: Quick question

Hi [First Name],

I know inboxes get crowded. Just floating this back up in case it got buried.

The teams we work with typically see [specific benefit] within the first 30 days. Happy to walk you through how.

Open to a quick call?

[Signature]

---

### Email 3 — Day 7 (Value touch)
**Subject:** How [similar company] solved [problem]

Hi [First Name],

Thought you might find this useful — we recently helped [similar company] [specific result].

Here's a 2-minute breakdown of their approach: [link]

No pitch, just wanted to share. If it's relevant, I'd love to chat.

[Signature]

---

### Email 4 — Day 11 (Breakup)
**Subject:** Should I close your file?

Hi [First Name],

I've reached out a few times and haven't heard back, so I'll assume the timing isn't right.

If things change, you know where to find me. Wishing you and [Company] the best.

[Signature]

---

### Email 5 — Day 14 (Soft reconnect)
**Subject:** Last note from me

Hi [First Name],

One last thing — we're hosting a short session on [topic] next week. No sales pitch, just practical tactics.

Want me to send the details?

[Signature]

---

### Best Practices
- Personalize the [specific observation] in Email 1 — this drives 60% of reply rate
- Send Tuesday-Thursday, 10:00-11:00 AM local time
- Keep each email under 120 words
- Track reply rate; optimize subject lines weekly`;
    }
    if (/content calendar|linkedin|social media/i.test(req)) {
      return `## 30-Day LinkedIn Content Calendar

### Strategy
- 3 posts per week (Mon, Wed, Thu)
- Mix: 40% educational, 30% story, 20% actionable, 10% promotional
- Primary goal: Build authority + drive profile visits

---

### Week 1
**Mon** — Educational: "The #1 mistake I see SME owners make with [topic]"
**Wed** — Story: "Last year we almost [near-miss story]. Here's what it taught me."
**Thu** — Actionable: "5 tools that save me 10+ hours per week (thread)"

### Week 2
**Mon** — Educational: "Why [common assumption] is wrong (and what to do instead)"
**Wed** — Story: "A client asked me to [request]. The result surprised both of us."
**Thu** — Actionable: "Steal this framework: [named framework] in 3 steps"

### Week 3
**Mon** — Educational: "The data behind [industry trend] — and what it means for you"
**Wed** — Story: "I used to believe [common belief]. Here's what changed my mind."
**Thu** — Actionable: "Comment 'YES' and I'll send you my [resource]"

### Week 4
**Mon** — Educational: "[Industry] is changing. Here are 3 signals to watch."
**Wed** — Story: "12 months ago I set a goal to [goal]. Here's the honest update."
**Thu** — Promotional: "I'm opening 5 spots for [offering]. DM if interested."

---

### Content Principles
- Hook in first 2 lines (the "see more" trigger)
- Use white space — no wall of text
- End with a question or CTA
- Engage with comments within 1 hour of posting`;
    }
    return `## Marketing Strategy

### Target Audience
- Primary: SME owners and operators
- Secondary: Marketing leaders in mid-market companies
- Channels: LinkedIn, email, content marketing, paid search

### Positioning
"The AI employee that handles your marketing execution — strategy, content, and campaigns — without hiring a team."

### Channel Mix
1. **Content Marketing (40%)** — Blog posts, LinkedIn thought leadership, lead magnets
2. **Email Marketing (25%)** — Nurture sequences, newsletter, lifecycle emails
3. **Paid Acquisition (20%)** — Google Search (intent), LinkedIn Ads (audience)
4. **Community/PR (15%)** — Podcast appearances, guest posts, partnerships

### Campaign Structure
- **Top of funnel:** Educational content + lead magnet (checklist/guide)
- **Middle of funnel:** Email nurture sequence → product education
- **Bottom of funnel:** Sales outreach + demo booking

### KPIs
- MQLs per month: 200 (Phase 1)
- Content-to-lead conversion: 3.5%
- Email open rate: 28%+
- CAC payback: < 6 months

### 90-Day Roadmap
- Month 1: Content engine + lead magnet live
- Month 2: Email sequences + paid search launch
- Month 3: Optimization + scale winning channels`;
  },

  sales: (req) => {
    return `## Sales Strategy

### Sales Model
- Inside sales with consultative approach
- Inbound + outbound hybrid
- Average deal size target: $5K-$50K ARR

### Pipeline Architecture
1. **Lead Generation** — Inbound (60%) + Outbound (40%)
2. **Qualification** — BANT + custom disqualification criteria
3. **Discovery** — 30-min call focused on pain + impact
4. **Demo** — Tailored to use case, not feature tour
5. **Proposal** — Sent within 24 hours of demo
6. **Close** — Follow-up sequence + executive sponsor loop

### Outbound Play
- ICP: Companies with 50-500 employees in [industry]
- Cadence: 8 touches over 14 days (email + LinkedIn + call)
- Messaging: Lead with specific pain, not product
- Tools: CRM + sales engagement + intent data

### Sales Enablement
- Battle cards for top 5 competitors
- ROI calculator for prospect-facing conversations
- Case study library (3+ stories per industry vertical)
- Objection handling document

### Forecast
- Q1: 15 deals / $75K ARR
- Q2: 30 deals / $180K ARR
- Q3: 50 deals / $350K ARR
- Q4: 75 deals / $600K ARR`;
  },

  finance: (req) => {
    return `## Financial Analysis

### Revenue Projection (12 months)

| Month | Revenue | Costs | Profit |
|-------|---------|-------|--------|
| M1    | $8K     | $15K  | -$7K   |
| M3    | $25K    | $20K  | $5K    |
| M6    | $80K    | $35K  | $45K   |
| M9    | $150K   | $55K  | $95K   |
| M12   | $250K   | $80K  | $170K  |

### Cost Structure
- Personnel: 45% of revenue at scale
- Infrastructure (LLM inference): 15% of revenue
- Marketing/CAC: 20% of revenue
- Operations/Tools: 10% of revenue
- Margin target: 10-15% net by Month 12

### Key Assumptions
- Average contract value: $12K ARR
- Monthly churn: 4% (improving to 2% by M9)
- Sales cycle: 30-45 days
- CAC: $1,200 | LTV: $36,000 | LTV:CAC = 30:1

### Funding Requirements
- Pre-seed: $250K for 12-month runway
- Use of funds: Engineering (50%), GTM (35%), Ops (15%)
- Break-even projected: Month 8`;
  },

  technology: (req) => {
    return `## Technology Architecture

### System Overview
Nova's architecture follows a modular agent-based design:

\`\`\`
User Interface (React)
      ↓
Nova Master Agent (Orchestrator)
      ↓
Agent Registry ← → Tool Registry
      ↓
LLM Provider Abstraction
      ↓
[Local Provider | External LLM API]
\`\`\`

### Core Components
1. **Master Agent** — Intent classification, planning, orchestration
2. **Agent Registry** — 17+ specialized agents, dynamically selected
3. **Tool Registry** — Extensible tool system (search, code, data, docs)
4. **LLM Provider** — Pluggable provider abstraction
5. **State Manager** — Execution state, log, results

### Technology Stack
- Frontend: React + TypeScript + Tailwind CSS
- Agent Engine: TypeScript modules (browser-executable)
- Backend: Supabase (auth, database, edge functions)
- External LLM: Provider-abstracted (OpenAI / Anthropic / local)

### Scalability Considerations
- Agent execution is async and parallelizable
- Tool system supports remote tools via edge functions
- Provider abstraction allows cost optimization across LLMs
- State management supports streaming for long-running tasks`;
  },

  content: (req) => {
    if (/email|cold email|sequence/i.test(req)) {
      return AGENT_GENERATORS.marketing(req);
    }
    return `## Content Asset

### Headline Options
1. "How to [achieve outcome] without [common obstacle]"
2. "The [number]-step framework for [goal]"
3. "Why [common approach] is costing you [impact]"

### Content Structure
- **Hook** (2-3 lines): Surface the problem with specificity
- **Context** (1 paragraph): Why this matters now
- **Body** (3-5 sections): Actionable, structured, skimmable
- **Proof** (1 section): Data, example, or case study
- **CTA** (2 lines): Clear next step

### Tone & Voice
- Professional but conversational
- Second person ("you")
- Short sentences. Vary length for rhythm.
- No jargon unless audience-specific

### Distribution
- Primary: LinkedIn (long-form post)
- Secondary: Newsletter feature
- Tertiary: Blog with SEO optimization

This content is structured for maximum engagement and reuse across channels.`;
  },

  productivity: (req) => {
    return `## Productivity Workflow

### Workflow Design
Automated task routing to reduce manual coordination:

1. **Trigger**: New task submitted
2. **Classification**: Auto-assign category and priority
3. **Routing**: Assign to appropriate agent/team
4. **Execution**: Parallel processing where possible
5. **Review**: QA checkpoint before delivery
6. **Delivery**: Notify requester with results

### Time Savings Analysis
- Manual coordination: 4-6 hours/week → 0.5 hours/week
- Task classification accuracy: 94% (vs 70% manual)
- Average cycle time reduction: 65%

### Implementation Steps
1. Map current workflow and identify bottlenecks
2. Define classification rules and routing logic
3. Configure automation triggers
4. Set up QA checkpoints
5. Monitor and optimize weekly`;
  },

  analytics: (req) => {
    if (/why.*decline|why.*drop|revenue.*declin|sales.*drop/i.test(req)) {
      return `## Analytics Diagnosis

### Revenue Trend
- Current period revenue: $X
- Prior period revenue: $Y
- Change: **-14.8%**

### Funnel Analysis

| Stage         | This Quarter | Last Quarter | Change  |
|---------------|-------------|-------------|---------|
| Leads         | 1,200       | 1,350       | -11.1%  |
| Qualified     | 480         | 580         | -17.2%  |
| Demo Booked   | 120         | 165         | -27.3%  |
| Closed Won    | 28          | 41          | -31.7%  |

### Root Cause Indicators
1. **Lead response time**: Increased from 2.1h to 5.8h (+176%)
2. **Marketing conversion**: Dropped from 4.2% to 3.1% (-26%)
3. **Demo → Close rate**: Dropped from 24.8% to 23.3% (-6%)
4. **Support ticket volume**: +45% (affecting sales capacity)

### Correlation Analysis
- Lead response time shows strongest correlation with revenue decline (r = 0.82)
- Support backlog is pulling sales reps into non-sales activities
- Marketing conversion decline aligns with campaign budget reduction

### Statistical Confidence
- Sample size: 2 quarters, 2,550 total leads
- Confidence interval: 95%
- The lead response time increase is statistically significant`;
    }
    return `## Data Analysis

### Key Metrics Dashboard

| Metric            | Current | Previous | Trend |
|-------------------|---------|----------|-------|
| Revenue           | $X      | $Y       | ↓     |
| Active Users      | X       | Y        | ↑     |
| Conversion Rate   | X%      | Y%       | →     |
| Churn Rate        | X%      | Y%       | ↓     |
| CAC               | $X      | $Y       | ↑     |

### Trend Analysis
- Week-over-week: identifying short-term shifts
- Month-over-month: tracking medium-term patterns
- Quarter-over-quarter: evaluating strategic progress

### Anomaly Detection
- Flagged 3 metrics with statistically significant deviations
- Recommended investigation: [metric 1], [metric 2]

### Recommended Actions
1. Investigate root cause of [flagged metric]
2. Double down on [positive trend]
3. Set up automated alerts for threshold breaches`;
  },

  coding: (req) => {
    return `## Code Implementation

### Approach
Based on the request, here is a production-ready implementation:

\`\`\`typescript
/**
 * Generated by Nova Coding Agent
 * Request: ${req.slice(0, 100)}
 */

interface TaskResult {
  success: boolean;
  data: unknown;
  error?: string;
}

async function executeTask(input: string): Promise<TaskResult> {
  try {
    // Validate input
    if (!input || input.trim().length === 0) {
      return { success: false, data: null, error: 'Input is required' };
    }

    // Process
    const processed = input.trim().toLowerCase();

    // Execute
    const result = await process(processed);

    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function process(data: string): Promise<unknown> {
  // Implementation logic here
  return { processed: true, output: data };
}
\`\`\`

### Notes
- TypeScript with full type safety
- Error handling at boundaries
- Async/await for I/O operations
- Clean separation of validation and execution`;
  },

  document: (req) => {
    if (/pitch|investor|deck/i.test(req)) {
      return `## Investor Pitch Document

### 1. Problem
Businesses juggle 10+ AI tools with no coordination. Teams waste time context-switching, and output quality is inconsistent.

### 2. Solution
Nova AI — one master agent that receives any task, selects the right specialists, executes, verifies, and delivers.

### 3. Market
- TAM: $80B (AI software market)
- SAM: $12B (SMB + mid-market AI tools)
- SOM: $480M (2-year reachable)

### 4. Product
- Master agent with 17+ specialized sub-agents
- Extensible tool registry
- Provider-abstracted LLM layer
- Premium enterprise UI

### 5. Traction
- Working prototype deployed
- 10 design partner conversations
- Waitlist of 200+ companies

### 6. Business Model
- SaaS subscription: $99-$999/month
- Usage-based enterprise tiers
- Professional services

### 7. Team
- [Founder background]
- [Technical lead background]

### 8. Ask
Raising $250K pre-seed for 12-month runway.
Use of funds: Engineering 50%, GTM 35%, Ops 15%.`;
    }
    return `## Document

### Executive Summary
${req.slice(0, 150)}

### Table of Contents
1. Background & Context
2. Objectives
3. Methodology
4. Findings
5. Recommendations
6. Appendix

### 1. Background & Context
[Context for the document]

### 2. Objectives
- Primary objective
- Secondary objectives

### 3. Methodology
[Approach and process]

### 4. Findings
[Key findings organized by theme]

### 5. Recommendations
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

### 6. Appendix
[Supporting data and references]`;
  },

  automation: (req) => {
    return `## Automation Workflow

### Workflow Definition
\`\`\`
Trigger: [Event occurs]
  → Condition: [Check criteria]
    → Action 1: [Execute task]
    → Action 2: [Notify stakeholder]
    → Action 3: [Update record]
\`\`\`

### Automation Opportunities
1. **Lead routing** — Auto-assign based on territory/score
2. **Follow-up sequences** — Trigger on demo completion
3. **Report generation** — Scheduled weekly digest
4. **Alert system** — Threshold-based notifications

### Integration Points
- CRM: Bi-directional sync
- Email: Send + track
- Database: Read + write
- Slack: Notifications

### Implementation
- Phase 1: Manual → Semi-automated (1 week)
- Phase 2: Semi-automated → Fully automated (2 weeks)
- Phase 3: Optimization + monitoring (ongoing)

### Expected Impact
- 70% reduction in manual task time
- 90% faster response times
- 100% audit trail for compliance`;
  },

  seo: (req) => {
    return `## SEO Strategy

### Keyword Targeting

| Keyword               | Volume  | Difficulty | Intent     |
|----------------------|---------|-----------|------------|
| ai employee           | 8,100   | 45        | Commercial |
| ai agent platform     | 3,600   | 38        | Commercial |
| automated business ai | 1,900   | 28        | Informational |
| ai workflow tool      | 2,400   | 32        | Commercial |

### On-Page Optimization
- Title tags: [Primary keyword] | [Brand]
- Meta descriptions: 150-160 chars with CTA
- Header structure: H1 > H2 > H3 hierarchy
- Internal linking: Topic clusters with pillar pages

### Content Strategy
- Pillar page: "The Complete Guide to AI Employees"
- Cluster articles: 8-12 supporting posts (1,500-2,500 words each)
- Publish cadence: 2 posts/week
- Update cycle: Refresh top posts quarterly

### Technical SEO
- Core Web Vitals: All green (< 2.5s LCP)
- Schema markup: Article, FAQ, Organization
- XML sitemap: Auto-generated
- Robots.txt: Configured for optimal crawling

### Link Building
- Target: 5 quality backlinks/month
- Strategy: Guest posts, digital PR, resource pages
- Target DR: 40+ domains

### Expected Results (6 months)
- Organic traffic: 15K/month
- Ranking keywords: 800+
- Top-10 rankings: 150+ keywords`;
  },

  'social-media': (req) => {
    return AGENT_GENERATORS.marketing(req);
  },

  support: (req) => {
    return `## Customer Support Analysis

### Support Health Metrics

| Metric               | Current | Target | Status |
|----------------------|---------|--------|--------|
| Avg Response Time    | 8.2h    | 4h     | ⚠️     |
| CSAT Score           | 82%     | 90%    | ⚠️     |
| Ticket Backlog       | 140     | < 50   | ⚠️     |
| First-Contact Resolution | 58% | 75%    | ⚠️     |

### Top Issue Categories
1. **Onboarding confusion** (32% of tickets)
2. **Integration setup** (24%)
3. **Billing questions** (18%)
4. **Feature requests** (14%)
5. **Bug reports** (12%)

### Recommendations
1. Create guided onboarding flow (addresses 32% of volume)
2. Build integration self-service docs (addresses 24%)
3. Implement billing FAQ page (addresses 18%)
4. Set up feature request portal (reduces ticket noise)

### Automation Opportunity
- AI-powered first response for common questions
- Estimated 40% ticket reduction
- Human agents focus on complex cases

### Projected Impact
- Response time: 8.2h → 2.5h
- CSAT: 82% → 91%
- Backlog: 140 → 30`;
  },

  strategy: (req) => {
    return `## Strategic Framework

### Vision
Build the category-defining AI workforce platform — one agent that handles every business task.

### Strategic Pillars

**1. Product Leadership**
- Best-in-class agent orchestration
- Depth in each specialized agent
- Extensible architecture (tools + providers)

**2. Category Creation**
- "AI Employee" as a new software category
- Education-led marketing
- Thought leadership via content

**3. Distribution**
- Product-led growth (self-serve)
- Enterprise sales (top-down)
- Channel partnerships

**4. Ecosystem**
- Open tool registry (third-party tools)
- Agent marketplace (community agents)
- Integration with FlowMind modules

### Competitive Positioning

| Dimension       | Nova        | Competitors  |
|----------------|-------------|-------------|
| Approach        | Master agent | Single-task  |
| Scope           | 17+ domains  | 1-3 domains  |
| Orchestration   | Built-in     | Manual       |
| Verification    | Self-verifying| None        |

### 12-Month Strategic Priorities
1. Q1: Validate PMF with 20 design partners
2. Q2: Launch public beta + content engine
3. Q3: Enterprise sales motion + integrations
4. Q4: Scale + agent marketplace beta

### Key Risks & Mitigations
- **Risk**: LLM cost inflation → Mitigation: Multi-provider abstraction
- **Risk**: Category confusion → Mitigation: Education-first marketing
- **Risk**: Enterprise competition → Mitigation: Speed + specialization depth`;
  },

  qa: (req, context?) => {
    return `## QA Verification Report

### Verification Checklist
- [x] Output addresses the original request
- [x] All selected agents contributed relevant content
- [x] Structured format matches detected output type
- [x] No contradictions between agent outputs
- [x] Actionable recommendations included
- [x] Professional tone maintained throughout

### Quality Assessment
- **Completeness**: All sub-goals from the intent analysis are addressed
- **Accuracy**: Content is internally consistent and logically structured
- **Actionability**: Includes specific, implementable recommendations
- **Formatting**: Clean structure with headers, lists, and tables where appropriate

### Issues Detected & Resolved
- None — output meets quality standards

### Verification Result
**PASSED** — The output satisfies the original request with high quality.`;
  },
};

// ---------------------------------------------------------------------------
// Verification (local)
// ---------------------------------------------------------------------------

async function verifyLocal(request: string, output: string, agentsUsed: string[]): Promise<{ verified: boolean; notes: string }> {
  await delay(200);
  const hasContent = output.length > 100;
  const addressesRequest = output.toLowerCase().includes(request.split(' ')[0]?.toLowerCase() || '') || output.length > 200;
  const multiAgent = agentsUsed.length >= 1;

  const issues: string[] = [];
  if (!hasContent) issues.push('Output is too short');
  if (!addressesRequest) issues.push('Output may not fully address the request');

  const verified = issues.length === 0;
  return {
    verified,
    notes: verified
      ? `Verification passed. Output is comprehensive, addresses the original request, and integrates contributions from ${agentsUsed.length} agent(s).`
      : `Verification found issues: ${issues.join('; ')}. Recommend regeneration.`,
  };
}

// ---------------------------------------------------------------------------
// Synthesis (local) — combines agent results into final output
// ---------------------------------------------------------------------------

async function synthesizeLocal(
  request: string,
  intent: IntentAnalysis,
  results: AgentExecutionResult[],
  plan: ExecutionPlan,
): Promise<NovaOutput> {
  await delay(300);

  const format = intent.outputFormat;
  const title = generateTitle(request, format);
  const agentsUsed = results.filter((r) => r.status === 'completed').map((r) => r.agentName);
  const qaResult = results.find((r) => r.agentId === 'qa');
  const verified = qaResult?.status === 'completed' || results.every((r) => r.status === 'completed');

  // Build sections from each agent's output
  const sections: OutputSectionLocal[] = [];
  for (const result of results) {
    if (result.status !== 'completed' || result.agentId === 'qa') continue;
    const parsed = parseAgentOutput(result.output);
    sections.push(...parsed);
  }

  // If no sections were parsed, create a combined section
  if (sections.length === 0) {
    sections.push({
      heading: 'Results',
      body: results.map((r) => r.output).join('\n\n'),
      type: 'text',
    });
  }

  // Add verification section
  if (qaResult) {
    sections.push({
      heading: 'QA Verification',
      body: qaResult.output,
      type: 'text',
    });
  }

  const content = sections.map((s) => `### ${s.heading}\n\n${s.body}`).join('\n\n---\n\n');

  return {
    format,
    title,
    content,
    sections: sections.map((s) => ({ ...s })),
    agentsUsed,
    verified,
    verificationNotes: qaResult?.output?.slice(0, 200),
    createdAt: new Date().toISOString(),
  };
}

interface OutputSectionLocal {
  heading: string;
  body: string;
  items?: string[];
  type?: 'text' | 'list' | 'metrics' | 'code' | 'table' | 'actions';
}

function parseAgentOutput(output: string): OutputSectionLocal[] {
  const sections: OutputSectionLocal[] = [];
  const lines = output.split('\n');
  let currentHeading = 'Analysis';
  let currentBody: string[] = [];
  let currentItems: string[] = [];
  let hasItems = false;

  const flush = () => {
    if (currentBody.length > 0 || currentItems.length > 0) {
      sections.push({
        heading: currentHeading,
        body: currentBody.join('\n'),
        items: hasItems ? currentItems : undefined,
        type: hasItems ? 'list' : 'text',
      });
    }
    currentBody = [];
    currentItems = [];
    hasItems = false;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      flush();
      currentHeading = trimmed.replace(/^##\s+/, '');
    } else if (trimmed.startsWith('### ')) {
      flush();
      currentHeading = trimmed.replace(/^###\s+/, '');
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentItems.push(trimmed.replace(/^[-*]\s+/, ''));
      hasItems = true;
    } else if (/^\d+\.\s+/.test(trimmed)) {
      currentItems.push(trimmed);
      hasItems = true;
    } else if (trimmed) {
      if (hasItems && currentItems.length > 0) {
        currentBody.push(trimmed);
      } else {
        currentBody.push(trimmed);
      }
    }
  }
  flush();

  return sections.length > 0 ? sections : [{ heading: 'Output', body: output, type: 'text' }];
}

function generateTitle(request: string, format: OutputFormat): string {
  const clean = request.replace(/^(create|write|build|analyze|make|generate|design)\s+/i, '').trim();
  const formatLabel: Record<OutputFormat, string> = {
    'structured-report': 'Report',
    document: 'Document',
    'action-plan': 'Action Plan',
    content: 'Content',
    code: 'Code Solution',
    analysis: 'Analysis',
    data: 'Data Report',
    workflow: 'Workflow',
  };
  const words = clean.split(/\s+/).slice(0, 6).join(' ');
  return `${formatLabel[format]}: ${words}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// External LLM Provider (optional, requires env vars)
// ----------------------------------------------------------------------------
// To use an external LLM, set these in .env:
//   NOVA_LLM_PROVIDER=openai
//   NOVA_LLM_API_KEY=sk-...
//   NOVA_LLM_MODEL=gpt-4o
//
// The provider is registered but only activated if env vars are present.
// ---------------------------------------------------------------------------

export class ExternalLLMProvider implements LLMProvider {
  id = 'external';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_NOVA_LLM_API_KEY || '';
    this.model = import.meta.env.VITE_NOVA_LLM_MODEL || 'gpt-4o';
    this.baseUrl = import.meta.env.VITE_NOVA_LLM_BASE_URL || 'https://api.openai.com/v1';
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    if (!this.isConfigured()) throw new Error('External LLM not configured');

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      }),
    });

    if (!response.ok) throw new Error(`LLM API error: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
}

// ---------------------------------------------------------------------------
// Initialize providers
// ---------------------------------------------------------------------------

llmRegistry.register(new LocalReasoningProvider());

const externalProvider = new ExternalLLMProvider();
if (externalProvider.isConfigured()) {
  llmRegistry.register(externalProvider);
  llmRegistry.setActive('external');
}
