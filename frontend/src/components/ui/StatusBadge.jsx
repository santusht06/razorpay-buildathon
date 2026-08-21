import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  const configs = {
    recovered: { label: 'Recovered', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    at_risk: { label: 'Revenue At Risk', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    detected: { label: 'Detected', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    analyzing: { label: 'AI Analyzing', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    recovery_planned: { label: 'Strategy Planned', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    action_executed: { label: 'Action Executed', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
    recovering: { label: 'In Recovery', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    verified: { label: 'Verified Captured', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    failed: { label: 'Failed', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    escalated: { label: 'Escalated to Merchant', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
    stopped: { label: 'Stopped (Guardrail)', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    captured: { label: 'Captured', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  };

  const cfg = configs[normalized] || { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${cfg.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {cfg.label}
    </span>
  );
};
