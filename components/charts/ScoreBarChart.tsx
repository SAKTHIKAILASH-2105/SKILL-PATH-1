'use client';

import React from 'react';

interface TopicScore {
  topic: string;
  total: number;
  correct: number;
  percentage: number;
}

interface ScoreBarChartProps {
  topics: Record<string, TopicScore>;
}

export function ScoreBarChart({ topics }: ScoreBarChartProps) {
  const entries = Object.entries(topics || {});

  if (entries.length === 0) {
    return <div className="text-gray-400 text-xs italic py-4">No topic performance data available</div>;
  }

  return (
    <div className="space-y-3.5">
      {entries.map(([topic, stats]) => {
        const isPassed = stats.percentage >= 75;
        const isRevision = stats.percentage >= 50 && stats.percentage < 75;
        const isWeak = stats.percentage < 50;

        return (
          <div key={topic} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{topic}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">
                  ({stats.correct}/{stats.total} correct)
                </span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    isPassed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isRevision
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {stats.percentage}%
                </span>
              </div>
            </div>

            {/* Progress track */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isPassed ? 'bg-emerald-500' : isRevision ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.max(4, stats.percentage)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
