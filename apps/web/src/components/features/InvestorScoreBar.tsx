"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";

export interface ScoreDimension {
  name: string;
  score: number; // 0 to 10
}

export interface InvestorScoreBarProps {
  data: ScoreDimension[];
}

export const InvestorScoreBar: React.FC<InvestorScoreBarProps> = ({ data }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
          <XAxis type="number" domain={[0, 10]} stroke={isDark ? "#94a3b8" : "#64748b"} />
          <YAxis dataKey="name" type="category" width={120} stroke={isDark ? "#cbd5e1" : "#475569"} tick={{ fontSize: 13 }} />
          <Tooltip 
            cursor={{ fill: isDark ? "#1e293b" : "#f1f5f9" }}
            contentStyle={{ 
              backgroundColor: isDark ? "#0f172a" : "#ffffff", 
              borderColor: isDark ? "#1e293b" : "#e2e8f0",
              borderRadius: "8px",
              color: isDark ? "#f8fafc" : "#0f172a"
            }}
          />
          <Bar 
            dataKey="score" 
            fill={isDark ? "#818cf8" : "#4f46e5"} 
            radius={[0, 4, 4, 0]} 
            barSize={24}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
