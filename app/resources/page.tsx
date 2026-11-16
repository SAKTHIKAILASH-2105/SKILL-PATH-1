'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import {
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Lock,
  Unlock,
  Filter,
  Search,
  BookOpen,
  Video,
  FileText,
  Code,
  FolderGit2,
} from 'lucide-react';

export default function ResourcesPage() {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);
  const [userSubscription, setUserSubscription] = useState('free');

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Subscription modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedPremiumTitle, setSelectedPremiumTitle] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);

  const loadResources = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (typeFilter !== 'all') query.set('type', typeFilter);
      if (diffFilter !== 'all') query.set('difficulty', diffFilter);
      if (tierFilter !== 'all') query.set('isPremium', tierFilter === 'premium' ? 'true' : 'false');
      if (search) query.set('search', search);

      const res = await fetch(`/api/resources?${query.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setResources(d.resources || []);
        setUserSubscription(d.userSubscription || 'free');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [typeFilter, diffFilter, tierFilter, search]);

  const handleMarkComplete = async (resourceId: string) => {
    setCompletingId(resourceId);
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId }),
      });
      if (res.ok) {
        await loadResources();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCompletingId(null);
    }
  };

  const handleOpenResource = (res: any) => {
    if (res.isPremium && userSubscription === 'free') {
      setSelectedPremiumTitle(res.title);
      setIsSubModalOpen(true);
      return;
    }
    window.open(res.url, '_blank', 'noopener,noreferrer');
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'tutorial':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'documentation':
        return <FileText className="w-4 h-4 text-slate-500" />;
      case 'exercise':
        return <Code className="w-4 h-4 text-emerald-500" />;
      case 'project':
        return <FolderGit2 className="w-4 h-4 text-purple-500" />;
      default:
        return <Layers className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Knowledge Index</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Learning Resources & Exercises</h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Free high-yield tutorials, documentation, and exercises recommended first for foundational weaknesses, with premium production tracks for deep mastery.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by topic, keyword, or provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">Free & Premium</option>
              <option value="free">Free Only</option>
              <option value="premium">Premium Only</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">All Types</option>
              <option value="tutorial">Tutorial</option>
              <option value="video">Video</option>
              <option value="documentation">Documentation</option>
              <option value="exercise">Exercise</option>
              <option value="course">Course</option>
              <option value="project">Project</option>
            </select>

            <select
              value={diffFilter}
              onChange={(e) => setDiffFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => {
            const isCompleted = res.isCompleted;
            const isAccessible = res.isAccessible;

            return (
              <div
                key={res.id}
                className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all space-y-4 ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      {getTypeIcon(res.type)}
                      <span>{res.type}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        res.isPremium
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {res.isPremium ? 'PRO ONLY' : 'FREE'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {res.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="font-medium text-slate-700">{res.provider}</span>
                    <span>{res.duration}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => handleOpenResource(res)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      !res.isPremium || isAccessible
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                    }`}
                  >
                    {!res.isPremium || isAccessible ? (
                      <>
                        <span>Start Resource</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock With Pro Plan</span>
                      </>
                    )}
                  </button>

                  {/* Mark complete button for accessible resources */}
                  {(!res.isPremium || isAccessible) && (
                    <button
                      onClick={() => handleMarkComplete(res.id)}
                      disabled={completingId === res.id}
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isCompleted ? 'Completed' : 'Mark Completed'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onSuccess={() => loadResources()}
        resourceTitle={selectedPremiumTitle}
      />
    </AppShell>
  );
}
