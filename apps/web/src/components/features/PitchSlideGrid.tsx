"use client";

import * as React from "react";

export interface PitchSlide {
  title: string;
  content: string;
}

export interface PitchSlideGridProps {
  slides: PitchSlide[];
}

export const PitchSlideGrid: React.FC<PitchSlideGridProps> = ({ slides }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {slides.map((slide, idx) => (
        <div 
          key={idx} 
          className="aspect-video rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 flex flex-col items-center justify-center text-center transition-colors hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10"
        >
          <div className="mb-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Slide {idx + 1}
          </div>
          <h4 className="text-xl font-bold text-foreground mb-3">{slide.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {slide.content}
          </p>
        </div>
      ))}
    </div>
  );
};
