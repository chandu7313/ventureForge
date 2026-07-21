import React from 'react';

interface SectionSkeletonProps {
  type?: 'cards' | 'text' | 'table' | 'chart';
}

export function SectionSkeleton({ type = 'text' }: SectionSkeletonProps) {
  const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent`;
  
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className={`bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 ${shimmer}`}>
            <div className="h-4 w-1/2 bg-surface-container-high rounded mb-4"></div>
            <div className="h-8 w-3/4 bg-surface-container-high rounded mb-2"></div>
            <div className="h-3 w-1/3 bg-surface-container-high rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (type === 'chart') {
    return (
      <div className={`bg-surface-container-low w-full h-[300px] rounded-xl border border-outline-variant/10 flex items-end p-6 gap-4 ${shimmer}`}>
        {[40, 70, 45, 90, 65, 80, 100, 60].map((h, i) => (
          <div key={i} className="flex-1 bg-surface-container-high rounded-t-sm" style={{ height: `${h}%` }}></div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`w-full border border-outline-variant/10 rounded-xl overflow-hidden ${shimmer}`}>
        <div className="h-12 bg-surface-container-low border-b border-outline-variant/10"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex h-12 items-center px-4 gap-4 border-b border-outline-variant/5 last:border-0">
            <div className="h-4 w-1/4 bg-surface-container-low rounded"></div>
            <div className="h-4 w-1/4 bg-surface-container-low rounded ml-auto"></div>
            <div className="h-4 w-1/4 bg-surface-container-low rounded ml-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  // Default text block
  return (
    <div className={`space-y-4 ${shimmer}`}>
      <div className="h-6 w-1/3 bg-surface-container-low rounded"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-surface-container-low rounded"></div>
        <div className="h-4 w-full bg-surface-container-low rounded"></div>
        <div className="h-4 w-5/6 bg-surface-container-low rounded"></div>
        <div className="h-4 w-4/6 bg-surface-container-low rounded"></div>
      </div>
      <br />
      <div className="h-6 w-1/4 bg-surface-container-low rounded"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-surface-container-low rounded"></div>
        <div className="h-4 w-full bg-surface-container-low rounded"></div>
        <div className="h-4 w-3/4 bg-surface-container-low rounded"></div>
      </div>
    </div>
  );
}
