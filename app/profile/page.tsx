'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import {
  User,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Save,
  Award,
  FolderGit2,
  Code2,
  Clock,
  BookOpen,
  Briefcase,
  Database,
  ExternalLink,
} from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [profile, setProfile] = useState<any>({
    name: '',
    email: '',
    education: '',
    experience: '',
    weeklyHours: 15,
    preferredStyle: '',
  });

  const [skills, setSkills] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  // New Skill Modal / Inputs
  const [newSkillId, setNewSkillId] = useState('');
  const [newProficiency, setNewProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  // New Cert Inputs
  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');

  // New Project Inputs
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.user.name,
          email: data.user.email,
          education: data.user.education,
          experience: data.user.experience,
          weeklyHours: data.user.weeklyHours,
          preferredStyle: data.user.preferredStyle,
        });
        setSkills(data.skills || []);
        setCerts(data.certifications || []);
        setProjects(data.projects || []);
      }

      const skillsRes = await fetch('/api/user/skills');
      if (skillsRes.ok) {
        const sdata = await skillsRes.json();
        setAllSkills(sdata.allAvailableSkills || []);
        if (sdata.allAvailableSkills?.length > 0) {
          setNewSkillId(sdata.allAvailableSkills[0].id);
        }
      }

      fetch('/api/settings/supabase')
        .then((r) => r.json())
        .then((d) => setSupabaseConfigured(Boolean(d.configured)))
        .catch(() => {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSuccessMsg('Profile saved successfully! Profile Analyzer Agent re-calibrated your velocity.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillId) return;
    try {
      const res = await fetch('/api/user/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: newSkillId, proficiency: newProficiency }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      const res = await fetch(`/api/user/skills?skillId=${skillId}`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCert = async () => {
    if (!certTitle || !certIssuer) return;
    try {
      const res = await fetch('/api/user/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: certTitle, issuer: certIssuer }),
      });
      if (res.ok) {
        setCertTitle('');
        setCertIssuer('');
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCert = async (id: string) => {
    try {
      const res = await fetch(`/api/user/certifications?id=${id}`, { method: 'DELETE' });
      if (res.ok) await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProject = async () => {
    if (!projTitle || !projDesc) return;
    try {
      const res = await fetch('/api/user/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: projTitle, description: projDesc, techStack: projTech }),
      });
      if (res.ok) {
        setProjTitle('');
        setProjDesc('');
        setProjTech('');
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/user/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Learner Profile & Credentials</h1>
          <p className="text-xs text-slate-500">
            Keep your background updated so the Profile Analyzer Agent can optimize your roadmap velocity and prerequisite checks.
          </p>
        </div>

        {/* Supabase Connection Status Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-700 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span>Cloud Database:</span>
                <span className={supabaseConfigured ? 'text-emerald-400 font-extrabold' : 'text-amber-400 font-extrabold'}>
                  {supabaseConfigured ? 'Supabase PostgreSQL Connected ✓' : 'Local Storage (Supabase Setup Available)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {supabaseConfigured
                  ? 'Your personal account and progress are synced with your Supabase cloud backend.'
                  : 'Connect your Supabase project URL & Anon Key to enable live cloud sync and multi-device persistence.'}
              </p>
            </div>
          </div>

          <Link
            href="/settings/supabase"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <span>{supabaseConfigured ? 'Manage Supabase' : 'Connect Supabase'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Basic Info Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            <span>Personal & Educational Background</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Education / Degree</label>
                <input
                  type="text"
                  value={profile.education}
                  onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  placeholder="e.g. B.Tech Computer Science, 3rd Year"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Weekly Learning Hours</label>
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={profile.weeklyHours}
                  onChange={(e) => setProfile({ ...profile, weeklyHours: parseInt(e.target.value) || 10 })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relevant Experience</label>
              <textarea
                rows={2}
                value={profile.experience}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                placeholder="Describe your prior programming or academic experience..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Learning Style</label>
              <input
                type="text"
                value={profile.preferredStyle}
                onChange={(e) => setProfile({ ...profile, preferredStyle: e.target.value })}
                placeholder="e.g. Hands-on coding sandboxes & structured interactive tutorials"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Current Skills Management */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>Current Skills & Proficiency</span>
            </div>
            <span className="text-xs text-slate-500">{skills.length} skills tracked</span>
          </div>

          {/* Add Skill Row */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Select Skill</label>
              <select
                value={newSkillId}
                onChange={(e) => setNewSkillId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                {allSkills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-44">
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Proficiency Level</label>
              <select
                value={newProficiency}
                onChange={(e) => setNewProficiency(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="Beginner">Beginner (35%)</option>
                <option value="Intermediate">Intermediate (70%)</option>
                <option value="Advanced">Advanced (100%)</option>
              </select>
            </div>

            <div className="w-full sm:w-auto pt-4 sm:pt-4">
              <button
                type="button"
                onClick={handleAddSkill}
                className="w-full sm:w-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {skills.map((s) => (
              <div
                key={s.skillId}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{s.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                      {s.proficiency}
                    </span>
                    {s.verifiedScore ? (
                      <span className="text-[10px] text-emerald-600 font-bold">
                        {s.verifiedScore}% Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Self-declared</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSkill(s.skillId)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications & Projects 2-Col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Certifications */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Certifications</span>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Certificate title..."
                value={certTitle}
                onChange={(e) => setCertTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Issuer (e.g. Coursera)..."
                  value={certIssuer}
                  onChange={(e) => setCertIssuer(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAddCert}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {certs.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{c.title}</div>
                    <div className="text-[10px] text-slate-500">{c.issuer} • {c.date}</div>
                  </div>
                  <button onClick={() => handleDeleteCert(c.id)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              <FolderGit2 className="w-4 h-4 text-purple-600" />
              <span>Verified Projects</span>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Project title..."
                value={projTitle}
                onChange={(e) => setProjTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
              />
              <input
                type="text"
                placeholder="Description..."
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tech stack (e.g. Python, SQL)..."
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {projects.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{p.title}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{p.description}</div>
                  </div>
                  <button onClick={() => handleDeleteProject(p.id)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
