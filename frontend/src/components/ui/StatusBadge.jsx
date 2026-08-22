import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  const configs = {
    recovered:         { label: '✓ Recovered',          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', pulse: 'bg-emerald-500' },
    at_risk:           { label: '⚠ Revenue At Risk',    bg: 'bg-amber-50 text-amber-700 border-amber-200',       pulse: 'bg-amber-500' },
    detected:          { label: 'Detected',              bg: 'bg-blue-50 text-blue-700 border-blue-200',          pulse: 'bg-blue-500' },
    analyzing:         { label: 'AI Analyzing…',         bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',    pulse: 'bg-indigo-500' },
    recovery_planned:  { label: 'Strategy Planned',      bg: 'bg-purple-50 text-purple-700 border-purple-200',    pulse: 'bg-purple-500' },
    action_executed:   { label: 'Action Executed',       bg: 'bg-sky-50 text-sky-700 border-sky-200',             pulse: 'bg-sky-500' },
    recovering:        { label: '● In Recovery',         bg: 'bg-blue-50 text-blue-700 border-blue-200',          pulse: 'bg-blue-500' },
    verified:          { label: '✓ Verified Captured',   bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', pulse: 'bg-emerald-500' },
    failed:            { label: '✗ Failed',              bg: 'bg-rose-50 text-rose-700 border-rose-200',          pulse: 'bg-rose-500' },
    escalated:         { label: '↑ Escalated to Merchant', bg: 'bg-orange-50 text-orange-700 border-orange-200', pulse: 'bg-orange-500' },
    stopped:           { label: '⊘ Guardrail Blocked',  bg: 'bg-slate-100 text-slate-600 border-slate-300',      pulse: 'bg-slate-400' },
    captured:          { label: '✓ Captured',            bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', pulse: 'bg-emerald-500' },
  };

  const cfg = configs[normalized] || { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200', pulse: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.pulse} mr-1.5 animate-pulse`} />
      {cfg.label}
    </span>
  );
};

/**
 * Determines autonomy level of a case:
 * 1 = Fully auto (recovered without merchant)
 * 2 = Auto-communicate (in recovery / email sent)
 * 3 = Human approval needed (escalated)
 */
export const getAutonomyLevel = (caseItem) => {
  const status = (caseItem?.status || caseItem?.recovery_status || '').toLowerCase();
  const amount = caseItem?.amount_at_risk || 0;
  if (status === 'escalated') return 3;
  if (status === 'recovered' && amount < 50000) return 1;
  if (['recovering', 'recovery_planned', 'action_executed'].includes(status)) return 2;
  return null;
};

export const AutonomyBadge = ({ caseItem }) => {
  const level = getAutonomyLevel(caseItem);
  if (!level) return null;
  const configs = {
    1: { label: 'L1 · Auto', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', title: 'Level 1 — Fully autonomous. Agent detected, decided, executed, and verified without merchant.' },
    2: { label: 'L2 · Notified', bg: 'bg-amber-50 text-amber-700 border-amber-200', title: 'Level 2 — Agent automatically contacted customer. Merchant not involved.' },
    3: { label: 'L3 · Approval', bg: 'bg-rose-50 text-rose-700 border-rose-200', title: 'Level 3 — High-value case. Policy blocked auto-execution. Awaiting merchant approval.' },
  }[level];
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black border ${configs.bg}`} title={configs.title}>
      {configs.label}
    </span>
  );
};
