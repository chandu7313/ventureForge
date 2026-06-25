"use client";

import * as React from "react";
import Link from "next/link";
import { useReportSocket } from "@/hooks/useReportSocket";
import { apiClient } from "@/lib/api-client";
import { ReportProgressBar } from "@/components/features/ReportProgressBar";
import { DownloadReportBtn } from "@/components/features/DownloadReportBtn";
import { ShareReportBtn } from "@/components/features/ShareReportBtn";
import { NameGeneratorWidget } from "@/components/features/NameGeneratorWidget";
import { MermaidDiagram } from "@/components/report/visualizations/MermaidDiagram";
import { FinancialChart } from "@/components/report/visualizations/FinancialChart";
import { BlueprintCanvas } from "@/components/report/visualizations/BlueprintCanvas";

const businessDNATabs = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "market", label: "Market Analysis", icon: "area_chart" },
  { id: "competitors", label: "Competitors", icon: "groups" },
  { id: "formation", label: "Business Formation", icon: "gavel" },
  { id: "compliance", label: "Compliance & Tax", icon: "checklist" },
  { id: "team", label: "Team & HR", icon: "badge" },
  { id: "infrastructure", label: "Infrastructure", icon: "engineering" },
  { id: "technology", label: "Technology", icon: "code" },
  { id: "financial", label: "Financials", icon: "monitoring" },
  { id: "funding", label: "Funding", icon: "savings" },
  { id: "gtm", label: "Go-To-Market", icon: "campaign" },
  { id: "operations", label: "Operations & SOPs", icon: "description" },
  { id: "pitch", label: "Pitch Deck", icon: "slideshow" },
  { id: "launch", label: "Launch Checklist", icon: "rocket_launch" },
];

export default function ReportPage({ params }: { params: { id: string } }) {
  const [report, setReport] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("overview");
  const { status, percent, stage, message, position, estimatedWait, error } = useReportSocket(params.id);

  React.useEffect(() => {
    async function loadReport() {
      try {
        const data = await apiClient(`/api/v1/reports/${params.id}`);
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [params.id, percent]);

  const isFinished = status === 'DONE' || report?.status === "DONE";
  
  if (loading || (!isFinished && status !== 'DISCONNECTED')) {
    return (
      <ReportProgressBar 
        status={status}
        percent={percent}
        stage={stage}
        message={message}
        position={position}
        estimatedWait={estimatedWait}
        error={error}
      />
    );
  }

  const ideaName = report?.idea?.name || "Startup Idea";
  const industry = report?.idea?.industry || "Tech";
  const ideaStage = report?.idea?.stage || "Idea";

  // Extract data from report
  const marketData = report?.marketData;
  const competitorData = report?.competitorData;
  const businessFormationData = report?.businessFormationData;
  const complianceData = report?.complianceData;
  const financialData = report?.financialData;
  const operationsData = report?.sopData || report?.operationsData;
  const teamData = report?.teamData;
  const technologyData = report?.technologyData;
  const fundingData = report?.fundingData;
  const gtmData = report?.gtmData;
  const pitchData = report?.pitchDeckData || report?.pitchData;
  const launchData = report?.launchChecklistData;
  const infrastructureData = report?.infrastructureData;
  
  // Visualizations
  const diagramData = report?.diagramData;
  const chartData = report?.chartData;

  const scores = [
    { label: "Market Potential", score: report?.marketScore || 0, color: "text-emerald-500" },
    { label: "Revenue Feasibility", score: report?.revenueScore || 0, color: "text-blue-500" },
    { label: "Competitive Advantage", score: report?.moatScore || 0, color: "text-violet-500" },
    { label: "Investor Attractiveness", score: report?.investorScore || 0, color: "text-amber-500" },
    { label: "Risk Score", score: report?.riskScore || 0, color: "text-rose-500" },
    { label: "Overall", score: report?.overallScore || report?.ideaScore || 0, color: "text-teal-500" },
  ];

  return (
    <div className="bg-surface text-on-surface flex min-h-screen font-body">
      {/* ── SideNavBar ───────────────────────────────────────── */}
      <nav className="bg-[#0f1729] font-headline text-sm font-medium tracking-wide h-screen w-64 fixed left-0 top-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.15)] flex-col p-6 space-y-6 hidden md:flex">
        <div className="flex flex-col mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            </div>
            <div className="text-lg font-black text-white tracking-tight">VentureForge <span className="text-emerald-400 font-medium text-xs">AI</span></div>
          </div>
          <div className="text-slate-500 text-xs ml-9">Business Operating System</div>
        </div>
        <Link href="/validate/new" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg py-3 px-4 font-bold hover:from-emerald-500 hover:to-teal-500 transition-all w-full flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20">
          <span className="material-symbols-outlined text-lg">add</span>
          New Business DNA
        </Link>
        <div className="flex-grow flex flex-col space-y-1 mt-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 px-4 py-2.5 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">dashboard</span>Dashboard
          </Link>
          <Link href="/validate/new" className="text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 px-4 py-2.5 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">edit_note</span>New Report
          </Link>
          <Link href="#" className="bg-white/10 text-white rounded-lg font-bold px-4 py-2.5 flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">analytics</span>Reports
          </Link>
          <Link href="/billing" className="text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 px-4 py-2.5 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">payments</span>Billing
          </Link>
          <Link href="/settings" className="text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 px-4 py-2.5 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">settings</span>Settings
          </Link>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 relative min-h-screen bg-surface">
        {/* Header */}
        <header className="sticky top-0 z-30 px-10 py-5 flex justify-between items-center border-b border-outline-variant/15 bg-surface-container-lowest/85 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h1 className="font-headline text-2xl font-extrabold text-on-surface tracking-tight">{ideaName}</h1>
            <span className="bg-surface-container text-on-surface-variant font-label text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">{industry}</span>
            <span className="bg-emerald-100 text-emerald-700 font-label text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">{ideaStage}</span>
          </div>
          <div className="flex items-center gap-3">
            <ShareReportBtn reportId={params.id} initialToken={report?.shareToken} />
            <DownloadReportBtn reportId={params.id} />
          </div>
        </header>

        <div className="px-10 py-8 max-w-7xl mx-auto space-y-8">
          {/* ── AI Startup Score™ ─────────────────────────────── */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {scores.map((s) => (
              <div key={s.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 text-center">
                <div className={`font-label text-3xl font-bold ${s.color}`}>{s.score}<span className="text-lg text-outline">/100</span></div>
                <span className="font-headline text-xs font-semibold text-on-surface-variant mt-1 block">{s.label}</span>
              </div>
            ))}
          </section>

          {/* ── Business DNA Tab Navigation ─────────────────── */}
          <div className="flex items-center gap-1 border-b border-outline-variant/15 overflow-x-auto pb-0">
            {businessDNATabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 font-headline text-sm whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "font-bold text-emerald-700 border-emerald-600"
                    : "font-medium text-on-surface-variant hover:text-on-surface border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab Content ─────────────────────────────────── */}
          <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 min-h-[400px]">
            
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-emerald-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <h2 className="font-headline text-2xl font-bold text-on-surface">Business DNA Report — {ideaName}</h2>
                </div>
                
                {diagramData?.reactflow?.businessBlueprint && (
                  <div className="mb-8">
                    <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Business Blueprint (Interactive)</h3>
                    <BlueprintCanvas nodes={diagramData.reactflow.businessBlueprint.nodes} edges={diagramData.reactflow.businessBlueprint.edges} />
                  </div>
                )}
                
                {diagramData?.mermaid?.businessWorkflow && (
                  <div className="mb-8">
                    <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Core Workflow</h3>
                    <MermaidDiagram chart={diagramData.mermaid.businessWorkflow} id={`workflow-${params.id}`} />
                  </div>
                )}
                <p className="font-body text-lg text-on-surface-variant leading-relaxed">
                  {report?.data?.vcScore?.summary || marketData?.analysis || report?.idea?.problem || "Your comprehensive Business DNA report is ready. Navigate through the tabs to explore all 14 dimensions."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-outline-variant/15">
                  <div>
                    <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1">Verdict</p>
                    <p className={`font-label text-2xl font-bold ${report?.verdict === 'FUND' ? 'text-emerald-600' : report?.verdict === 'PASS' ? 'text-rose-600' : 'text-amber-600'}`}>{report?.verdict || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1">Overall Score</p>
                    <p className="font-label text-2xl font-bold text-on-surface">{report?.overallScore || report?.ideaScore || 'N/A'}<span className="text-lg text-outline">/100</span></p>
                  </div>
                  <div>
                    <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1">Generation Time</p>
                    <p className="font-label text-2xl font-bold text-on-surface">{report?.generationTimeMs ? `${(report.generationTimeMs / 1000).toFixed(1)}s` : 'N/A'}</p>
                  </div>
                </div>
                <NameGeneratorWidget idea={report?.idea?.problem || ""} industry={report?.idea?.industry || ""} geography={report?.idea?.geography || ""} />
              </div>
            )}

            {/* Market Analysis Tab */}
            {activeTab === "market" && (
              <div className="space-y-8">
                <h2 className="font-headline text-2xl font-bold text-on-surface">📊 Market Analysis</h2>
                {marketData ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: "Total Addressable Market (TAM)", value: `₹${marketData.tam?.inrCr} Cr`, sub: `$${marketData.tam?.usdM}M · ${marketData.tam?.cagr}% CAGR` },
                        { label: "Serviceable Addressable Market (SAM)", value: `₹${marketData.sam?.inrCr} Cr`, sub: `$${marketData.sam?.usdM}M` },
                        { label: "Obtainable Market (SOM)", value: `₹${marketData.som?.inrCr} Cr`, sub: `$${marketData.som?.usdM}M` },
                      ].map((m) => (
                        <div key={m.label} className="bg-surface-container-low p-6 rounded-xl">
                          <h3 className="font-headline text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">{m.label}</h3>
                          <div className="font-label text-3xl font-bold text-on-surface mb-1">{m.value}</div>
                          <p className="font-body text-sm text-on-surface-variant">{m.sub}</p>
                        </div>
                      ))}
                    </div>
                    
                    {chartData?.marketSizeChart && (
                      <div className="mb-6">
                        <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Market Sizing Distribution</h3>
                        <FinancialChart option={chartData.marketSizeChart} />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Market Analysis</h3>
                      <p className="font-body text-on-surface-variant leading-relaxed">{marketData.analysis}</p>
                    </div>
                    <div>
                      <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Ideal Customer Profile</h3>
                      <p className="font-body text-on-surface-variant">{marketData.icp}</p>
                    </div>
                    {marketData.tailwinds?.length > 0 && (
                      <div>
                        <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Growth Tailwinds</h3>
                        <ul className="space-y-2">{marketData.tailwinds.map((t: string, i: number) => (
                          <li key={i} className="flex items-start gap-2"><span className="material-symbols-outlined text-emerald-500 text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span><span className="font-body text-sm text-on-surface-variant">{t}</span></li>
                        ))}</ul>
                      </div>
                    )}
                  </>
                ) : <p className="text-on-surface-variant">Market analysis data will appear here once the report is generated.</p>}
              </div>
            )}

            {/* Competitors Tab */}
            {activeTab === "competitors" && (
              <div className="space-y-8">
                <h2 className="font-headline text-2xl font-bold text-on-surface">🔍 Competitor Intelligence</h2>
                {competitorData?.competitors?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {competitorData.competitors.map((c: any, i: number) => (
                      <div key={i} className="bg-surface-container-low p-5 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-headline font-bold text-on-surface">{c.name}</h3>
                          <span className={`font-label text-xs px-2 py-0.5 rounded-full ${c.type === 'Direct' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>{c.type}</span>
                        </div>
                        <div className="space-y-1 font-body text-sm text-on-surface-variant">
                          <p><strong>HQ:</strong> {c.hq}</p>
                          <p><strong>Funding:</strong> {c.fundingStage} — {c.totalFunding}</p>
                          <p><strong>Pricing:</strong> {c.pricing}</p>
                          <p className="text-rose-600"><strong>Weakness:</strong> {c.weakness}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-on-surface-variant">Competitor data will appear here once the report is generated.</p>}
              </div>
            )}

            {/* Business Formation Tab */}
            {activeTab === "formation" && (
              <div className="space-y-8">
                <h2 className="font-headline text-2xl font-bold text-on-surface">🏛️ Business Formation Guide</h2>
                {businessFormationData ? (
                  <>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                      <h3 className="font-headline font-bold text-emerald-800 mb-2">✅ Recommended: {businessFormationData.recommendedStructure}</h3>
                      <p className="font-body text-sm text-emerald-700">{businessFormationData.structures?.find((s: any) => s.isRecommended)?.reasoning}</p>
                    </div>
                    {businessFormationData.structures?.map((s: any, i: number) => (
                      <div key={i} className={`bg-surface-container-low p-5 rounded-xl ${s.isRecommended ? 'ring-2 ring-emerald-500' : ''}`}>
                        <h3 className="font-headline font-bold text-on-surface mb-3">{s.type} {s.isRecommended && <span className="text-emerald-600 text-sm">— Recommended</span>}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Pros</p>
                            <ul className="space-y-1">{s.pros?.map((p: string, j: number) => <li key={j} className="flex items-start gap-1.5 text-sm text-emerald-700"><span className="text-emerald-500">✓</span>{p}</li>)}</ul>
                          </div>
                          <div>
                            <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Cons</p>
                            <ul className="space-y-1">{s.cons?.map((c: string, j: number) => <li key={j} className="flex items-start gap-1.5 text-sm text-rose-700"><span className="text-rose-500">✗</span>{c}</li>)}</ul>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-outline-variant/15">
                          <div><p className="font-label text-xs text-on-surface-variant">Registration Cost</p><p className="font-body text-sm font-semibold">{s.registrationCost}</p></div>
                          <div><p className="font-label text-xs text-on-surface-variant">Tax</p><p className="font-body text-sm font-semibold">{s.taxImplications}</p></div>
                          <div><p className="font-label text-xs text-on-surface-variant">Compliance</p><p className="font-body text-sm font-semibold">{s.complianceBurden}</p></div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : <p className="text-on-surface-variant">Business formation data will appear here once the report is generated.</p>}
              </div>
            )}

            {/* Compliance & Tax Tab */}
            {activeTab === "compliance" && (
              <div className="space-y-8">
                <h2 className="font-headline text-2xl font-bold text-on-surface">📋 Compliance & Registration Checklist</h2>
                {complianceData?.registrations?.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {complianceData.registrations.map((r: any, i: number) => (
                        <div key={i} className="bg-surface-container-low p-5 rounded-xl flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label text-sm font-bold flex-shrink-0 ${r.isMandatory ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>{r.priority}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-headline font-bold text-on-surface">{r.name}</h3>
                              {r.isMandatory && <span className="font-label text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">Mandatory</span>}
                            </div>
                            <p className="font-body text-sm text-on-surface-variant mb-2">{r.authority}</p>
                            <div className="flex gap-4 text-xs text-on-surface-variant">
                              <span>💰 {r.estimatedCost}</span>
                              <span>⏱️ {r.processingTime}</span>
                            </div>
                            {r.portalLink && <a href={r.portalLink} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline mt-1 block">Apply Online →</a>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {complianceData.taxStructure && (
                      <div>
                        <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Tax Structure</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-surface-container-low p-4 rounded-xl">
                            <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Income Tax</p>
                            <p className="font-body text-sm font-semibold">{complianceData.taxStructure.incomeTax?.rate}</p>
                          </div>
                          <div className="bg-surface-container-low p-4 rounded-xl">
                            <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">GST Rate</p>
                            <p className="font-body text-sm font-semibold">{complianceData.taxStructure.gst?.applicableRate}</p>
                          </div>
                          <div className="bg-surface-container-low p-4 rounded-xl">
                            <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">GST Threshold</p>
                            <p className="font-body text-sm font-semibold">{complianceData.taxStructure.gst?.threshold}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : <p className="text-on-surface-variant">Compliance data will appear here once the report is generated.</p>}
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === "financial" && (
              <div className="space-y-8">
                <h2 className="font-headline text-2xl font-bold text-on-surface">💰 Financial Projections</h2>
                {financialData ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-surface-container-low p-5 rounded-xl">
                        <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Startup Capital</p>
                        <p className="font-label text-2xl font-bold text-on-surface">{financialData.startupCapital?.totalSetupCost}</p>
                      </div>
                      <div className="bg-surface-container-low p-5 rounded-xl">
                        <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Monthly Burn Rate</p>
                        <p className="font-label text-2xl font-bold text-rose-600">{financialData.workingCapital?.monthlyBurnRate}</p>
                      </div>
                      <div className="bg-surface-container-low p-5 rounded-xl">
                        <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Break-even</p>
                        <p className="font-label text-2xl font-bold text-emerald-600">Month {financialData.breakEvenAnalysis?.timelineMonths}</p>
                      </div>
                    </div>
                    
                    {chartData?.revenueChart && (
                      <div className="mb-6">
                        <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Revenue Projection</h3>
                        <FinancialChart option={chartData.revenueChart} />
                      </div>
                    )}
                    
                    {chartData?.breakEvenChart && (
                      <div className="mb-6">
                        <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Break-Even Analysis</h3>
                        <FinancialChart option={chartData.breakEvenChart} />
                      </div>
                    )}
                    
                    {chartData?.cashFlowChart && (
                      <div className="mb-6">
                        <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Cumulative Cash Flow</h3>
                        <FinancialChart option={chartData.cashFlowChart} />
                      </div>
                    )}

                    <div>
                      <h3 className="font-headline text-lg font-bold text-on-surface mb-4">3-Year Revenue Forecast</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="border-b border-outline-variant/15">
                            <th className="text-left py-3 font-headline text-on-surface-variant">Scenario</th>
                            <th className="text-right py-3 font-headline text-on-surface-variant">Year 1</th>
                            <th className="text-right py-3 font-headline text-on-surface-variant">Year 2</th>
                            <th className="text-right py-3 font-headline text-on-surface-variant">Year 3</th>
                          </tr></thead>
                          <tbody>
                            {['conservative', 'realistic', 'optimistic'].map((s) => (
                              <tr key={s} className="border-b border-outline-variant/10">
                                <td className="py-3 font-body capitalize font-semibold">{s}</td>
                                <td className="py-3 text-right font-body">{financialData.revenueProjections?.[s]?.year1}</td>
                                <td className="py-3 text-right font-body">{financialData.revenueProjections?.[s]?.year2}</td>
                                <td className="py-3 text-right font-body font-semibold">{financialData.revenueProjections?.[s]?.year3}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Unit Economics</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-surface-container-low p-4 rounded-xl text-center">
                          <p className="font-label text-xs text-on-surface-variant uppercase mb-1">CAC</p>
                          <p className="font-label text-xl font-bold">{financialData.unitEconomics?.cac}</p>
                        </div>
                        <div className="bg-surface-container-low p-4 rounded-xl text-center">
                          <p className="font-label text-xs text-on-surface-variant uppercase mb-1">LTV</p>
                          <p className="font-label text-xl font-bold">{financialData.unitEconomics?.ltv}</p>
                        </div>
                        <div className="bg-surface-container-low p-4 rounded-xl text-center">
                          <p className="font-label text-xs text-on-surface-variant uppercase mb-1">LTV:CAC</p>
                          <p className="font-label text-xl font-bold text-emerald-600">{financialData.unitEconomics?.ltvCacRatio}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : <p className="text-on-surface-variant">Financial projections will appear here once the report is generated.</p>}
              </div>
            )}

            {/* Operations & SOPs Tab */}
            {activeTab === "operations" && (
              <div className="space-y-8">
                <h2 className="font-headline text-2xl font-bold text-on-surface">⚙️ Operations & SOPs</h2>
                
                {diagramData?.mermaid?.orgChart && (
                  <div className="mb-8">
                    <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Organizational Structure</h3>
                    <MermaidDiagram chart={diagramData.mermaid.orgChart} id={`orgchart-${params.id}`} />
                  </div>
                )}
                
                {diagramData?.mermaid?.supplyChain && (
                  <div className="mb-8">
                    <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Supply Chain Flow</h3>
                    <MermaidDiagram chart={diagramData.mermaid.supplyChain} id={`supply-${params.id}`} />
                  </div>
                )}
                {operationsData?.sops?.length > 0 ? (
                  <div className="space-y-4">
                    {operationsData.sops.map((sop: any, i: number) => (
                      <details key={i} className="bg-surface-container-low rounded-xl overflow-hidden">
                        <summary className="p-5 cursor-pointer font-headline font-bold text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                          <span className="flex items-center gap-3">
                            <span className="bg-emerald-100 text-emerald-700 font-label text-xs px-2 py-0.5 rounded-full">{sop.category}</span>
                            {sop.title}
                          </span>
                          <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
                        </summary>
                        <div className="px-5 pb-5 space-y-2">
                          <p className="font-body text-sm text-on-surface-variant mb-3"><strong>Objective:</strong> {sop.objective}</p>
                          {sop.steps?.map((step: any) => (
                            <div key={step.stepNumber} className="flex items-start gap-3 py-2 border-b border-outline-variant/10 last:border-0">
                              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{step.stepNumber}</span>
                              <div>
                                <p className="font-body text-sm text-on-surface">{step.action}</p>
                                <p className="font-body text-xs text-on-surface-variant">Responsible: {step.responsible}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                ) : <p className="text-on-surface-variant">SOPs will appear here once the report is generated.</p>}
              </div>
            )}

            {/* Launch Checklist Tab */}
            {activeTab === "launch" && (
              <div className="space-y-8">
                <h2 className="font-headline text-2xl font-bold text-on-surface">🚀 Launch Checklist</h2>
                
                {diagramData?.mermaid?.launchRoadmap && (
                  <div className="mb-8">
                    <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Launch Timeline</h3>
                    <MermaidDiagram chart={diagramData.mermaid.launchRoadmap} id={`launch-${params.id}`} />
                  </div>
                )}
                {(launchData || operationsData?.launchChecklist)?.length > 0 ? (
                  <div className="space-y-3">
                    {(launchData || operationsData.launchChecklist).map((item: any) => (
                      <div key={item.step} className="bg-surface-container-low p-5 rounded-xl flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-label text-sm font-bold flex-shrink-0">{item.step}</div>
                        <div className="flex-1">
                          <h3 className="font-headline font-bold text-on-surface">{item.task}</h3>
                          <div className="flex gap-4 mt-1 text-xs text-on-surface-variant">
                            <span className="bg-surface-container px-2 py-0.5 rounded">{item.category}</span>
                            <span>⏱️ {item.estimatedDuration}</span>
                            {item.dependencies?.length > 0 && <span>Depends on: Step {item.dependencies.join(', ')}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-on-surface-variant">Launch checklist will appear here once the report is generated.</p>}
              </div>
            )}

            {/* Generic fallback for other tabs */}
            {!["overview", "market", "competitors", "formation", "compliance", "financial", "operations", "launch"].includes(activeTab) && (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-4 block">construction</span>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-2">{businessDNATabs.find(t => t.id === activeTab)?.label}</h3>
                <p className="font-body text-on-surface-variant">This section&apos;s data is included in your Business DNA report. View the full data in the PDF export.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
