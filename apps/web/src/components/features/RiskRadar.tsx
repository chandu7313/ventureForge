"use client";

import * as React from "react";
import { ShieldAlert } from "lucide-react";
import { cn } from "@startupiq/ui";

export type RiskSeverity = "High" | "Medium" | "Low";

export interface Risk {
  category: string;
  description: string;
  severity: RiskSeverity;
  mitigation: string;
}

export interface RiskRadarProps {
  risks: Risk[];
}

export const RiskRadar: React.FC<RiskRadarProps> = ({ risks }) => {
  const severityColors = {
    High: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    Low: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium rounded-tl-lg">Category</th>
            <th className="px-4 py-3 font-medium">Risk Description</th>
            <th className="px-4 py-3 font-medium">Severity</th>
            <th className="px-4 py-3 font-medium rounded-tr-lg">Mitigation Strategy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {risks.map((risk, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
              <td className="px-4 py-4 font-medium text-foreground whitespace-nowrap">
                {risk.category}
              </td>
              <td className="px-4 py-4 text-muted-foreground">
                {risk.description}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", severityColors[risk.severity])}>
                  {risk.severity}
                </span>
              </td>
              <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                <div className="flex gap-2 items-start">
                  <ShieldAlert className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                  <span>{risk.mitigation}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
