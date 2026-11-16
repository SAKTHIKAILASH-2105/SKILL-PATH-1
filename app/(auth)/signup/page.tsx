'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  AlertCircle,
  Database,
  Lock,
  Mail,
  User,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetCareerId, setTargetCareerId] = useState('car_fullstack');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  useEffect(() => {
    fetch('/api/settings/supabase')
      .then((r) => r.json())
      .then((d) => setSupabaseConfigured(Boolean(d.configured)))
      .catch(() => {});
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          targetCareerId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Account creation failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            SkillPath<span className="text-blue-500"> AI</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Create your personal account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Get personal skill assessments, AI study roadmaps, and verifiable certificates.
        </p>

        {/* Supabase Status Pill */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px]">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium ${
              supabaseConfigured
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {supabaseConfigured ? 'Supabase Backend Connected' : 'Supabase Integration Available'}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl backdrop-blur space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Target Career Pathway */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Target Career Pathway</span>
              </label>
              <select
                value={targetCareerId}
                onChange={(e) => setTargetCareerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="car_fullstack">Full Stack Developer</option>
                <option value="car_react_frontend">React Frontend Specialist</option>
                <option value="car_ai_ml_engineer">AI & Machine Learning Engineer</option>
                <option value="car_data_scientist">Data Science & Analytics</option>
                <option value="car_backend_node">Backend Node.js Engineer</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Personal Account</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch to Login */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold hover:underline">
                Sign in here →
              </Link>
            </p>
          </div>
        </div>

        {/* Supabase Connection Footer Link */}
        <div className="mt-6 text-center">
          <Link
            href="/settings/supabase"
            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Configure Supabase Project & Run SQL Migration</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
