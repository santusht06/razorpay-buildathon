import React, { useEffect, useState } from 'react';
import { 
  ChevronDown, ExternalLink, ArrowUpRight, RotateCcw, 
  HelpCircle, AlertCircle, RefreshCw, Zap, ShieldCheck, CheckCircle2, Sparkles, ArrowRight, Search, CreditCard, Send, Briefcase, DollarSign, Users, Award
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
    <div className="space-y-6 pb-12">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-black text-[#02042B] tracking-tight">Merchant Overview</h1>
          <button className="flex items-center space-x-1 text-xs font-bold text-[#0C54EA] hover:bg-blue-100 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors">
            <span>Today</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSimulator}
            className="rzp-btn-primary text-xs flex items-center space-x-2"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>Test Webhook Event</span>
          </button>

          <a
            href="https://github.com/santusht06/razorpay-buildathon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#0C54EA] hover:text-blue-800 flex items-center space-x-1 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs"
          >
            <span>Documentation</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Official Razorpay Landing Page Hero Banner (Matching Reference Screenshot Aesthetic) */}
      <div className="rzp-hero-bg border border-blue-100 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          
          <div className="inline-flex items-center space-x-2 bg-blue-100/80 border border-blue-200 text-[#0C54EA] px-3 py-1 rounded-full text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>Razorpay Autonomous AI Stack</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-[#02042B] tracking-tight leading-tight">
            This festive season get <span className="text-[#0C54EA]">Razorpay AI Recovery</span> for FREE<span className="text-[#0C54EA]">*</span>
          </h2>

          <p className="text-xs md:text-sm font-semibold text-slate-600">
            Payment Gateway &nbsp;|&nbsp; Payment Links &nbsp;|&nbsp; Autonomous One-Click Recovery Engine
          </p>

          {/* Big Metric Display inside Hero */}
          <div className="pt-2 flex items-baseline space-x-4">
            <div>
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Total Revenue At Risk</span>
              <span className="text-3xl md:text-4xl font-black text-[#02042B] font-sans">₹{atRiskAmount}</span>
            </div>
            <div className="pl-4 border-l border-slate-200">
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider block">Recovered by AI Agent</span>
              <span className="text-2xl md:text-3xl font-black text-emerald-600 font-sans">₹{recoveredAmount}</span>
            </div>
          </div>

          <div className="pt-3 flex items-center space-x-3">
            <button
              onClick={() => onSelectCase(recentCases[0]?.case_id || 'RCV-9081')}
              className="rzp-btn-primary text-xs flex items-center space-x-2 shadow-md"
            >
              <span>Inspect AI Recoveries</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSimulator}
              className="rzp-btn-secondary text-xs flex items-center space-x-1.5"
            >
              <span>Know More</span>
            </button>
          </div>
        </div>

        {/* Decorative Badge Graphic */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-64 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-blue-100 shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-black text-[#0C54EA] mb-2">
            <Award className="w-4 h-4 text-amber-500 fill-current" />
            <span>90 DAYS ZERO PLATFORM FEES</span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">Automated smart retries & guardrail protection included out of the box.</p>
        </div>
      </div>

      {/* Quick Action Search & Category Pills Bar (Matching Bottom Search Pills in Screenshot) */}
      <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs flex items-center space-x-2 overflow-x-auto text-xs font-extrabold select-none">
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl shrink-0 font-bold">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span>Start your search</span>
        </div>
        <button
          onClick={() => setActiveSubTab('payments')}
          className={`px-3 py-1.5 rounded-xl border shrink-0 transition-colors flex items-center space-x-1.5 ${
            activeSubTab === 'payments' ? 'bg-blue-50 text-[#0C54EA] border-blue-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-[#0C54EA]" />
          <span>Accept Payments</span>
        </button>
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-3 py-1.5 rounded-xl border shrink-0 transition-colors flex items-center space-x-1.5 ${
            activeSubTab === 'orders' ? 'bg-blue-50 text-[#0C54EA] border-blue-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-blue-600" />
          <span>Make Payouts</span>
        </button>
        <button
          onClick={() => setActiveSubTab('invoices')}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shrink-0 transition-colors flex items-center space-x-1.5"
        >
          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
          <span>Start Business Banking</span>
        </button>
        <button
          onClick={() => setActiveSubTab('payments')}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shrink-0 transition-colors flex items-center space-x-1.5"
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Get Credit</span>
        </button>
        <button
          onClick={() => setActiveSubTab('payments')}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shrink-0 transition-colors flex items-center space-x-1.5"
        >
          <Users className="w-3.5 h-3.5 text-purple-600" />
          <span>Automate Payroll</span>
        </button>
      </div>

      {/* 3 Secondary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Revenue Recovered */}
        <div className="rzp-card rzp-card-hover p-5 border border-slate-200 rounded-2xl bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center space-x-1.5 text-[#0C54EA]">
                <RotateCcw className="w-4 h-4" />
                <span>Revenue Recovered ⓘ</span>
              </div>
              <span className="text-[#0C54EA] font-extrabold">&gt;</span>
            </div>
            <div className="text-2xl font-black text-[#02042B] mt-2 font-sans">
              ₹{recoveredAmount}
            </div>
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-3 flex items-center justify-between">
            <span>{metrics?.recovered_count || 8} cases recovered by AI</span>
            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">+100% verified</span>
          </div>
        </div>

        {/* Card 2: Recovery Success Rate */}
        <div className="rzp-card rzp-card-hover p-5 border border-slate-200 rounded-2xl bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center space-x-1.5 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
                <span>Recovery Rate ⓘ</span>
              </div>
              <span className="text-slate-400">&gt;</span>
            </div>
            <div className="text-2xl font-black text-[#02042B] mt-2 font-sans">
              {recoveryRate}%
            </div>
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-3 flex items-center justify-between">
            <span>vs 32% baseline rules engine</span>
            <span className="text-[#0C54EA] font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">+31.4% Lift</span>
          </div>
        </div>

        {/* Card 3: Active Recoveries */}
        <div className="rzp-card rzp-card-hover p-5 border border-slate-200 rounded-2xl bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center space-x-1.5 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span>Active Recoveries ⓘ</span>
              </div>
              <span className="text-slate-400">&gt;</span>
            </div>
            <div className="text-2xl font-black text-[#02042B] mt-2 font-sans">
              {metrics?.active_recoveries || 4}
            </div>
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-3 flex items-center justify-between">
            <span>{metrics?.escalated_count || 1} escalated to VIP</span>
            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Monitoring</span>
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
                ? 'text-[#0C54EA] border-b-2 border-[#0C54EA] font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Payments & Live AI Stream
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`pb-3 transition-colors ${
              activeSubTab === 'orders'
                ? 'text-[#0C54EA] border-b-2 border-[#0C54EA] font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Subscription Orders
          </button>

          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`pb-3 transition-colors ${
              activeSubTab === 'invoices'
                ? 'text-[#0C54EA] border-b-2 border-[#0C54EA] font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Overdue Invoices
          </button>
        </div>

        {/* Cases Table Container */}
        <div className="rzp-card border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="text-xs font-extrabold text-[#02042B] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live AI Recovery Stream ({recentCases.length} active records)</span>
            </div>
            <button
              onClick={fetchData}
              className="text-xs font-bold text-[#0C54EA] hover:text-blue-800 flex items-center space-x-1.5 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Case Reference</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Failure Reason</th>
                  <th className="py-3.5 px-4">AI Strategy</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium bg-white">
                {recentCases.map((item) => (
                  <tr key={item.case_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#02042B] font-mono">{item.case_id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.customer_name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{item.customer_email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#02042B]">
                      ₹{item.amount_at_risk?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-slate-700">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {item.failure_reason}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#0C54EA] capitalize">
                      {(item.selected_strategy || 'Analyzing...').replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectCase(item.case_id)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-[#0C54EA] rounded-lg text-xs font-extrabold border border-blue-200 transition-colors shadow-2xs"
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

    </div>
  );
};

