"use client";

import React from "react";

interface ReportProgressBarProps {
  status: 'DISCONNECTED' | 'CONNECTING' | 'QUEUED' | 'PROCESSING' | 'DONE' | 'FAILED';
  percent: number;
  stage: string;
  message: string;
  position?: number;
  estimatedWait?: string;
  error?: string | null;
}

const getStageIcon = (stage: string) => {
  switch (stage) {
    case 'market_analysis': return 'language';
    case 'competitor_scout': return 'query_stats';
    case 'product_strategy': return 'architecture';
    case 'completed': return 'task_alt';
    default: return 'robot_2';
  }
};

export const ReportProgressBar: React.FC<ReportProgressBarProps> = ({
  status,
  percent,
  stage,
  message,
  position,
  estimatedWait,
  error
}) => {
  if (status === 'FAILED') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-surface px-4">
        <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-xl ambient-shadow text-center border border-error/20">
          <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Analysis Failed</h2>
          <p className="text-on-surface-variant text-sm mb-6">{error || message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-error text-on-error px-6 py-2 rounded-lg font-medium hover:bg-error/90 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  const isQueued = status === 'QUEUED';
  const displayPercent = isQueued ? 0 : percent;

  return (
    <div className="flex h-[calc(100vh-80px)] w-full flex-col items-center justify-center bg-surface px-4">
      <div className="max-w-lg w-full bg-surface-container-lowest p-10 rounded-2xl shadow-[0_8px_60px_-12px_rgba(27,27,29,0.08)] text-center relative overflow-hidden">
        
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary-container" />

        {/* Circular Progress & Icon */}
        <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
          <svg className="w-full h-full absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle 
              className="text-surface-container-high stroke-current" 
              cx="50" cy="50" fill="transparent" r="46" strokeWidth="6" 
            />
            <circle 
              className="text-secondary stroke-current transition-all duration-1000 ease-out" 
              cx="50" cy="50" fill="transparent" r="46" 
              strokeDasharray="289.02" 
              strokeDashoffset={289.02 - (289.02 * displayPercent) / 100} 
              strokeLinecap="round" strokeWidth="6" 
            />
          </svg>
          
          <div className="bg-surface-container rounded-full w-20 h-20 flex items-center justify-center z-10 shadow-inner">
             {isQueued ? (
               <span className="material-symbols-outlined animate-pulse text-4xl text-on-surface-variant">schedule</span>
             ) : (
               <span className="material-symbols-outlined animate-bounce text-4xl text-secondary">
                 {getStageIcon(stage)}
               </span>
             )}
          </div>
        </div>

        {/* Status Text */}
        <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-3 tracking-tight">
          {isQueued ? 'In Queue' : 'AI Analysis in Progress'}
        </h2>
        
        <div className="bg-surface-container py-3 px-6 rounded-xl inline-block mb-8">
          <p className="text-on-surface-variant font-medium text-sm animate-pulse">
            {message}
          </p>
        </div>

        {/* Queue Information */}
        {isQueued && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-bold">Position</p>
              <p className="text-2xl font-black text-on-surface">#{position || '--'}</p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-bold">Est. Wait</p>
              <p className="text-2xl font-black text-on-surface">{estimatedWait || '--'}</p>
            </div>
          </div>
        )}

        {/* Processing Percentage */}
        {!isQueued && (
          <div className="mt-4">
             <div className="flex justify-between items-center mb-2 px-1">
               <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Overall Progress</span>
               <span className="text-sm font-black text-secondary">{Math.round(displayPercent)}%</span>
             </div>
             <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-secondary to-primary-container transition-all duration-700 ease-out" 
                  style={{ width: `${displayPercent}%` }} 
                />
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
