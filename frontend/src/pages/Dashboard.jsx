import React, { useEffect, useState } from 'react';
import { IndianRupee, TrendingUp, RotateCcw, ShieldCheck, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';
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
        api.getCases({ limit: 8 })
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
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 fill-current text-amber-500" />
            <span>Razorpay Autonomous Revenue Recovery Core</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Merchant Revenue Command Center</h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl font-medium">
            Detect payment failures in real-time, diagnose failure causes via Groq AI RAG Agent, enforce security guardrails, and safely recover lost revenue.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={onOpenSimulator}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-current" />
            <span>Trigger Webhook Event</span>
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
          subtext="Verified payment recovery ratio"
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
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Active Recovery Pipeline Stream</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Real-time status of payment failure recovery cases managed by Groq AI Agent & Guardrails</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Case & Payment</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Amount at Risk</th>
                <th className="py-3.5 px-4">Failure Reason</th>
                <th className="py-3.5 px-4">AI Recovery Prob</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentCases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No recovery cases found. Click "Trigger Webhook Event" above to create one live!
                  </td>
                </tr>
              ) : (
                recentCases.map((item) => (
                  <tr key={item.case_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-extrabold text-slate-900">{item.case_id}</div>
                      <div className="text-[11px] font-mono text-slate-500">{item.payment_id || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{item.customer_name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{item.customer_email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">₹{item.amount_at_risk?.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-500">LTV: ₹{item.customer_ltv?.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">
                        {item.failure_reason}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.round((item.recovery_probability || 0.8) * 100)}%` }}
                          />
                        </div>
                        <span className="text-emerald-700 font-bold text-xs">
                          {Math.round((item.recovery_probability || 0.8) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectCase(item.case_id)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-bold inline-flex items-center space-x-1 border border-slate-200 hover:border-blue-300 transition-colors shadow-xs"
                      >
                        <span>Details</span>
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
