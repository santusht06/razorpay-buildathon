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
    <aside className="w-56 bg-[#f8fafc] border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-3.5rem)] sticky top-14 shrink-0 select-none text-xs">
      <div className="p-3 space-y-6 overflow-y-auto">
        
        {/* Core Links */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-200/80 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-200/80 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 text-slate-500" />
            <span>Transactions</span>
          </button>

          <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors font-medium">
            <Landmark className="w-4 h-4 text-slate-500" />
            <span>Settlements</span>
          </button>

          <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors font-medium">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Reports</span>
          </button>
        </div>

        {/* AI REVENUE RECOVERY SECTION */}
        <div className="space-y-1">
          <div className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider px-3 mb-1.5 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-500 fill-current" />
            <span>AI Revenue Recovery</span>
          </div>

          <button
            onClick={() => setActiveTab('recoveries')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors font-medium ${
              activeTab === 'recoveries' || activeTab === 'recovery-detail'
                ? 'bg-slate-200/80 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Revenue Cases</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors font-medium ${
              activeTab === 'analytics'
                ? 'bg-slate-200/80 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-4 h-4 text-slate-500" />
            <span>Financial Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors font-medium ${
              activeTab === 'evaluation'
                ? 'bg-slate-200/80 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span>AI Benchmark</span>
            </div>
            <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-purple-100 text-purple-700">Rules vs AI</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors font-medium ${
              activeTab === 'settings'
                ? 'bg-slate-200/80 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Policy Engine</span>
          </button>
        </div>

        {/* PAYMENT PRODUCTS SECTION (from screenshot) */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
            PAYMENT PRODUCTS
          </div>

          <button className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium">
            <div className="flex items-center space-x-2.5">
              <Link className="w-3.5 h-3.5 text-slate-400" />
              <span>Payment Links</span>
            </div>
            <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-emerald-100 text-emerald-700">New Update</span>
          </button>

          <button className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium">
            <FileCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Payment Pages</span>
          </button>

          <button className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium">
            <QrCode className="w-3.5 h-3.5 text-slate-400" />
            <span>Razorpay.me Link</span>
          </button>

          <button className="w-full flex items-center space-x-1 text-slate-400 px-3 py-1.5 hover:text-slate-700 font-medium">
            <span>+9 More</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Pinned Bottom Account & Settings (from screenshot) */}
      <div className="p-3 border-t border-slate-200 bg-[#f8fafc]">
        <button
          onClick={() => setActiveTab('settings')}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-200/80 transition-colors font-bold"
        >
          <Settings className="w-4 h-4 text-slate-600" />
          <span>Account & Settings</span>
        </button>
      </div>
    </aside>
  );
};
