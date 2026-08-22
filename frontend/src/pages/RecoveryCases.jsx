import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpRight } from 'lucide-react';
import { StatusBadge, AutonomyBadge } from '../components/ui/StatusBadge';
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
      (c.payment_id || '').toLowerCase().includes(term) ||
      (c.customer_name || '').toLowerCase().includes(term) ||
      (c.customer_email || '').toLowerCase().includes(term) ||
      (c.failure_reason || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#02042B] tracking-tight">Revenue Recovery Cases</h1>
          <p className="text-xs text-slate-600 mt-1 font-semibold">Manage, inspect, and track autonomous Groq AI recovery workflows across all merchant transactions.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-4 shadow-xs w-full">
        <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Case ID, Customer name, Email, Failure reason..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#0C54EA] focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0C54EA]"
          >
            <option value="">All Case Statuses</option>
            <option value="AT_RISK">At Risk</option>
            <option value="RECOVERING">In Recovery</option>
            <option value="RECOVERED">Recovered (₹)</option>
            <option value="ESCALATED">Escalated to Merchant</option>
            <option value="STOPPED">Stopped by Guardrail</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Case Reference</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Amount at Risk</th>
                <th className="py-4 px-6">Failure Reason</th>
                <th className="py-4 px-6">Recovery Prob.</th>
                <th className="py-4 px-6">Autonomy</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium bg-white">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-semibold">Loading recovery cases...</td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-semibold">No recovery cases matched your query.</td>
                </tr>
              ) : (
                filteredCases.map((item) => (
                  <tr key={item.case_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-[#02042B] font-mono text-xs">{item.case_id}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{item.payment_id || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{item.customer_name}</div>
                      <div className="text-[11px] text-slate-500">{item.customer_email}</div>
                    </td>
                    <td className="py-4 px-6 font-black text-[#02042B] text-xs font-sans">
                      ₹{item.amount_at_risk?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200">
                        {item.failure_reason}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
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
                    <td className="py-4 px-6">
                      <AutonomyBadge caseItem={item} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onSelectCase(item.case_id)}
                        className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0C54EA] rounded-xl text-xs font-extrabold inline-flex items-center space-x-1 border border-blue-200 transition-colors shadow-2xs"
                      >
                        <span>View</span>
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
