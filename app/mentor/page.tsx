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
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { MentorMessage } from '@/lib/types';

export default function MentorPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'What should I learn next?',
    'Why do I need JavaScript before React?',
    'Explain promises simply.',
    'Why did my roadmap change?',
    'I scored poorly in my assessment. What should I do?',
    'Recommend a project for my current skill level.',
  ];

  const loadMessages = async () => {
    try {
      const res = await fetch('/api/mentor');
      if (res.ok) {
        const d = await res.json();
        setMessages(d.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const d = await res.json();
        setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), d.userMessage, d.mentorMessage]);
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
        {/* Mentor Title Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Autonomous AI Mentor</span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Contextually Active
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Trained on your real-time skills, diagnostic scores, and active roadmap
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            Powered by Contextual Fallback / Gemini Provider
          </div>
        </div>

        {/* Suggested Prompt Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Try asking:</span>
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

            return (
              <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
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
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-transform hover:scale-[1.02]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{msg.actionSuggestion.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-500 italic animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                AI Mentor is formulating response based on your roadmap and gaps...
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
            placeholder="Ask AI Mentor anything about your roadmap, assessments, or code..."
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
    </AppShell>
  );
}
