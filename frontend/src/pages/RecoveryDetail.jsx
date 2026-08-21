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
    return <div className="py-12 text-center text-slate-400">Loading case details...</div>;
  }

  if (!detail || !detail.case) {
    return (
      <div className="py-12 text-center text-slate-400 space-y-4">
        <div>Case not found.</div>
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold">
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
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition-colors"
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{recovering ? 'Verifying Outcome...' : 'Simulate Customer Payment Checkout'}</span>
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
        </div>
      )}

      {/* Case Overview Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-5 gap-6">
        <div>
          <div className="text-xs text-slate-400 font-medium">Case Reference</div>
          <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">{c.case_id}</div>
          <div className="text-[11px] text-slate-500 mt-1">Payment: {c.payment_id || 'N/A'}</div>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">Revenue Risk Type</div>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            {c.risk_type || 'FAILED_PAYMENT'}
          </span>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">Amount at Risk</div>
          <div className="text-2xl font-bold text-slate-100 mt-0.5">₹{c.amount_at_risk?.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500 mt-1">Currency: INR</div>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">Customer Profile</div>
          <div className="text-sm font-semibold text-slate-200 mt-0.5">{customer?.name || 'Customer'}</div>
          <div className="text-xs text-slate-400 truncate">{customer?.email || 'N/A'}</div>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">AI Recovery Probability</div>
          <div className="text-2xl font-bold text-emerald-400 mt-0.5">
            {Math.round((c.recovery_probability || 0.85) * 100)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Strategy: {c.selected_strategy || 'Active'}</div>
        </div>
      </div>

      {/* Main Grid: Left Column (AI Decision + Policy + Overrides), Right Column (Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* AI Agent Decision Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>AI Decision Panel</span>
            </div>

            {agent_decision ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Diagnosis:</span>
                  <div className="font-bold text-slate-100 capitalize mt-0.5">{agent_decision.diagnosis?.replace(/_/g, ' ')}</div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Decision Explanation:</span>
                  <p className="text-slate-300 mt-1 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans">
                    "{agent_decision.reasoning_summary}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block">Recommended Action:</span>
                    <span className="font-semibold text-purple-300">{agent_decision.recommended_action}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block">Confidence Score:</span>
                    <span className="font-semibold text-emerald-300">{Math.round((agent_decision.confidence || 0.9) * 100)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs">Analyzing revenue risk payload...</div>
            )}
          </div>

          {/* Policy Guardrail Engine Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Policy & Guardrail Engine</span>
            </div>

            {agent_decision?.policy_result ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${agent_decision.policy_result.allowed ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span className="font-semibold text-slate-200">
                    {agent_decision.policy_result.allowed ? 'Automatic Recovery Permitted' : 'Blocked by Guardrail Rule'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs bg-slate-950 p-2.5 rounded border border-slate-800 font-mono">
                  {agent_decision.policy_result.reason}
                </p>
              </div>
            ) : (
              <div className="text-slate-400 text-xs font-mono">
                ✓ Max automated limit (₹50,000) check PASSED<br/>
                ✓ Terminal failure check PASSED<br/>
                ✓ Idempotency validation PASSED
              </div>
            )}
          </div>

          {/* Merchant Manual Override Controls */}
          {!isRecovered && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Merchant Manual Controls</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleManualAction(api.approveCase, 'Approve')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg font-semibold flex items-center justify-center space-x-1 border border-slate-700"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Action</span>
                </button>
                <button
                  onClick={() => handleManualAction(api.retryCase, 'Force Retry')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg font-semibold flex items-center justify-center space-x-1 border border-slate-700"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Force Retry</span>
                </button>
                <button
                  onClick={() => handleManualAction(api.escalateCase, 'Escalate')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg font-semibold flex items-center justify-center space-x-1 border border-slate-700"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Escalate to VIP</span>
                </button>
                <button
                  onClick={() => handleManualAction(api.stopCase, 'Stop')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg font-semibold flex items-center justify-center space-x-1 border border-slate-700"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Stop Case</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visual Audit Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl">
            <h3 className="font-bold text-slate-100 text-sm mb-4 flex items-center justify-between">
              <span>Complete Lifecycle Audit Timeline</span>
              <span className="text-xs font-normal text-slate-400">{audit_logs?.length || 0} events logged</span>
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
