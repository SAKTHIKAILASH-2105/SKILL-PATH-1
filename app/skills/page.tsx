'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { SkillRadarChart } from '@/components/charts/SkillRadarChart';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Target,
  ChevronRight,
} from 'lucide-react';

export default function SkillGapPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadSkillGap = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user');
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
    loadSkillGap();
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

  const career = data?.career;
  const userSkills = data?.skills || [];
  const readiness = data?.readiness || 0;

  // Build gap analysis table from career required skills
  const levelScores: Record<string, number> = {
    'Not Started': 0,
    Beginner: 35,
    Intermediate: 70,
    Advanced: 100,
  };

  const gapItems = (career?.requiredSkillIds || []).map((req: any) => {
    const found = userSkills.find((us: any) => us.skillId === req.skillId);
    const currentLevel = found?.proficiency || 'Not Started';
    const currentScore = found?.verifiedScore !== undefined ? found.verifiedScore : levelScores[currentLevel] || 0;
    const requiredScore = levelScores[req.requiredLevel] || 100;
    const gap = Math.max(0, requiredScore - currentScore);

    let status = 'Not Started';
    if (currentScore >= requiredScore) status = 'Mastered';
    else if (currentScore > 0) status = 'In Progress';

    return {
      skillId: req.skillId,
      skillName: found?.name || req.skillId,
      currentLevel,
      currentScore,
      requiredLevel: req.requiredLevel,
      requiredScore,
      gap,
      importance: req.importance,
      status,
    };
  });

  const filteredItems = gapItems.filter((item: any) => {
    if (filterStatus === 'all') return true;
    return item.status.toLowerCase().replace(' ', '-') === filterStatus;
  });

  const radarPoints = gapItems.slice(0, 7).map((item: any) => ({
    skill: item.skillName,
    current: item.currentScore,
    target: item.requiredScore,
  }));

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deficiency Scoring & Prioritization</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Skill Gap Analysis & Benchmark</h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Target career requirements compared against your verified and declared competencies. Skill Gap Agent prioritizes your highest-yield study targets.
          </p>
        </div>

        {/* Readiness Summary Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Career</span>
            <h3 className="text-lg font-bold text-slate-900">{career?.title || 'Full Stack Developer'}</h3>
            <p className="text-xs text-slate-500">
              {gapItems.filter((g: any) => g.status === 'Mastered').length} of {gapItems.length} core competencies currently met
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
            <div>
              <div className="text-xs font-semibold text-slate-500">Career Readiness Score</div>
              <div className="text-2xl font-black text-slate-900">{readiness}%</div>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-50 border-4 border-blue-600 flex items-center justify-center text-xs font-black text-blue-700">
              {readiness}%
            </div>
          </div>
        </div>

        {/* 2-Col Grid: Radar Chart + Strengths/Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col items-center">
            <div className="w-full text-left mb-4">
              <h3 className="text-sm font-bold text-slate-900">Skill Alignment Radar</h3>
              <p className="text-xs text-slate-500">Visual overlay of your verified mastery vs benchmark</p>
            </div>
            <SkillRadarChart data={radarPoints} size={340} />
          </div>

          {/* Strengths & Weaknesses Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Verified Strengths</span>
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {gapItems.filter((g: any) => g.status === 'Mastered').length}
                </span>
              </div>
              <p className="text-xs text-slate-500">Competencies that meet or exceed career requirements:</p>
              <div className="space-y-2">
                {gapItems.filter((g: any) => g.status === 'Mastered').map((item: any) => (
                  <div key={item.skillId} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{item.skillName}</span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {item.currentLevel} ({item.currentScore}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Priority Skill Gaps</span>
                </h3>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {gapItems.filter((g: any) => g.status !== 'Mastered').length}
                </span>
              </div>
              <p className="text-xs text-slate-500">Critical missing prerequisites sequenced into your roadmap:</p>
              <div className="space-y-2">
                {gapItems.filter((g: any) => g.status !== 'Mastered').slice(0, 3).map((item: any) => (
                  <div key={item.skillId} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{item.skillName}</span>
                      <span className="text-[10px] text-slate-500 block">Gap: -{item.gap}% • {item.importance}</span>
                    </div>
                    <Link
                      href="/roadmap"
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Study in Roadmap</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Skill Gap Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Competency Matrix</h3>
              <p className="text-xs text-slate-500">Skill | Current Level | Required Level | Gap | Priority | Status</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                  filterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('not-started')}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                  filterStatus === 'not-started' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Not Started
              </button>
              <button
                onClick={() => setFilterStatus('in-progress')}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                  filterStatus === 'in-progress' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilterStatus('mastered')}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                  filterStatus === 'mastered' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Mastered
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Skill</th>
                  <th className="py-3.5 px-6">Current Level</th>
                  <th className="py-3.5 px-6">Required Level</th>
                  <th className="py-3.5 px-6">Gap Score</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item: any) => {
                  const isMastered = item.status === 'Mastered';

                  return (
                    <tr key={item.skillId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">{item.skillName}</td>
                      <td className="py-3.5 px-6">
                        <span className="font-medium text-slate-700">{item.currentLevel}</span>
                        <span className="text-[10px] text-slate-400 block">({item.currentScore}%)</span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="font-semibold text-slate-800">{item.requiredLevel}</span>
                        <span className="text-[10px] text-slate-400 block">({item.requiredScore}%)</span>
                      </td>
                      <td className="py-3.5 px-6">
                        {item.gap > 0 ? (
                          <span className="text-rose-600 font-bold">-{item.gap}%</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">0% (Met)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.importance === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : item.importance === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.importance}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            isMastered
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isMastered && <CheckCircle2 className="w-3 h-3" />}
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link
                          href="/resources"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          <span>Resources</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
