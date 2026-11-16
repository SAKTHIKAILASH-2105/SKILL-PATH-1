'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { AgentLog } from '@/lib/types';

interface AgentActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentActivityDrawer({ isOpen, onClose }: AgentActivityDrawerProps) {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<AgentLog | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setAgents(data.agents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Multi-Agent AI Collaboration</span>
                <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  9 Specialized Agents
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Live decision timeline & roadmap influence trace</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-Agent Orchestrator Pipeline Visual */}
        <div className="px-6 py-3 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-blue-50/70 border-b border-indigo-100/60 overflow-x-auto text-xs">
          <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agent Orchestration Pipeline Flow</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 whitespace-nowrap">
            <span className="px-2 py-1 bg-white rounded border border-slate-200 shadow-xs">Profile Analyzer</span>
            <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="px-2 py-1 bg-white rounded border border-slate-200 shadow-xs">Career Analysis</span>
            <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="px-2 py-1 bg-white rounded border border-slate-200 shadow-xs">Skill Gap</span>
            <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="px-2 py-1 bg-white rounded border border-slate-200 shadow-xs">Assessment</span>
            <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="px-2 py-1 bg-white rounded border border-slate-200 shadow-xs">Learning Path</span>
            <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="px-2 py-1 bg-white rounded border border-slate-200 shadow-xs">Adaptive Agent</span>
          </div>
        </div>

        {/* Log Entries List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No agent events recorded yet. Perform an action like taking an assessment or changing careers!
            </div>
          ) : (
            logs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              const dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(isSelected ? null : log)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/30 shadow-md ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-bold text-xs text-slate-900">{log.agentName}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {log.agentRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mb-2">
                    {log.summary}
                  </p>

                  {/* Impact on Roadmap */}
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Roadmap Decision Impact: </span>
                      <span>{log.decisionImpact}</span>
                    </div>
                  </div>

                  {/* Expanded JSON Inspector */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 animate-fade-in">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                        <Terminal className="w-3 h-3" />
                        <span>Structured Agent Telemetry</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <div className="font-semibold text-slate-600 mb-1">Input Telemetry:</div>
                          <pre className="p-2 rounded bg-slate-900 text-slate-200 overflow-x-auto max-h-36">
                            {JSON.stringify(log.input, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-600 mb-1">Output Decision:</div>
                          <pre className="p-2 rounded bg-slate-900 text-emerald-300 overflow-x-auto max-h-36">
                            {JSON.stringify(log.output, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
