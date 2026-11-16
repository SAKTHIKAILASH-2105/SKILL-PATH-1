'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Compass,
  Bot,
  Sparkles,
  RotateCcw,
  User as UserIcon,
  Shield,
  Check,
  ChevronDown,
  Menu,
  LogOut,
  Database,
  UserPlus,
} from 'lucide-react';
import { SubscriptionModal } from '../SubscriptionModal';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  onOpenAgentDrawer?: () => void;
}

export function AppHeader({ onToggleSidebar, onOpenAgentDrawer }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setCurrentUser(null);
      setIsUserMenuOpen(false);
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const isPro = currentUser?.subscriptionTier === 'pro' || currentUser?.subscriptionTier === 'enterprise';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Toggle Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                  SkillPath<span className="text-blue-600"> AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  ADAPTIVE PREREQUISITE ENGINE
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Agent Activity Live Drawer Trigger */}
            <button
              onClick={onOpenAgentDrawer}
              className="relative inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors shadow-xs"
              title="Inspect 9 Multi-Agent AI decisions"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Agent Activity</span>
            </button>

            {/* Pro Subscription Badge / Upgrade CTA */}
            {isPro ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>PRO SUBSCRIBER</span>
              </span>
            ) : (
              <button
                onClick={() => setIsUpgradeOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-gradient-to-r from-amber-300 to-yellow-400 hover:from-amber-400 hover:to-yellow-500 rounded-lg shadow-xs shadow-amber-400/20 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade Pro</span>
              </button>
            )}

            {/* Authenticated User Menu or Guest Auth Buttons */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                    alt="Avatar"
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser?.name || 'Personal Account'}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {currentUser?.role === 'admin' ? 'Platform Admin' : 'Learner'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile & Skills</span>
                    </Link>

                    {currentUser.role === 'admin' && (
                      <Link
                        href="/settings/supabase"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Database className="w-3.5 h-3.5 text-slate-400" />
                        <span>Database Settings</span>
                      </Link>
                    )}

                    {currentUser.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <SubscriptionModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onSuccess={() => fetchUser()}
      />
    </>
  );
}
