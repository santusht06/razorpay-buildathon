import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Save, CheckCircle2, BookOpen } from 'lucide-react';

export const Settings = () => {
  const [maxRetries, setMaxRetries] = useState(3);
  const [maxAmount, setMaxAmount] = useState(50000);
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Policy Engine & Security Guardrails</h1>
        <p className="text-xs text-slate-600 mt-1 font-medium">Define deterministic parameters and safety limits enforced on all Groq AI Agent recommendations.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Merchant Guardrail Policies successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6 shadow-sm">
        <div className="flex items-center space-x-2 text-blue-700 font-extrabold text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Deterministic Financial Guardrails</span>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-900 font-bold mb-1">Maximum Automated Retries</label>
            <p className="text-slate-500 text-[11px] mb-2 font-medium">Maximum number of retries the AI agent can execute automatically before escalating to merchant support.</p>
            <input
              type="number"
              value={maxRetries}
              onChange={(e) => setMaxRetries(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold text-xs w-36 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-bold mb-1">Maximum Automated Recovery Amount (₹)</label>
            <p className="text-slate-500 text-[11px] mb-2 font-medium">Transactions exceeding this amount require manual merchant approval before executing automated retries.</p>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold text-xs w-48 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-bold mb-1">High-Value VIP Threshold (₹)</label>
            <p className="text-slate-500 text-[11px] mb-2 font-medium">Transactions equal to or exceeding this threshold trigger high-priority merchant account manager alerts.</p>
            <input
              type="number"
              value={highValueLimit}
              onChange={(e) => setHighValueLimit(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold text-xs w-48 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Guardrail Policies</span>
          </button>
        </div>
      </form>

      {/* RAG Knowledge Base Preview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-purple-700 font-extrabold text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>Active RAG Vector Playbooks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <div className="font-extrabold text-slate-900">Insufficient Funds Playbook</div>
            <p className="text-slate-600 text-[11px] font-medium">Dynamic retry delay with customer LTV score verification and personalized checkout links.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <div className="font-extrabold text-slate-900">Expired Card Guidance</div>
            <p className="text-slate-600 text-[11px] font-medium">Strict prohibition on immediate automated retries to avoid gateway penalty fees; requests card update.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
