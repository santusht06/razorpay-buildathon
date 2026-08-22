import React from 'react';
import { 
  Home, 
  ArrowLeftRight, 
  FileText, 
  RotateCcw, 
  PieChart, 
  BarChart3, 
  Settings, 
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 shrink-0 select-none text-xs shadow-xs">
      <div className="p-3.5 space-y-6 overflow-y-auto">
        
        {/* Core Monitoring & Recovery */}
        <div className="space-y-1">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-1">
            Monitoring & Ledger
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#EDF5FF] text-[#0C54EA] border-l-4 border-[#0C54EA]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Home className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#0C54EA]' : 'text-slate-400'}`} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('recoveries')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-bold ${
              activeTab === 'recoveries' || activeTab === 'recovery-detail'
                ? 'bg-[#EDF5FF] text-[#0C54EA] border-l-4 border-[#0C54EA]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <RotateCcw className={`w-4 h-4 ${activeTab === 'recoveries' || activeTab === 'recovery-detail' ? 'text-[#0C54EA]' : 'text-slate-400'}`} />
              <span>Recovery Cases</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'payments'
                ? 'bg-[#EDF5FF] text-[#0C54EA] border-l-4 border-[#0C54EA]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className={`w-4 h-4 ${activeTab === 'payments' ? 'text-[#0C54EA]' : 'text-slate-400'}`} />
            <span>Payments Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-[#EDF5FF] text-[#0C54EA] border-l-4 border-[#0C54EA]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'audit' ? 'text-[#0C54EA]' : 'text-slate-400'}`} />
            <span>Audit Trail</span>
          </button>
        </div>

        {/* AI Intelligence & Guardrails */}
        <div className="space-y-1">
          <div className="text-[10px] font-extrabold text-[#0C54EA] uppercase tracking-wider px-3 mb-1.5 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>AI Intelligence & Policy</span>
          </div>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition-all font-bold ${
              activeTab === 'analytics'
                ? 'bg-[#EDF5FF] text-[#0C54EA] border-l-4 border-[#0C54EA]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <PieChart className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-[#0C54EA]' : 'text-slate-400'}`} />
            <span>Financial Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-bold ${
              activeTab === 'evaluation'
                ? 'bg-[#EDF5FF] text-[#0C54EA] border-l-4 border-[#0C54EA]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <BarChart3 className={`w-4 h-4 ${activeTab === 'evaluation' ? 'text-[#0C54EA]' : 'text-slate-400'}`} />
              <span>AI Benchmark</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-purple-50 text-purple-700 border border-purple-200">1k Cases</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition-all font-bold ${
              activeTab === 'settings'
                ? 'bg-[#EDF5FF] text-[#0C54EA] border-l-4 border-[#0C54EA]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#0C54EA]' : 'text-slate-400'}`} />
            <span>Policy Guardrails</span>
          </button>
        </div>

      </div>

      {/* Pinned Bottom System Status */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
          <span className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#0C54EA]" />
            <span>Engine: Groq AI</span>
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">Llama 70B</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Safety Guardrails</span>
          </span>
          <span className="text-[10px] bg-blue-100 text-[#0C54EA] px-1.5 py-0.2 rounded">Enforced</span>
        </div>
      </div>
    </aside>
  );
};
