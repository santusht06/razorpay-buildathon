import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpRight, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from '../api';

export const RecoveryCases = ({ onSelectCase }) => {
  const [cases, setCases] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.getCases({
        status: statusFilter || undefined,
        limit: 100
      });
      setCases(res.data.cases || []);
    } catch (err) {
      console.error('Error loading cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [statusFilter]);

  const filteredCases = cases.filter(c => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.case_id.toLowerCase().includes(term) ||
      c.payment_id.toLowerCase().includes(term) ||
      c.customer_name?.toLowerCase().includes(term) ||
      c.customer_email?.toLowerCase().includes(term) ||
      c.failure_reason?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Revenue Recovery Cases</h1>
          <p className="text-xs text-slate-400 mt-1">Manage, inspect, and track autonomous AI recovery workflows across all merchant transactions.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-md">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search case ID, customer email, failure reason..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="detected">Detected</option>
            <option value="action_executed">Action Executed</option>
            <option value="recovered">Recovered (₹)</option>
            <option value="escalated">Escalated to Merchant</option>
            <option value="stopped">Stopped by Guardrail</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Case Reference</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Amount at Risk</th>
                <th className="py-3.5 px-4">Failure Reason</th>
                <th className="py-3.5 px-4">Recovery Probability</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">Loading cases...</td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">No recovery cases matched query.</td>
                </tr>
              ) : (
                filteredCases.map((item) => (
                  <tr key={item.case_id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-100">{item.case_id}</div>
                      <div className="text-[11px] font-mono text-slate-500">{item.payment_id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{item.customer_name}</div>
                      <div className="text-[11px] text-slate-500">{item.customer_email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      ₹{item.amount_at_risk?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                        {item.failure_reason}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.round((item.recovery_probability || 0.8) * 100)}%` }}
                          />
                        </div>
                        <span className="text-emerald-400 font-bold text-xs">
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
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 border border-slate-700 transition-colors"
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
