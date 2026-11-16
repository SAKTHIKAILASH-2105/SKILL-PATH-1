'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Key,
  Globe,
  Terminal,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const SQL_MIGRATION = `-- ==============================================================================
-- PROMPTWARS / SKILLPATH AI - SUPABASE SCHEMA & MIGRATION
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'learner',
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  education TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  target_career_id TEXT DEFAULT 'car_fullstack',
  weekly_hours INTEGER DEFAULT 15,
  preferred_style TEXT DEFAULT 'Hands-on projects & videos',
  streak_days INTEGER DEFAULT 1,
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    avatar_url,
    target_career_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'),
    COALESCE(NEW.raw_user_meta_data->>'target_career_id', 'car_fullstack')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. USER SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  proficiency TEXT NOT NULL DEFAULT 'Beginner',
  verified_score INTEGER,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- 5. USER CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USER TOPIC PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.user_topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, topic_id)
);

-- 7. USER PROGRESS & VELOCITY TABLE
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_stage_id TEXT DEFAULT 'stage_1',
  overall_progress_pct INTEGER DEFAULT 0,
  weekly_goal_hours INTEGER DEFAULT 15,
  hours_logged_this_week INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 1,
  last_active_date TIMESTAMPTZ DEFAULT NOW()
);

-- 8. USER PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills_used TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Completed',
  github_url TEXT,
  live_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles can be viewed by owner"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users manage own skills"
  ON public.user_skills FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own certifications"
  ON public.user_certifications FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own topic progress"
  ON public.user_topic_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own progress"
  ON public.user_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own projects"
  ON public.user_projects FOR ALL USING (auth.uid() = user_id);
`;

export default function SupabaseSettingsPage() {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [serviceRoleKey, setServiceRoleKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/supabase');
      if (res.ok) {
        const data = await res.json();
        if (data.url && !data.url.includes('your-project-id')) {
          setUrl(data.url);
        }
        setTestResult(data.test);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/settings/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, anonKey, serviceRoleKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save credentials');
      }

      setStatusMsg({ type: 'success', text: data.message });
      setTestResult(data.test);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/settings/supabase');
      if (res.ok) {
        const data = await res.json();
        setTestResult(data.test);
      }
    } catch (e: any) {
      setTestResult({ ok: false, message: e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleCopySql = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(SQL_MIGRATION);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-3.5 h-3.5" />
              <span>Database & Cloud Architecture</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Supabase Connection & Setup
            </h1>
            <p className="text-xs text-slate-500">
              Connect PromptWars to your own Supabase project for PostgreSQL persistence, user authentication, and real-time syncing.
            </p>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        {/* Live Status Card */}
        <div
          className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            testResult?.ok
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                testResult?.ok
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                  : 'bg-amber-100 text-amber-700 border-amber-300'
              }`}
            >
              {testResult?.ok ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-bold flex items-center gap-2">
                <span>Status:</span>
                <span className={testResult?.ok ? 'text-emerald-700' : 'text-amber-800 font-extrabold'}>
                  {testResult?.ok ? 'Supabase Connected ✓' : 'Supabase Credentials Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-xl">
                {testResult?.message ||
                  'Enter your Supabase Project URL and Anon Public Key below to establish a live connection.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>{testing ? 'Testing...' : 'Test Connection'}</span>
          </button>
        </div>

        {/* Credentials Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Project API Credentials</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Found in your Supabase Dashboard under <strong>Project Settings → API</strong>. These are saved securely to your local <code className="text-blue-600">.env.local</code>.
            </p>
          </div>

          {statusMsg && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>NEXT_PUBLIC_SUPABASE_URL</span>
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Your unique project REST URL ending with <code className="text-slate-600">.supabase.co</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              </label>
              <input
                type="text"
                required
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The public anon JWT key safe for client-side API calls.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>SUPABASE_SERVICE_ROLE_KEY (Optional)</span>
              </label>
              <input
                type="password"
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value)}
                placeholder="Optional backend admin secret"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Used only for administrative server bypasses. Never exposed to browser clients.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving & Connecting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Credentials & Connect</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Turnkey SQL Schema Migration */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span>Turnkey SQL Migration Script</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Copy and paste this script into your Supabase SQL Editor to provision tables, triggers, and Row Level Security.
              </p>
            </div>

            <button
              onClick={handleCopySql}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs shrink-0 ${
                copiedSql
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {copiedSql ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard! ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy SQL Migration</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">1</span>
              <div className="font-bold text-xs text-slate-900">Copy the SQL Script</div>
              <p className="text-[11px] text-slate-500">Click the button above to copy the schema.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">2</span>
              <div className="font-bold text-xs text-slate-900">Open SQL Editor</div>
              <p className="text-[11px] text-slate-500">In Supabase dashboard, select SQL Editor & create new query.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">3</span>
              <div className="font-bold text-xs text-slate-900">Run Migration</div>
              <p className="text-[11px] text-slate-500">Paste and click &ldquo;Run&rdquo;. Your cloud database is ready!</p>
            </div>
          </div>

          {/* Code Viewer Box */}
          <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 overflow-hidden font-mono text-[11px] text-slate-300 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre">{SQL_MIGRATION}</pre>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
