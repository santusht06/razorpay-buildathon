import React, { useEffect, useState } from 'react';
import { IndianRupee, TrendingUp, RotateCcw, AlertTriangle, ShieldCheck, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from '../api';

export const Dashboard = ({ onSelectCase, onOpenSimulator }) => {
  const [metrics, setMetrics] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, cRes] = await Promise.all([
        api.getMetrics(),
        api.getCases({ limit: 6 })
      ]);
      setMetrics(mRes.data);
      setRecentCases(cRes.data.cases || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 fill-current text-amber-300" />
            <span>Autonomous Revenue Recovery Core</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Merchant Risk & Recovery Command Center</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Detect payment failures in real-time, diagnose failure causes via LangChain RAG agent, enforce security policy guardrails, and safely recover lost revenue.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onOpenSimulator}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-600/30 flex items-center space-x-2 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-current" />
            <span>Test Webhook Event</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue at Risk"
          value={`₹${(metrics?.revenue_at_risk || 0).toLocaleString('en-IN')}`}
          subtext="Total failed transactions detected"
          icon={IndianRupee}
          color="rose"
        />
        <MetricCard
          title="Revenue Recovered"
          value={`₹${(metrics?.revenue_recovered || 0).toLocaleString('en-IN')}`}
          subtext="Actual revenue saved by AI agent"
          trend="+₹4,998 today"
          icon={TrendingUp}
          color="emerald"
        />
        <MetricCard
          title="Recovery Success Rate"
          value={`${metrics?.recovery_rate_pct || 0}%`}
          subtext="Successful recovery ratio"
          trend="vs 32% baseline"
          icon={ShieldCheck}
          color="blue"
        />
        <MetricCard
          title="Active Recovery Cases"
          value={metrics?.active_recoveries || 0}
          subtext="Cases currently in recovery pipeline"
          icon={RotateCcw}
          color="amber"
        />
      </div>

      {/* Recent Recovery Cases Stream Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-base">Active Recovery Pipeline Stream</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status of payment failure recovery cases managed by AI Agent & Guardrails</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Case & Payment</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Amount at Risk</th>
                <th className="py-3.5 px-4">Failure Diagnosis</th>
                <th className="py-3.5 px-4">Agent Strategy</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {recentCases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No recovery cases found. Click "Test Webhook Event" above to create one live!
                  </td>
                </tr>
              ) : (
                recentCases.map((item) => (
                  <tr key={item.case_id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-100">{item.case_id}</div>
                      <div className="text-[11px] font-mono text-slate-500">{item.payment_id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{item.customer_name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{item.customer_email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100">₹{item.amount_at_risk?.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-500">LTV: ₹{item.customer_ltv?.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                        {item.failure_reason}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 capitalize font-medium">{item.selected_strategy?.replace(/_/g, ' ') || 'Analyzing...'}</div>
                      <div className="text-[10px] text-emerald-400">Prob: {Math.round((item.recovery_probability || 0.8) * 100)}%</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectCase(item.case_id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 transition-colors border border-slate-700"
                      >
                        <span>View Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
