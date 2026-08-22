import React, { useState } from 'react';
import { X, Play, Zap, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../../api';

export const WebhookSimulatorModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('2499');
  const [failureReason, setFailureReason] = useState('insufficient_funds');
  const [customerName, setCustomerName] = useState('Priya Sharma');
  const [customerEmail, setCustomerEmail] = useState('priya.s@example.com');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [riskType, setRiskType] = useState('FAILED_SUBSCRIPTION');
  const [autoRecover, setAutoRecover] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const failurePresets = [
    { label: '₹2,499 Soft Insufficient Funds', amount: '2499', reason: 'insufficient_funds', method: 'card', risk: 'FAILED_SUBSCRIPTION', name: 'Priya Sharma', email: 'priya.s@example.com' },
    { label: '₹999 Expired Card Details', amount: '999', reason: 'card_expired', method: 'card', risk: 'FAILED_SUBSCRIPTION', name: 'Rohan Mehta', email: 'rohan.m@example.com' },
    { label: '₹4,999 UPI Mandate Exhausted', amount: '4999', reason: 'upi_mandate_exhausted', method: 'upi', risk: 'FAILED_SUBSCRIPTION', name: 'Vikram Aditya', email: 'vikram.a@example.com' },
    { label: '₹14,500 3DS / OTP Timeout', amount: '14500', reason: 'authentication_failed', method: 'card', risk: 'FAILED_PAYMENT', name: 'Sophia Chen', email: 'sophia.c@global.io' },
    { label: '₹75,000 High-Value VIP Block', amount: '75000', reason: 'insufficient_funds', method: 'netbanking', risk: 'FAILED_PAYMENT', name: 'Enterprise VIP Client', email: 'vip@enterprise.com' },
    { label: '₹25,000 Abandoned Cart', amount: '25000', reason: 'checkout_abandonment', method: 'upi', risk: 'CHECKOUT_ABANDONMENT', name: 'Ananya Roy', email: 'ananya.r@example.com' },
    { label: '₹8,200 Bank Gateway Outage', amount: '8200', reason: 'bank_outage', method: 'netbanking', risk: 'FAILED_PAYMENT', name: 'Kavita Nair', email: 'kavita.n@example.com' },
    { label: '₹1,200 Terminal Stolen Card', amount: '1200', reason: 'stolen_card', method: 'card', risk: 'FAILED_PAYMENT', name: 'Suspicious Entity', email: 'suspicious@unknown.org' },
  ];

  const applyPreset = (preset) => {
    setAmount(preset.amount);
    setFailureReason(preset.reason);
    setPaymentMethod(preset.method);
    setRiskType(preset.risk);
    setCustomerName(preset.name);
    setCustomerEmail(preset.email);
  };

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
        payment_method: paymentMethod,
        risk_type: riskType,
        auto_recover: autoRecover
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl">
        <div className="bg-[#EDF5FF] px-6 py-4 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[#0C54EA] fill-current" />
            <div>
              <h3 className="font-black text-[#02042B] text-sm">Dynamic Payment Failure Simulator</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Test real-time Groq AI diagnoses and deterministic guardrails</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSimulate} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Quick Scenario Presets */}
          <div>
            <label className="text-xs font-black text-slate-700 flex items-center mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#0C54EA] mr-1.5" /> Quick Fintech Failure Presets:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {failurePresets.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className={`p-2 rounded-xl text-left border text-[11px] transition-all ${
                    failureReason === p.reason && amount === p.amount
                      ? 'bg-blue-50 border-[#0C54EA] text-[#0C54EA] font-extrabold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <div className="truncate">{p.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
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
                <option value="upi">UPI Auto-Pay / Intent</option>
                <option value="netbanking">Netbanking</option>
                <option value="enach">e-NACH Mandate</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Revenue Risk Type</label>
              <select
                value={riskType}
                onChange={(e) => setRiskType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-extrabold focus:outline-none focus:border-[#0C54EA] focus:bg-white"
              >
                <option value="FAILED_SUBSCRIPTION">Recurring Subscription</option>
                <option value="FAILED_PAYMENT">Standard One-Time</option>
                <option value="CHECKOUT_ABANDONMENT">Checkout Abandonment</option>
                <option value="OVERDUE_RECEIVABLE">Overdue Invoice</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Failure Reason Code</label>
            <select
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-extrabold focus:outline-none focus:border-[#0C54EA] focus:bg-white"
            >
              <option value="insufficient_funds">insufficient_funds (Temporary Balance / Limit Soft Decline)</option>
              <option value="card_expired">card_expired (Card Details Invalid / Expired)</option>
              <option value="upi_mandate_exhausted">upi_mandate_exhausted (UPI Auto-Pay Limit Reached)</option>
              <option value="bank_outage">bank_outage (Transient Gateway Network Timeout)</option>
              <option value="authentication_failed">authentication_failed (3D Secure / OTP Drop-off)</option>
              <option value="checkout_abandonment">checkout_abandonment (Abandoned Shopping Cart)</option>
              <option value="fraud_blocked">fraud_blocked (Terminal Security Blacklist)</option>
              <option value="stolen_card">stolen_card (Terminal Stolen Card Reported)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          {/* Results feedback banner */}
          {result && (
            <div className={`p-4 rounded-2xl text-xs font-mono border ${result.error ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
              {result.error ? (
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{result.error}</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center font-black text-emerald-800 text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
                    Webhook Processed & Autonomous Recovery Executed!
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-semibold text-slate-800">
                    <div>Case ID: <span className="font-mono font-bold text-blue-700">{result.recovery_pipeline_result?.case_id}</span></div>
                    <div>Status: <span className="font-mono font-bold uppercase">{result.recovery_pipeline_result?.status}</span></div>
                    <div>AI Action: <span className="font-mono font-bold">{result.recovery_pipeline_result?.action_executed}</span></div>
                    <div>Policy Allowed: <span className="font-mono font-bold">{result.recovery_pipeline_result?.policy_allowed ? '✓ True' : '✗ False (Blocked)'}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-black text-slate-600 hover:text-slate-900"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rzp-btn-primary text-xs flex items-center space-x-1.5 shadow-md disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Triggering Pipeline...' : 'Trigger Dynamic Failure'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
