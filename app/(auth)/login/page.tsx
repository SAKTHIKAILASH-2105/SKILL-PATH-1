'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowRight,
  LogIn,
  AlertCircle,
  Database,
  Lock,
  Mail,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  useEffect(() => {
    fetch('/api/settings/supabase')
      .then((r) => r.json())
      .then((d) => setSupabaseConfigured(Boolean(d.configured)))
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      if (data.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign in');
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
          Sign in to your personal account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Access your personalized learning roadmaps, course mastery, and verified certificates.
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

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="••••••••"
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
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Account</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch to Sign Up */}
          <div className="text-center pt-2 border-t border-slate-800/80 space-y-2">
            <p className="text-xs text-slate-400">
              Don&apos;t have a personal account yet?{' '}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-bold hover:underline">
                Sign up free →
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
