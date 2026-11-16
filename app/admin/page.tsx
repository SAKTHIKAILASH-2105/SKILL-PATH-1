'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Briefcase,
  Layers,
  Sparkles,
  TrendingUp,
  Plus,
  Trash2,
  Edit,
  BarChart3,
  Award,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'careers' | 'courses' | 'skills' | 'resources'>('analytics');

  // Modal / Form state for CRUD
  const [isCreating, setIsCreating] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
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
    loadAdminData();
  }, []);

  const handleCreate = async () => {
    if (!newItemTitle) return;
    try {
      let entityType = 'career';
      let payload: any = { title: newItemTitle, description: newItemDesc };

      if (activeTab === 'skills') {
        entityType = 'skill';
        payload = { name: newItemTitle, description: newItemDesc, category: 'Frontend', importance: 'High' };
      } else if (activeTab === 'courses') {
        entityType = 'course';
        payload = {
          title: newItemTitle,
          description: newItemDesc,
          category: 'Software Engineering',
          difficulty: 'Intermediate',
          duration: '20 Hours',
          isPremium: false,
          prerequisiteSkillIds: [],
          skillsTaught: [],
          modulesCount: 6,
          learningObjectives: ['Master fundamental principles'],
        };
      } else if (activeTab === 'resources') {
        entityType = 'resource';
        payload = {
          title: newItemTitle,
          description: newItemDesc,
          type: 'Tutorial',
          skillId: 'skl_js',
          difficulty: 'Beginner',
          duration: '1 hr',
          isPremium: false,
          provider: 'Community Docs',
          url: 'https://developer.mozilla.org',
        };
      } else {
        payload = {
          title: newItemTitle,
          description: newItemDesc,
          estimatedDurationWeeks: 20,
          averageSalary: '$120,000 / yr',
          category: 'Engineering',
          iconName: 'Layers',
          requiredSkillIds: [],
        };
      }

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, action: 'create', data: payload }),
      });

      if (res.ok) {
        setIsCreating(false);
        setNewItemTitle('');
        setNewItemDesc('');
        setActionMsg(`New ${entityType} created successfully!`);
        setTimeout(() => setActionMsg(''), 3000);
        await loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (entityType: string, id: string) => {
    if (!confirm(`Delete this ${entityType}?`)) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, action: 'delete', data: { id } }),
      });
      if (res.ok) {
        setActionMsg(`${entityType} deleted successfully.`);
        setTimeout(() => setActionMsg(''), 3000);
        await loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  const analytics = data?.analytics || {};
  const learners = data?.learners || [];
  const careers = data?.careers || [];
  const courses = data?.courses || [];
  const skills = data?.skills || [];
  const resources = data?.resources || [];

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Curriculum Director & Analytics Console</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Platform Dashboard</h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Monitor platform performance, analyze prerequisite diagnostic pass rates, and manage careers, courses, skills, and resources.
          </p>
        </div>

        {actionMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* 4 Stat Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Total Learners</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{analytics.totalLearners || 1}</div>
            <div className="text-[11px] text-emerald-600 font-semibold">{analytics.activeLearners || 1} currently active</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Diagnostic Pass Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{analytics.assessmentPassRate || 65}%</div>
            <div className="text-[11px] text-slate-500">Benchmark ≥ 75% score</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Pro Subscribers</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{analytics.proSubscribers || 0}</div>
            <div className="text-[11px] text-slate-500">Active premium accounts</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Total Catalog Assets</span>
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {(analytics.totalCourses || 0) + (analytics.totalResources || 0)}
            </div>
            <div className="text-[11px] text-slate-500">
              {analytics.totalCourses} courses • {analytics.totalResources} resources
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'analytics', label: 'Platform Analytics' },
            { id: 'careers', label: `Careers (${careers.length})` },
            { id: 'courses', label: `Courses (${courses.length})` },
            { id: 'skills', label: `Skills (${skills.length})` },
            { id: 'resources', label: `Resources (${resources.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ANALYTICS & LEARNERS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Popular Careers */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Most Selected Careers</h3>
                <div className="space-y-2">
                  {careers.slice(0, 4).map((c: any) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{c.title}</span>
                      <span className="text-[11px] font-semibold text-slate-600">{c.averageSalary}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficult Skills */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Most Challenging Prerequisite Skills</h3>
                <p className="text-xs text-slate-500">Skills with lowest average diagnostic accuracy</p>
                <div className="space-y-2">
                  {[
                    { name: 'JavaScript Functions & Closures', avg: '38%' },
                    { name: 'DOM Event Bubbling', avg: '42%' },
                    { name: 'ES6 Asynchronous Promises', avg: '55%' },
                  ].map((s, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">{s.name}</span>
                      <span className="font-bold text-rose-600">{s.avg} Avg Score</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Registered Learners Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">Enrolled Learners</h3>
                <p className="text-xs text-slate-500">Active learners and their target career paths</p>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-6">Learner</th>
                    <th className="py-3 px-6">Email</th>
                    <th className="py-3 px-6">Target Career</th>
                    <th className="py-3 px-6">Streak</th>
                    <th className="py-3 px-6">Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {learners.map((l: any) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-3 px-6 font-bold text-slate-900">{l.name}</td>
                      <td className="py-3 px-6 text-slate-500">{l.email}</td>
                      <td className="py-3 px-6 font-medium text-slate-800">
                        {careers.find((c: any) => c.id === l.targetCareerId)?.title || l.targetCareerId}
                      </td>
                      <td className="py-3 px-6 font-mono">{l.streakDays} days</td>
                      <td className="py-3 px-6">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {l.subscriptionTier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2, 3, 4, 5: CRUD PANELS */}
        {activeTab !== 'analytics' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 capitalize">Manage {activeTab}</h3>
                <p className="text-xs text-slate-500">Add, edit, and curate curriculum database records</p>
              </div>

              <button
                onClick={() => setIsCreating(!isCreating)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add {activeTab.slice(0, -1)}</span>
              </button>
            </div>

            {/* Create Form Modal / Inline Box */}
            {isCreating && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
                <div className="font-bold text-xs text-slate-900">New {activeTab.slice(0, -1)} Entry</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Title or Name..."
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Description or summary..."
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
                  >
                    Save Entry
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              {(activeTab === 'careers'
                ? careers
                : activeTab === 'courses'
                ? courses
                : activeTab === 'skills'
                ? skills
                : resources
              ).map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-slate-900">{item.title || item.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        handleDelete(
                          activeTab === 'skills' ? 'skill' : activeTab === 'courses' ? 'course' : activeTab === 'resources' ? 'resource' : 'career',
                          item.id
                        )
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
