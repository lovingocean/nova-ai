// ============================================================================
// NOVA AI — Engine: Intent Analyzer
// ----------------------------------------------------------------------------
// Analyzes the user's request to determine intent, domains, complexity, and
// output format. Uses the LLM provider's typed reasoning methods.
// ============================================================================

import type { IntentAnalysis } from '../types';
import { LocalReasoningProvider } from '../providers';

const localProvider = new LocalReasoningProvider();

export async function analyzeIntent(request: string): Promise<IntentAnalysis> {
  return localProvider.analyzeIntent(request);
}
