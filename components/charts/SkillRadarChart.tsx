'use client';

import React from 'react';

interface RadarDataPoint {
  skill: string;
  current: number;
  target: number;
}

interface SkillRadarChartProps {
  data: RadarDataPoint[];
  size?: number;
}

export function SkillRadarChart({ data, size = 380 }: SkillRadarChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-sm italic py-8 text-center">No skill data available</div>;
  }

  const center = size / 2;
  const radius = (size / 2) - 45;
  const numPoints = data.length;
  const angleStep = (Math.PI * 2) / numPoints;

  // Grid levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const currentPoints = data.map((d, i) => getCoordinates(d.current, i));
  const targetPoints = data.map((d, i) => getCoordinates(d.target, i));

  const currentPath = currentPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const targetPath = targetPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Background concentric polygons */}
        {levels.map((level) => {
          const polyPoints = data
            .map((_, i) => {
              const { x, y } = getCoordinates(level * 100, i);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={level}
              points={polyPoints}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={level < 1 ? '3 3' : 'none'}
            />
          );
        })}

        {/* Axis lines */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(100, i);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
        })}

        {/* Target Area (Blue outline) */}
        <path
          d={targetPath}
          fill="rgba(59, 130, 246, 0.08)"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Current Skill Area (Emerald green) */}
        <path
          d={currentPath}
          fill="rgba(16, 185, 129, 0.25)"
          stroke="#10b981"
          strokeWidth="2.5"
        />

        {/* Vertex dots */}
        {currentPoints.map((p, i) => (
          <circle key={`curr-dot-${i}`} cx={p.x} cy={p.y} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
        ))}

        {/* Labels */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(114, i);
          const isLeft = x < center - 10;
          const isRight = x > center + 10;
          const textAnchor = isLeft ? 'end' : isRight ? 'start' : 'middle';

          return (
            <text
              key={`label-${i}`}
              x={x}
              y={y + 4}
              textAnchor={textAnchor}
              className="text-[11px] font-medium fill-slate-700"
            >
              {d.skill}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500/30 border border-emerald-500 inline-block" />
          <span>Current Verified Skill</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-blue-500/10 border border-blue-500 border-dashed inline-block" />
          <span>Target Career Requirement</span>
        </div>
      </div>
    </div>
  );
}
