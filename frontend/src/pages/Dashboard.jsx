import React, { useEffect, useState } from 'react';
import { 
  ArrowUpRight, RotateCcw, HelpCircle, AlertCircle, 
  RefreshCw, Zap, ShieldCheck, TrendingUp, IndianRupee, Cpu
} from 'lucide-react';
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
        api.getCases({ limit: 12 })
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

  const atRiskAmount = (metrics?.revenue_at_risk || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const recoveredAmount = (metrics?.revenue_recovered || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const recoveryRate = metrics?.recovery_rate_pct || 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-[#0C54EA] text-xs font-extrabold uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>Autonomous Revenue Recovery Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Recovery Command Center</h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Monitor real-time payment failure detection, Groq AI strategy decisions, and verified revenue capture.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onOpenSimulator}
            className="px-4 py-2.5 bg-[#0C54EA] hover:bg-[#0A47C4] text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>Simulate Payment Failure</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Revenue at Risk */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Revenue at Risk</span>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-sans">
              ₹{atRiskAmount}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              from {metrics?.total_cases || 0} failed payment events
            </div>
          </div>
        </div>

        {/* Card 2: Revenue Recovered */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Revenue Recovered</span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-emerald-600 tracking-tight font-sans">
              ₹{recoveredAmount}
            </div>
            <div className="text-xs text-emerald-800 font-bold mt-1">
              {metrics?.recovered_count || 0} verified captured payments
            </div>
          </div>
        </div>

        {/* Card 3: Recovery Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Recovery Rate</span>
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-sans">
              {recoveryRate}%
            </div>
            <div className="text-xs text-blue-700 font-bold mt-1">
              vs 32.0% conventional baseline
            </div>
          </div>
        </div>

        {/* Card 4: Active Recoveries */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Pipeline</span>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-sans">
              {metrics?.active_recoveries || 0}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              {metrics?.escalated_count || 0} escalated for VIP review
            </div>
          </div>
        </div>

      </div>

      {/* Recovery Stream Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Active Recovery Stream ({recentCases.length} records)</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time payment failure cases evaluated by Groq AI and bounded by deterministic guardrails.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Case Reference</th>
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
                  <td colSpan="7" className="py-10 text-center text-slate-400 font-medium">
                    No recovery cases in database. Click "Simulate Payment Failure" above or trigger a demo scenario!
                  </td>
                </tr>
              ) : (
                recentCases.map((item) => (
                  <tr key={item.case_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-extrabold text-slate-900 font-mono">{item.case_id}</div>
                      <div className="text-[11px] font-mono text-slate-400">{item.payment_id || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.customer_name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{item.customer_email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 font-sans">
                      ₹{item.amount_at_risk?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
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
                        <span className="text-emerald-700 font-black text-xs font-mono">
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
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0C54EA] rounded-lg text-xs font-extrabold inline-flex items-center space-x-1 border border-blue-200 transition-colors shadow-2xs"
                      >
                        <span>Inspect Case</span>
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
