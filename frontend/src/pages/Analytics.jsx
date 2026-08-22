import React, { useEffect, useState } from 'react';
import { IndianRupee, TrendingUp, ShieldCheck, AlertTriangle, Cpu, Zap, CheckCircle2, ArrowUpRight, RefreshCw } from 'lucide-react';
import { api } from '../api';

// Green/Yellow/Red autonomy level badge
const LevelBadge = ({ level }) => {
  const config = {
    1: { label: 'Level 1 · Auto Recover', bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', dot: 'bg-emerald-500', desc: 'Fully Autonomous' },
    2: { label: 'Level 2 · Auto Communicate', bg: 'bg-amber-50 border-amber-200 text-amber-800', dot: 'bg-amber-500', desc: 'Customer Participates' },
    3: { label: 'Level 3 · Merchant Approval', bg: 'bg-rose-50 border-rose-200 text-rose-800', dot: 'bg-rose-500', desc: 'Human Override Required' },
  }[level];
  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black border ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const summary = data?.summary || {};
  const autonomy = data?.autonomy_breakdown || {};

  const totalAutonomyActions = (autonomy.level1_auto_recovered || 0) + (autonomy.level2_auto_communication || 0) + (autonomy.level3_merchant_approval || 0);
  const fullyAutoPercent = totalAutonomyActions > 0
    ? Math.round(((autonomy.level1_auto_recovered || 0) + (autonomy.level2_auto_communication || 0)) / totalAutonomyActions * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#02042B] tracking-tight">Financial Analytics</h1>
          <p className="text-xs text-slate-600 mt-1 font-semibold">
            All data computed in real-time from your MongoDB case and action records.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Cards — real data from backend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Revenue at Risk', value: `₹${(summary.revenue_at_risk || 0).toLocaleString('en-IN')}`, sub: `${summary.total_cases || 0} payment events`, icon: IndianRupee, color: 'rose' },
          { title: 'Revenue Recovered', value: `₹${(summary.revenue_recovered || 0).toLocaleString('en-IN')}`, sub: `${summary.recovered_count || 0} verified captures`, icon: TrendingUp, color: 'emerald' },
          { title: 'AI Recovery Rate', value: `${summary.recovery_rate_pct || 0}%`, sub: 'vs 32% rules baseline', icon: ShieldCheck, color: 'blue' },
          { title: 'Escalated (VIP)', value: summary.escalated_count || 0, sub: 'High-value guardrail blocks', icon: AlertTriangle, color: 'amber' },
        ].map(({ title, value, sub, icon: Icon, color }) => (
          <div key={title} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{title}</span>
              <div className={`p-2 rounded-xl bg-${color}-50 border border-${color}-100`}>
                <Icon className={`w-4 h-4 text-${color}-600`} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-slate-900 tracking-tight font-sans">{value}</div>
              <div className={`text-xs text-${color}-700 font-bold mt-1`}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* === 3-LEVEL AUTONOMY BREAKDOWN === */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#0C54EA]" />
              <span>Autonomy Level Breakdown</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              How the AI agent resolved each case — computed from live MongoDB data
            </p>
          </div>
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            {fullyAutoPercent}% handled without merchant
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Level 1 */}
          <div className="p-6 space-y-3">
            <LevelBadge level={1} />
            <div className="text-3xl font-black text-slate-900 font-sans">
              {autonomy.level1_auto_recovered || 0}
            </div>
            <div className="text-xs text-slate-600 font-semibold leading-relaxed">
              Low-risk cases where the agent detected, decided, executed, and verified recovery entirely without merchant input.
            </div>
            <div className="pt-2 space-y-1.5 text-xs">
              {[
                'Amount < ₹50,000 guardrail limit',
                'Failure is retryable (not fraud/stolen)',
                'Customer reliability score ≥ 0.75',
                'Retry count within policy (< 3)'
              ].map(t => (
                <div key={t} className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Level 2 */}
          <div className="p-6 space-y-3">
            <LevelBadge level={2} />
            <div className="text-3xl font-black text-slate-900 font-sans">
              {autonomy.level2_auto_communication || 0}
            </div>
            <div className="text-xs text-slate-600 font-semibold leading-relaxed">
              Agent automatically sent recovery emails or payment method update links. Customer participates, merchant does not.
            </div>
            <div className="pt-2 space-y-1.5 text-xs">
              {[
                'Expired card or soft decline detected',
                'Agent sends personalized recovery link',
                'Customer updates card / completes checkout',
                'System detects captured payment automatically'
              ].map(t => (
                <div key={t} className="flex items-center space-x-1.5 text-amber-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Level 3 */}
          <div className="p-6 space-y-3">
            <LevelBadge level={3} />
            <div className="text-3xl font-black text-slate-900 font-sans">
              {autonomy.level3_merchant_approval || 0}
            </div>
            <div className="text-xs text-slate-600 font-semibold leading-relaxed">
              High-value transactions where the deterministic policy guardrail blocked automatic execution and escalated to merchant.
            </div>
            <div className="pt-2 space-y-1.5 text-xs">
              {[
                'Amount exceeds ₹50,000 auto-limit',
                'AI recommends action — policy blocks it',
                'Case escalated to merchant dashboard',
                'Merchant approves → agent executes'
              ].map(t => (
                <div key={t} className="flex items-center space-x-1.5 text-rose-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === Real Strategy & Failure Reason Breakdown === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500 fill-current" />
            <span>Revenue Recovered by AI Strategy</span>
          </h3>
          <div className="space-y-2 text-xs">
            {loading ? (
              <div className="text-slate-400 py-4 text-center font-medium">Computing from live data...</div>
            ) : (data?.recovery_by_strategy || []).length === 0 ? (
              <div className="text-slate-400 py-4 text-center font-medium">No recovery actions executed yet. Run a demo scenario above.</div>
            ) : (
              (data?.recovery_by_strategy || []).map((s, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="font-black text-slate-900 font-mono text-[11px]">{s.strategy}</div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{s.count} execution{s.count !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-700">₹{(s.recovered_amount || 0).toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Recovered</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#0C54EA]" />
            <span>Recovery Rate by Failure Reason</span>
          </h3>
          <div className="space-y-2 text-xs">
            {loading ? (
              <div className="text-slate-400 py-4 text-center font-medium">Computing from live data...</div>
            ) : (data?.recovery_by_failure_reason || []).length === 0 ? (
              <div className="text-slate-400 py-4 text-center font-medium">No failure cases in database yet.</div>
            ) : (
              (data?.recovery_by_failure_reason || []).map((r, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="font-mono font-black text-slate-900 capitalize text-[11px]">{r.reason}</div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{r.count} case{r.count !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black text-sm ${r.recovered_rate >= 70 ? 'text-emerald-700' : r.recovered_rate > 0 ? 'text-amber-700' : 'text-rose-600'}`}>
                      {r.recovered_rate}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold">Conversion</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
