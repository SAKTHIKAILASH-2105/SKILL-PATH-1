'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowRight,
  LogIn,
  AlertCircle,
  Lock,
  Mail,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [portalType, setPortalType] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get('error');
      if (urlError) {
        setError(decodeURIComponent(urlError));
      }
      const roleParam = params.get('role');
      if (roleParam === 'admin') {
        setPortalType('admin');
        setEmail('admin@skillpath.ai');
      }
    }
  }, []);

  const handlePortalSwitch = (type: 'student' | 'admin') => {
    setPortalType(type);
    setError('');
    if (type === 'admin') {
      setEmail('admin@skillpath.ai');
      setPassword('admin123');
    } else {
      setEmail('aarav@skillpath.ai');
      setPassword('');
    }
  };

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
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          portalType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      if (data.user?.role === 'admin' || portalType === 'admin') {
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

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Authentication backend is not configured.');
      }

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        throw oauthError;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('not enabled') || msg.includes('Unsupported provider') || msg.includes('validation_failed')) {
        setError(
          'Google Provider is not enabled in your Supabase project yet. In your Supabase Dashboard, go to Authentication → Providers → Google to enable it, or log in with your email and password below.'
        );
      } else {
        setError(msg || 'Google sign-in failed. Please try again or use email & password.');
      }
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            SkillPath<span className="text-blue-500"> AI</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          {portalType === 'admin' ? 'Administrator Console' : 'Student Portal'}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          {portalType === 'admin'
            ? 'Access student enrollment metrics, course analytics, and platform governance.'
            : 'Access your personalized learning roadmaps, course mastery, and verified certificates.'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/95 border border-slate-800 py-7 px-6 sm:px-10 shadow-2xl rounded-3xl backdrop-blur space-y-5">
          {/* Two Types of Login Selector */}
          <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handlePortalSwitch('student')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                portalType === 'student'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Login</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalSwitch('admin')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                portalType === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Google OAuth Button */}
          {portalType === 'student' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-3 border border-slate-200 disabled:opacity-50"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Or with email
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>
            </>
          )}

          {/* Admin Banner Info */}
          {portalType === 'admin' && (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin: <strong>admin@skillpath.ai</strong></span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@skillpath.ai');
                  setPassword('admin123');
                }}
                className="text-[10px] font-bold underline hover:text-white"
              >
                Autofill
              </button>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{portalType === 'admin' ? 'Administrator Email' : 'Student Email Address'}</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={portalType === 'admin' ? 'admin@skillpath.ai' : 'you@domain.com'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 text-white font-bold rounded-xl text-xs shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 ${
                portalType === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>
                    {portalType === 'admin' ? 'Sign In to Admin Console' : 'Sign In as Student'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Student Switcher for convenience */}
          {portalType === 'student' && (
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60">
              <span>Demo Student:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('aarav@skillpath.ai');
                  setPassword('demo123');
                }}
                className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
              >
                Autofill Aarav Sharma
              </button>
            </div>
          )}

          {/* Bottom Switch to Sign Up */}
          <div className="text-center pt-2 border-t border-slate-800/80 space-y-2">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account yet?{' '}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-bold hover:underline">
                Create account →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
