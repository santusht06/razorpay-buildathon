import React from 'react';
import { CheckCircle2, ShieldCheck, Cpu, Mail, Play, RefreshCw } from 'lucide-react';

export const AuditTimeline = ({ auditLogs = [], agentDecision, recoveryActions = [] }) => {
  const getActorBadge = (actor) => {
    switch (actor) {
      case 'webhook':
        return { label: 'Razorpay Webhook', color: 'bg-sky-50 text-sky-700 border-sky-200', icon: Play };
      case 'ai_agent':
      case 'groq_llm':
        return { label: 'AI Agent (Groq LLM)', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Cpu };
      case 'policy_engine':
        return { label: 'Policy Engine Guardrail', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: ShieldCheck };
      case 'email_service':
      case 'recovery_service':
        return { label: 'Action Engine', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Mail };
      case 'verification_service':
      case 'merchant_checkout':
        return { label: 'Verification Service', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
      default:
        return { label: actor, color: 'bg-slate-100 text-slate-700 border-slate-200', icon: RefreshCw };
    }
  };

  if (!auditLogs || auditLogs.length === 0) {
    return <div className="text-slate-500 text-sm py-4 text-center">No timeline records available yet.</div>;
  }

  return (
    <div className="relative pl-6 border-l-2 border-slate-200 space-y-5 my-3">
      {auditLogs.map((log, idx) => {
        const actorInfo = getActorBadge(log.actor);
        const IconComponent = actorInfo.icon;
        const dateStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';

        return (
          <div key={log.log_id || log.event_id || idx} className="relative group">
            {/* Node marker */}
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-600 shadow-sm" />
            
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold border ${actorInfo.color}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                    {actorInfo.label}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{log.event || log.event_type}</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">{dateStr}</span>
              </div>

              {log.details && Object.keys(log.details).length > 0 && (
                <div className="mt-2.5 bg-slate-50 rounded-lg p-3 border border-slate-200/80 text-[11px] font-mono text-slate-700 space-y-1">
                  {Object.entries(log.details).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-slate-500 font-semibold">{k}:</span>
                      <span className="text-blue-700 font-medium">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
