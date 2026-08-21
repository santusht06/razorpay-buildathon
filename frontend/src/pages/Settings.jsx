import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Save, CheckCircle2, BookOpen } from 'lucide-react';

export const Settings = () => {
  const [maxRetries, setMaxRetries] = useState(3);
  const [maxAmount, setMaxAmount] = useState(100000);
  const [highValueLimit, setHighValueLimit] = useState(10000);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Policy Engine & Security Guardrails</h1>
        <p className="text-xs text-slate-400 mt-1">Define deterministic parameters and safety limits enforced on all AI Agent recommendations.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Merchant Guardrail Policies successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>Deterministic Financial Guardrails</span>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-200 font-semibold mb-1">Maximum Automated Retries</label>
            <p className="text-slate-400 text-[11px] mb-2">Maximum number of retries the AI agent can execute automatically before escalating to merchant support.</p>
            <input
              type="number"
              value={maxRetries}
              onChange={(e) => setMaxRetries(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs w-36 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1">Maximum Automated Recovery Amount (₹)</label>
            <p className="text-slate-400 text-[11px] mb-2">Transactions exceeding this amount require manual merchant confirmation before executing financial retries.</p>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs w-48 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1">High-Value VIP Threshold (₹)</label>
            <p className="text-slate-400 text-[11px] mb-2">Transactions equal to or exceeding this threshold trigger high-priority merchant account manager alerts.</p>
            <input
              type="number"
              value={highValueLimit}
              onChange={(e) => setHighValueLimit(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs w-48 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-600/30 flex items-center space-x-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Guardrail Policies</span>
          </button>
        </div>
      </form>

      {/* RAG Knowledge Base Preview */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-3">
          <BookOpen className="w-4 h-4" />
          <span>Active RAG Knowledge Base Playbooks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">Insufficient Funds Playbook</div>
            <p className="text-slate-400 text-[11px]">Dynamic retry delay with customer LTV score verification and personalized email checkout links.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">Expired Card Guidance</div>
            <p className="text-slate-400 text-[11px]">Strict prohibition on immediate automated retries to avoid gateway penalty fees; requests card update.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
