import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export interface ScoreGaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const ScoreGauge = React.forwardRef<HTMLDivElement, ScoreGaugeProps>(
  ({ score, size = 120, strokeWidth = 10, className, ...props }, ref) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const dashoffset = circumference - (score / 100) * circumference;

    let colorClass = "stroke-red-500";
    if (score >= 80) colorClass = "stroke-green-500";
    else if (score >= 50) colorClass = "stroke-yellow-500";

    return (
      <div
        ref={ref}
        className={cn("relative flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-muted fill-none"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={cn("fill-none transition-all duration-1000", colorClass)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashoffset }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-2xl font-bold dark:text-white">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Math.round(score)}
          </motion.span>
        </div>
      </div>
    );
  }
);
ScoreGauge.displayName = "ScoreGauge";
