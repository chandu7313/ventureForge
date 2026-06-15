import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../lib/utils";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  delta?: number;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, delta, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col gap-2",
          className
        )}
        {...props}
      >
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex items-center gap-4">
          <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
          {delta !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                delta >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}
            >
              {delta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{Math.abs(delta)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";
