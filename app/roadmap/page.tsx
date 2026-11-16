'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import {
  MapPin,
  Sparkles,
  CheckCircle2,
  Lock,
  Unlock,
  Play,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Flame,
} from 'lucide-react';

export default function RoadmapPage() {
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState<any[]>([]);
  const [career, setCareer] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/roadmap');
      if (res.ok) {
        const d = await res.json();
        setStages(d.stages || []);
        setCareer(d.career);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, []);

  const handleUpdateStatus = async (stageId: string, status: string) => {
    setUpdatingId(stageId);
    try {
      const res = await fetch('/api/roadmap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId, status }),
      });
      if (res.ok) {
        await loadRoadmap();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const completedCount = stages.filter((s) => s.status === 'Completed').length;
  const progressPct = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Prerequisite Sequencing</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Personalized Learning Roadmap</h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Custom-built for <strong className="text-slate-800">{career?.title || 'your target career'}</strong>. This path dynamically updates when you submit assessments, complete exercises, or alter career targets.
          </p>
        </div>

        {/* Milestone Tracker Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-900 text-sm">Roadmap Progression</span>
              <span className="text-slate-500 ml-2">
                ({completedCount} of {stages.length} stages completed)
              </span>
            </div>
            <span className="font-black text-blue-600 text-sm">{progressPct}% Complete</span>
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(3, progressPct)}%` }}
            />
          </div>
        </div>

        {/* Stages Timeline */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
          {stages.map((stage) => {
            const isCompleted = stage.status === 'Completed';
            const isInProgress = stage.status === 'In Progress';
            const isAvailable = stage.status === 'Available';
            const isLocked = stage.status === 'Locked';

            return (
              <div key={stage.id} className="relative group">
                {/* Timeline Icon Marker */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : isInProgress
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : isAvailable
                      ? 'bg-white text-blue-600 border-2 border-blue-600'
                      : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <span>{stage.stageNumber}</span>
                  )}
                </div>

                {/* Stage Content Card */}
                <div
                  className={`p-6 rounded-2xl border transition-all ${
                    stage.isFoundationModule
                      ? 'border-amber-300 bg-amber-50/30 shadow-sm ring-1 ring-amber-300'
                      : isInProgress
                      ? 'border-blue-500 bg-white shadow-md ring-1 ring-blue-500'
                      : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/15'
                      : isAvailable
                      ? 'border-slate-300 bg-white shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 opacity-85'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          STAGE {stage.stageNumber}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isInProgress
                              ? 'bg-blue-100 text-blue-800'
                              : isAvailable
                              ? 'bg-slate-200 text-slate-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {stage.status}
                        </span>

                        {stage.isFoundationModule && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Adaptively Injected Remediation</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900">{stage.title}</h3>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                        {stage.reason}
                      </p>
                    </div>

                    {/* Stage Action Controls */}
                    <div className="flex sm:flex-col items-end gap-2 shrink-0">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        ~{stage.estimatedHours} Hours
                      </span>

                      {!isLocked && (
                        <div className="flex gap-2">
                          {!isCompleted ? (
                            <button
                              onClick={() => handleUpdateStatus(stage.id, 'Completed')}
                              disabled={updatingId === stage.id}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Complete</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(stage.id, 'In Progress')}
                              disabled={updatingId === stage.id}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prerequisites info */}
                  {stage.prerequisites?.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">Required Prerequisites:</span>
                      <span>{stage.prerequisites.join(', ')}</span>
                    </div>
                  )}

                  {/* Resources & Diagnostic Shortcuts */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Curated Resources:</span>
                      {stage.resources?.length > 0 ? (
                        stage.resources.map((res: any) => (
                          <a
                            key={res.id}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium transition-colors"
                          >
                            <span>{res.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">Targeted exercises provided in course</span>
                      )}
                    </div>

                    {stage.assessmentId && (
                      <Link
                        href={`/assessments/${stage.assessmentId}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Diagnostic Test</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
