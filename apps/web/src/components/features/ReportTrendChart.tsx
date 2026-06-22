"use client";

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subDays, format, isAfter, startOfDay } from 'date-fns';

interface ReportTrendChartProps {
  reports: any[];
}

export const ReportTrendChart: React.FC<ReportTrendChartProps> = ({ reports }) => {
  const data = useMemo(() => {
    // Generate an array of the last 30 days
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = startOfDay(subDays(new Date(), 29 - i));
      return {
        date: d,
        label: format(d, 'dd MMM'),
        count: 0
      };
    });

    const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));

    // Map reports to the correct day
    reports.forEach(r => {
      const reportDate = new Date(r.createdAt);
      if (isAfter(reportDate, thirtyDaysAgo)) {
        const formatted = format(reportDate, 'dd MMM');
        const day = days.find(d => d.label === formatted);
        if (day) day.count += 1;
      }
    });

    return days;
  }, [reports]);

  return (
    <div className="w-full h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
          <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} minTickGap={20} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
            formatter={(value: number) => [`${value} report${value === 1 ? '' : 's'}`, 'Generated']}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#22c55e" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
