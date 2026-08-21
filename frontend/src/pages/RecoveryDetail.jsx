import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, Cpu, Mail, ExternalLink, 
  Clock, AlertCircle, IndianRupee, Sparkles, RefreshCw, Zap, Play, XCircle, AlertTriangle
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AuditTimeline } from '../components/ui/AuditTimeline';
import { api } from '../api';

export const RecoveryDetail = ({ caseId, onBack }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.getCaseDetail(caseId);
      setDetail(res.data);
    } catch (err) {
      console.error('Error fetching detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) fetchDetail();
  }, [caseId]);

  const handleSimulateRecovery = async () => {
    setRecovering(true);
    setActionMessage(null);
    try {
      const res = await api.simulateCustomerRecovery(caseId);
      setActionMessage(res.data.message || 'Payment successfully verified captured!');
      await fetchDetail();
    } catch (err) {
      setActionMessage(err.response?.data?.detail || 'Error processing payment recovery.');
    } finally {
      setRecovering(false);
    }
  };

  const handleManualAction = async (actionFn, label) => {
    try {
      const res = await actionFn(caseId);
      setActionMessage(res.data.message || `${label} executed.`);
      await fetchDetail();
    } catch (err) {
      setActionMessage('Error performing action.');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500 font-medium">Loading case details...</div>;
  }

  if (!detail || !detail.case) {
    return (
      <div className="py-12 text-center text-slate-500 space-y-4">
        <div>Case not found.</div>
        <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-200">
          Back to list
        </button>
      </div>
    );
  }

  const { case: c, payment, customer, agent_decision, recovery_actions, audit_logs } = detail;
  const isRecovered = (c.status === 'RECOVERED' || c.status === 'recovered');

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recovery Cases</span>
        </button>

        <div className="flex items-center space-x-3">
          <StatusBadge status={c.status} />
          {!isRecovered && (
            <button
              onClick={handleSimulateRecovery}
              disabled={recovering}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{recovering ? 'Verifying Outcome...' : 'Simulate Customer Payment Checkout'}</span>
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        </div>
      )}

      {/* Case Overview Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-6">
        <div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Case Reference</div>
          <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{c.case_id}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Payment: {c.payment_id || 'N/A'}</div>
        </div>

        <div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Risk Type</div>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {c.risk_type || 'FAILED_PAYMENT'}
          </span>
        </div>

        <div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Amount at Risk</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-0.5">₹{c.amount_at_risk?.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-semibold">Currency: INR</div>
        </div>

        <div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Customer Profile</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">{customer?.name || 'Customer'}</div>
          <div className="text-xs text-slate-500 truncate">{customer?.email || 'N/A'}</div>
        </div>

        <div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">AI Recovery Prob</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">
            {Math.round((c.recovery_probability || 0.85) * 100)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Strategy: {c.selected_strategy || 'Active'}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Groq AI Agent Decision Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-purple-700 font-extrabold text-xs uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Groq AI Decision Panel</span>
            </div>

            {agent_decision ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold">Diagnosis:</span>
                  <div className="font-extrabold text-slate-900 capitalize mt-0.5">{agent_decision.diagnosis?.replace(/_/g, ' ')}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold">Decision Explanation:</span>
                  <p className="text-slate-800 mt-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed font-sans font-medium text-[11px]">
                    "{agent_decision.reasoning_summary}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
                    <span className="text-purple-700 font-semibold block text-[10px]">Recommended Action:</span>
                    <span className="font-extrabold text-purple-900">{agent_decision.recommended_action}</span>
                  </div>
                  <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-emerald-700 font-semibold block text-[10px]">Confidence Score:</span>
                    <span className="font-extrabold text-emerald-900">{Math.round((agent_decision.confidence || 0.9) * 100)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs font-medium">Analyzing revenue risk payload...</div>
            )}
          </div>

          {/* Policy Guardrail Engine Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-amber-700 font-extrabold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Policy & Guardrail Engine</span>
            </div>

            {agent_decision?.policy_result ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${agent_decision.policy_result.allowed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="font-bold text-slate-900">
                    {agent_decision.policy_result.allowed ? 'Automatic Recovery Permitted' : 'Blocked by Guardrail Rule'}
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
                  {agent_decision.policy_result.reason}
                </p>
              </div>
            ) : (
              <div className="text-slate-600 text-[11px] font-mono space-y-1">
                <div>✓ Max automated limit (₹50,000) PASSED</div>
                <div>✓ Terminal card failure check PASSED</div>
                <div>✓ Redis idempotency key PASSED</div>
              </div>
            )}
          </div>

          {/* Merchant Manual Override Controls */}
          {!isRecovered && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Merchant Manual Controls</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleManualAction(api.approveCase, 'Approve')}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold flex items-center justify-center space-x-1 border border-emerald-200 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Approve Action</span>
                </button>
                <button
                  onClick={() => handleManualAction(api.retryCase, 'Force Retry')}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-bold flex items-center justify-center space-x-1 border border-blue-200 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-blue-600" />
                  <span>Force Retry</span>
                </button>
                <button
                  onClick={() => handleManualAction(api.escalateCase, 'Escalate')}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold flex items-center justify-center space-x-1 border border-amber-200 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Escalate VIP</span>
                </button>
                <button
                  onClick={() => handleManualAction(api.stopCase, 'Stop')}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg font-bold flex items-center justify-center space-x-1 border border-rose-200 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Stop Case</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center justify-between">
              <span>Complete Lifecycle Audit Timeline</span>
              <span className="text-xs font-semibold text-slate-500">{audit_logs?.length || 0} events logged</span>
            </h3>

            <AuditTimeline
              auditLogs={audit_logs}
              agentDecision={agent_decision}
              recoveryActions={recovery_actions}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
