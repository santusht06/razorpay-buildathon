import React, { useEffect, useState } from 'react';
import { 
  ChevronDown, ExternalLink, ArrowUpRight, RotateCcw, 
  HelpCircle, AlertCircle, RefreshCw, Zap, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from '../api';

export const Dashboard = ({ onSelectCase, onOpenSimulator }) => {
  const [metrics, setMetrics] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('payments');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, cRes] = await Promise.all([
        api.getMetrics(),
        api.getCases({ limit: 10 })
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

  const atRiskAmount = (metrics?.revenue_at_risk || 18499.00).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const recoveredAmount = (metrics?.revenue_recovered || 11730.00).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const recoveryRate = metrics?.recovery_rate_pct || 63.4;

  return (
    <div className="space-y-6 pb-16 bg-white min-h-screen">
      
      {/* Overview Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-bold text-slate-900">Overview</h2>
          <button className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
            <span>Today</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <a
          href="https://github.com/santusht06/razorpay-buildathon"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
        >
          <span>Documentation</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Hero Card: Collected Amount / Revenue at Risk */}
      <div className="rzp-card p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600">
          <span>Revenue at Risk</span>
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        </div>
        
        <div className="text-4xl font-extrabold text-slate-900 tracking-tight mt-2 font-sans">
          ₹{atRiskAmount}
        </div>
        
        <div className="text-xs text-slate-500 font-medium mt-2">
          from {metrics?.total_cases || 12} failed payment recovery cases
        </div>
      </div>

      {/* 3 Secondary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Revenue Recovered */}
        <div className="rzp-card rzp-card-hover p-5 border border-slate-200 rounded-xl bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center space-x-1.5 text-blue-600">
                <RotateCcw className="w-4 h-4" />
                <span>Revenue Recovered ⓘ</span>
              </div>
              <span className="text-blue-600 font-bold">&gt;</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-sans">
              ₹{recoveredAmount}
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-3">
            {metrics?.recovered_count || 8} cases recovered by AI
          </div>
        </div>

        {/* Card 2: Recovery Success Rate */}
        <div className="rzp-card rzp-card-hover p-5 border border-slate-200 rounded-xl bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center space-x-1.5 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
                <span>Recovery Rate ⓘ</span>
              </div>
              <span className="text-slate-400">&gt;</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-sans">
              {recoveryRate}%
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-3">
            vs 32% baseline rules engine
          </div>
        </div>

        {/* Card 3: Active Cases */}
        <div className="rzp-card rzp-card-hover p-5 border border-slate-200 rounded-xl bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center space-x-1.5 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span>Active Recoveries ⓘ</span>
              </div>
              <span className="text-slate-400">&gt;</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-sans">
              {metrics?.active_recoveries || 4}
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-3">
            {metrics?.escalated_count || 1} escalated to VIP
          </div>
        </div>

      </div>

      {/* Main Content Sub-Navigation Tabs */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-slate-200 flex items-center space-x-8 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('payments')}
            className={`pb-3 transition-colors ${
              activeSubTab === 'payments'
                ? 'text-slate-900 border-b-2 border-slate-900 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Payments & Recovery Stream
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`pb-3 transition-colors ${
              activeSubTab === 'orders'
                ? 'text-slate-900 border-b-2 border-slate-900 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Subscription Orders
          </button>

          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`pb-3 transition-colors ${
              activeSubTab === 'invoices'
                ? 'text-slate-900 border-b-2 border-slate-900 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Overdue Invoices
          </button>
        </div>

        {/* Cases Table Container */}
        <div className="rzp-card border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="text-xs font-bold text-slate-900">
              Live AI Recovery Stream ({recentCases.length} records)
            </div>
            <button
              onClick={fetchData}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Case Reference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Failure Reason</th>
                  <th className="py-3 px-4">AI Strategy</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium bg-white">
                {recentCases.map((item) => (
                  <tr key={item.case_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.case_id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.customer_name}</div>
                      <div className="text-[11px] text-slate-500">{item.customer_email}</div>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      ₹{item.amount_at_risk?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] font-semibold text-slate-700">
                      {item.failure_reason}
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-700 capitalize">
                      {(item.selected_strategy || 'Analyzing...').replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectCase(item.case_id)}
                        className="px-3 py-1 bg-white hover:bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-slate-200 transition-colors shadow-xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={onOpenSimulator}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 text-xs font-bold border border-slate-700 transition-all transform hover:scale-105"
        >
          <Zap className="w-4 h-4 text-amber-400 fill-current" />
          <span>Webhook Simulator</span>
        </button>
      </div>

    </div>
  );
};
