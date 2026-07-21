/**
 * Section Registry — Central definition of all 30 report sections.
 *
 * Every section job, worker, cache key, and UI component references
 * this registry as the single source of truth for:
 *   - priority ordering
 *   - AI provider routing
 *   - inter-section dependencies
 *   - Prisma column mapping
 */

export type SectionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SectionDefinition {
  /** Unique key used in Redis, BullMQ job data, and WebSocket events */
  sectionId: string;
  /** Human-readable name shown in the UI progress tracker */
  displayName: string;
  /** 1 = highest priority (generated first). Range: 1–10 */
  priority: number;
  /** Which agent or service generates this section */
  agent: string;
  /** Which LLM injection token to use (only for direct LLM calls) */
  provider: 'GEMINI_PRO' | 'GEMINI_FLASH' | 'GROQ_DEEPSEEK' | 'GROQ_QWEN' | null;
  /** The Prisma Report JSON column to persist to */
  dbField: string;
  /** Other sectionIds that must complete before this one can start */
  dependsOn: string[];
  /** Approximate generation time in ms (for progress estimation) */
  estimatedMs: number;
  /** Icon identifier for frontend (Material Symbols) */
  icon: string;
  /** Tab group for frontend navigation */
  tabGroup: string;
}

// ─────────────────────────────────────────────────────────────────
// THE REGISTRY
// ─────────────────────────────────────────────────────────────────

export const SECTION_REGISTRY: SectionDefinition[] = [
  // ── Priority 1: Instant Value ──────────────────────────────────
  {
    sectionId: 'executive_summary',
    displayName: 'Executive Summary',
    priority: 1,
    agent: 'geminiFlash',
    provider: 'GEMINI_FLASH',
    dbField: 'aiRecommendations', // Stored as overview in recommendations
    dependsOn: [],
    estimatedMs: 4000,
    icon: 'summarize',
    tabGroup: 'overview',
  },
  {
    sectionId: 'business_score',
    displayName: 'Business Score',
    priority: 1,
    agent: 'geminiFlash',
    provider: 'GEMINI_FLASH',
    dbField: 'successPrediction',
    dependsOn: [],
    estimatedMs: 3000,
    icon: 'speed',
    tabGroup: 'overview',
  },

  // ── Priority 2: Core Intelligence ──────────────────────────────
  {
    sectionId: 'market_analysis',
    displayName: 'Market Analysis',
    priority: 2,
    agent: 'marketAgent',
    provider: 'GEMINI_PRO',
    dbField: 'marketData',
    dependsOn: [],
    estimatedMs: 12000,
    icon: 'area_chart',
    tabGroup: 'market',
  },
  {
    sectionId: 'customer_personas',
    displayName: 'Customer Personas',
    priority: 2,
    agent: 'marketAgent', // extracted from market output
    provider: null,
    dbField: 'marketData', // stored within marketData
    dependsOn: ['market_analysis'],
    estimatedMs: 0, // derived, not generated separately
    icon: 'person',
    tabGroup: 'market',
  },

  // ── Priority 3: Competitive Landscape ──────────────────────────
  {
    sectionId: 'competitors',
    displayName: 'Competitor Intelligence',
    priority: 3,
    agent: 'competitorAgent',
    provider: 'GEMINI_PRO',
    dbField: 'competitorData',
    dependsOn: [],
    estimatedMs: 12000,
    icon: 'groups',
    tabGroup: 'competitors',
  },
  {
    sectionId: 'swot',
    displayName: 'SWOT Analysis',
    priority: 3,
    agent: 'competitorAgent', // extracted from competitor output
    provider: null,
    dbField: 'competitorData',
    dependsOn: ['competitors'],
    estimatedMs: 0,
    icon: 'grid_view',
    tabGroup: 'competitors',
  },

  // ── Priority 4: Product & Strategy ─────────────────────────────
  {
    sectionId: 'product',
    displayName: 'Product & Services',
    priority: 4,
    agent: 'productAgent',
    provider: 'GEMINI_PRO',
    dbField: 'productServiceData',
    dependsOn: [],
    estimatedMs: 12000,
    icon: 'inventory_2',
    tabGroup: 'product',
  },
  {
    sectionId: 'risk_analysis',
    displayName: 'Risk Analysis',
    priority: 4,
    agent: 'productAgent', // risks extracted from product output
    provider: null,
    dbField: 'riskData',
    dependsOn: ['product'],
    estimatedMs: 0,
    icon: 'warning',
    tabGroup: 'product',
  },
  {
    sectionId: 'pricing_strategy',
    displayName: 'Pricing Strategy',
    priority: 4,
    agent: 'productAgent',
    provider: null,
    dbField: 'productServiceData',
    dependsOn: ['product'],
    estimatedMs: 0,
    icon: 'sell',
    tabGroup: 'product',
  },
  {
    sectionId: 'gtm',
    displayName: 'Go-To-Market',
    priority: 4,
    agent: 'productAgent',
    provider: null,
    dbField: 'gtmData',
    dependsOn: ['product'],
    estimatedMs: 0,
    icon: 'campaign',
    tabGroup: 'product',
  },
  {
    sectionId: 'marketing_strategy',
    displayName: 'Marketing Strategy',
    priority: 4,
    agent: 'productAgent',
    provider: null,
    dbField: 'productServiceData',
    dependsOn: ['product'],
    estimatedMs: 0,
    icon: 'ads_click',
    tabGroup: 'product',
  },

  // ── Priority 5: Financial ──────────────────────────────────────
  {
    sectionId: 'financial',
    displayName: 'Financial Projections',
    priority: 5,
    agent: 'financialAgent',
    provider: 'GROQ_DEEPSEEK',
    dbField: 'financialData',
    dependsOn: [],
    estimatedMs: 15000,
    icon: 'monitoring',
    tabGroup: 'financial',
  },

  // ── Priority 6: Legal & Compliance ─────────────────────────────
  {
    sectionId: 'formation',
    displayName: 'Business Formation',
    priority: 6,
    agent: 'businessFormationAgent',
    provider: 'GEMINI_PRO',
    dbField: 'businessFormationData',
    dependsOn: [],
    estimatedMs: 12000,
    icon: 'gavel',
    tabGroup: 'formation',
  },
  {
    sectionId: 'bmc',
    displayName: 'Business Model Canvas',
    priority: 6,
    agent: 'businessFormationAgent',
    provider: null,
    dbField: 'businessFormationData',
    dependsOn: ['formation'],
    estimatedMs: 0,
    icon: 'dashboard_customize',
    tabGroup: 'formation',
  },
  {
    sectionId: 'lean_canvas',
    displayName: 'Lean Canvas',
    priority: 6,
    agent: 'businessFormationAgent',
    provider: null,
    dbField: 'businessFormationData',
    dependsOn: ['formation'],
    estimatedMs: 0,
    icon: 'view_kanban',
    tabGroup: 'formation',
  },
  {
    sectionId: 'compliance',
    displayName: 'Compliance & Licenses',
    priority: 6,
    agent: 'complianceAgent',
    provider: 'GEMINI_PRO',
    dbField: 'complianceData',
    dependsOn: [],
    estimatedMs: 12000,
    icon: 'checklist',
    tabGroup: 'compliance',
  },
  {
    sectionId: 'tax_planning',
    displayName: 'Tax Planning',
    priority: 6,
    agent: 'complianceAgent',
    provider: null,
    dbField: 'complianceData',
    dependsOn: ['compliance'],
    estimatedMs: 0,
    icon: 'receipt_long',
    tabGroup: 'compliance',
  },

  // ── Priority 7: Operations ─────────────────────────────────────
  {
    sectionId: 'operations',
    displayName: 'Operations & SOPs',
    priority: 7,
    agent: 'operationsAgent',
    provider: 'GROQ_QWEN',
    dbField: 'sopData',
    dependsOn: [],
    estimatedMs: 15000,
    icon: 'settings',
    tabGroup: 'operations',
  },
  {
    sectionId: 'team_structure',
    displayName: 'Team Structure',
    priority: 7,
    agent: 'operationsAgent',
    provider: null,
    dbField: 'teamData',
    dependsOn: ['operations'],
    estimatedMs: 0,
    icon: 'badge',
    tabGroup: 'operations',
  },
  {
    sectionId: 'infrastructure',
    displayName: 'Infrastructure Planning',
    priority: 7,
    agent: 'operationsAgent',
    provider: null,
    dbField: 'infrastructureData',
    dependsOn: ['operations'],
    estimatedMs: 0,
    icon: 'engineering',
    tabGroup: 'operations',
  },
  {
    sectionId: 'technology_stack',
    displayName: 'Technology Stack',
    priority: 7,
    agent: 'operationsAgent',
    provider: null,
    dbField: 'technologyData',
    dependsOn: ['operations'],
    estimatedMs: 0,
    icon: 'code',
    tabGroup: 'operations',
  },
  {
    sectionId: 'suppliers',
    displayName: 'Supplier Intelligence',
    priority: 7,
    agent: 'operationsAgent',
    provider: null,
    dbField: 'supplierData',
    dependsOn: ['operations'],
    estimatedMs: 0,
    icon: 'local_shipping',
    tabGroup: 'operations',
  },
  {
    sectionId: 'launch_checklist',
    displayName: 'Launch Checklist',
    priority: 7,
    agent: 'operationsAgent',
    provider: null,
    dbField: 'launchChecklistData',
    dependsOn: ['operations'],
    estimatedMs: 0,
    icon: 'rocket_launch',
    tabGroup: 'operations',
  },

  // ── Priority 8: Funding ────────────────────────────────────────
  {
    sectionId: 'funding',
    displayName: 'Funding Strategy',
    priority: 8,
    agent: 'financialAgent',
    provider: null,
    dbField: 'fundingData',
    dependsOn: ['financial'],
    estimatedMs: 0,
    icon: 'savings',
    tabGroup: 'financial',
  },

  // ── Priority 9: Synthesis (requires multiple parents) ──────────
  {
    sectionId: 'vc_synthesis',
    displayName: 'Investor & Pitch Deck',
    priority: 9,
    agent: 'vcAgent',
    provider: 'GEMINI_PRO',
    dbField: 'pitchData',
    dependsOn: ['market_analysis', 'competitors', 'product'],
    estimatedMs: 15000,
    icon: 'slideshow',
    tabGroup: 'funding',
  },

  // ── Priority 10: Visualizations & Final ────────────────────────
  {
    sectionId: 'diagrams',
    displayName: 'Business Diagrams',
    priority: 10,
    agent: 'diagramGenerator',
    provider: 'GEMINI_FLASH',
    dbField: 'diagramData',
    dependsOn: ['operations', 'compliance', 'product'],
    estimatedMs: 8000,
    icon: 'schema',
    tabGroup: 'overview',
  },
  {
    sectionId: 'charts',
    displayName: 'Financial Charts',
    priority: 10,
    agent: 'chartGenerator',
    provider: null, // deterministic calculator, no LLM
    dbField: 'chartData',
    dependsOn: ['financial', 'market_analysis', 'product'],
    estimatedMs: 2000,
    icon: 'bar_chart',
    tabGroup: 'financial',
  },
  {
    sectionId: 'ai_recommendations',
    displayName: 'AI Recommendations',
    priority: 10,
    agent: 'geminiPro',
    provider: 'GEMINI_PRO',
    dbField: 'aiRecommendations',
    dependsOn: ['market_analysis', 'financial', 'competitors', 'product'],
    estimatedMs: 10000,
    icon: 'auto_awesome',
    tabGroup: 'overview',
  },
];

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

/** Only sections that require an actual AI/generation call (not derived sub-sections) */
export const GENERATABLE_SECTIONS = SECTION_REGISTRY.filter(s => s.estimatedMs > 0);

/** Total number of sections that produce real progress ticks */
export const TOTAL_GENERATABLE = GENERATABLE_SECTIONS.length;

/** Get section definition by ID */
export function getSection(sectionId: string): SectionDefinition | undefined {
  return SECTION_REGISTRY.find(s => s.sectionId === sectionId);
}

/** Get all sections sorted by priority (ascending) */
export function getSectionsByPriority(): SectionDefinition[] {
  return [...SECTION_REGISTRY].sort((a, b) => a.priority - b.priority);
}

/** Get all sectionIds that a given section depends on */
export function getDependencies(sectionId: string): string[] {
  return getSection(sectionId)?.dependsOn ?? [];
}

/** Get the total estimated time for all generatable sections in ms */
export function getTotalEstimatedMs(): number {
  return GENERATABLE_SECTIONS.reduce((sum, s) => sum + s.estimatedMs, 0);
}

/** Map of unique tab groups for UI navigation */
export function getTabGroups(): { id: string; label: string; icon: string; sections: string[] }[] {
  const groups = new Map<string, { label: string; icon: string; sections: string[] }>();

  for (const section of SECTION_REGISTRY) {
    if (!groups.has(section.tabGroup)) {
      groups.set(section.tabGroup, {
        label: section.tabGroup.charAt(0).toUpperCase() + section.tabGroup.slice(1),
        icon: section.icon,
        sections: [],
      });
    }
    groups.get(section.tabGroup)!.sections.push(section.sectionId);
  }

  return Array.from(groups.entries()).map(([id, data]) => ({ id, ...data }));
}
