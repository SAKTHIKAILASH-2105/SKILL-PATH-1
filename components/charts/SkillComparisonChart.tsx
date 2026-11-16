'use client';

import React from 'react';

interface SkillComparisonItem {
  skill: string;
  before: number;
  after: number;
  proficiency: string;
}

interface SkillComparisonChartProps {
  data: SkillComparisonItem[];
}

export function SkillComparisonChart({ data }: SkillComparisonChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-xs italic py-4">No skill progress comparison available</div>;
  }

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const gain = Math.max(0, item.after - item.before);

        return (
          <div key={item.skill} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-slate-800">{item.skill}</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {item.proficiency}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium">Growth: </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  +{gain}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              {/* Baseline (Before) */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="w-14">Initial:</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${item.before}%` }} />
                </div>
                <span className="w-8 text-right font-mono">{item.before}%</span>
              </div>

              {/* Current (After) */}
              <div className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                <span className="w-14 text-emerald-700 font-semibold">Current:</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.after}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono font-bold text-emerald-700">{item.after}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
