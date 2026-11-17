'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ScoreBarChart } from '@/components/charts/ScoreBarChart';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Play,
  RotateCcw,
  Award,
} from 'lucide-react';
import { CertificateModal } from '@/components/CertificateModal';

import { Suspense } from 'react';

function CourseDetailContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    fetch('/api/user')
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.name) setUserName(d.user.name);
      })
      .catch(() => {});
  }, []);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/courses/${courseId}`);
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
    if (courseId) loadCourseDetail();
  }, [courseId]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!data?.course) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-slate-800">Course not found</h2>
          <Link href="/courses" className="text-blue-600 text-xs font-semibold mt-2 inline-block">
            ← Return to course catalog
          </Link>
        </div>
      </AppShell>
    );
  }

  const { course, prerequisites, resources, assessment, latestSubmission, readinessStatus } = data;
  const isReady = readinessStatus === 'Ready';
  const isRevision = readinessStatus === 'Needs Revision';
  const isFoundation = readinessStatus === 'Foundation Required';

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/courses" className="hover:text-blue-600">Courses</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{course.title}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  course.isPremium ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {course.isPremium ? 'PRO MASTERCLASS' : 'FREE PATHWAY'}
                </span>
                <span className="text-xs text-slate-500 font-medium">{course.difficulty} • {course.duration}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{course.title}</h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{course.description}</p>
            </div>

            {/* Readiness Badge */}
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Readiness Gate
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                isReady
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isRevision
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : isFoundation
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {isReady ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-amber-600" />}
                <span>{readinessStatus}</span>
              </span>
            </div>
          </div>

          {/* Diagnostic Action CTA Box */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isReady
              ? 'bg-emerald-50/70 border-emerald-200'
              : isFoundation
              ? 'bg-rose-50/70 border-rose-200'
              : 'bg-blue-50/70 border-blue-200'
          }`}>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>Diagnostic Assessment Status</span>
                {latestSubmission && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border text-slate-700">
                    Score: {latestSubmission.score}%
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                {latestSubmission
                  ? latestSubmission.feedback
                  : 'Our adaptive learning engine requires taking a diagnostic assessment to verify foundational prerequisite comprehension before unlocking main course materials.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setCertModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>🎓 Certificate of Completion</span>
              </button>
              <Link
                href={`/courses/${courseId}/learn`}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Learn by Topic (Test / Study)</span>
              </Link>
              {assessment && !isReady && (
                <Link
                  href={`/assessments/${assessment.id}`}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{latestSubmission ? 'Retake Prerequisite Test' : 'Check My Readiness (5 Mins)'}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Latest Topic-Level Diagnostics (if submitted) */}
        {latestSubmission && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Topic-Level Diagnostic Breakdown</h3>
                <p className="text-xs text-slate-500">Prerequisite concepts analyzed by Assessment Agent</p>
              </div>
              <span className="text-xs font-bold text-slate-700">Benchmark: 75%</span>
            </div>

            <ScoreBarChart topics={latestSubmission.topicScores} />
          </div>
        )}

        {/* Learning Objectives */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">What You Will Master</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {course.learningObjectives?.map((obj: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topics Preview */}
        {course.topics && course.topics.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Course Topics</h3>
              <Link href={`/courses/${courseId}/learn`} className="text-xs font-semibold text-blue-600 hover:underline">
                Start Learning →
              </Link>
            </div>
            <div className="space-y-2">
              {course.topics.slice(0, 3).map((topic: any, i: number) => (
                <div key={topic.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{topic.title}</div>
                    <div className="text-[11px] text-slate-500">{topic.description}</div>
                  </div>
                </div>
              ))}
              {course.topics.length > 3 && (
                <Link href={`/courses/${courseId}/learn`} className="block text-center text-xs text-blue-600 font-semibold py-2 hover:underline">
                  +{course.topics.length - 3} more topics →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Required Prerequisites Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Prerequisite Competencies Checklist</h3>
            <span className="text-xs text-slate-400">Gatekeeping rules applied</span>
          </div>

          <div className="space-y-2">
            {prerequisites.map((p: any) => (
              <div
                key={p.skillId}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{p.skillName}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Your Proficiency: <strong className="text-slate-700">{p.proficiency}</strong> ({p.score}%)
                  </div>
                </div>

                {p.isMet ? (
                  <span className="flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 text-[11px]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Prerequisite Needed</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Course Resources & Foundation Tutorials */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Curated Learning Resources</h3>
              <p className="text-xs text-slate-500">Free foundational modules & practice sandboxes</p>
            </div>
            <Link href="/resources" className="text-xs font-semibold text-blue-600 hover:underline">
              View all resources →
            </Link>
          </div>

          <div className="space-y-3">
            {resources.map((res: any) => (
              <div
                key={res.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      res.isPremium ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {res.isPremium ? 'PRO' : 'FREE'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{res.provider} • {res.duration}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{res.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{res.description}</p>
                </div>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        courseTitle={course?.title || 'Course'}
        courseId={courseId}
        userName={userName}
        skills={course?.skillsTaught || []}
      />
    </AppShell>
  );
}

export default function CourseDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CourseDetailContent />
    </Suspense>
  );
}

