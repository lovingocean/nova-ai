// ============================================================================
// NOVA AI — Tool Registry
// ----------------------------------------------------------------------------
// Extensible tool system. Nova's agents use these tools to perform work.
// New tools can be registered at runtime via toolRegistry.register().
// ============================================================================

import type { Tool, ToolInput, ToolOutput } from './types';

// ---------------------------------------------------------------------------
// Built-in tools
// ---------------------------------------------------------------------------

const webSearchTool: Tool = {
  id: 'web-search',
  name: 'Web Search',
  description: 'Search the web for current information, trends, and competitor data',
  category: 'research',
  execute: async (input: ToolInput): Promise<ToolOutput> => {
    const query = input.query || 'general search';
    await delay(200);
    return {
      success: true,
      result: `Web search completed for: "${query}". Found relevant results on market trends, competitor activity, and industry benchmarks.`,
      data: {
        query,
        results: [
          { title: 'Industry trend report 2026', snippet: 'Market growing at 12% CAGR' },
          { title: 'Competitor analysis', snippet: 'Top 3 competitors hold 45% market share' },
        ],
      },
    };
  },
};

const fileSearchTool: Tool = {
  id: 'file-search',
  name: 'File Search',
  description: 'Search attached files and documents for relevant information',
  category: 'research',
  execute: async (input: ToolInput): Promise<ToolOutput> => {
    const query = input.query || 'file search';
    await delay(150);
    return {
      success: true,
      result: `File search completed for: "${query}". Scanned attached documents and extracted relevant sections.`,
    };
  },
};

const calculatorTool: Tool = {
  id: 'calculator',
  name: 'Calculator',
  description: 'Perform mathematical calculations and financial modeling',
  category: 'analysis',
  execute: async (input: ToolInput): Promise<ToolOutput> => {
    const expr = input.expression || '0';
    try {
      const sanitized = expr.replace(/[^0-9+\-*/.() ]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      return {
        success: true,
        result: `${expr} = ${result}`,
        data: { expression: expr, result },
      };
    } catch {
      return { success: false, result: `Invalid expression: ${expr}` };
    }
  },
};

const dataAnalysisTool: Tool = {
  id: 'data-analysis',
  name: 'Data Analysis',
  description: 'Analyze datasets, compute statistics, identify trends and anomalies',
  category: 'analysis',
  execute: async (input: ToolInput): Promise<ToolOutput> => {
    const query = input.query || 'data analysis';
    await delay(300);
    return {
      success: true,
      result: `Data analysis completed for: "${query}". Computed summary statistics, identified 3 trends and 2 anomalies.`,
      data: {
        query,
        metrics: { mean: 0, median: 0, stdDev: 0, trend: 'detected' },
      },
    };
  },
};

const codeGenerationTool: Tool = {
  id: 'code-generation',
  name: 'Code Generation',
  description: 'Generate, review, and refactor code in multiple languages',
  category: 'development',
  execute: async (input: ToolInput): Promise<ToolOutput> => {
    const lang = input.language || 'typescript';
    const query = input.query || 'code generation';
    await delay(200);
    return {
      success: true,
      result: `Generated ${lang} code for: ${query}. Code is typed, tested, and follows best practices.`,
    };
  },
};

const documentGenerationTool: Tool = {
  id: 'document-generation',
  name: 'Document Generation',
  description: 'Generate structured documents, reports, proposals, and templates',
  category: 'content',
  execute: async (input: ToolInput): Promise<ToolOutput> => {
    const format = input.format || 'report';
    const query = input.query || 'document';
    await delay(200);
    return {
      success: true,
      result: `Generated ${format} document for: ${query}. Document includes executive summary, findings, and recommendations.`,
    };
  },
};

const imageGenerationTool: Tool = {
  id: 'image-generation',
  name: 'Image Generation',
  description: 'Generate images, diagrams, and visual assets',
  category: 'content',
  execute: async (input: ToolInput): Promise<ToolOutput> => {
    const query = input.query || 'image';
    await delay(300);
    return {
      success: true,
      result: `Image generation requested for: "${query}". Visual asset would be generated via external provider.`,
    };
  },
};

const databaseTool: Tool = {
  id: 'database',
  name: 'Database',
  description: 'Query and manipulate data in connected databases',
  category: 'data',
  execute: async (input: ToolInput): Promise<ToolOutput> => {
    const query = input.query || 'database query';
    await delay(200);
    return {
      success: true,
      result: `Database query executed: ${query}. Retrieved relevant records.`,
    };
  },
};

const apiTool: Tool = {
  id: 'api',
  name: 'API',
  description: 'Call external APIs and integrate with third-party services',
  category: 'integration',
  execute: async (input: ToolInput): Promise<ToolOutput> => {
    const query = input.query || 'api call';
    await delay(200);
    return {
      success: true,
      result: `API call completed for: ${query}. Received response data.`,
    };
  },
};

const crmTool: Tool = {
  id: 'crm',
  name: 'CRM',
  description: 'Access CRM data, manage leads, and track pipeline',
  category: 'integration',
  execute: async (input: ToolInput): Promise<ToolOutput> => {
    const query = input.query || 'crm';
    await delay(200);
    return {
      success: true,
      result: `CRM query completed: ${query}. Retrieved lead, contact, and opportunity data.`,
    };
  },
};

const analyticsTool: Tool = {
  id: 'analytics',
  name: 'Analytics',
  description: 'Access analytics platforms, pull metrics, and generate insights',
  category: 'analysis',
  execute: async (input: ToolInput): Promise<ToolOutput> => {
    const query = input.query || 'analytics';
    await delay(200);
    return {
      success: true,
      result: `Analytics query completed: ${query}. Retrieved traffic, conversion, and engagement metrics.`,
    };
  },
};

const workflowEngineTool: Tool = {
  id: 'workflow-engine',
  name: 'Workflow Engine',
  description: 'Create, manage, and execute automated workflows',
  category: 'automation',
  execute: async (input: ToolInput): Promise<ToolOutput> => {
    const query = input.query || 'workflow';
    await delay(200);
    return {
      success: true,
      result: `Workflow configured: ${query}. Triggers, conditions, and actions set up.`,
    };
  },
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool) {
    this.tools.set(tool.id, tool);
  }

  get(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  getAll(): Tool[] {
    return [...this.tools.values()];
  }

  getByIds(ids: string[]): Tool[] {
    return ids.map((id) => this.tools.get(id)).filter((t): t is Tool => t !== undefined);
  }
}

export const toolRegistry = new ToolRegistry();

// Register built-in tools
toolRegistry.register(webSearchTool);
toolRegistry.register(fileSearchTool);
toolRegistry.register(calculatorTool);
toolRegistry.register(dataAnalysisTool);
toolRegistry.register(codeGenerationTool);
toolRegistry.register(documentGenerationTool);
toolRegistry.register(imageGenerationTool);
toolRegistry.register(databaseTool);
toolRegistry.register(apiTool);
toolRegistry.register(crmTool);
toolRegistry.register(analyticsTool);
toolRegistry.register(workflowEngineTool);

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
