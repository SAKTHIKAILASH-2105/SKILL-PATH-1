'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ScoreBarChart } from '@/components/charts/ScoreBarChart';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { Suspense } from 'react';

function AssessmentContent() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params?.assessmentId as string;

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/assessments/${assessmentId}`);
      if (res.ok) {
        const d = await res.json();
        setAssessment(d.assessment);
        if (d.previousSubmissions?.length > 0) {
          // keep previous if needed
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assessmentId) loadAssessment();
  }, [assessmentId]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!assessment) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-slate-800">Assessment not found</h2>
          <Link href="/courses" className="text-blue-600 text-xs font-semibold mt-2 inline-block">
            ← Return to courses
          </Link>
        </div>
      </AppShell>
    );
  }

  const questions = assessment.questions || [];
  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const progressPct = Math.round(((currentIndex + 1) / totalQ) * 100);

  const handleSelectOption = (option: string) => {
    if (result) return; // locked after submission
    setAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Demo Simulators
  const simulateWeakScore = () => {
    const weakMap: Record<string, string> = {};
    questions.forEach((q: any) => {
      // Pick wrong answer for JS and DOM
      if (q.topic.includes('JavaScript') || q.topic.includes('DOM') || q.topic.includes('ES6')) {
        const wrong = q.options.find((opt: string) => opt !== q.correctAnswer) || q.options[0];
        weakMap[q.id] = wrong;
      } else {
        weakMap[q.id] = q.correctAnswer;
      }
    });
    setAnswers(weakMap);
  };

  const simulateHighScore = () => {
    const highMap: Record<string, string> = {};
    questions.forEach((q: any) => {
      highMap[q.id] = q.correctAnswer;
    });
    setAnswers(highMap);
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setCurrentIndex(0);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Prerequisite Diagnostic</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{assessment.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{assessment.description}</p>
          </div>

          {/* Demo shortcuts */}
          {!result && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={simulateWeakScore}
                className="px-2.5 py-1.5 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors"
                title="Fill answers that demonstrate weak JS/DOM fundamentals (<50%)"
              >
                Simulate Weak (38%)
              </button>
              <button
                type="button"
                onClick={simulateHighScore}
                className="px-2.5 py-1.5 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors"
                title="Fill all correct answers (100% Ready)"
              >
                Simulate High (100%)
              </button>
            </div>
          )}
        </div>

        {/* RESULTS SCREEN */}
        {result ? (
          <div className="space-y-6 animate-fade-in">
            {/* Score Summary Banner */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 ${
                result.submission.score >= 75
                  ? 'bg-gradient-to-b from-emerald-50 to-emerald-100/50 border-emerald-200'
                  : result.submission.score >= 50
                  ? 'bg-gradient-to-b from-amber-50 to-amber-100/50 border-amber-200'
                  : 'bg-gradient-to-b from-rose-50 to-rose-100/50 border-rose-200'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl ${
                  result.submission.score >= 75
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : result.submission.score >= 50
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                }`}
              >
                {result.submission.score}%
              </div>

              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                    result.submission.score >= 75
                      ? 'bg-emerald-200 text-emerald-900'
                      : result.submission.score >= 50
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-rose-200 text-rose-900'
                  }`}
                >
                  Readiness: {result.submission.readinessStatus}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {result.submission.score >= 75
                    ? 'Congratulations! You are Ready for React Developer Path!'
                    : result.submission.score >= 50
                    ? 'Good Attempt! Revision Required in Specific Topics.'
                    : 'Foundation Required Before Starting React!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
                  {result.submission.feedback}
                </p>
              </div>

              {/* Adaptive Action Alert */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 text-left text-xs text-slate-700 max-w-xl mx-auto space-y-1.5 shadow-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Adaptive Recommendation Agent Action:</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {result.adaptiveResult?.summary || 'Roadmap adapted to match verified diagnostic performance.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/roadmap"
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>View Updated Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={handleRetake}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Diagnostic</span>
                </button>
              </div>
            </div>

            {/* Topic-Level Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-900">Topic-Level Diagnostic Performance</h4>
                <span className="text-xs text-slate-400">Target passing score: 75%</span>
              </div>
              <ScoreBarChart topics={result.submission.topicScores} />
            </div>

            {/* Detailed Questions & Explanations Review */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              <h4 className="font-bold text-sm text-slate-900">Diagnostic Question Review</h4>

              <div className="space-y-4">
                {questions.map((q: any, i: number) => {
                  const userAns = result.submission.answers[q.id];
                  const isCorrect = userAns?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border space-y-2.5 ${
                        isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            Q{i + 1} • {q.topic}
                          </span>
                        </div>
                        {isCorrect ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-600 font-bold text-xs">
                            <XCircle className="w-4 h-4" /> Incorrect
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-slate-900">{q.question}</div>

                      <div className="text-[11px] space-y-1">
                        <div>
                          <span className="text-slate-500 font-medium">Your answer: </span>
                          <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            {userAns || '(Not answered)'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div>
                            <span className="text-slate-500 font-medium">Correct answer: </span>
                            <span className="text-emerald-700 font-bold">{q.correctAnswer}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 rounded-lg bg-white/80 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                        <strong className="text-slate-800">Pedagogical Explanation: </strong>
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE ASSESSMENT QUESTION WIZARD */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>
                  Question <strong className="text-slate-900">{currentIndex + 1}</strong> of {totalQ}
                </span>
                <span className="font-semibold text-blue-600">{currentQ.topic}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options?.map((option: string, idx: number) => {
                  const isSelected = answers[currentQ.id] === option;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(option)}
                      className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-xs ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentIndex < totalQ - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{submitting ? 'Scoring Answers...' : 'Submit Diagnostic'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AssessmentContent />
    </Suspense>
  );
}

