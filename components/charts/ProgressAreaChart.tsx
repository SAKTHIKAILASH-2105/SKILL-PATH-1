'use client';

import React from 'react';

interface ActivityPoint {
  date: string;
  hours: number;
  activity: string;
}

interface ProgressAreaChartProps {
  data: ActivityPoint[];
  height?: number;
}

export function ProgressAreaChart({ data, height = 180 }: ProgressAreaChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-xs italic py-6 text-center">No study activity recorded yet</div>;
  }

  const sorted = [...data].slice(-7);
  const maxHours = Math.max(...sorted.map((d) => d.hours), 4);
  const width = 450;
  const paddingX = 40;
  const paddingY = 25;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  const points = sorted.map((d, i) => {
    const x = paddingX + (i / (sorted.length - 1 || 1)) * graphWidth;
    const y = paddingY + graphHeight - (d.hours / maxHours) * graphHeight;
    return { x, y, hours: d.hours, date: d.date };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingY + graphHeight} L ${points[0].x} ${paddingY + graphHeight} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((pct) => {
          const y = paddingY + graphHeight - pct * graphHeight;
          const val = (pct * maxHours).toFixed(1);
          return (
            <g key={pct}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={paddingX - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400">
                {val}h
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" className="transition-all duration-200 hover:r-6" />
            <text x={p.x} y={height - 6} textAnchor="middle" className="text-[10px] font-medium fill-slate-500">
              {p.date.split('-').slice(1).join('/')}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
