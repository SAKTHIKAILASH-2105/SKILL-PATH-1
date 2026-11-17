'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { SkillRadarChart } from '@/components/charts/SkillRadarChart';
import { ProgressAreaChart } from '@/components/charts/ProgressAreaChart';
import {
  Sparkles,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlayCircle,
  HelpCircle,
  Target,
  Layers,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Play,
  BookMarked,
  Loader2,
  Trophy,
  Video,
  ExternalLink,
  Lock,
  Unlock,
} from 'lucide-react';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { CertificateModal } from '@/components/CertificateModal';
import { getMentor } from '@/lib/mentors';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs_react');
  const [topicStatus, setTopicStatus] = useState<Record<string, string>>({});
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'quiz' | 'study' | null>(null);
  const [activeStudyTab, setActiveStudyTab] = useState<Record<string, 'theory' | 'videos'>>({});
  const [userTier, setUserTier] = useState<string>('free');
  const [proModalOpen, setProModalOpen] = useState(false);
  const [proModalTitle, setProModalTitle] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<Record<string, { passed: boolean; score: number } | null>>({});
  const [markingStudied, setMarkingStudied] = useState<string | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [userRes, roadRes, progRes, coursesRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/roadmap'),
        fetch('/api/progress'),
        fetch('/api/courses'),
      ]);

      if (userRes.ok && roadRes.ok && progRes.ok) {
        const u = await userRes.json();
        const r = await roadRes.json();
        const p = await progRes.json();
        setData(u);
        setRoadmap(r);
        setProgressData(p);
        setUserTier(u.user?.subscriptionTier || 'free');
      }

      if (coursesRes.ok) {
        const c = await coursesRes.json();
        const courseList = c.courses || [];
        setCourses(courseList);
        if (courseList.length > 0 && !selectedCourseId) {
          setSelectedCourseId(courseList[0].id);
        }
        if (c.topicProgress) {
          setTopicStatus(c.topicProgress);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleIKnowThis = (topicId: string) => {
    setActiveTopicId(topicId);
    setActiveMode('quiz');
    setQuizAnswers({});
    setQuizResult((prev) => ({ ...prev, [topicId]: null }));
  };

  const handleStudyTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setActiveMode('study');
    if (!activeStudyTab[topicId]) {
      setActiveStudyTab((prev) => ({ ...prev, [topicId]: 'theory' }));
    }
  };

  const handleStartQuizAfterStudy = (topicId: string) => {
    setActiveTopicId(topicId);
    setActiveMode('quiz');
    setQuizAnswers({});
    setQuizResult((prev) => ({ ...prev, [topicId]: null }));
  };

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async (topicId: string, questions: any[]) => {
    if (submittingQuiz) return;
    setSubmittingQuiz(true);
    try {
      const res = await fetch(`/api/courses/${selectedCourseId}/topics/${topicId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: quizAnswers }),
      });
      const resData = await res.json();
      setQuizResult((prev) => ({ ...prev, [topicId]: { passed: resData.passed, score: resData.score } }));
      if (resData.passed) {
        setTopicStatus((prev) => ({ ...prev, [topicId]: 'completed' }));
        await fetch(`/api/courses/${selectedCourseId}/topics/${topicId}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => {});
      } else {
        setTopicStatus((prev) => ({ ...prev, [topicId]: 'study' }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleMarkStudied = async (topicId: string) => {
    setMarkingStudied(topicId);
    try {
      await fetch(`/api/courses/${selectedCourseId}/topics/${topicId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      setTopicStatus((prev) => ({ ...prev, [topicId]: 'completed' }));
      setActiveTopicId(null);
      setActiveMode(null);
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingStudied(null);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading personalized learning path...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const user = data?.user;
  const career = data?.career;
  const readiness = data?.readiness || 0;
  const activeStage = roadmap?.activeStage;
  const latestSubmission = progressData?.assessmentHistory?.[0];

  // Radar points
  const radarPoints = (data?.skills || []).slice(0, 6).map((s: any) => ({
    skill: s.name,
    current: s.verifiedScore || (s.proficiency === 'Advanced' ? 90 : s.proficiency === 'Intermediate' ? 65 : s.proficiency === 'Beginner' ? 30 : 0),
    target: 85,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome & Philosophy Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-blue-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Learn only what you need before learning what you want</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'Learner'}! 👋
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                Your target career is <strong className="text-white underline decoration-blue-300 decoration-2">{career?.title || 'Full Stack Developer'}</strong>. Our 9 autonomous AI agents have calibrated your personalized prerequisite roadmap.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="flex items-center gap-3 bg-black/20 p-3 rounded-2xl backdrop-blur border border-white/10 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1 text-center">
                <Flame className="w-5 h-5 text-amber-400" />
                <div className="text-left">
                  <div className="text-lg font-black leading-none">{user?.streakDays || 7} Days</div>
                  <div className="text-[10px] text-blue-200">Study Streak</div>
                </div>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="flex items-center gap-2 px-3 py-1 text-center">
                <Clock className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <div className="text-lg font-black leading-none">{progressData?.totalHoursSpent || 18.5}h</div>
                  <div className="text-[10px] text-blue-200">Hours Studied</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action CTAs Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/roadmap"
            className="p-4 bg-white border border-slate-200 hover:border-blue-500 rounded-2xl shadow-xs transition-all hover:shadow-md group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Continue Learning
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                  {activeStage?.title || 'Active Roadmap Stage'}
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/courses/crs_react"
            className="p-4 bg-white border border-slate-200 hover:border-purple-500 rounded-2xl shadow-xs transition-all hover:shadow-md group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Take Diagnostic Test
                </div>
                <div className="text-[11px] text-slate-500">React Prerequisite Check</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {(() => {
            const activeMentor = getMentor(data?.user?.preferredMentorId);
            return (
              <Link
                href="/mentor"
                className="p-4 bg-white border border-slate-200 hover:border-blue-500 rounded-2xl shadow-xs transition-all hover:shadow-md group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={activeMentor.avatar}
                      alt={activeMentor.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      <span>{activeMentor.name}</span>
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.2 rounded shrink-0">
                        Active Mentor
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[190px]">
                      {activeMentor.role}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </Link>
            );
          })()}
        </div>

        {/* SELECT COURSES & TOPIC MASTERY WIDGET */}
        {(() => {
          const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
          const currentTopics = currentCourse?.topics || [];
          const doneTopicsCount = currentTopics.filter(
            (t: any) => topicStatus[t.id] === 'skipped' || topicStatus[t.id] === 'completed'
          ).length;
          const totalTopicsCount = currentTopics.length;
          const courseProgress = totalTopicsCount > 0 ? Math.round((doneTopicsCount / totalTopicsCount) * 100) : 0;

          return (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
              {/* Header and Course Selector Dropdown */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Course & Topic Mastery</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Select Course to Explore Topics
                  </h2>
                  <p className="text-xs text-slate-500">
                    Choose any course below to review topics. Know the basics? Take the test to skip it; otherwise study the material!
                  </p>
                </div>

                {/* Course Select Dropdown */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-xs font-bold text-slate-500">Select Course:</span>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setActiveTopicId(null);
                      setActiveMode(null);
                      setQuizAnswers({});
                    }}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
                  >
                    {courses.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.difficulty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Course Selection Tabs / Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {courses.map((c: any) => {
                  const isSelected = c.id === selectedCourseId;
                  const cDone = (c.topics || []).filter(
                    (t: any) => topicStatus[t.id] === 'skipped' || topicStatus[t.id] === 'completed'
                  ).length;
                  const cTotal = (c.topics || []).length;

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        setActiveTopicId(null);
                        setActiveMode(null);
                        setQuizAnswers({});
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{c.title}</span>
                      {cTotal > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {cDone}/{cTotal}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Course Banner with Progress */}
              {currentCourse && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/20 to-indigo-50/30 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {currentCourse.difficulty}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {currentCourse.duration} • {totalTopicsCount} Topics
                      </span>
                      {courseProgress === 100 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <Trophy className="w-3 h-3 text-emerald-600" />
                          <span>All Topics Complete</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{currentCourse.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{currentCourse.description}</p>

                    {/* Mini Progress */}
                    <div className="pt-1 space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                        <span>Topics Completed / Skipped</span>
                        <span>
                          {doneTopicsCount} / {totalTopicsCount} ({courseProgress}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden max-w-md">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${courseProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    {courseProgress === 100 ? (
                      <button
                        onClick={() => setCertModalOpen(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Award className="w-4 h-4" />
                        <span>🎓 Generate Certificate</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setCertModalOpen(true)}
                        className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-amber-200"
                        title="Preview certificate of completion"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>Certificate Preview</span>
                      </button>
                    )}

                    <Link
                      href={`/courses/${selectedCourseId}/learn`}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <span>Full Learning Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Topics List for Selected Course */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                  <span>Topics to Read & Test ({currentTopics.length}):</span>
                  <span className="text-slate-400 font-normal">Click &ldquo;I Know This&rdquo; to test out, or &ldquo;Study Topic&rdquo; to read</span>
                </div>

                {currentTopics.map((topic: any, idx: number) => {
                  const status = topicStatus[topic.id] || 'not_started';
                  const isActive = activeTopicId === topic.id;
                  const result = quizResult[topic.id];
                  const allAnswered = (topic.quiz || []).every((q: any) => quizAnswers[q.id]);

                  return (
                    <div
                      key={topic.id}
                      className={`rounded-2xl border-l-4 border border-slate-200 shadow-xs overflow-hidden transition-all duration-200 ${
                        status === 'skipped'
                          ? 'border-l-green-500 bg-green-50/20'
                          : status === 'completed'
                          ? 'border-l-emerald-500 bg-emerald-50/20'
                          : status === 'study'
                          ? 'border-l-rose-500 bg-rose-50/20'
                          : isActive
                          ? 'border-l-blue-500 bg-blue-50/20'
                          : 'border-l-slate-300 bg-white'
                      }`}
                    >
                      {/* Topic row */}
                      <div className="p-4 flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 border border-slate-200">
                          {idx + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-slate-900 truncate">{topic.title}</h4>
                            {status === 'skipped' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-200">
                                <CheckCircle2 className="w-3 h-3 text-green-600" /> Quiz Passed ✓ Skipped
                              </span>
                            ) : status === 'completed' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed ✓
                              </span>
                            ) : status === 'study' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <BookOpen className="w-3 h-3 text-rose-600" /> Study Required 📖
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                Not Started
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Video className="w-2.5 h-2.5" />
                              <span>{(topic.videos?.length || 2)} Videos</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{topic.description}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 shrink-0">
                          {status !== 'skipped' && status !== 'completed' && (
                            <>
                              <button
                                onClick={() => handleIKnowThis(topic.id)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                                  isActive && activeMode === 'quiz'
                                    ? 'bg-blue-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                                }`}
                              >
                                <Play className="w-3.5 h-3.5" />
                                <span>I Know This</span>
                              </button>
                              <button
                                onClick={() => handleStudyTopic(topic.id)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Study Topic</span>
                              </button>
                            </>
                          )}

                          {(status === 'skipped' || status === 'completed') && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (isActive && activeMode === 'study') {
                                    setActiveTopicId(null);
                                    setActiveMode(null);
                                  } else {
                                    setActiveTopicId(topic.id);
                                    setActiveMode('study');
                                    if (!activeStudyTab[topic.id]) {
                                      setActiveStudyTab((prev) => ({ ...prev, [topic.id]: 'videos' }));
                                    }
                                  }
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
                              >
                                <Video className="w-3.5 h-3.5 text-blue-600" />
                                <span>{isActive && activeMode === 'study' ? 'Hide' : 'Review Videos & Theory'}</span>
                              </button>
                              <button
                                onClick={() => handleIKnowThis(topic.id)}
                                title="Retake Quiz"
                                className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                              >
                                Retake
                              </button>
                            </div>
                          )}

                          {isActive && (
                            <button
                              onClick={() => {
                                setActiveTopicId(null);
                                setActiveMode(null);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* INLINE QUIZ PANEL */}
                      {isActive && activeMode === 'quiz' && (
                        <div className="border-t border-slate-200 p-5 space-y-4 bg-white">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <Play className="w-4 h-4 text-blue-600" />
                              <h5 className="font-bold text-sm text-slate-900">
                                Diagnostic Quiz: {topic.title}
                              </h5>
                            </div>
                            <span className="text-xs text-slate-400">Passing score: 67% (2/3 correct)</span>
                          </div>

                          {/* Result Banner if already submitted */}
                          {result && result.passed && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs font-semibold text-green-700 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>✓ You passed with {result.score}%! Topic marked as skipped.</span>
                            </div>
                          )}

                          {result && !result.passed && (
                            <div className="space-y-3">
                              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                <span>Score: {result.score}% (need ≥67%). You must study this topic fully!</span>
                              </div>

                              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                                  <BookMarked className="w-4 h-4" /> Full Study Material
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                  {topic.studyContent}
                                </p>
                              </div>

                              <button
                                onClick={() => handleMarkStudied(topic.id)}
                                disabled={markingStudied === topic.id}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                              >
                                {markingStudied === topic.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>Mark as Studied & Complete</span>
                              </button>
                            </div>
                          )}

                          {/* Quiz Questions */}
                          {!result && (topic.quiz || []).map((q: any, qi: number) => (
                            <div key={q.id} className="space-y-2 pt-1">
                              <p className="text-xs font-semibold text-slate-800">
                                Q{qi + 1}. {q.question}
                              </p>
                              <div className="space-y-1.5">
                                {q.options.map((opt: string) => {
                                  const selected = quizAnswers[q.id] === opt;
                                  return (
                                    <button
                                      key={opt}
                                      onClick={() => handleQuizAnswer(q.id, opt)}
                                      className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                                        selected
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}

                          {/* Submit Quiz button */}
                          {!result && (
                            <button
                              onClick={() => handleSubmitQuiz(topic.id, topic.quiz)}
                              disabled={!allAnswered || submittingQuiz}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                            >
                              {submittingQuiz ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {allAnswered
                                  ? 'Submit Topic Quiz'
                                  : `Answer all questions (${Object.keys(quizAnswers).length}/${topic.quiz.length})`}
                              </span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* INLINE STUDY CONTENT PANEL WITH THEORY & MULTI-PLATFORM VIDEOS */}
                      {isActive && activeMode === 'study' && (
                        <div className="border-t border-slate-200 p-5 space-y-5 bg-white">
                          {/* Dual Tabs: Theory vs Video */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveStudyTab((prev) => ({ ...prev, [topic.id]: 'theory' }))}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                  (activeStudyTab[topic.id] || 'theory') === 'theory'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Theory Content</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveStudyTab((prev) => ({ ...prev, [topic.id]: 'videos' }))}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                  activeStudyTab[topic.id] === 'videos'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Video Content ({topic.videos?.length || 0})</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                                YouTube
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                                Coursera
                              </span>
                            </div>
                          </div>

                          {/* TAB 1: THEORY CONTENT */}
                          {(activeStudyTab[topic.id] || 'theory') === 'theory' && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                                <BookMarked className="w-4 h-4 text-amber-600" />
                                <span>In-Depth Conceptual Theory</span>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                                  {topic.studyContent}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* TAB 2: MULTI-PLATFORM VIDEO CONTENT */}
                          {activeStudyTab[topic.id] === 'videos' && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                                  <Video className="w-4 h-4 text-blue-600" />
                                  <span>Curated Multi-Platform Video Lessons</span>
                                </div>
                                <span className="text-[11px] text-slate-500 font-medium">Free & Advanced Pro Masterclasses</span>
                              </div>

                              <div className="grid grid-cols-1 gap-4">
                                {(topic.videos || []).map((v: any) => {
                                  const isLocked = v.isPro && userTier !== 'pro';

                                  return (
                                    <div
                                      key={v.id}
                                      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                                        isLocked
                                          ? 'bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 border-amber-200 shadow-xs'
                                          : 'bg-white border-slate-200 shadow-xs'
                                      }`}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                                v.platform === 'YouTube'
                                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                                              }`}
                                            >
                                              {v.platform}
                                            </span>

                                            {v.isPro ? (
                                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                                <Sparkles className="w-3 h-3 text-amber-600" />
                                                <span>PRO ADVANCED</span>
                                              </span>
                                            ) : (
                                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                FREE TUTORIAL
                                              </span>
                                            )}

                                            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                              <Clock className="w-3 h-3 text-slate-400" />
                                              {v.duration}
                                            </span>
                                          </div>

                                          <h5 className="font-bold text-sm text-slate-900">{v.title}</h5>

                                          {v.instructor && (
                                            <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                                              <Award className="w-3 h-3 text-indigo-500" />
                                              <span>Instructor / Institution: <strong className="text-slate-800">{v.instructor}</strong></span>
                                            </p>
                                          )}
                                        </div>

                                        {/* Right side actions */}
                                        <div className="shrink-0">
                                          {isLocked ? (
                                            <button
                                              onClick={() => {
                                                setProModalTitle(v.title);
                                                setProModalOpen(true);
                                              }}
                                              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                                            >
                                              <Lock className="w-3.5 h-3.5" />
                                              <span>Unlock PRO to Access</span>
                                            </button>
                                          ) : (
                                            <a
                                              href={v.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5 border border-slate-200"
                                            >
                                              <span>Open on {v.platform}</span>
                                              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                            </a>
                                          )}
                                        </div>
                                      </div>

                                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{v.description}</p>

                                      {/* Free Embedded Video Player */}
                                      {!isLocked && v.embedId && (
                                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 mt-2 shadow-xs">
                                          <iframe
                                            src={`https://www.youtube-nocookie.com/embed/${v.embedId}`}
                                            title={v.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                          />
                                        </div>
                                      )}

                                      {/* Locked Pro Overlay Box */}
                                      {isLocked && (
                                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-300/60 flex items-center justify-between gap-4 mt-2">
                                          <div className="space-y-0.5">
                                            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                              <Lock className="w-3.5 h-3.5 text-amber-700" />
                                              <span>Advanced Coursera Specialization Content</span>
                                            </div>
                                            <p className="text-[11px] text-amber-800">
                                              Upgrade to SkillPath Pro to stream verified university masterclasses and enterprise project labs.
                                            </p>
                                          </div>
                                          <button
                                            onClick={() => {
                                              setProModalTitle(v.title);
                                              setProModalOpen(true);
                                            }}
                                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shrink-0 transition-colors"
                                          >
                                            Upgrade
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {(!topic.videos || topic.videos.length === 0) && (
                                  <p className="text-xs text-slate-400 italic">No video content linked yet.</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* POST-STUDY CALLOUT: AFTER FINISHING TOPIC, ASK QUIZ */}
                          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/40 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                                <Play className="w-4 h-4 text-blue-600" />
                                <span>Finished Studying Theory & Videos?</span>
                              </h5>
                              <p className="text-xs text-slate-600 max-w-lg">
                                Test your comprehension now! Pass the 3-question quiz (≥67%) to verify mastery and mark this topic as complete.
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleStartQuizAfterStudy(topic.id)}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                              >
                                <Play className="w-3.5 h-3.5" />
                                <span>Take Topic Quiz Now</span>
                              </button>

                              <button
                                onClick={() => handleMarkStudied(topic.id)}
                                disabled={markingStudied === topic.id}
                                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
                                title="Mark as studied directly"
                              >
                                {markingStudied === topic.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {currentTopics.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No topics loaded for this course.
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* 2-Column Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Readiness Gauge, Recommended Action, Roadmap Stage */}
          <div className="lg:col-span-2 space-y-6">
            {/* Career Readiness & Current Roadmap Stage Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Target Goal Analysis
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>{career?.title}</span>
                    <Link
                      href="/careers"
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      (Change Goal)
                    </Link>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Readiness Score</div>
                    <div className="text-xl font-black text-slate-900">{readiness}%</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 border-4 border-blue-600 flex items-center justify-center text-xs font-black text-blue-700">
                    {readiness}%
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Current Competency Alignment</span>
                  <span className="font-semibold">{readiness}% Complete</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, readiness)}%` }}
                  />
                </div>
              </div>

              {/* Current Stage Card */}
              {activeStage && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                        STAGE {activeStage.stageNumber}
                      </span>
                      {activeStage.isFoundationModule && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                          Adaptive Remediation Injected
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{activeStage.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-1">{activeStage.reason}</p>
                  </div>

                  <Link
                    href="/roadmap"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <span>View Roadmap</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Strengths & Missing Skills Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Verified Strengths</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    {data?.strengths?.length || 0} Skills
                  </span>
                </div>
                <div className="space-y-2">
                  {(data?.strengths || ['Python (Intermediate)', 'SQL (Intermediate)']).map((item: string, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 font-medium flex items-center justify-between">
                      <span>{item}</span>
                      <span className="text-[10px] font-bold text-emerald-700">Mastered</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak / Missing Skills */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Identified Skill Gaps</span>
                  </h4>
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                    {(data?.weaknesses?.length || 0) + (data?.missing?.length || 0)} Gaps
                  </span>
                </div>
                <div className="space-y-2">
                  {[...(data?.weaknesses || ['HTML', 'JavaScript']), ...(data?.missing || ['DOM', 'React'])].slice(0, 3).map((item: string, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100 text-xs text-rose-900 font-medium flex items-center justify-between">
                      <span>{item}</span>
                      <span className="text-[10px] font-bold text-rose-700">Needs Study</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Study Activity Area Chart */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Weekly Learning Velocity</h4>
                  <p className="text-xs text-slate-500">Study hours logged across the past 7 days</p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  Velocity: Steady
                </span>
              </div>
              <ProgressAreaChart data={progressData?.activityHistory || []} height={160} />
            </div>
          </div>

          {/* Right Column: Skill Radar Chart & Diagnostic Status */}
          <div className="space-y-6">
            {/* Skill Radar Chart Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col items-center">
              <div className="w-full text-left mb-2">
                <h4 className="text-sm font-bold text-slate-900">Skill Competency Radar</h4>
                <p className="text-xs text-slate-500">Verified mastery vs career requirements</p>
              </div>
              <SkillRadarChart data={radarPoints} size={320} />
            </div>

            {/* Latest Diagnostic Assessment Performance Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Latest Diagnostic</h4>
                {latestSubmission && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      latestSubmission.score >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : latestSubmission.score >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {latestSubmission.readinessStatus}
                  </span>
                )}
              </div>

              {latestSubmission ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Diagnostic Score</span>
                    <span className="font-extrabold text-base text-slate-900">{latestSubmission.score}%</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {latestSubmission.feedback}
                  </p>
                  <Link
                    href={`/assessments/${latestSubmission.assessmentId}`}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Retake Diagnostic</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-500">
                    No diagnostic taken yet. Verify your JavaScript and DOM readiness before starting React!
                  </p>
                  <Link
                    href="/courses/crs_react"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                  >
                    <span>Check React Readiness</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        onSuccess={(tier) => setUserTier(tier)}
        resourceTitle={proModalTitle}
      />

      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        courseTitle={courses.find((c) => c.id === selectedCourseId)?.title || 'Course'}
        courseId={selectedCourseId}
        userName={data?.user?.name || 'Student'}
        skills={courses.find((c) => c.id === selectedCourseId)?.skillsTaught || []}
      />
    </AppShell>
  );
}
