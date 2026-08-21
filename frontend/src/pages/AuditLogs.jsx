import React, { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../api';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs(100);
      setLogs(res.data.audit_logs || []);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audit Trail Ledger</h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">Immutable audit stream recording every AI decision, policy validation check, and payment action.</p>
        </div>
        <button
          onClick={fetchAuditLogs}
          className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-4">Case ID</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-sans font-medium">Loading audit logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-sans font-medium">No audit records found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id || log.event_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-blue-700 font-bold">{log.case_id}</td>
                    <td className="py-3.5 px-4 font-sans font-semibold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">{log.actor}</span>
                    </td>
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{log.event}</td>
                    <td className="py-3.5 px-4 text-slate-700">{log.action}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.result === 'success' || log.result === 'RECOVERED' || log.result === 'executed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.result === 'blocked' || log.result === 'AT_RISK'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {log.result}
                      </span>
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
