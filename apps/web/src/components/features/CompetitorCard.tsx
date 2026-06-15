"use client";

import * as React from "react";
import { AlertCircle, Target } from "lucide-react";

export interface CompetitorCardProps {
  name: string;
  type: "Direct" | "Indirect";
  weakness: string;
  gapToExploit: string;
}

export const CompetitorCard: React.FC<CompetitorCardProps> = ({ name, type, weakness, gapToExploit }) => {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-foreground">{name}</h4>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300">
          {type}
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="mt-0.5 text-red-500 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Key Weakness</p>
            <p className="text-sm text-muted-foreground">{weakness}</p>
          </div>
        </div>

        <div className="flex gap-3 bg-indigo-50/50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
          <div className="mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-1">Gap to Exploit</p>
            <p className="text-sm text-indigo-800/80 dark:text-indigo-400/80">{gapToExploit}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
