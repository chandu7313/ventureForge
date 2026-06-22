"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface IndustryDistChartProps {
  reports: any[];
}

export const IndustryDistChart: React.FC<IndustryDistChartProps> = ({ reports }) => {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => {
      const industry = r.idea?.industry || 'Unknown';
      counts[industry] = (counts[industry] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Max 8 industries
  }, [reports]);

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          layout="vertical" 
          data={data} 
          margin={{ top: 0, right: 20, left: -20, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            width={120}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
            formatter={(value: number) => [`${value} report${value === 1 ? '' : 's'}`, 'Count']}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#22c55e" fillOpacity={0.8 + (index * -0.05)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
