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
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-[#02042B] tracking-tight">Payments Ledger</h1>
        <p className="text-xs text-slate-600 mt-1 font-semibold">Raw Razorpay transaction log received via webhooks and payment gateways.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Payment ID</th>
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Failure Reason</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-sans font-semibold">Loading payments...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-sans font-semibold">No payment logs found.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-[#02042B] font-extrabold">{p.payment_id}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{p.customer_id}</td>
                    <td className="py-3.5 px-4 font-black text-[#02042B]">₹{p.amount?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 capitalize font-bold">{p.payment_method}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">{p.failure_reason || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold border ${
                        p.status === 'captured' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
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

