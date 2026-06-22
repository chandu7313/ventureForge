"use client";

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface RadarCompareProps {
  reportA: any;
  reportB: any;
}

export const RadarCompare: React.FC<RadarCompareProps> = ({ reportA, reportB }) => {
  const data = [
    {
      subject: 'Idea Strength',
      A: reportA.ideaScore || 0,
      B: reportB.ideaScore || 0,
      fullMark: 100,
    },
    {
      subject: 'Market Size',
      A: reportA.marketScore || 0,
      B: reportB.marketScore || 0,
      fullMark: 100,
    },
    {
      subject: 'Moat',
      A: reportA.moatScore || 0,
      B: reportB.moatScore || 0,
      fullMark: 100,
    },
    {
      subject: 'Execution Ease',
      A: 100 - (reportA.riskScore || 0), // Lower risk means higher execution ease
      B: 100 - (reportB.riskScore || 0),
      fullMark: 100,
    },
    {
      subject: 'Investor Readiness',
      A: reportA.investorScore || 0,
      B: reportB.investorScore || 0,
      fullMark: 100,
    },
  ];

  return (
    <div className="w-full h-full min-h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
          <Radar
            name={reportA.idea?.name || 'Idea A'}
            dataKey="A"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.3}
          />
          <Radar
            name={reportB.idea?.name || 'Idea B'}
            dataKey="B"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
