import React, { useState } from 'react';
import { X, Play, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';

export const WebhookSimulatorModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('2499');
  const [failureReason, setFailureReason] = useState('insufficient_funds');
  const [customerName, setCustomerName] = useState('Rahul Dravid');
  const [customerEmail, setCustomerEmail] = useState('rahul.d@example.com');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await api.simulatePaymentFailure({
        amount: parseFloat(amount),
        failure_reason: failureReason,
        customer_name: customerName,
        customer_email: customerEmail,
        payment_method: paymentMethod
      });
      setResult(res.data);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setResult({ error: err.response?.data?.detail || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="bg-[#EDF5FF] px-6 py-4 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[#0C54EA] fill-current" />
            <h3 className="font-black text-[#02042B] text-sm">Razorpay Webhook Simulator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSimulate} className="p-6 space-y-4">
          <p className="text-xs text-slate-600 font-semibold">
            Simulate a live Razorpay <code className="bg-blue-50 px-1.5 py-0.5 rounded text-[#0C54EA] font-mono font-bold">payment.failed</code> webhook event to observe the Groq AI Autonomous Recovery Agent in real-time.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-extrabold focus:outline-none focus:border-[#0C54EA] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-extrabold focus:outline-none focus:border-[#0C54EA] focus:bg-white"
              >
                <option value="card">Credit / Debit Card</option>
                <option value="upi">UPI Auto-pay</option>
                <option value="netbanking">Netbanking</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Failure Reason (Scenario)</label>
            <select
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-extrabold focus:outline-none focus:border-[#0C54EA] focus:bg-white"
            >
              <option value="insufficient_funds">Insufficient Funds (Soft Failure - Auto Recovery Link)</option>
              <option value="card_expired">Card Expired (Payment Method Update Needed)</option>
              <option value="bank_outage">Bank Network Outage (Transient - Schedule Retry)</option>
              <option value="authentication_failed">3D Secure Auth Failed</option>
              <option value="fraud_blocked">Fraud Risk Blocked (Terminal - Guardrail Halt)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#0C54EA] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#0C54EA] focus:bg-white"
              />
            </div>
          </div>

          {result && (
            <div className={`p-3.5 rounded-xl text-xs font-mono border ${result.error ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
              {result.error ? (
                <div className="flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{result.error}</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center font-extrabold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                    Webhook Processed & Recovery Pipeline Triggered!
                  </div>
                  <div>Case ID: {result.recovery_pipeline_result?.case_id}</div>
                  <div>Status: {result.recovery_pipeline_result?.status}</div>
                  <div>AI Action: {result.recovery_pipeline_result?.action_executed}</div>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-extrabold text-slate-600 hover:text-slate-900"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rzp-btn-primary text-xs flex items-center space-x-1.5 shadow-md disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Triggering...' : 'Trigger Webhook Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

