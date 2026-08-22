import React from 'react';
import { 
  Home, 
  ArrowLeftRight, 
  Landmark, 
  FileText, 
  Link, 
  FileCheck, 
  QrCode, 
  RotateCcw, 
  PieChart, 
  BarChart3, 
  Settings, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-4.25rem)] sticky top-16 shrink-0 select-none text-xs shadow-xs">
      <div className="p-3.5 space-y-6 overflow-y-auto">
        
        {/* Core Links */}
        <div className="space-y-1">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-1">
            Core Overview
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#EDF5FF] text-[#0C54EA] border-l-4 border-[#0C54EA]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Home className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#0C54EA]' : 'text-slate-400'}`} />
            <span>Overview & Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
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
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-[#EDF5FF] text-[#0C54EA] border-l-4 border-[#0C54EA]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'audit' ? 'text-[#0C54EA]' : 'text-slate-400'}`} />
            <span>Audit Trail</span>
          </button>
        </div>

        {/* AI REVENUE RECOVERY SECTION */}
        <div className="space-y-1">
          <div className="text-[10px] font-extrabold text-[#0C54EA] uppercase tracking-wider px-3 mb-1.5 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>AI Agentic Stack</span>
          </div>

          <button
            onClick={() => setActiveTab('recoveries')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-bold ${
              activeTab === 'recoveries' || activeTab === 'recovery-detail'
                ? 'bg-[#EDF5FF] text-[#0C54EA] border-l-4 border-[#0C54EA]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <RotateCcw className={`w-4 h-4 ${activeTab === 'recoveries' ? 'text-[#0C54EA]' : 'text-slate-400'}`} />
              <span>Revenue Cases</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all font-bold ${
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
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-bold ${
              activeTab === 'evaluation'
                ? 'bg-[#EDF5FF] text-[#0C54EA] border-l-4 border-[#0C54EA]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <BarChart3 className={`w-4 h-4 ${activeTab === 'evaluation' ? 'text-[#0C54EA]' : 'text-slate-400'}`} />
              <span>AI Benchmark</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-purple-50 text-purple-700 border border-purple-200">AI vs Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all font-bold ${
              activeTab === 'settings'
                ? 'bg-[#EDF5FF] text-[#0C54EA] border-l-4 border-[#0C54EA]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#0C54EA]' : 'text-slate-400'}`} />
            <span>Policy Engine</span>
          </button>
        </div>

        {/* PAYMENT PRODUCTS SECTION */}
        <div className="space-y-1">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
            PAYMENT PRODUCTS
          </div>

          <button className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium">
            <div className="flex items-center space-x-2.5">
              <Link className="w-3.5 h-3.5 text-slate-400" />
              <span>Payment Links</span>
            </div>
            <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
          </button>

          <button className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium">
            <FileCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Payment Pages</span>
          </button>

          <button className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium">
            <QrCode className="w-3.5 h-3.5 text-slate-400" />
            <span>Razorpay.me Link</span>
          </button>
        </div>

      </div>

      {/* Pinned Bottom Account & Settings */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <button
          onClick={() => setActiveTab('settings')}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors font-bold text-xs"
        >
          <Settings className="w-4 h-4 text-slate-600" />
          <span>Account & Guardrails</span>
        </button>
      </div>
    </aside>
  );
};

