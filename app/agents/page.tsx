'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  Bot,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Play,
  Layers,
  Cpu,
} from 'lucide-react';
import { AgentLog } from '@/lib/types';

export default function AgentsPage() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<AgentLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningPipeline, setRunningPipeline] = useState(false);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/agents');
      if (res.ok) {
        const d = await res.json();
        setLogs(d.logs || []);
        setAgents(d.agents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentData();
  }, []);

  const handleRunFullPipeline = async () => {
    setRunningPipeline(true);
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'full_pipeline' }),
      });
      if (res.ok) {
        const d = await res.json();
        setLogs(d.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunningPipeline(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Agent AI Telemetry & Collaboration</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">AI Agent Orchestration Center</h1>
            <p className="text-xs text-slate-500 max-w-2xl">
              Inspect how the 9 specialized agents analyze your declared profile, evaluate prerequisite diagnostics, synthesize roadmaps, and adaptively mutate curriculum stages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunFullPipeline}
              disabled={runningPipeline}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-transform hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${runningPipeline ? 'animate-spin' : ''}`} />
              <span>{runningPipeline ? 'Orchestrating Agents...' : 'Run Full Agent Pipeline'}</span>
            </button>
            <button
              onClick={loadAgentData}
              disabled={loading}
              className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 9 Specialized Agents Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((ag) => (
            <div key={ag.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <h4 className="font-bold text-xs text-slate-900">{ag.name}</h4>
              </div>
              <span className="inline-block text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {ag.role}
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {ag.purpose}
              </p>
            </div>
          ))}
        </div>

        {/* Execution Logs Timeline & Inspector */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Agent Decision Timeline</h3>
              <p className="text-xs text-slate-500">Chronological telemetry of agent execution runs and decisions</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {logs.length} Total Events
            </span>
          </div>

          <div className="space-y-4">
            {logs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              const dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(isSelected ? null : log)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/20 shadow-md ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h4 className="font-bold text-sm text-slate-900">{log.agentName}</h4>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {log.agentRole}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mb-3">
                    {log.summary}
                  </p>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Decision Impact: </strong>
                      <span>{log.decisionImpact}</span>
                    </div>
                  </div>

                  {/* Telemetry Inspector */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 animate-fade-in">
                      <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Telemetry Payload & Parameters</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="font-semibold text-slate-600 text-[11px] mb-1">Agent Input:</div>
                          <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 overflow-x-auto text-[11px] max-h-48">
                            {JSON.stringify(log.input, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-600 text-[11px] mb-1">Agent Output Decision:</div>
                          <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 overflow-x-auto text-[11px] max-h-48">
                            {JSON.stringify(log.output, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
