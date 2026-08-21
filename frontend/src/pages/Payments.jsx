import React, { useEffect, useState } from 'react';
import { CreditCard, Search, ArrowUpRight } from 'lucide-react';
import { api } from '../api';

export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await api.getPayments({ limit: 50 });
        setPayments(res.data.payments || []);
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Payments Log</h1>
        <p className="text-xs text-slate-400 mt-1">Raw Razorpay transaction ledger received via webhooks and payment gateways.</p>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Payment ID</th>
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Failure Reason</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">Loading payments...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No payment logs found.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-100 font-bold">{p.payment_id}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{p.customer_id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">₹{p.amount?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 capitalize">{p.payment_method}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{p.failure_reason || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        p.status === 'captured' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {p.status}
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
