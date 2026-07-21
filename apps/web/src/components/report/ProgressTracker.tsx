import React from 'react';
import { SectionStatus } from '@/types/report.types';
import { getSectionsByPriority } from '@/lib/section-registry-client';

interface ProgressTrackerProps {
  sections: Record<string, { status: SectionStatus; error?: string }>;
  completedCount: number;
  totalCount: number;
  overallStatus: 'DISCONNECTED' | 'CONNECTING' | 'PROCESSING' | 'DONE' | 'FAILED';
  onRetry: (sectionId: string) => void;
}

export function ProgressTracker({
  sections,
  completedCount,
  totalCount,
  overallStatus,
  onRetry
}: ProgressTrackerProps) {
  const percent = Math.min(100, Math.max(0, Math.round((completedCount / totalCount) * 100)));
  const allSections = getSectionsByPriority();
  
  return (
    <div className="bg-surface-container-lowest border-b border-outline-variant/15 sticky top-[80px] z-20 overflow-hidden">
      {/* Thin Progress Bar */}
      <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-1000 ease-in-out" style={{ width: `${percent}%` }} />
      
      <div className="px-10 py-3 max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 flex-shrink-0 border-r border-outline-variant/20 pr-6">
          {overallStatus === 'DONE' ? (
            <span className="material-symbols-outlined text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          ) : overallStatus === 'FAILED' ? (
            <span className="material-symbols-outlined text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          ) : (
            <span className="material-symbols-outlined text-emerald-500 animate-spin">progress_activity</span>
          )}
          <div>
            <div className="font-headline text-sm font-bold text-on-surface">
              {overallStatus === 'DONE' ? 'Report Complete' : `Generating Report`}
            </div>
            <div className="font-body text-xs text-on-surface-variant">
              {completedCount} of {totalCount} sections complete
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {allSections.map(sec => {
            const state = sections[sec.sectionId];
            const isCompleted = state?.status === 'completed';
            const isFailed = state?.status === 'failed';
            const isProcessing = state?.status === 'processing';
            
            return (
              <div 
                key={sec.sectionId}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                  isCompleted 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : isFailed 
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : isProcessing
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-surface-container border-transparent text-on-surface-variant'
                }`}
                title={isFailed && state.error ? state.error : sec.displayName}
              >
                {isCompleted && <span className="material-symbols-outlined text-[14px]">check</span>}
                {isProcessing && <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>}
                {isFailed && (
                  <button onClick={() => onRetry(sec.sectionId)} className="hover:text-rose-900" title="Retry section">
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                  </button>
                )}
                {!isCompleted && !isProcessing && !isFailed && <span className="material-symbols-outlined text-[14px]">schedule</span>}
                <span className="font-headline text-xs font-semibold">{sec.displayName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
