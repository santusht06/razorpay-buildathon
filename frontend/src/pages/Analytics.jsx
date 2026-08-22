import React, { useEffect, useState } from 'react';
import { BarChart3, IndianRupee, TrendingUp, ShieldCheck, AlertTriangle } from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard';
import { api } from '../api';

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchAnalytics();
  }, []);

  const summary = data?.summary || {};

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-[#02042B] tracking-tight">Revenue Recovery Analytics</h1>
        <p className="text-xs text-slate-600 mt-1 font-semibold">Financial performance analytics, strategy breakdowns, and recovery conversion rates.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue at Risk"
          value={`₹${(summary.revenue_at_risk || 0).toLocaleString('en-IN')}`}
          subtext="Total revenue flagged at risk"
          icon={IndianRupee}
          color="rose"
        />
        <MetricCard
          title="Revenue Recovered"
          value={`₹${(summary.revenue_recovered || 0).toLocaleString('en-IN')}`}
          subtext="Actual money saved"
          icon={TrendingUp}
          color="emerald"
        />
        <MetricCard
          title="Recovery Success Rate"
          value={`${summary.recovery_rate_pct || 0}%`}
          subtext="Verified payment recovery ratio"
          icon={ShieldCheck}
          color="blue"
        />
        <MetricCard
          title="Escalated Cases"
          value={summary.escalated_count || 0}
          subtext="Escalated for VIP merchant outreach"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Strategy Breakdown Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-extrabold text-[#02042B] text-sm">Revenue Recovered by AI Strategy</h3>
          
          <div className="space-y-3 text-xs">
            {(data?.recovery_by_strategy || []).map((s, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-[#02042B]">{s.strategy}</div>
                  <div className="text-[11px] text-slate-500 font-semibold">{s.count} recovery executions</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-emerald-700">₹{s.recovered_amount?.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Recovered</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-extrabold text-[#02042B] text-sm">Recovery Rate by Failure Reason</h3>
          
          <div className="space-y-3 text-xs">
            {(data?.recovery_by_failure_reason || []).map((r, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-mono font-bold text-[#02042B] capitalize">{r.reason}</div>
                  <div className="text-[11px] text-slate-500 font-semibold">{r.count} failure cases</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-[#0C54EA]">{r.recovered_rate}%</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Conversion Rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
