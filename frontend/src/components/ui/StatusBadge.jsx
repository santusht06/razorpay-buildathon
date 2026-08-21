import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  const configs = {
    recovered: { label: 'Recovered', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    detected: { label: 'Detected', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    diagnosing: { label: 'Diagnosing', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
    action_recommended: { label: 'AI Recommended', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    policy_checked: { label: 'Policy Checked', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
    action_executed: { label: 'Action Executed', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    verified: { label: 'Verified', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    failed: { label: 'Failed', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    escalated: { label: 'Escalated to Merchant', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    stopped: { label: 'Stopped (Guardrail)', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
    captured: { label: 'Captured', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' }
  };

  const cfg = configs[normalized] || { label: status, bg: 'bg-slate-500/10 text-slate-300 border-slate-500/30' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {cfg.label}
    </span>
  );
};
