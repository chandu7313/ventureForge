import { SectionDefinition } from '../types/report.types';

export const CLIENT_SECTION_REGISTRY: SectionDefinition[] = [
  { sectionId: 'executive_summary', displayName: 'Executive Summary', priority: 1, icon: 'summarize', tabGroup: 'overview' },
  { sectionId: 'business_score', displayName: 'Business Score', priority: 1, icon: 'speed', tabGroup: 'overview' },
  { sectionId: 'market_analysis', displayName: 'Market Analysis', priority: 2, icon: 'area_chart', tabGroup: 'market' },
  { sectionId: 'customer_personas', displayName: 'Customer Personas', priority: 2, icon: 'person', tabGroup: 'market' },
  { sectionId: 'competitors', displayName: 'Competitor Intelligence', priority: 3, icon: 'groups', tabGroup: 'competitors' },
  { sectionId: 'swot', displayName: 'SWOT Analysis', priority: 3, icon: 'grid_view', tabGroup: 'competitors' },
  { sectionId: 'product', displayName: 'Product & Services', priority: 4, icon: 'inventory_2', tabGroup: 'product' },
  { sectionId: 'risk_analysis', displayName: 'Risk Analysis', priority: 4, icon: 'warning', tabGroup: 'product' },
  { sectionId: 'pricing_strategy', displayName: 'Pricing Strategy', priority: 4, icon: 'sell', tabGroup: 'product' },
  { sectionId: 'gtm', displayName: 'Go-To-Market', priority: 4, icon: 'campaign', tabGroup: 'product' },
  { sectionId: 'marketing_strategy', displayName: 'Marketing Strategy', priority: 4, icon: 'ads_click', tabGroup: 'product' },
  { sectionId: 'financial', displayName: 'Financial Projections', priority: 5, icon: 'monitoring', tabGroup: 'financial' },
  { sectionId: 'formation', displayName: 'Business Formation', priority: 6, icon: 'gavel', tabGroup: 'formation' },
  { sectionId: 'bmc', displayName: 'Business Model Canvas', priority: 6, icon: 'dashboard_customize', tabGroup: 'formation' },
  { sectionId: 'lean_canvas', displayName: 'Lean Canvas', priority: 6, icon: 'view_kanban', tabGroup: 'formation' },
  { sectionId: 'compliance', displayName: 'Compliance & Licenses', priority: 6, icon: 'checklist', tabGroup: 'compliance' },
  { sectionId: 'tax_planning', displayName: 'Tax Planning', priority: 6, icon: 'receipt_long', tabGroup: 'compliance' },
  { sectionId: 'operations', displayName: 'Operations & SOPs', priority: 7, icon: 'settings', tabGroup: 'operations' },
  { sectionId: 'team_structure', displayName: 'Team Structure', priority: 7, icon: 'badge', tabGroup: 'operations' },
  { sectionId: 'infrastructure', displayName: 'Infrastructure Planning', priority: 7, icon: 'engineering', tabGroup: 'operations' },
  { sectionId: 'technology_stack', displayName: 'Technology Stack', priority: 7, icon: 'code', tabGroup: 'operations' },
  { sectionId: 'suppliers', displayName: 'Supplier Intelligence', priority: 7, icon: 'local_shipping', tabGroup: 'operations' },
  { sectionId: 'launch_checklist', displayName: 'Launch Checklist', priority: 7, icon: 'rocket_launch', tabGroup: 'operations' },
  { sectionId: 'funding', displayName: 'Funding Strategy', priority: 8, icon: 'savings', tabGroup: 'financial' },
  { sectionId: 'vc_synthesis', displayName: 'Investor & Pitch Deck', priority: 9, icon: 'slideshow', tabGroup: 'funding' },
  { sectionId: 'diagrams', displayName: 'Business Diagrams', priority: 10, icon: 'schema', tabGroup: 'overview' },
  { sectionId: 'charts', displayName: 'Financial Charts', priority: 10, icon: 'bar_chart', tabGroup: 'financial' },
  { sectionId: 'ai_recommendations', displayName: 'AI Recommendations', priority: 10, icon: 'auto_awesome', tabGroup: 'overview' },
];

export function getSectionsByPriority(): SectionDefinition[] {
  return [...CLIENT_SECTION_REGISTRY].sort((a, b) => a.priority - b.priority);
}

export function getTabGroups(): { id: string; label: string; icon: string; sections: string[] }[] {
  const groups = new Map<string, { label: string; icon: string; sections: string[] }>();

  for (const section of CLIENT_SECTION_REGISTRY) {
    if (!groups.has(section.tabGroup)) {
      groups.set(section.tabGroup, {
        label: section.tabGroup.charAt(0).toUpperCase() + section.tabGroup.slice(1),
        icon: section.icon,
        sections: [],
      });
    }
    groups.get(section.tabGroup)!.sections.push(section.sectionId);
  }

  // Ensure 'overview' is always first, then custom order
  const order = ['overview', 'market', 'competitors', 'product', 'financial', 'formation', 'compliance', 'operations', 'funding'];
  const result = Array.from(groups.entries()).map(([id, data]) => ({ id, ...data }));
  
  result.sort((a, b) => {
    const idxA = order.indexOf(a.id);
    const idxB = order.indexOf(b.id);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  return result;
}
