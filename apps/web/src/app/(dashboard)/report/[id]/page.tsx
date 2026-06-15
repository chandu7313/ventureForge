import * as React from "react";
import { ReportHeader } from "../../../components/features/ReportHeader";
import { ScoreGauge, SectionCard } from "@startupsaarthi/ui";
import { CompetitorCard } from "../../../components/features/CompetitorCard";
import { RiskRadar, type Risk } from "../../../components/features/RiskRadar";
import { MVPTimeline, type Phase } from "../../../components/features/MVPTimeline";
import { PitchSlideGrid } from "../../../components/features/PitchSlideGrid";
import { InvestorScoreBar } from "../../../components/features/InvestorScoreBar";
import { Activity, LayoutTemplate, Presentation, ShieldAlert, Target, Users } from "lucide-react";

// In a real app, this would be fetched from the database based on params.id
const mockReport = {
  name: "Acme AI Chat",
  industry: "B2B SaaS / Customer Support",
  date: new Date().toISOString(),
  strength: "Strong" as const,
  marketScore: 82,
  summary: "Acme AI Chat addresses a rapidly growing need for automated customer support in mid-market B2B companies. While the market is crowded, a specific focus on deep integrations could carve out a defensible niche.",
  competitors: [
    { name: "Intercom", type: "Direct" as const, weakness: "Enterprise-focused pricing structure", gapToExploit: "Target mid-market with flat-rate AI agent pricing" },
    { name: "Zendesk", type: "Indirect" as const, weakness: "Legacy UI and slow AI adoption", gapToExploit: "Emphasize modern, AI-first UX and speed of deployment" },
  ],
  risks: [
    { category: "Market", description: "High churn if AI hallucinates", severity: "High" as const, mitigation: "Implement strict human-in-the-loop fallback mechanisms" },
    { category: "Tech", description: "LLM API cost scaling", severity: "Medium" as const, mitigation: "Cache common responses, use smaller open-source models for triage" },
  ] as Risk[],
  timeline: [
    { title: "Core LLM Integration", duration: "Weeks 1-2", tasks: ["Setup RAG pipeline", "Connect to OpenAI API"] },
    { title: "Widget & Dashboard", duration: "Weeks 3-4", tasks: ["Build chat widget", "Build basic analytics view"] },
  ] as Phase[],
  slides: [
    { title: "The Problem", content: "Customer support costs scale linearly with growth. Humans cannot be available 24/7." },
    { title: "The Solution", content: "An AI agent that resolves 70% of L1 support tickets instantly." },
    { title: "Business Model", content: "B2B SaaS. $499/mo for up to 10,000 resolved tickets." },
  ],
  scores: [
    { name: "Market Size", score: 8 },
    { name: "Timing", score: 9 },
    { name: "Defensibility", score: 5 },
    { name: "Monetization", score: 8 },
  ]
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Report - ${mockReport.name} | StartupSaarthi`,
    // Open Graph dynamic image would go here:
    // openGraph: { images: [`/api/og?id=${params.id}`] }
  };
}

export default function ReportPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8 pb-16">
      <ReportHeader 
        name={mockReport.name} 
        industry={mockReport.industry} 
        date={mockReport.date} 
        strength={mockReport.strength} 
      />

      {/* Executive Summary & Score */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" /> Executive Summary
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {mockReport.summary}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Overall Market Score</h3>
          <ScoreGauge score={mockReport.marketScore} size={140} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <SectionCard title="Competitor Analysis" icon={Users}>
          <div className="grid gap-4">
            {mockReport.competitors.map((comp, idx) => (
              <CompetitorCard key={idx} {...comp} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Investor Viewpoint" icon={Target}>
          <p className="text-sm text-muted-foreground mb-2">How a pre-seed investor evaluates this idea:</p>
          <InvestorScoreBar data={mockReport.scores} />
        </SectionCard>
      </div>

      <SectionCard title="Risk Radar" icon={ShieldAlert}>
        <RiskRadar risks={mockReport.risks} />
      </SectionCard>

      <div className="grid md:grid-cols-2 gap-6">
        <SectionCard title="MVP Build Timeline" icon={LayoutTemplate}>
          <MVPTimeline phases={mockReport.timeline} />
        </SectionCard>

        <SectionCard title="Generated Pitch Deck" icon={Presentation} className="md:col-span-1">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Key talking points for your investor meetings.</p>
            <PitchSlideGrid slides={mockReport.slides} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
