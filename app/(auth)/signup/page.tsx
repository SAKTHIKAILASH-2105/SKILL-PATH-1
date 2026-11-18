'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  AlertCircle,
  Lock,
  Mail,
  User,
  Briefcase,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<'student' | 'admin'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [targetCareerId, setTargetCareerId] = useState('car_fullstack');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Account Already Exists Popup State
  const [showExistsModal, setShowExistsModal] = useState(false);
  const [existingEmail, setExistingEmail] = useState('');

  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password criteria computation
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const strengthScore = [hasMinLen, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const isPasswordStrong = strengthScore === 5;

  // Countdown timer for OTP Resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtpModal && resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showOtpModal, resendCooldown]);

  // Handle Initial Form Submit -> Validate & Request OTP
  const handleInitiateSignup = async (e: React.FormEvent) => {
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
    if (!isPasswordStrong) {
      setError('Please fulfill all strong password requirements before continuing.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (accountType === 'admin' && !adminPasscode.trim()) {
      setError('Please enter the Administrator Passcode (ADMIN2026).');
      return;
    }

    setLoading(true);
    try {
      // Call OTP send API to check if account exists and send email verification code
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (res.status === 409 || data.error === 'ACCOUNT_EXISTS') {
        // Trigger the "Account Already Exists" Popup!
        setExistingEmail(email.trim().toLowerCase());
        setShowExistsModal(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to send verification code.');
      }

      // Success -> open OTP Modal
      if (data.previewCode) {
        setPreviewOtp(data.previewCode);
      }
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
      setShowOtpModal(true);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || 'An error occurred while preparing your account');
    } finally {
      setLoading(false);
    }
  };

  // Handle Digit Typing in OTP Input Boxes
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) {
      const nextDigits = [...otpDigits];
      nextDigits[index] = '';
      setOtpDigits(nextDigits);
      return;
    }

    // Support pasting multi-digit code
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('');
      const nextDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) nextDigits[i] = char;
      });
      setOtpDigits(nextDigits);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = cleaned[0];
    setOtpDigits(nextDigits);

    // Auto advance to next box
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace Key in OTP Boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend code');
      if (data.previewCode) setPreviewOtp(data.previewCode);
      setResendCooldown(60);
    } catch (err: any) {
      setOtpError(err.message || 'Could not resend verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  // Finalize Signup with Verified OTP
  const handleVerifyAndComplete = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits of your verification code.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          targetCareerId,
          accountType,
          adminPasscode,
          otpCode: code,
        }),
      });

      const data = await res.json();

      if (res.status === 409 || data.error === 'ACCOUNT_EXISTS') {
        setShowOtpModal(false);
        setExistingEmail(email.trim().toLowerCase());
        setShowExistsModal(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Account registration failed.');
      }

      // Success! Redirect to correct portal
      if (accountType === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Google OAuth Flow
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

      if (oauthError) throw oauthError;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed. Please try again or use email.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            SkillPath<span className="text-blue-500"> AI</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Create your account</h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Get personal skill assessments, AI study roadmaps, and verifiable certificates.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-slate-900/95 border border-slate-800 py-7 px-6 sm:px-10 shadow-2xl rounded-3xl backdrop-blur space-y-5">
          {/* Account Type Selector */}
          <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => {
                setAccountType('student');
                setError('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                accountType === 'student'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType('admin');
                setError('');
                if (!adminPasscode) setAdminPasscode('ADMIN2026');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                accountType === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Account</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Google OAuth */}
          {accountType === 'student' && (
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
                <span>Sign up with Google</span>
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

          <form onSubmit={handleInitiateSignup} className="space-y-4">
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
                placeholder={accountType === 'admin' ? 'e.g. Dr. Jane Smith' : 'e.g. Jane Doe'}
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

            {/* Target Career Pathway (for Students) */}
            {accountType === 'student' ? (
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
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                    <span>Administrator Passcode</span>
                  </span>
                  <span className="text-[10px] text-purple-400 font-mono">Default: ADMIN2026</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Enter ADMIN2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password (Strong)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, A-Z, 0-9, special symbol"
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border text-white text-xs placeholder:text-slate-600 focus:outline-none transition-colors ${
                    password.length > 0
                      ? isPasswordStrong
                        ? 'border-emerald-500/70 focus:border-emerald-400'
                        : 'border-amber-500/70 focus:border-amber-400'
                      : 'border-slate-800 focus:border-blue-500'
                  }`}
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

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Strength:</span>
                    <span
                      className={`font-bold ${
                        strengthScore === 5
                          ? 'text-emerald-400'
                          : strengthScore >= 3
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {strengthScore === 5
                        ? 'Strong Password ✓'
                        : strengthScore >= 3
                        ? 'Medium'
                        : 'Weak (Needs more criteria)'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-full flex-1 transition-all duration-300 rounded-full ${
                          strengthScore >= lvl
                            ? strengthScore === 5
                              ? 'bg-emerald-500'
                              : strengthScore >= 3
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Criteria Checklist */}
                  <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                    <div
                      className={`flex items-center gap-1.5 ${
                        hasMinLen ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {hasMinLen ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-3 text-center">•</span>}
                      <span>8+ characters</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        hasUpper && hasLower ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {hasUpper && hasLower ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-3 text-center">•</span>}
                      <span>Upper & lowercase</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {hasNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-3 text-center">•</span>}
                      <span>At least 1 number</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        hasSpecial ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {hasSpecial ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-3 text-center">•</span>}
                      <span>Special symbol (!@#$)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 text-white font-bold rounded-xl text-xs shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 ${
                accountType === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Details...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Verify Email & Create Account</span>
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
      </div>

      {/* ========================================================================= */}
      {/* 1. POPUP MODAL: ACCOUNT ALREADY EXISTS                                    */}
      {/* ========================================================================= */}
      {showExistsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Account Already Exists</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                An account with the email{' '}
                <span className="font-semibold text-amber-300 underline underline-offset-2">
                  {existingEmail}
                </span>{' '}
                is already registered on SkillPath Academy.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 text-left space-y-1">
              <p className="flex items-center gap-1.5 text-slate-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Your profile & courses are securely saved.</span>
              </p>
              <p className="text-[11px] text-slate-400 pl-5">
                Please sign in with your password or use Google Sign-In to access your portal.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowExistsModal(false);
                  router.push(`/login?email=${encodeURIComponent(existingEmail)}`);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExistsModal(false);
                  setEmail('');
                }}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Use a Different Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. POPUP MODAL: EMAIL OTP VERIFICATION                                   */}
      {/* ========================================================================= */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <Mail className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Verify Your Email Address</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                We sent a 6-digit verification code to:
                <br />
                <span className="font-semibold text-blue-400">{email}</span>
              </p>
            </div>

            {/* In-app code helper if email provider rate limit occurred */}
            {previewOtp && (
              <div className="p-3 bg-blue-950/60 border border-blue-500/40 rounded-2xl text-left space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Instant Verification Code:</span>
                </div>
                <div className="text-xl font-mono tracking-widest font-extrabold text-white text-center py-1 bg-slate-950/80 rounded-lg border border-blue-500/30">
                  {previewOtp}
                </div>
                <p className="text-[10px] text-blue-300/80 text-center">
                  Enter this code below to instantly activate your account.
                </p>
              </div>
            )}

            {/* 6 Digit Input Boxes */}
            <div>
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={idx === 0 ? 6 : 1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-extrabold font-mono rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                  />
                ))}
              </div>

              {otpError && (
                <p className="mt-3 text-xs text-rose-400 flex items-center justify-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{otpError}</span>
                </p>
              )}
            </div>

            {/* Verify Button */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleVerifyAndComplete}
                disabled={otpLoading || otpDigits.join('').length < 6}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {otpLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Complete Registration</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="hover:text-slate-200 transition-colors"
                >
                  ← Edit details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || otpLoading}
                  className="text-blue-400 hover:text-blue-300 font-semibold disabled:text-slate-500 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
