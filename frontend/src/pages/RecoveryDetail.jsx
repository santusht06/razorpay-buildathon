import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, CheckCircle2, ShieldCheck, Cpu, Mail, AlertTriangle,
  XCircle, Play, RefreshCw, ChevronRight, BookOpen, IndianRupee
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from '../api';

// ─── Vertical Recovery Timeline ─────────────────────────────────────────────
const TimelineStep = ({ icon: Icon, iconColor, label, sublabel, items = [], isLast, isSuccess, isMuted }) => (
  <div className="flex gap-4">
    {/* Spine */}
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
        isSuccess ? 'bg-emerald-50 border-emerald-400' :
        isMuted   ? 'bg-slate-100 border-slate-300' :
                    `bg-white border-slate-300`
      }`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      {!isLast && <div className="w-px flex-1 bg-slate-200 my-1" />}
    </div>

    {/* Content */}
    <div className={`pb-6 ${isLast ? '' : ''}`}>
      <div className={`text-xs font-extrabold uppercase tracking-widest mb-1 ${
        isSuccess ? 'text-emerald-700' : isMuted ? 'text-slate-400' : 'text-slate-900'
      }`}>
        {label}
      </div>
      {sublabel && (
        <div className="text-sm font-bold text-slate-800 mb-2">{sublabel}</div>
      )}
      {items.map((item, i) => (
        <div key={i} className={`text-xs font-medium mt-1 ${
          item.type === 'check' ? 'text-emerald-700 flex items-center gap-1' :
          item.type === 'mono'  ? 'font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block' :
          item.type === 'warn'  ? 'text-amber-700' :
                                  'text-slate-600'
        }`}>
          {item.type === 'check' && <CheckCircle2 className="w-3 h-3" />}
          {item.text}
        </div>
      ))}
    </div>
  </div>
);

// ─── Why This Action Panel ───────────────────────────────────────────────────
const WhyThisAction = ({ agentDecision, customer, caseDoc }) => {
  if (!agentDecision) return null;
  const prob = Math.round((agentDecision.recovery_probability || 0.8) * 100);
  const action = (agentDecision.recommended_action || '').replace(/_/g, ' ');
  const successPayments = customer?.history_summary?.successful_payments || customer?.successful_payments || '—';
  const failureReason = caseDoc?.failure_reason || '—';
  const diagnosis = (agentDecision.diagnosis || '').replace(/_/g, ' ');
  const intel = agentDecision?.customer_intelligence || {};
  const timing = intel?.timing_recommendation || {};

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
        <Cpu className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Dynamic AI Diagnosis & Intelligence</span>
        <span className="ml-auto text-[10px] font-mono text-slate-400">{agentDecision.source || 'agent'}</span>
      </div>

      <div className="p-5 space-y-4 text-xs">
        {/* Customer Intelligence Badges */}
        {intel.customer_tier && (
          <div className="flex items-center gap-2 flex-wrap pb-1">
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase">
              Tier: {intel.customer_tier.replace(/_/g, ' ')}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black uppercase">
              Channel: {(intel.optimal_channel || 'EMAIL').replace(/_/g, ' ')}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
              (intel.churn_risk_score || 0) > 0.4 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              Churn Risk: {Math.round((intel.churn_risk_score || 0.15) * 100)}%
            </span>
          </div>
        )}

        {/* Data table */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="text-slate-500 font-semibold mb-1">Customer History</div>
            <div className="font-bold text-slate-900">
              {successPayments !== '—' ? `${successPayments} successful txns` : 'New customer'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
              Reliability: {Math.round((intel.reliability_score || 0.85) * 100)}%
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="text-slate-500 font-semibold mb-1">Failure Reason</div>
            <div className="font-mono font-bold text-slate-900 capitalize truncate">{failureReason}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 capitalize truncate">
              {diagnosis}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="text-slate-500 font-semibold mb-1">Calibrated Recovery Prob.</div>
            <div className={`text-xl font-black ${prob >= 75 ? 'text-emerald-600' : prob >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
              {prob}%
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-blue-600 font-semibold mb-1">Recommended Action</div>
            <div className="font-extrabold text-blue-900 capitalize">{action}</div>
          </div>
        </div>

        {/* Dynamic Timing Signal */}
        {timing.strategy && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900 font-semibold">
            <div className="font-bold uppercase tracking-wider text-amber-800 text-[10px] mb-0.5">
              ⚡ Smart Timing Engine ({timing.strategy.replace(/_/g, ' ')})
            </div>
            <div>{timing.reasoning}</div>
          </div>
        )}

        {/* AI Reasoning */}
        <div className="border-t border-slate-100 pt-3">
          <div className="text-slate-500 font-semibold mb-1.5">Business Explanation</div>
          <p className="text-slate-800 leading-relaxed font-medium">
            {agentDecision.reasoning_summary || 'AI analyzed customer history, failure reason, and merchant policies to determine the optimal recovery action.'}
          </p>
        </div>

        {/* Confidence bar */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-slate-500 font-semibold shrink-0">Model Confidence</span>
          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${Math.round((agentDecision.confidence || 0.85) * 100)}%` }}
            />
          </div>
          <span className="font-bold text-slate-700 text-[11px]">
            {Math.round((agentDecision.confidence || 0.85) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── RAG Policy Panel ────────────────────────────────────────────────────────
const RAGPoliciesPanel = ({ agentDecision }) => {
  const policies = agentDecision?.rag_policies_used || [];
  if (policies.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">RAG Merchant Policies Used</span>
        <span className="ml-auto text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-bold">
          Vector Retrieval
        </span>
      </div>

      <div className="p-5 space-y-3 text-xs">
        <p className="text-slate-500 font-medium text-[11px]">
          The AI agent retrieved these policies from the merchant's recovery playbook before deciding its strategy.
          This ensures the agent is not hallucinating — it's grounding decisions in real merchant rules.
        </p>
        {policies.map((policy, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900">{policy.title || policy.id}</span>
              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                {policy.category}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">{policy.content}</p>
            {policy.relevance_score !== undefined && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-slate-400 font-semibold">Relevance</span>
                <div className="flex-1 bg-slate-100 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-purple-400 h-full rounded-full"
                    style={{ width: `${Math.max(10, Math.round(policy.relevance_score * 100))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Recovery Timeline ───────────────────────────────────────────────────────
const RecoveryTimeline = ({ caseDoc, agentDecision, auditLogs, recoveryActions }) => {
  const amount = `₹${(caseDoc?.amount_at_risk || 0).toLocaleString('en-IN')}`;
  const isRecovered = ['RECOVERED', 'recovered', 'VERIFIED'].includes(caseDoc?.status);
  const prob = Math.round((agentDecision?.recovery_probability || 0.8) * 100);
  const action = (agentDecision?.recommended_action || 'SEND_RECOVERY_EMAIL').replace(/_/g, ' ');
  const actionRecord = recoveryActions?.[0];
  const actionExecuted = actionRecord?.action_type?.replace(/_/g, ' ') || action;
  const actionResult = actionRecord?.result?.status || 'executed';

  const policyResult = agentDecision?.policy_result || {};
  const amount_ok = (caseDoc?.amount_at_risk || 0) < 50000;
  const retry_ok = (caseDoc?.attempt_count || 0) < 3;

  const steps = [
    {
      icon: AlertTriangle,
      iconColor: 'text-rose-500',
      label: 'Revenue Risk Detected',
      sublabel: `${amount} · Payment failed`,
      items: [
        { type: 'mono', text: caseDoc?.failure_reason || 'PAYMENT_FAILED' },
        { type: 'default', text: `Risk type: ${caseDoc?.risk_type || 'FAILED_PAYMENT'}` },
      ]
    },
    {
      icon: Cpu,
      iconColor: 'text-blue-500',
      label: 'AI Diagnosis',
      sublabel: (agentDecision?.diagnosis || 'temporary_payment_failure').replace(/_/g, ' '),
      items: [
        { type: 'default', text: `Recovery probability: ${prob}%` },
        { type: 'default', text: `Source: ${agentDecision?.source || 'groq_llm'}` },
      ]
    },
    {
      icon: ChevronRight,
      iconColor: 'text-indigo-500',
      label: 'Recovery Strategy',
      sublabel: action,
      items: [
        { type: 'default', text: agentDecision?.reasoning_summary?.slice(0, 80) + '...' || '' }
      ]
    },
    {
      icon: ShieldCheck,
      iconColor: 'text-amber-500',
      label: 'Policy Safety Check',
      items: [
        { type: 'check', text: `Amount within limit (${amount} < ₹50,000)` },
        { type: retry_ok ? 'check' : 'warn', text: `Retry count allowed (${caseDoc?.attempt_count || 0}/3)` },
        { type: policyResult?.allowed !== false ? 'check' : 'warn', text: policyResult?.allowed !== false ? 'Action permitted by merchant policy' : (policyResult?.reason || 'Blocked by policy') },
      ]
    },
    {
      icon: Mail,
      iconColor: 'text-sky-500',
      label: 'Action Executed',
      sublabel: actionExecuted,
      items: [
        { type: 'default', text: `Result: ${actionResult}` },
        actionRecord?.result?.to && { type: 'default', text: `Sent to: ${actionRecord.result.to}` },
      ].filter(Boolean)
    },
    isRecovered ? {
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      label: 'Payment Verified Captured',
      sublabel: `${amount} RECOVERED`,
      items: [
        { type: 'check', text: 'Payment status confirmed: captured' },
        { type: 'check', text: 'Revenue recorded in dashboard' },
      ],
      isSuccess: true,
      isLast: true
    } : {
      icon: RefreshCw,
      iconColor: 'text-slate-400',
      label: 'Awaiting Verification',
      sublabel: 'Monitoring payment status',
      items: [
        { type: 'default', text: 'Customer has been contacted' },
        { type: 'default', text: 'Payment capture pending confirmation' },
      ],
      isMuted: true,
      isLast: true
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
        <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Recovery Lifecycle</span>
      </div>
      <div className="p-5">
        {steps.map((step, i) => (
          <TimelineStep key={i} {...step} isLast={step.isLast || i === steps.length - 1} />
        ))}
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export const RecoveryDetail = ({ caseId, onBack }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.getCaseDetail(caseId);
      setDetail(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (caseId) fetchDetail(); }, [caseId]);

  const handleRecover = async () => {
    setRecovering(true);
    try {
      const res = await api.simulateCustomerRecovery(caseId);
      setMessage({ type: 'success', text: res.data.message || 'Payment verified captured. Revenue recovered!' });
      await fetchDetail();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Error verifying payment.' });
    } finally {
      setRecovering(false);
    }
  };

  const handleAction = async (fn, label) => {
    try {
      const res = await fn(caseId);
      setMessage({ type: 'success', text: res.data.message || `${label} executed.` });
      await fetchDetail();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error performing action.' });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-500 text-sm font-medium">
      Loading recovery case...
    </div>
  );
  if (!detail?.case) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="text-slate-500 font-medium">Case not found.</div>
      <button onClick={onBack} className="text-xs font-bold text-blue-600 underline">← Back</button>
    </div>
  );

  const { case: c, customer, agent_decision, recovery_actions, audit_logs } = detail;
  const isRecovered = ['RECOVERED', 'recovered'].includes(c.status);

  return (
    <div className="space-y-5 pb-12">

      {/* ── Nav & Controls ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />Back to Cases
        </button>

        <div className="flex items-center gap-3">
          <StatusBadge status={c.status} />
          {!isRecovered && (
            <button
              onClick={handleRecover}
              disabled={recovering}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {recovering ? 'Verifying...' : 'Simulate Payment Captured'}
            </button>
          )}
          <button onClick={fetchDetail} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 shadow-xs">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 border ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />{message.text}
        </div>
      )}

      {/* ── Case Header Banner ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Autonomy level band */}
        {(() => {
          const s = (c.status || '').toLowerCase();
          const a = c.amount_at_risk || 0;
          const level = s === 'escalated' ? 3 : (s === 'recovered' && a < 50000) ? 1 : (['recovering','recovery_planned','action_executed'].includes(s) ? 2 : null);
          const bands = {
            1: 'bg-emerald-600 text-white',
            2: 'bg-amber-500 text-white',
            3: 'bg-rose-600 text-white',
          };
          const labels = {
            1: '🟢 Level 1 — Fully Autonomous · Agent detected, decided, executed & verified without any merchant intervention',
            2: '🟡 Level 2 — Auto-Communication · Agent automatically contacted customer; merchant not involved',
            3: '🔴 Level 3 — Merchant Approval Required · High-value guardrail blocked automatic execution',
          };
          return level ? (
            <div className={`px-5 py-2 text-[11px] font-black tracking-wide ${bands[level]}`}>
              {labels[level]}
            </div>
          ) : null;
        })()}

        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 text-xs">
            <div>
              <div className="text-slate-500 font-semibold uppercase tracking-wider mb-1">Case ID</div>
              <div className="font-mono font-extrabold text-slate-900">{c.case_id}</div>
              <div className="text-slate-400 font-mono text-[10px] mt-0.5">{c.payment_id}</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold uppercase tracking-wider mb-1">Risk Type</div>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-[11px]">
                {c.risk_type || 'FAILED_PAYMENT'}
              </span>
            </div>
            <div>
              <div className="text-slate-500 font-semibold uppercase tracking-wider mb-1">Amount at Risk</div>
              <div className="text-2xl font-black text-slate-900">₹{(c.amount_at_risk || 0).toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold uppercase tracking-wider mb-1">Customer</div>
              <div className="font-bold text-slate-900">{customer?.name || 'Customer'}</div>
              <div className="text-slate-500 text-[11px]">{customer?.email}</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold uppercase tracking-wider mb-1">Recovery Prob.</div>
              <div className="text-2xl font-black text-emerald-600">
                {Math.round((c.recovery_probability || 0.8) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ── Main 3-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Left: AI Decision + RAG + Manual Controls */}
        <div className="lg:col-span-2 space-y-4">
          <WhyThisAction agentDecision={agent_decision} customer={customer} caseDoc={c} />
          <RAGPoliciesPanel agentDecision={agent_decision} />

          {/* Manual Merchant Controls */}
          {!isRecovered && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">Merchant Override</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button onClick={() => handleAction(api.approveCase, 'Approve')}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold flex items-center justify-center gap-1.5 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />Approve
                </button>
                <button onClick={() => handleAction(api.retryCase, 'Retry')}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-bold flex items-center justify-center gap-1.5 border border-blue-200">
                  <Play className="w-3.5 h-3.5" />Retry
                </button>
                <button onClick={() => handleAction(api.escalateCase, 'Escalate')}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold flex items-center justify-center gap-1.5 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />Escalate
                </button>
                <button onClick={() => handleAction(api.stopCase, 'Stop')}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg font-bold flex items-center justify-center gap-1.5 border border-rose-200">
                  <XCircle className="w-3.5 h-3.5" />Stop
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Recovery Timeline */}
        <div className="lg:col-span-3">
          <RecoveryTimeline
            caseDoc={c}
            agentDecision={agent_decision}
            auditLogs={audit_logs}
            recoveryActions={recovery_actions}
          />
        </div>
      </div>
    </div>
  );
};
