'use client';

import React, { useState } from 'react';
import { Check, Sparkles, X, Shield, Zap, Award } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tier: string) => void;
  resourceTitle?: string;
}

export function SubscriptionModal({ isOpen, onClose, onSuccess, resourceTitle }: SubscriptionModalProps) {
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'quarterly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const plans = {
    monthly: { price: '$29', period: '/ month', billed: 'Billed monthly', save: null },
    quarterly: { price: '$79', period: '/ quarter', billed: 'Billed every 3 months ($26/mo)', save: 'Save 10%' },
    annual: { price: '$249', period: '/ year', billed: 'Billed annually ($20.75/mo)', save: 'Save 30%' },
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', billingCycle: selectedCycle }),
      });
      if (res.ok) {
        setConfirmed(true);
        setTimeout(() => {
          onSuccess('pro');
          setConfirmed(false);
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmed ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Welcome to SkillPath Pro!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your demo subscription has been activated. All enterprise masterclasses, full-stack capstone projects, and priority AI mentor responses are now unlocked!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SkillPath AI Pro Upgrade</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Unlock Premium Learning Paths
              </h2>
              {resourceTitle && (
                <p className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 inline-block">
                  Required for: &ldquo;{resourceTitle}&rdquo;
                </p>
              )}
              <p className="text-sm text-slate-600">
                Get unlimited access to production capstones, enterprise state architecture tracks, interactive coding sandboxes, and priority AI Mentor analysis.
              </p>
            </div>

            {/* Billing Cycle Switcher */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl">
              {(['monthly', 'quarterly', 'annual'] as const).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setSelectedCycle(cycle)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg capitalize transition-all ${
                    selectedCycle === cycle
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cycle}
                  {plans[cycle].save && (
                    <span className="block text-[10px] text-emerald-600 font-bold">
                      {plans[cycle].save}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{plans[selectedCycle].price}</span>
                  <span className="text-xs text-slate-500 font-medium">{plans[selectedCycle].period}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{plans[selectedCycle].billed}</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Zap className="w-3.5 h-3.5" /> Instant Demo Access
                </span>
              </div>
            </div>

            {/* Benefits Checklist */}
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Access all <strong>Premium Enterprise Courses</strong> and Docker capstones</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Adaptive reassessment with customized weakness remediation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited 24/7 AI Mentor contextual codebase questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verified Career Readiness Certificate of Completion</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Activating Pro Demo...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Start SkillPath Pro (Demo 1-Click Upgrade)</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                * Simulated demo flow. No real credit card or payment processing required.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
