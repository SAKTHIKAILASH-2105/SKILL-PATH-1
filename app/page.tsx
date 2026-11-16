'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Bot,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Layers,
  Award,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-500 selection:text-white font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 sticky top-0 z-50 bg-slate-900/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              SkillPath<span className="text-blue-500"> AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#multi-agent" className="hover:text-white transition-colors">Multi-Agent AI</a>
            <a href="#resources" className="hover:text-white transition-colors">Free vs Premium</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-2 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-xs font-semibold text-blue-300 mb-8 animate-fade-in shadow-xs">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Core Innovation: Adaptive Prerequisite Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
          Learn <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">only what you need</span> before learning what you want.
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop struggling through complex courses with unaddressed prerequisite gaps. SkillPath AI runs diagnostic checks, pinpoints missing foundations, and adaptively prescribes free targeted modules before unlocking advanced tracks.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>Create Personal Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In to Account</span>
          </Link>
        </div>

        {/* Live Simulation Card */}
        <div className="mt-16 max-w-4xl mx-auto bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-2xl text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-700/60 gap-4">
            <div>
              <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-1">
                Real-Time Prerequisite Verification Example
              </div>
              <h3 className="text-xl font-bold text-white">Target Course: React Developer Path</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5" />
              <span>Diagnostic Required (JavaScript & DOM)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-sm">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-300">HTML & CSS</span>
                <span className="text-xs text-emerald-400 font-bold">Passed (85%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[85%]" />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Semantic markup & layout ready.</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-rose-300">JS Functions & DOM</span>
                <span className="text-xs text-rose-400 font-bold">Weak (38%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[38%]" />
              </div>
              <p className="text-[11px] text-rose-300 mt-2">Adaptive Agent: Foundation module injected.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-300">React Components</span>
                <span className="text-xs text-slate-500 font-bold">Locked</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-700 h-full w-[0%]" />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Unlocks upon diagnostic score ≥ 75%.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & The Solution */}
      <section id="problem" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">The Broken Reality</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
            Why 90% of online learners quit before reaching their career goal.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Most platforms serve monolithic 60-hour courses. When a student doesn&apos;t understand closures or array mutation in JavaScript, they fail React and abandon the path entirely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-rose-950/10 border border-rose-500/20 space-y-4">
            <h3 className="text-xl font-bold text-rose-300">The Traditional Model</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold text-lg leading-none">✕</span>
                <span>Assume all learners possess the exact same background.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold text-lg leading-none">✕</span>
                <span>Force beginners into complex frameworks before checking prerequisites.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold text-lg leading-none">✕</span>
                <span>Rigid linear courses that never adapt to assessment failures.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold text-lg leading-none">✕</span>
                <span>Zero insight into whether foundational knowledge actually stuck.</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-4">
            <h3 className="text-xl font-bold text-blue-300">The SkillPath AI Model</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Prerequisite Gatekeeper:</strong> Diagnostic assessment verifies readiness before starting.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Adaptive Remediation:</strong> If weak in DOM or functions, free targeted tutorials are injected automatically.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Reassessment Verification:</strong> Re-test weak topics. Once score ≥75%, main course unlocks!</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Preserves Career Skills:</strong> Switching to Data Science preserves Python & SQL without restarting.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
            The 4-Step Adaptive Learning Loop
          </h2>
          <p className="text-slate-400 text-sm">
            Continuous diagnosis, targeted remediation, and automatic roadmap adaptation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Select Career & Declare Skills',
              desc: 'Select a target role like Full Stack Developer. Declare current proficiencies in Python, SQL, or HTML.',
              icon: TrendingUp,
            },
            {
              step: '02',
              title: 'Take Prerequisite Diagnostic',
              desc: 'Before taking React, take a 5-minute diagnostic covering JavaScript fundamentals, functions, and the DOM.',
              icon: ShieldCheck,
            },
            {
              step: '03',
              title: 'Adaptive Remediation',
              desc: 'Scored <50% in functions? The Adaptive Agent injects free high-yield tutorials directly into your roadmap.',
              icon: Zap,
            },
            {
              step: '04',
              title: 'Verify & Unlock Course',
              desc: 'Retake the assessment. Score ≥75% unlocks React and marks prerequisite milestones complete!',
              icon: Unlock,
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 relative group hover:border-blue-500/50 transition-colors">
                <span className="text-3xl font-black text-slate-700 group-hover:text-blue-500/40 transition-colors">
                  {s.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center my-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base mb-2">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Multi-Agent Architecture */}
      <section id="multi-agent" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Multi-Agent AI Systems</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
            9 Specialized AI Agents Collaborating In Real Time
          </h2>
          <p className="text-slate-400 text-sm">
            Orchestrated by the central <code className="text-purple-300">AgentOrchestrator</code> service, each agent manages a dedicated phase of curriculum generation, diagnostic evaluation, and roadmap adaptation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {[
            { name: 'Profile Analyzer Agent', role: 'Learner Skill Normalization', desc: 'Extracts and normalizes declared skills, analyzes certifications and projects, estimates velocity.' },
            { name: 'Career Analysis Agent', role: 'Target Career Breakdown', desc: 'Analyzes target career requirements, constructs prerequisite dependency graphs.' },
            { name: 'Skill Gap Agent', role: 'Deficiency & Readiness Scoring', desc: 'Compares user skills against target competencies and prioritizes weak & missing skills.' },
            { name: 'Assessment Agent', role: 'Diagnostic Evaluation', desc: 'Calculates overall score, generates topic breakdown, classifies readiness into 3 tiers.' },
            { name: 'Learning Path Agent', role: 'Roadmap Sequencing', desc: 'Sequences stages respecting prerequisite order, enforcing "learn only what you need".' },
            { name: 'Resource Recommendation Agent', role: 'Resource Curation', desc: 'Ranks free tutorials first for weak topics, tiers premium projects when suitable.' },
            { name: 'Progress Tracking Agent', role: 'Activity Logging', desc: 'Detects learning velocity, credits study hours, updates verified skill mastery.' },
            { name: 'Adaptive Recommendation Agent', role: 'Curriculum Adaptation', desc: 'Dynamically injects remedial modules on low scores, skips basics on 75%+, re-routes on career change.' },
            { name: 'AI Mentor Agent', role: 'Pedagogical Guidance', desc: 'Answers questions in context of learner gaps, scores, and roadmap with clickable action links.' },
          ].map((agent, i) => (
            <div key={i} className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="font-bold text-sm text-white">{agent.name}</span>
              </div>
              <div className="text-[10px] text-purple-300 font-semibold mb-2">{agent.role}</div>
              <p className="text-slate-400 leading-relaxed">{agent.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Free vs Premium Resources */}
      <section id="resources" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Resource Philosophy</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
            Free High-Yield Resources First, Premium When Ready
          </h2>
          <p className="text-slate-400 text-sm">
            We curate the best open documentation and tutorials (MDN, freeCodeCamp, official docs). Premium masterclasses and production capstones are available for advanced subscribers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700">
            <span className="text-xs font-bold text-emerald-400 uppercase">Always Free For All Learners</span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-4">Open Web Knowledge Base</h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All Prerequisite Diagnostic Assessments & Score Breakdowns</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Targeted Free Tutorials (MDN Web Docs, freeCodeCamp, JavaScript.info)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Personalized Adaptive Roadmap Generation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Skill-Gap Radar Chart & Career Readiness Analysis</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/40 relative">
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold">
              PRO / ENTERPRISE
            </div>
            <span className="text-xs font-bold text-indigo-300 uppercase">Advanced Deep-Dives</span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-4">SkillPath Pro Masterclasses</h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Enterprise Architecture Courses (React 19, Node.js Streams & Security)</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Production Full-Stack Capstones with Docker & CI/CD Pipelines</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Unlimited Contextual AI Mentor Queries & Project Recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Verified Career Readiness Certificate of Completion</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 px-4 text-center border-t border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
          Ready to experience true adaptive learning?
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-8">
          Create your personal account now to get adaptive prerequisite evaluations, tailored roadmaps, and verified certificates.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <p>© 2026 SkillPath AI. Autonomous Multi-Agent Adaptive Learning Architecture.</p>
      </footer>
    </div>
  );
}
