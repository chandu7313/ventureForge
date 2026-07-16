import { Injectable, Logger } from '@nestjs/common';
import { GeminiProvider } from '../providers/gemini.provider';
import { z } from 'zod';

/**
 * DiagramGeneratorService — Generates Mermaid and ReactFlow diagrams.
 *
 * Design decisions:
 * - Org charts, roadmaps, registration processes → DETERMINISTIC (built from structured data)
 * - Business workflows, customer journeys, ecosystems → GEMINI (creative generation)
 * - Mermaid syntax is used for linear/sequential diagrams
 * - ReactFlow JSON (nodes/edges) is used for interactive/spatial diagrams
 */

// ─── ReactFlow Types ─────────────────────────────────────────────

export interface ReactFlowNode {
  id: string;
  type?: string;
  data: { label: string; description?: string; color?: string; icon?: string };
  position: { x: number; y: number };
  style?: Record<string, string | number>;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, string | number>;
}

export interface ReactFlowData {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
}

// ─── Service ─────────────────────────────────────────────────────

@Injectable()
export class DiagramGeneratorService {
  private readonly logger = new Logger(DiagramGeneratorService.name);

  constructor(private readonly gemini: GeminiProvider) {}

  // ─── Mermaid Diagrams (Deterministic) ────────────────────────

  /**
   * Generate org chart from team plan data.
   * Deterministic — no LLM needed.
   */
  generateOrgChart(teamPlan: {
    hiringRoadmap: {
      year: number;
      roles: { title: string; salaryRange: string }[];
    }[];
  }): string {
    const lines: string[] = ['graph TD'];

    lines.push('  CEO["👤 CEO / Founder"]');

    const departments = new Map<string, string[]>();

    // Group roles into departments heuristically
    const allRoles = teamPlan.hiringRoadmap.flatMap((yr) => yr.roles);

    for (const role of allRoles) {
      const title = role.title.toLowerCase();
      let dept = 'Operations';
      if (title.includes('tech') || title.includes('engineer') || title.includes('developer') || title.includes('cto')) {
        dept = 'Technology';
      } else if (title.includes('market') || title.includes('sales') || title.includes('growth') || title.includes('cmo')) {
        dept = 'Marketing & Sales';
      } else if (title.includes('finance') || title.includes('account') || title.includes('cfo')) {
        dept = 'Finance';
      } else if (title.includes('hr') || title.includes('people') || title.includes('recruit')) {
        dept = 'HR & People';
      } else if (title.includes('product') || title.includes('design') || title.includes('cpo')) {
        dept = 'Product';
      } else if (title.includes('operations') || title.includes('coo') || title.includes('supply') || title.includes('logistics')) {
        dept = 'Operations';
      }

      if (!departments.has(dept)) departments.set(dept, []);
      departments.get(dept)!.push(role.title);
    }

    const deptIcons: Record<string, string> = {
      Technology: '💻',
      'Marketing & Sales': '📢',
      Finance: '💰',
      'HR & People': '👥',
      Product: '🎯',
      Operations: '⚙️',
    };

    let deptIdx = 0;
    for (const [dept, roles] of departments) {
      const deptId = `dept_${deptIdx}`;
      const icon = deptIcons[dept] || '📋';
      lines.push(`  ${deptId}["${icon} ${dept}"]`);
      lines.push(`  CEO --> ${deptId}`);

      roles.forEach((role, roleIdx) => {
        const roleId = `role_${deptIdx}_${roleIdx}`;
        lines.push(`  ${roleId}["${role}"]`);
        lines.push(`  ${deptId} --> ${roleId}`);
      });
      deptIdx++;
    }

    // Styling
    lines.push('  style CEO fill:#6366f1,stroke:#4f46e5,color:#fff,font-weight:bold');
    departments.forEach((_, dept) => {
      const idx = [...departments.keys()].indexOf(dept);
      lines.push(`  style dept_${idx} fill:#8b5cf6,stroke:#7c3aed,color:#fff`);
    });

    return lines.join('\n');
  }

  /**
   * Generate launch roadmap as Mermaid Gantt chart.
   * Deterministic — built from launch checklist data.
   */
  generateLaunchRoadmap(
    checklist: {
      step: number;
      task: string;
      category: string;
      estimatedDuration: string;
    }[],
  ): string {
    if (!checklist.length) return 'gantt\n  title Launch Roadmap\n  No tasks defined : 0, 1d';

    const lines: string[] = [
      'gantt',
      '  title Business Launch Roadmap',
      '  dateFormat YYYY-MM-DD',
      '  axisFormat %b %d',
    ];

    // Group by category
    const categories = new Map<string, typeof checklist>();
    for (const item of checklist) {
      const cat = item.category || 'General';
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat)!.push(item);
    }

    for (const [category, items] of categories) {
      lines.push(`  section ${category}`);
      for (const item of items) {
        // Parse duration string like "1 week", "2 days", "3 weeks"
        const durationMatch = item.estimatedDuration.match(/(\d+)\s*(day|week|month)/i);
        let days = 7; // default
        if (durationMatch) {
          const num = parseInt(durationMatch[1]);
          const unit = durationMatch[2].toLowerCase();
          days = unit === 'day' ? num : unit === 'week' ? num * 7 : num * 30;
        }
        const taskName = item.task.replace(/:/g, ' -');
        lines.push(`    ${taskName} : task_${item.step}, after task_${Math.max(1, item.step - 1)}, ${days}d`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate registration process as Mermaid sequence diagram.
   * Deterministic — built from compliance data.
   */
  generateRegistrationProcess(
    registrations: {
      name: string;
      authority: string;
      processingTime: string;
      priority: number;
    }[],
  ): string {
    if (!registrations.length) return 'sequenceDiagram\n  Note over Founder: No registrations required';

    const sorted = [...registrations].sort((a, b) => a.priority - b.priority);
    const lines: string[] = ['sequenceDiagram'];
    lines.push('  participant F as 👤 Founder');

    // Deduplicate authorities
    const authorities = [...new Set(sorted.map((r) => r.authority))];
    authorities.forEach((auth, idx) => {
      const shortAuth = auth.length > 20 ? auth.substring(0, 18) + '..' : auth;
      lines.push(`  participant A${idx} as 🏛️ ${shortAuth}`);
    });

    for (const reg of sorted) {
      const authIdx = authorities.indexOf(reg.authority);
      const regName = reg.name.length > 30 ? reg.name.substring(0, 28) + '..' : reg.name;
      lines.push(`  F->>A${authIdx}: Apply for ${regName}`);
      lines.push(`  A${authIdx}-->>F: ${reg.processingTime}`);
    }

    return lines.join('\n');
  }

  // ─── Mermaid Diagrams (Gemini-Generated) ─────────────────────

  /**
   * Generate business workflow diagram using Gemini.
   */
  async generateBusinessWorkflow(context: {
    ideaDescription: string;
    industry: string;
    businessType?: string;
  }): Promise<string> {
    const prompt = `Generate a Mermaid flowchart diagram showing the core business workflow for this business:

Industry: ${context.industry}
Business Type: ${context.businessType || 'product'}
Idea: ${context.ideaDescription}

Requirements:
- Use Mermaid "graph TD" (top-down) syntax
- Include 8-12 key steps in the business workflow
- Use descriptive node labels with emojis
- Include decision points (diamond shapes) where applicable
- Use appropriate arrow labels
- Do NOT include any markdown fences, just the raw Mermaid syntax

Return ONLY the Mermaid syntax, nothing else.`;

    const response = await this.gemini.generateText(prompt, { maxTokens: 1500, temperature: 0.5 });
    return response.data.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim();
  }

  /**
   * Generate customer journey map using Gemini.
   */
  async generateCustomerJourney(context: {
    ideaDescription: string;
    industry: string;
  }): Promise<string> {
    const prompt = `Generate a Mermaid journey diagram showing the customer journey for this business:

Industry: ${context.industry}
Idea: ${context.ideaDescription}

Requirements:
- Use Mermaid "journey" syntax
- Include 5-7 stages of the customer journey
- Rate each stage from 1-5 for customer satisfaction
- Include key touchpoints
- Return ONLY the raw Mermaid syntax, no markdown fences`;

    const response = await this.gemini.generateText(prompt, { maxTokens: 1000, temperature: 0.5 });
    return response.data.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim();
  }

  /**
   * Generate supply chain diagram using Gemini.
   */
  async generateSupplyChain(context: {
    ideaDescription: string;
    industry: string;
    suppliers?: { rawMaterials: { item: string; source: string }[] };
  }): Promise<string> {
    const supplierContext = context.suppliers?.rawMaterials
      ?.map((s) => `${s.item} from ${s.source}`)
      .join(', ') || 'to be determined';

    const prompt = `Generate a Mermaid flowchart showing the supply chain for this business:

Industry: ${context.industry}
Idea: ${context.ideaDescription}
Known suppliers/materials: ${supplierContext}

Requirements:
- Use Mermaid "graph LR" (left-right) syntax
- Include suppliers, manufacturing/processing, distribution, and end customer
- Use descriptive labels with emojis
- Show material/product flow with arrow labels
- Return ONLY the raw Mermaid syntax, no markdown fences`;

    const response = await this.gemini.generateText(prompt, { maxTokens: 1200, temperature: 0.5 });
    return response.data.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim();
  }

  // ─── ReactFlow Diagrams ──────────────────────────────────────

  /**
   * Generate business blueprint as ReactFlow interactive diagram.
   * Semi-deterministic — built from orchestrator output.
   */
  generateBusinessBlueprint(context: {
    ideaDescription: string;
    industry: string;
    businessType?: string;
    hasMarket: boolean;
    hasCompetitors: boolean;
    hasFinancial: boolean;
    hasOperations: boolean;
    hasCompliance: boolean;
  }): ReactFlowData {
    const nodes: ReactFlowNode[] = [];
    const edges: ReactFlowEdge[] = [];

    // Central node
    nodes.push({
      id: 'business',
      type: 'default',
      data: { label: '🏢 Business Core', description: context.ideaDescription, color: '#6366f1' },
      position: { x: 400, y: 300 },
      style: { background: '#6366f1', color: '#fff', borderRadius: '12px', padding: '16px', fontWeight: 'bold', border: 'none', width: 180 },
    });

    const surrounding = [
      { id: 'market', label: '📊 Market', description: 'TAM/SAM/SOM Analysis', color: '#10b981', x: 150, y: 50, enabled: context.hasMarket },
      { id: 'competitors', label: '🔍 Competitors', description: 'Competitive Landscape', color: '#f59e0b', x: 650, y: 50, enabled: context.hasCompetitors },
      { id: 'financial', label: '💰 Financial', description: 'Revenue & Projections', color: '#3b82f6', x: 150, y: 550, enabled: context.hasFinancial },
      { id: 'operations', label: '⚙️ Operations', description: 'Team & Infrastructure', color: '#8b5cf6', x: 650, y: 550, enabled: context.hasOperations },
      { id: 'compliance', label: '📋 Legal & Compliance', description: 'Registrations & Tax', color: '#ec4899', x: 50, y: 300, enabled: context.hasCompliance },
      { id: 'customers', label: '👥 Customers', description: 'Segments & Personas', color: '#14b8a6', x: 750, y: 300, enabled: true },
      { id: 'product', label: '🚀 Product/Service', description: 'MVP & Offering', color: '#f97316', x: 400, y: 50, enabled: true },
      { id: 'growth', label: '📈 Growth & GTM', description: 'Marketing & Sales', color: '#a855f7', x: 400, y: 550, enabled: true },
    ];

    for (const node of surrounding) {
      if (!node.enabled) continue;
      nodes.push({
        id: node.id,
        type: 'default',
        data: { label: node.label, description: node.description, color: node.color },
        position: { x: node.x, y: node.y },
        style: {
          background: node.color + '22',
          border: `2px solid ${node.color}`,
          borderRadius: '10px',
          padding: '12px',
          width: 160,
        },
      });
      edges.push({
        id: `e-business-${node.id}`,
        source: 'business',
        target: node.id,
        animated: true,
        style: { stroke: node.color },
      });
    }

    return { nodes, edges };
  }

  /**
   * Generate product lifecycle as ReactFlow diagram.
   * Deterministic — built from MVP phase data.
   */
  generateProductLifecycle(
    mvpPhases: { phase: number; title: string; duration: string; tasks: string[] }[],
  ): ReactFlowData {
    const nodes: ReactFlowNode[] = [];
    const edges: ReactFlowEdge[] = [];

    const phaseColors = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'];

    for (let i = 0; i < mvpPhases.length; i++) {
      const phase = mvpPhases[i];
      const color = phaseColors[i % phaseColors.length];

      nodes.push({
        id: `phase_${i}`,
        type: 'default',
        data: {
          label: `Phase ${phase.phase}: ${phase.title}`,
          description: `Duration: ${phase.duration}\nTasks: ${phase.tasks.length}`,
          color,
        },
        position: { x: i * 250, y: 150 },
        style: {
          background: color + '22',
          border: `2px solid ${color}`,
          borderRadius: '12px',
          padding: '14px',
          width: 200,
        },
      });

      if (i > 0) {
        edges.push({
          id: `e-phase-${i - 1}-${i}`,
          source: `phase_${i - 1}`,
          target: `phase_${i}`,
          label: '→',
          animated: true,
          style: { stroke: color },
        });
      }
    }

    return { nodes, edges };
  }

  /**
   * Generate business ecosystem using Gemini.
   */
  async generateBusinessEcosystem(context: {
    ideaDescription: string;
    industry: string;
  }): Promise<ReactFlowData> {
    const schema = z.object({
      nodes: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          description: z.string(),
          category: z.enum(['core', 'partner', 'customer', 'supplier', 'regulator', 'competitor']),
        }),
      ),
      edges: z.array(
        z.object({
          source: z.string(),
          target: z.string(),
          relationship: z.string(),
        }),
      ),
    });

    const prompt = `Generate a business ecosystem map for this business as JSON:

Industry: ${context.industry}
Idea: ${context.ideaDescription}

Return a JSON object with:
- "nodes": array of 8-12 entities. Each has: id, label (with emoji), description, category (one of: core, partner, customer, supplier, regulator, competitor)
- "edges": array of relationships between nodes. Each has: source (node id), target (node id), relationship (short label)

The ecosystem should show the complete business environment including partners, customers, suppliers, regulators, and competitors.`;

    const response = await this.gemini.generateStructuredJson(prompt, schema, { maxTokens: 2000 });

    const categoryColors: Record<string, string> = {
      core: '#6366f1',
      partner: '#10b981',
      customer: '#3b82f6',
      supplier: '#f59e0b',
      regulator: '#ef4444',
      competitor: '#8b5cf6',
    };

    // Arrange nodes in a circle
    const centerX = 400;
    const centerY = 300;
    const radius = 250;

    const nodes: ReactFlowNode[] = response.data.nodes.map((node, idx) => {
      const angle = (2 * Math.PI * idx) / response.data.nodes.length;
      const isCore = node.category === 'core';
      const color = categoryColors[node.category] || '#6366f1';

      return {
        id: node.id,
        type: 'default',
        data: { label: node.label, description: node.description, color },
        position: {
          x: isCore ? centerX : centerX + radius * Math.cos(angle),
          y: isCore ? centerY : centerY + radius * Math.sin(angle),
        },
        style: {
          background: isCore ? color : color + '22',
          color: isCore ? '#fff' : '#1a1a2e',
          border: `2px solid ${color}`,
          borderRadius: '12px',
          padding: '12px',
          fontWeight: isCore ? 'bold' : 'normal',
          width: isCore ? 180 : 150,
        },
      };
    });

    const edges: ReactFlowEdge[] = response.data.edges.map((edge, idx) => ({
      id: `e-${idx}`,
      source: edge.source,
      target: edge.target,
      label: edge.relationship,
      type: 'smoothstep',
      animated: true,
    }));

    return { nodes, edges };
  }
}
