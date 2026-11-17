'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  User,
  Check,
  CheckCircle2,
  X,
  Users,
  ChevronDown,
  RefreshCw,
  HelpCircle,
  Award,
  Zap,
} from 'lucide-react';
import { MentorMessage, MentorProfile } from '@/lib/types';
import { AVAILABLE_MENTORS, DEFAULT_MENTOR } from '@/lib/mentors';

export default function MentorPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMentor, setActiveMentor] = useState<MentorProfile>(DEFAULT_MENTOR);
  const [availableMentors, setAvailableMentors] = useState<MentorProfile[]>(AVAILABLE_MENTORS);
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [switchingMentor, setSwitchingMentor] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'What should I learn next?',
    'Why do I need JavaScript before React?',
    'Explain promises simply.',
    'Why did my roadmap change?',
    'I scored poorly in my assessment. What should I do?',
    'Recommend a project for my current skill level.',
    'Tell me about your background and specialty.',
  ];

  const loadMentorData = async () => {
    try {
      const res = await fetch('/api/mentor');
      if (res.ok) {
        const d = await res.json();
        if (d.messages) setMessages(d.messages);
        if (d.activeMentor) setActiveMentor(d.activeMentor);
        if (d.availableMentors) setAvailableMentors(d.availableMentors);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMentorData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectMentor = async (mentor: MentorProfile) => {
    if (activeMentor.id === mentor.id) {
      setIsMentorModalOpen(false);
      return;
    }
    setSwitchingMentor(true);
    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'select_mentor', mentorId: mentor.id }),
      });
      if (res.ok) {
        const d = await res.json();
        setActiveMentor(d.activeMentor || mentor);
        if (d.mentorMessage) {
          setMessages((prev) => [...prev, d.mentorMessage]);
        }
        setIsMentorModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSwitchingMentor(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    setLoading(true);

    // Optimistic user message
    const tempUserMsg: MentorMessage = {
      id: `temp_${Date.now()}`,
      userId: '',
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mentorId: activeMentor.id }),
      });

      if (res.ok) {
        const d = await res.json();
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          d.userMessage,
          d.mentorMessage,
        ]);
        if (d.activeMentor) setActiveMentor(d.activeMentor);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (suggestion: any) => {
    if (!suggestion) return;
    if (suggestion.actionType === 'navigate' && suggestion.payload) {
      router.push(suggestion.payload);
    } else if (suggestion.actionType === 'take_assessment' && suggestion.payload) {
      router.push(`/assessments/${suggestion.payload}`);
    } else if (suggestion.actionType === 'view_resource') {
      router.push('/resources');
    } else {
      router.push('/roadmap');
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col space-y-4">
        {/* Mentor Title & Active Mentor Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={activeMentor.avatar}
                alt={activeMentor.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md shadow-slate-200"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">{activeMentor.name}</h1>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60">
                  {activeMentor.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{activeMentor.tagline}</p>
            </div>
          </div>

          {/* Mentor Selector Trigger Button */}
          <button
            onClick={() => setIsMentorModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 group"
          >
            <Users className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Select Mentor</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Suggested Prompt Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Ask {activeMentor.name.split(' ')[0]}:</span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 whitespace-nowrap text-[11px] font-medium transition-colors shadow-2xs hover:border-slate-300 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages Box */}
        <div className="flex-1 overflow-y-auto bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const mentorName = msg.mentorName || activeMentor.name;
            const mentorAvatar = msg.mentorAvatar || activeMentor.avatar;

            return (
              <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <img
                    src={mentorAvatar}
                    alt={mentorName}
                    className="w-8 h-8 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs mt-1"
                  />
                )}

                <div className={`space-y-1.5 max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                  {!isUser && (
                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 ml-1">
                      <span>{mentorName}</span>
                      <span className="text-[9px] font-medium text-slate-400">• Mentor</span>
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Mentor Action Suggestion Button */}
                  {msg.actionSuggestion && (
                    <button
                      onClick={() => handleAction(msg.actionSuggestion)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-transform hover:scale-[1.02] ml-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{msg.actionSuggestion.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-500 italic animate-pulse">
              <img
                src={activeMentor.avatar}
                alt={activeMentor.name}
                className="w-8 h-8 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                {activeMentor.name} is formulating personalized advice based on your roadmap...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs"
        >
          <input
            type="text"
            placeholder={`Ask ${activeMentor.name.split(' ')[0]} anything about your roadmap, code, or career...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2 text-xs focus:outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* ====================================================================== */}
      {/* SELECT MENTOR MODAL                                                   */}
      {/* ====================================================================== */}
      {isMentorModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Choose Your AI Mentor</h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Select a dedicated mentor aligned with your target specialization and learning goals.
                </p>
              </div>

              <button
                onClick={() => setIsMentorModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mentor Cards Grid */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableMentors.map((mentor) => {
                  const isCurrent = activeMentor.id === mentor.id;

                  return (
                    <div
                      key={mentor.id}
                      className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Top Profile */}
                        <div className="flex items-start gap-3">
                          <img
                            src={mentor.avatar}
                            alt={mentor.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-slate-900 truncate">{mentor.name}</h4>
                              {isCurrent && (
                                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                  <Check className="w-3 h-3" />
                                  <span>Active</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-600">{mentor.title}</div>
                            <div className="text-[10px] text-blue-600 font-medium">{mentor.role}</div>
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-xs text-slate-600 mt-3 leading-relaxed">{mentor.bio}</p>

                        {/* Specialties Tags */}
                        <div className="mt-3 flex flex-wrap gap-1">
                          {mentor.specialties.map((spec, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Select Action Button */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] italic text-slate-400 line-clamp-1 max-w-[65%]">
                          &ldquo;{mentor.tagline}&rdquo;
                        </span>

                        <button
                          onClick={() => handleSelectMentor(mentor)}
                          disabled={switchingMentor || isCurrent}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isCurrent
                              ? 'bg-slate-100 text-slate-400 cursor-default'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Selected</span>
                            </>
                          ) : (
                            <>
                              <span>Select Mentor</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
              You can switch between specialized mentors at any time. Your roadmap and quiz progress remain preserved across all mentors.
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
