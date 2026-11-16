'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  LineChart,
  Palette,
  Cloud,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Layers: Layers,
  LineChart: LineChart,
  Cpu: Cpu,
  ShieldCheck: ShieldCheck,
  Cloud: Cloud,
  Palette: Palette,
};

export default function CareersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [switching, setSwitching] = useState<string | null>(null);
  const [changeModal, setChangeModal] = useState<any>(null);

  const loadCareers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/careers');
      if (res.ok) {
        const data = await res.json();
        setCareers(data.careers || []);
        setSelectedId(data.selectedCareerId || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCareers();
  }, []);

  const handleSelectCareer = async (careerId: string) => {
    if (careerId === selectedId) return;
    setSwitching(careerId);
    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedId(careerId);
        setChangeModal({
          career: careers.find((c) => c.id === careerId),
          agentResult: data.agentResult,
        });
        await loadCareers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Role Alignment</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Explore & Select Career Paths</h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Switching your target career dynamically recalculates skill gap priorities, preserves your existing compatible proficiencies, and regenerates your personalized roadmap.
          </p>
        </div>

        {/* Careers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careers.map((career) => {
            const Icon = iconMap[career.iconName] || Briefcase;
            const isSelected = selectedId === career.id;

            return (
              <div
                key={career.id}
                className={`rounded-2xl p-6 border transition-all flex flex-col justify-between relative bg-white ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active Goal</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{career.title}</h3>
                      <span className="text-[11px] text-slate-500 font-medium">{career.category}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[48px]">
                    {career.description}
                  </p>

                  {/* Readiness Progress */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Your Readiness</span>
                      <span className="font-black text-slate-900">{career.readinessPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          career.readinessPct >= 60 ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.max(4, career.readinessPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Required Core Competencies ({career.requiredSkillNames?.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(career.requiredSkillNames || []).map((sk: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ~{career.estimatedDurationWeeks} Weeks
                    </span>
                    <span className="text-slate-700 font-semibold">{career.averageSalary}</span>
                  </div>

                  <button
                    onClick={() => handleSelectCareer(career.id)}
                    disabled={isSelected || switching === career.id}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs hover:scale-[1.01]'
                    }`}
                  >
                    {switching === career.id ? (
                      <span>Regenerating Path...</span>
                    ) : isSelected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Active Path</span>
                      </>
                    ) : (
                      <>
                        <span>Select Career & Adapt Roadmap</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal explaining what changed after career switch */}
        {changeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                    Adaptive Agent In Action
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    Career Pivoted to {changeModal.career?.title}!
                  </h3>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="font-semibold text-slate-900">What happened under the hood:</div>
                <p className="leading-relaxed">
                  {changeModal.agentResult?.summary ||
                    'Preserved your existing verified skills (like Python & SQL) while recalculating missing domain modules.'}
                </p>
                <div className="pt-2 border-t border-slate-200 text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Roadmap Stages, Quizzes & Recommended Resources have been updated!</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/roadmap')}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
                >
                  View Regenerated Roadmap
                </button>
                <button
                  onClick={() => setChangeModal(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
