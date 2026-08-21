import React from 'react';
import { CheckCircle2, ShieldCheck, Cpu, Mail, AlertTriangle, Play, RefreshCw } from 'lucide-react';

export const AuditTimeline = ({ auditLogs = [], agentDecision, recoveryActions = [] }) => {
  const getActorBadge = (actor) => {
    switch (actor) {
      case 'webhook':
        return { label: 'Razorpay Webhook', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40', icon: Play };
      case 'ai_agent':
        return { label: 'AI Recovery Agent', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: Cpu };
      case 'policy_engine':
        return { label: 'Policy Engine Guardrail', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: ShieldCheck };
      case 'email_service':
      case 'recovery_service':
        return { label: 'Action Service', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: Mail };
      case 'merchant_checkout':
        return { label: 'Customer Checkout', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40', icon: CheckCircle2 };
      default:
        return { label: actor, color: 'bg-slate-500/20 text-slate-300 border-slate-500/40', icon: RefreshCw };
    }
  };

  if (!auditLogs || auditLogs.length === 0) {
    return <div className="text-slate-400 text-sm py-4 text-center">No timeline records available yet.</div>;
  }

  return (
    <div className="relative pl-6 border-l-2 border-slate-800 space-y-6 my-4">
      {auditLogs.map((log, idx) => {
        const actorInfo = getActorBadge(log.actor);
        const IconComponent = actorInfo.icon;
        const dateStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';

        return (
          <div key={log.log_id || idx} className="relative group">
            {/* Dot node */}
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-sky-400 group-hover:border-sky-300 group-hover:scale-110 transition-transform" />
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${actorInfo.color}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                    {actorInfo.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{log.event}</span>
                </div>
                <span className="text-xs text-slate-400">{dateStr}</span>
              </div>

              {log.details && (
                <div className="mt-2.5 bg-slate-950/70 rounded p-2.5 border border-slate-800/80 text-xs font-mono text-slate-300 overflow-x-auto">
                  {Object.entries(log.details).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-slate-500 font-semibold">{k}:</span>
                      <span className="text-sky-300">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
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
