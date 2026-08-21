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
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Audit Trail Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">Immutable audit stream recording every AI decision, policy validation check, and payment action.</p>
        </div>
        <button
          onClick={fetchAuditLogs}
          className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1 hover:text-slate-100"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-4">Case ID</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-sans">Loading audit logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-sans">No audit records found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-5 text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-sky-400 font-bold">{log.case_id}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{log.actor}</span>
                    </td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-200">{log.event}</td>
                    <td className="py-3.5 px-4 text-slate-300">{log.action}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.result === 'success' || log.result === 'recovered' || log.result === 'executed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : log.result === 'blocked'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
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
