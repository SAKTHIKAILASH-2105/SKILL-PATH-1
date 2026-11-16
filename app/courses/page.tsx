'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import {
  BookOpen,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function CoursesPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = filterDifficulty === 'all' || c.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
    return matchesSearch && matchesDiff;
  });

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Diagnostic Prerequisite Catalog</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Curriculum & Course Catalog</h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Every course verifies your prerequisite knowledge first. If weak foundations are detected, we guide you through high-yield tutorials before starting.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses by title, topic, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 shadow-xs"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => {
            const isReady = course.readinessStatus === 'Ready';
            const isRevision = course.readinessStatus === 'Needs Revision';
            const isFoundation = course.readinessStatus === 'Foundation Required';

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-6 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        course.isPremium
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {course.isPremium ? 'PRO MASTERCLASS' : 'FREE CURRICULUM'}
                    </span>

                    <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-100">
                      {course.difficulty}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {course.description}
                  </p>

                  {/* Prerequisites checklist */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Required Prerequisites
                    </div>
                    {course.prerequisites?.length === 0 ? (
                      <div className="text-xs text-slate-500 italic">No prerequisites required (Foundational course)</div>
                    ) : (
                      <div className="space-y-1">
                        {course.prerequisites.map((p: any) => (
                          <div key={p.skillId} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700">{p.skillName}</span>
                            {p.isMet ? (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Ready
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] text-rose-500 font-semibold">
                                <Lock className="w-3 h-3" /> Unverified
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom stats and CTA */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {course.duration}
                    </span>
                    <span>{course.modulesCount} Modules</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/courses/${course.id}`}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>Details</span>
                    </Link>
                    <Link
                      href={`/courses/${course.id}/learn`}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Topics & Quiz</span>
                    </Link>
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
