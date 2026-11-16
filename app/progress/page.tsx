'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { ProgressAreaChart } from '@/components/charts/ProgressAreaChart';
import { SkillComparisonChart } from '@/components/charts/SkillComparisonChart';
import {
  TrendingUp,
  Flame,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FolderGit2,
} from 'lucide-react';

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/progress');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  const {
    user,
    progress,
    overallProgress,
    careerReadiness,
    streakDays,
    totalHoursSpent,
    activityHistory,
    assessmentHistory,
    skillsComparison,
    completedStagesCount,
    totalStagesCount,
    completedResourcesCount,
  } = data || {};

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Progress Tracking Agent Telemetry</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Learning Progress & Performance</h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Detailed analytics on study velocity, skill improvements, diagnostic assessment history, and verified project milestones.
          </p>
        </div>

        {/* 4-Stat Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Overall Roadmap</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{overallProgress}%</div>
            <div className="text-[11px] text-slate-500">{completedStagesCount} of {totalStagesCount} stages completed</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Current Streak</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{streakDays} Days</div>
            <div className="text-[11px] text-emerald-600 font-semibold">Active study routine</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Total Hours Logged</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalHoursSpent} hrs</div>
            <div className="text-[11px] text-slate-500">Across tutorials & sandboxes</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Resources Mastered</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{completedResourcesCount}</div>
            <div className="text-[11px] text-slate-500">Free & pro modules completed</div>
          </div>
        </div>

        {/* 2-Column: Weekly Velocity Chart + Before & After Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Area Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Study Velocity (Past 7 Days)</h3>
                <p className="text-xs text-slate-500">Daily logged learning hours</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Weekly Goal: 15h
              </span>
            </div>
            <ProgressAreaChart data={activityHistory || []} height={200} />
          </div>

          {/* Before and After Skill Levels */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Before-and-After Skill Growth</h3>
                <p className="text-xs text-slate-500">Baseline diagnostic vs verified current level</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600">Adaptive Progress</span>
            </div>
            <SkillComparisonChart data={skillsComparison || []} />
          </div>
        </div>

        {/* Assessment Submission History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">Diagnostic Assessment History</h3>
            <p className="text-xs text-slate-500">Chronological records of prerequisite evaluations</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Assessment</th>
                  <th className="py-3.5 px-6">Score</th>
                  <th className="py-3.5 px-6">Readiness Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessmentHistory?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      No assessment attempts recorded yet.
                    </td>
                  </tr>
                ) : (
                  assessmentHistory?.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">{sub.assessmentTitle}</td>
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{sub.score}%</td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            sub.score >= 75
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sub.score >= 50
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {sub.readinessStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link
                          href={`/assessments/${sub.assessmentId}`}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Review / Retake →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
