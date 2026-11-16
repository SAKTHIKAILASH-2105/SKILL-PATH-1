'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  BookOpen,
  Briefcase,
  Layers,
  LineChart,
  Bot,
  User,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Database,
} from 'lucide-react';

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Roadmap', href: '/roadmap', icon: MapPin, highlight: true },
    { label: 'Skill Gap Analysis', href: '/skills', icon: TrendingUp },
    { label: 'Course Catalog', href: '/courses', icon: BookOpen },
    { label: 'Career Targets', href: '/careers', icon: Briefcase },
    { label: 'Learning Resources', href: '/resources', icon: Layers },
    { label: 'Progress & Analytics', href: '/progress', icon: LineChart },
    { label: 'AI Mentor Chat', href: '/mentor', icon: Bot, badge: 'AI' },
    { label: 'AI Agent Activity', href: '/agents', icon: Sparkles, badge: '9 Agents' },
    { label: 'Learner Profile', href: '/profile', icon: User },
    { label: 'Admin Center', href: '/admin', icon: ShieldCheck, adminOnly: true },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Platform Philosophy Banner */}
      <div className="p-4 mx-3 mt-4 mb-2 rounded-xl bg-gradient-to-br from-blue-900/60 to-indigo-900/40 border border-blue-500/20 text-xs">
        <div className="flex items-center gap-1.5 text-blue-300 font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Core Innovation</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          &ldquo;Learn only what you need before learning what you want.&rdquo;
        </p>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-400 border border-indigo-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200">SkillPath AI v2.4</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
            Engine Active
          </span>
        </div>
        <p className="text-[10px] text-slate-400">Autonomous Multi-Agent Orchestrator</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-800 h-[calc(100vh-4rem)] sticky top-16 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={onClose} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
