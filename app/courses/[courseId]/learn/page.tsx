'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { CertificateModal } from '@/components/CertificateModal';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Trophy,
  AlertCircle,
  BookMarked,
  Loader2,
  Video,
  ExternalLink,
  Lock,
  Unlock,
  Sparkles,
  Clock,
  Award,
} from 'lucide-react';

type TopicStatus = 'not_started' | 'quiz_active' | 'study_active' | 'skipped' | 'study' | 'completed';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface TopicVideo {
  id: string;
  title: string;
  platform: 'YouTube' | 'Coursera' | 'freeCodeCamp' | 'edX' | 'Udemy';
  duration: string;
  url: string;
  embedId?: string;
  isPro: boolean;
  instructor?: string;
  description: string;
}

interface CourseTopic {
  id: string;
  title: string;
  description: string;
  studyContent: string;
  videos?: TopicVideo[];
  quiz: QuizQuestion[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  skillsTaught?: string[];
  topics?: CourseTopic[];
  topicProgress?: Record<string, 'skipped' | 'study' | 'completed'>;
}

const statusColors: Record<TopicStatus, string> = {
  not_started: 'border-l-slate-300 bg-white',
  quiz_active: 'border-l-blue-400 bg-blue-50/40',
  study_active: 'border-l-amber-400 bg-amber-50/40',
  skipped: 'border-l-green-400 bg-green-50/30',
  study: 'border-l-rose-400 bg-rose-50/30',
  completed: 'border-l-emerald-400 bg-emerald-50/30',
};

function StatusBadge({ status }: { status: TopicStatus }) {
  switch (status) {
    case 'skipped':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700 border border-green-200">
          <CheckCircle2 className="w-3 h-3" /> Quiz Passed ✓ Skipped
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Completed ✓
        </span>
      );
    case 'study':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
          <BookOpen className="w-3 h-3" /> Study Required 📖
        </span>
      );
    case 'quiz_active':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
          <Play className="w-3 h-3" /> Quiz In Progress
        </span>
      );
    case 'study_active':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
          <BookMarked className="w-3 h-3" /> Studying
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
          Not Started
        </span>
      );
  }
}

function CourseLearningContent() {
  const params = useParams();
  const courseId = params?.courseId as string;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [topicStatus, setTopicStatus] = useState<Record<string, TopicStatus>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<Record<string, { passed: boolean; score: number } | null>>({});
  const [markingStudied, setMarkingStudied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, 'theory' | 'videos'>>({});
  const [userTier, setUserTier] = useState<string>('free');
  const [proModalOpen, setProModalOpen] = useState(false);
  const [proModalTitle, setProModalTitle] = useState('');
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

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const d = await res.json();
          const c: Course = d.course;
          setCourse(c);
          setUserTier(d.subscriptionTier || 'free');
          // Initialize statuses from server progress
          const initialStatus: Record<string, TopicStatus> = {};
          if (c.topics) {
            for (const topic of c.topics) {
              const serverStatus = c.topicProgress?.[topic.id];
              initialStatus[topic.id] = serverStatus ?? 'not_started';
            }
          }
          setTopicStatus(initialStatus);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const topics = course?.topics ?? [];

  const doneCount = Object.values(topicStatus).filter(
    (s) => s === 'skipped' || s === 'completed'
  ).length;
  const totalCount = topics.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const allDone = totalCount > 0 && doneCount === totalCount;

  const handleIKnowThis = (topicId: string) => {
    setActiveTopicId(topicId);
    setTopicStatus((prev) => ({ ...prev, [topicId]: 'quiz_active' }));
    setQuizAnswers({});
    setQuizResult((prev) => ({ ...prev, [topicId]: null }));
  };

  const handleStudyTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setTopicStatus((prev) => ({ ...prev, [topicId]: 'study_active' }));
    if (!activeTab[topicId]) {
      setActiveTab((prev) => ({ ...prev, [topicId]: 'theory' }));
    }
  };

  const handleStartQuizAfterStudy = (topicId: string) => {
    setActiveTopicId(topicId);
    setTopicStatus((prev) => ({ ...prev, [topicId]: 'quiz_active' }));
    setQuizAnswers({});
    setQuizResult((prev) => ({ ...prev, [topicId]: null }));
  };

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async (topicId: string, questions: QuizQuestion[]) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/topics/${topicId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: quizAnswers }),
      });
      const data = await res.json();
      setQuizResult((prev) => ({ ...prev, [topicId]: { passed: data.passed, score: data.score } }));
      if (data.passed) {
        setTopicStatus((prev) => ({ ...prev, [topicId]: 'completed' }));
        await fetch(`/api/courses/${courseId}/topics/${topicId}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => {});
      } else {
        setTopicStatus((prev) => ({ ...prev, [topicId]: 'study' }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkStudied = async (topicId: string) => {
    setMarkingStudied(topicId);
    try {
      await fetch(`/api/courses/${courseId}/topics/${topicId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      setTopicStatus((prev) => ({ ...prev, [topicId]: 'completed' }));
      setActiveTopicId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingStudied(null);
    }
  };

  const handleMasterAllTopics = async () => {
    if (!course || !course.topics) return;
    const newStatus: Record<string, TopicStatus> = {};
    for (const t of course.topics) {
      newStatus[t.id] = 'completed';
      fetch(`/api/courses/${courseId}/topics/${t.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});
    }
    setTopicStatus(newStatus);
    setCertModalOpen(true);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!course) {
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

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/courses" className="hover:text-blue-600">Courses</Link>
          <span>/</span>
          <Link href={`/courses/${courseId}`} className="hover:text-blue-600">{course.title}</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Learn</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                href={`/courses/${courseId}`}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-medium mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to course
              </Link>
              <h1 className="text-xl font-extrabold text-slate-900">{course.title}</h1>
              <p className="text-xs text-slate-500 mt-1">
                Work through each topic — take the quiz to skip it, or study the material.
              </p>
            </div>
            <div className="text-right shrink-0 flex flex-col items-end">
              <div>
                <span className="text-2xl font-extrabold text-blue-600">{doneCount}</span>
                <span className="text-xs text-slate-500 font-medium"> / {totalCount}</span>
                <span className="text-[11px] text-slate-400 ml-1">topics done</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {allDone ? (
                  <button
                    onClick={() => setCertModalOpen(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>🎓 View Certificate</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setCertModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-amber-200"
                      title="Preview official certificate of completion"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Certificate Preview</span>
                    </button>
                    <button
                      onClick={handleMasterAllTopics}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-emerald-200"
                      title="Mark all topics complete and generate certificate"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Complete All & Claim Certificate</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Congratulations Banner with Generate Certificate CTA */}
        {allDone && (
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-emerald-400/40">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-800/60 px-2.5 py-0.5 rounded-full text-emerald-200 border border-emerald-400/30">
                  Course Milestone Achieved
                </span>
                <h2 className="font-extrabold text-xl sm:text-2xl mt-1">🎉 All Topics Complete!</h2>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
                  You&apos;ve mastered all {totalCount} topics in <strong>{course.title}</strong>. Your verifiable certificate of completion is ready to generate and download!
                </p>
              </div>
            </div>

            <button
              onClick={() => setCertModalOpen(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-900 font-black text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 shrink-0 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Award className="w-5 h-5 text-amber-900" />
              <span>🎓 Generate Certificate of Completion</span>
            </button>
          </div>
        )}

        {/* Topic list */}
        <div className="space-y-3">
          {topics.map((topic, idx) => {
            const status = topicStatus[topic.id] ?? 'not_started';
            const isActive = activeTopicId === topic.id;
            const result = quizResult[topic.id];
            const allAnswered = topic.quiz.every((q) => quizAnswers[q.id]);

            return (
              <div
                key={topic.id}
                className={`rounded-2xl border-l-4 border border-slate-200 shadow-xs overflow-hidden transition-all duration-200 ${statusColors[status]}`}
              >
                {/* Topic header row */}
                <div className="p-4 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 border border-slate-200">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{topic.title}</h3>
                      <StatusBadge status={status} />
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Video className="w-2.5 h-2.5" />
                        <span>{(topic.videos?.length || 2)} Videos</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{topic.description}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 shrink-0">
                    {(status === 'not_started' || status === 'study') && (
                      <>
                        <button
                          onClick={() => handleIKnowThis(topic.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" />
                          I Know This
                        </button>
                        <button
                          onClick={() => handleStudyTopic(topic.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Study Topic
                        </button>
                      </>
                    )}
                    {(status === 'quiz_active' || status === 'study_active') && (
                      <button
                        onClick={() => {
                          setActiveTopicId(isActive ? null : topic.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                      >
                        {isActive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                    {(status === 'skipped' || status === 'completed') && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (isActive) {
                              setActiveTopicId(null);
                            } else {
                              setActiveTopicId(topic.id);
                              if (!activeTab[topic.id]) {
                                setActiveTab((prev) => ({ ...prev, [topic.id]: 'videos' }));
                              }
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
                        >
                          <Video className="w-3.5 h-3.5 text-blue-600" />
                          <span>{isActive ? 'Hide Content' : 'Review Videos & Theory'}</span>
                          {isActive ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quiz panel */}
                {status === 'quiz_active' && isActive && (
                  <div className="border-t border-slate-200 p-5 space-y-5 bg-white">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-blue-600" />
                      <h4 className="font-bold text-sm text-slate-900">Quick Knowledge Check</h4>
                      <span className="text-xs text-slate-400 font-medium">— answer all 3 to submit</span>
                    </div>

                    {/* After submit result banner */}
                    {result && result.passed && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-xs font-semibold text-green-700">
                        <CheckCircle2 className="w-4 h-4" />
                        ✓ Topic Skipped! Score: {result.score}%
                      </div>
                    )}
                    {result && !result.passed && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                          <XCircle className="w-4 h-4" />
                          Study Required — Score: {result.score}% (need ≥67%)
                        </div>
                        {/* Study content after fail */}
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                            <BookMarked className="w-4 h-4" /> Study Material
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{topic.studyContent}</p>
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
                          Mark as Studied
                        </button>
                      </div>
                    )}

                    {/* Questions */}
                    {!result && topic.quiz.map((q, qi) => (
                      <div key={q.id} className="space-y-2">
                        <p className="text-xs font-semibold text-slate-800">
                          Q{qi + 1}. {q.question}
                        </p>
                        <div className="space-y-1.5">
                          {q.options.map((opt) => {
                            const selected = quizAnswers[q.id] === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => handleQuizAnswer(q.id, opt)}
                                className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                                  selected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Submit button */}
                    {!result && (
                      <button
                        onClick={() => handleSubmitQuiz(topic.id, topic.quiz)}
                        disabled={!allAnswered || submitting}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        {allAnswered ? 'Submit Quiz' : `Answer all questions (${Object.keys(quizAnswers).length}/${topic.quiz.length})`}
                      </button>
                    )}
                  </div>
                )}

                {/* Study content panel with Theory & Multi-Platform Videos */}
                {(status === 'study_active' || ((status === 'completed' || status === 'skipped') && isActive)) && (
                  <div className="border-t border-slate-200 p-5 space-y-5 bg-white">
                    {/* Dual Tabs: Theory vs Video */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab((prev) => ({ ...prev, [topic.id]: 'theory' }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                            (activeTab[topic.id] || 'theory') === 'theory'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Theory Content</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab((prev) => ({ ...prev, [topic.id]: 'videos' }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                            activeTab[topic.id] === 'videos'
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
                    {(activeTab[topic.id] || 'theory') === 'theory' && (
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
                    {activeTab[topic.id] === 'videos' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                            <Video className="w-4 h-4 text-blue-600" />
                            <span>Curated Multi-Platform Video Lessons</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">Free & Advanced Pro Masterclasses</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {(topic.videos || []).map((v) => {
                            const isCoursera = v.platform === 'Coursera';
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
                          title="Skip directly to completed"
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

                {/* Skipped result — show score and video review button */}
                {status === 'skipped' && !isActive && (
                  <div className="border-t border-green-100 px-4 py-2.5 bg-green-50/60 flex items-center justify-between">
                    <p className="text-[11px] text-green-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      <span>You passed the quiz and skipped this topic!</span>
                    </p>
                    <button
                      onClick={() => {
                        setActiveTopicId(topic.id);
                        setActiveTab((prev) => ({ ...prev, [topic.id]: 'videos' }));
                      }}
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Video className="w-3 h-3 text-blue-600" />
                      <span>Watch Topic Videos & Review →</span>
                    </button>
                  </div>
                )}

                {/* Completed result — show status and video review button */}
                {status === 'completed' && !isActive && (
                  <div className="border-t border-emerald-100 px-4 py-2.5 bg-emerald-50/60 flex items-center justify-between">
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Topic studied and marked complete!</span>
                    </p>
                    <button
                      onClick={() => {
                        setActiveTopicId(topic.id);
                        setActiveTab((prev) => ({ ...prev, [topic.id]: 'videos' }));
                      }}
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Video className="w-3 h-3 text-blue-600" />
                      <span>Watch Topic Videos & Review →</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {topics.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No topics available for this course yet.</p>
          </div>
        )}
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
        courseTitle={course?.title || 'Course'}
        courseId={courseId}
        userName={userName}
        skills={course?.skillsTaught || []}
      />
    </AppShell>
  );
}

export default function CourseLearningPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </AppShell>
      }
    >
      <CourseLearningContent />
    </Suspense>
  );
}
