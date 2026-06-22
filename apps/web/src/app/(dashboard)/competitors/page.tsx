"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function CompetitorsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Direct' | 'Indirect'>('All');

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await apiClient('/api/v1/reports?limit=100');
        const doneReports = (res.data || []).filter((r: any) => r.status === 'DONE' || r.status === 'COMPLETED');
        setReports(doneReports);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const competitors = useMemo(() => {
    const map = new Map<string, any>();

    reports.forEach(report => {
      const comps = report.competitorData?.competitors || [];
      comps.forEach((c: any) => {
        // Deduplicate by lowercased name
        const key = c.name.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            ...c,
            sourceReportId: report.id,
            sourceIdeaName: report.idea?.name || 'Unknown Idea',
          });
        }
      });
    });

    return Array.from(map.values());
  }, [reports]);

  const filteredCompetitors = useMemo(() => {
    return competitors.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          (c.weakness || '').toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'All' || c.type === filterType;
      return matchSearch && matchType;
    });
  }, [competitors, search, filterType]);

  return (
    <div className="flex-1 ml-64 p-10 pl-16 flex flex-col gap-8 max-w-7xl min-h-screen">
      <header className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <span className="font-body text-sm font-medium text-on-surface-variant uppercase tracking-widest">
            Market Intelligence
          </span>
          <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">
            Saved Competitors
          </h1>
          <p className="text-on-surface-variant font-body max-w-2xl mt-2">
            An aggregated view of all market players identified across your validated startup ideas.
          </p>
        </div>
      </header>

      {/* Filters & Search */}
      <section className="bg-surface-container-lowest p-4 rounded-xl ambient-shadow flex gap-4 items-center border border-outline-variant/20">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text"
            placeholder="Search by name or weakness..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-lg border-0 focus:ring-2 focus:ring-primary text-on-surface text-sm"
          />
        </div>
        <div className="flex bg-surface-container rounded-lg p-1">
          {['All', 'Direct', 'Indirect'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${filterType === type ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="ml-auto text-sm font-bold text-on-surface-variant">
          {filteredCompetitors.length} Found
        </div>
      </section>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
        </div>
      ) : filteredCompetitors.length === 0 ? (
        <div className="bg-surface-container-low p-10 rounded-2xl text-center flex flex-col items-center justify-center border border-outline-variant/20">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">person_search</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">No competitors found</h3>
          <p className="text-on-surface-variant text-sm">Try adjusting your search or validate a new idea.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompetitors.map((c, i) => (
            <div key={i} className="bg-surface-container-lowest p-6 rounded-2xl ambient-shadow flex flex-col gap-4 border border-outline-variant/20 hover:border-primary/30 transition-colors group">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-headline font-bold text-on-surface">{c.name}</h3>
                <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded ${c.type === 'Direct' ? 'bg-error/10 text-error' : 'bg-[#3b82f6]/10 text-[#3b82f6]'}`}>
                  {c.type}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold">Funding Stage</p>
                  <p className="text-on-surface font-medium">{c.fundingStage}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold">Total Funding</p>
                  <p className="text-on-surface font-medium">{c.totalFunding}</p>
                </div>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Identified Weakness</p>
                <p className="text-sm text-on-surface line-clamp-3">{c.weakness || 'Unknown'}</p>
              </div>

              <div className="mt-auto pt-4 flex justify-between items-center border-t border-outline-variant/10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">Appeared in</span>
                  <Link href={`/report/${c.sourceReportId}`} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                    {c.sourceIdeaName}
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </Link>
                </div>
                <a 
                  href={`https://google.com/search?q=${encodeURIComponent(c.name + ' startup website')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-on-primary-container px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">language</span> Web
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
