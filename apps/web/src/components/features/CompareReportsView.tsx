"use client";

import React from 'react';
import { RadarCompare } from './RadarCompare';

interface CompareReportsViewProps {
  data: {
    reportA: any;
    reportB: any;
    winners: Record<string, string>;
    deltas: Record<string, number>;
    recommendation: string;
    summary: string;
  };
}

export const CompareReportsView: React.FC<CompareReportsViewProps> = ({ data }) => {
  const { reportA, reportB, winners, recommendation, summary } = data;

  const getWinnerIcon = (dim: string, side: 'A' | 'B') => {
    if (winners[dim] === side) {
      return <span className="material-symbols-outlined text-yellow-500 text-lg ml-2" title="Winner">workspace_premium</span>;
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Top Row: Idea Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-8">
        <div className={`p-8 rounded-2xl ambient-shadow border-t-4 ${winners.investorScore === 'A' ? 'border-secondary bg-surface-container-low' : 'border-outline-variant/30 bg-surface-container-lowest'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Idea A</span>
            {winners.investorScore === 'A' && (
              <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">workspace_premium</span> Recommended
              </span>
            )}
          </div>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-2">{reportA.idea?.name}</h2>
          <p className="text-on-surface-variant font-body mb-6 line-clamp-3">{reportA.idea?.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-surface-container rounded-md text-xs font-medium text-on-surface-variant">{reportA.idea?.industry}</span>
            <span className="px-3 py-1 bg-surface-container rounded-md text-xs font-medium text-on-surface-variant">{reportA.idea?.stage}</span>
          </div>
        </div>

        <div className={`p-8 rounded-2xl ambient-shadow border-t-4 ${winners.investorScore === 'B' ? 'border-secondary bg-surface-container-low' : 'border-outline-variant/30 bg-surface-container-lowest'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className="bg-[#3b82f6]/20 text-[#3b82f6] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Idea B</span>
            {winners.investorScore === 'B' && (
              <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">workspace_premium</span> Recommended
              </span>
            )}
          </div>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-2">{reportB.idea?.name}</h2>
          <p className="text-on-surface-variant font-body mb-6 line-clamp-3">{reportB.idea?.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-surface-container rounded-md text-xs font-medium text-on-surface-variant">{reportB.idea?.industry}</span>
            <span className="px-3 py-1 bg-surface-container rounded-md text-xs font-medium text-on-surface-variant">{reportB.idea?.stage}</span>
          </div>
        </div>
      </div>

      {/* ── AI Recommendation Card ─────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 rounded-2xl ambient-shadow border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-10 blur-[100px] rounded-full" />
        <div className="flex items-start gap-4 relative z-10">
          <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-white mb-1">AI Verdict: {summary}</h3>
            <p className="text-slate-300 font-body text-base leading-relaxed">{recommendation}</p>
          </div>
        </div>
      </div>

      {/* ── Middle Row: Radar & Score Table ────────────────────────────── */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-5 bg-surface-container-lowest rounded-2xl p-6 ambient-shadow flex flex-col justify-center">
          <h3 className="font-headline font-bold text-lg text-on-surface mb-4">Dimensional Analysis</h3>
          <RadarCompare reportA={reportA} reportB={reportB} />
        </div>

        <div className="col-span-7 bg-surface-container-lowest rounded-2xl p-6 ambient-shadow overflow-hidden">
          <h3 className="font-headline font-bold text-lg text-on-surface mb-6">Score Breakdown</h3>
          <div className="flex flex-col gap-4">
            {[
              { key: 'investorScore', label: 'Investor Readiness (100)' },
              { key: 'ideaScore', label: 'Idea Strength (100)' },
              { key: 'marketScore', label: 'Market Potential (100)' },
              { key: 'moatScore', label: 'Defensibility / Moat (100)' },
              { key: 'riskScore', label: 'Risk Profile (Lower is better)' }
            ].map(row => (
              <div key={row.key} className="grid grid-cols-3 items-center p-3 rounded-lg hover:bg-surface-container transition-colors border border-outline-variant/10">
                <div className="font-body text-sm font-medium text-on-surface-variant">{row.label}</div>
                <div className="text-center font-bold text-lg flex items-center justify-center">
                  <span className="text-primary">{reportA[row.key] ?? 'N/A'}</span>
                  {getWinnerIcon(row.key, 'A')}
                </div>
                <div className="text-center font-bold text-lg flex items-center justify-center">
                  <span className="text-[#3b82f6]">{reportB[row.key] ?? 'N/A'}</span>
                  {getWinnerIcon(row.key, 'B')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Qualitative Comparison ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-8">
        {/* Market & Competitors */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-4 border-b border-outline-variant/20 pb-2">Market Dynamics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-primary mb-1 block">IDEA A</span>
                <p className="text-sm text-on-surface-variant line-clamp-4">{reportA.marketData?.analysis || 'No data'}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-[#3b82f6] mb-1 block">IDEA B</span>
                <p className="text-sm text-on-surface-variant line-clamp-4">{reportB.marketData?.analysis || 'No data'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Risks & Monetization */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-4 border-b border-outline-variant/20 pb-2">Risks & Threats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-primary mb-1 block">IDEA A</span>
                <ul className="text-sm text-on-surface-variant space-y-1 list-disc pl-4">
                  {reportA.riskData?.slice(0, 3).map((r: any, i: number) => <li key={i} className="truncate">{r.category}</li>) || <li>No data</li>}
                </ul>
              </div>
              <div>
                <span className="text-xs font-bold text-[#3b82f6] mb-1 block">IDEA B</span>
                <ul className="text-sm text-on-surface-variant space-y-1 list-disc pl-4">
                  {reportB.riskData?.slice(0, 3).map((r: any, i: number) => <li key={i} className="truncate">{r.category}</li>) || <li>No data</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};
