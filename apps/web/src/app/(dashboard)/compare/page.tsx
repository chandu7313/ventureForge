"use client";

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { CompareReportsView } from '@/components/features/CompareReportsView';

export default function ComparePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [reportAId, setReportAId] = useState<string>('');
  const [reportBId, setReportBId] = useState<string>('');
  
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await apiClient('/api/v1/reports?limit=50');
        // Only show DONE reports for comparison
        const doneReports = (res.data || []).filter((r: any) => r.status === 'DONE' || r.status === 'COMPLETED');
        setReports(doneReports);
      } catch (err) {
        console.error("Failed to load reports:", err);
      }
    }
    fetchReports();
  }, []);

  const handleCompare = async () => {
    if (!reportAId || !reportBId) return;
    if (reportAId === reportBId) {
      setError("Please select two different reports to compare.");
      return;
    }

    setLoading(true);
    setError(null);
    setComparisonData(null);

    try {
      const data = await apiClient(`/api/v1/reports/compare?reportAId=${reportAId}&reportBId=${reportBId}`);
      setComparisonData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate comparison. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 ml-64 p-10 pl-16 flex flex-col gap-8 max-w-7xl min-h-screen">
      <header className="flex flex-col gap-2">
        <span className="font-body text-sm font-medium text-on-surface-variant uppercase tracking-widest">
          Analysis Engine
        </span>
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">
          Compare Ideas
        </h1>
        <p className="text-on-surface-variant font-body max-w-2xl mt-2">
          Select two validated startup ideas to generate a side-by-side comparative analysis. Our AI will evaluate both reports and recommend the strongest path forward.
        </p>
      </header>

      {/* Selectors */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl ambient-shadow flex gap-6 items-end border border-outline-variant/20">
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">
            Idea A
          </label>
          <select 
            className="w-full bg-surface-container p-3 rounded-lg border-0 focus:ring-2 focus:ring-primary text-on-surface"
            value={reportAId}
            onChange={(e) => setReportAId(e.target.value)}
          >
            <option value="">-- Select Report --</option>
            {reports.map(r => (
              <option key={r.id} value={r.id} disabled={r.id === reportBId}>
                {r.idea?.name || 'Unknown'} ({r.idea?.industry || 'Unknown'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-shrink-0 mb-3 font-bold text-on-surface-variant italic">VS</div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">
            Idea B
          </label>
          <select 
            className="w-full bg-surface-container p-3 rounded-lg border-0 focus:ring-2 focus:ring-[#3b82f6] text-on-surface"
            value={reportBId}
            onChange={(e) => setReportBId(e.target.value)}
          >
            <option value="">-- Select Report --</option>
            {reports.map(r => (
              <option key={r.id} value={r.id} disabled={r.id === reportAId}>
                {r.idea?.name || 'Unknown'} ({r.idea?.industry || 'Unknown'})
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleCompare}
          disabled={!reportAId || !reportBId || loading}
          className="bg-gradient-to-b from-primary to-primary-container text-on-primary px-8 py-3 rounded-lg font-bold hover:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 h-[48px]"
        >
          {loading ? (
            <><span className="material-symbols-outlined animate-spin text-[20px]">sync</span> Analyzing...</>
          ) : (
            <><span className="material-symbols-outlined text-[20px]">compare_arrows</span> Compare</>
          )}
        </button>
      </section>

      {error && (
        <div className="bg-error/10 text-error border border-error/20 p-4 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Results */}
      {comparisonData && !loading && (
        <CompareReportsView data={comparisonData} />
      )}

    </div>
  );
}
