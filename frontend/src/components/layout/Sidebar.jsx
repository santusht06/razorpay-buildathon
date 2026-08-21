import React from 'react';
import { 
  LayoutDashboard, 
  RotateCcw, 
  CreditCard, 
  ShieldCheck, 
  BarChart3, 
  Settings, 
  Sparkles,
  PieChart,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'recoveries', label: 'Recovery Cases', icon: RotateCcw },
    { id: 'analytics', label: 'Financial Analytics', icon: PieChart },
    { id: 'payments', label: 'Payments Log', icon: CreditCard },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
    { id: 'evaluation', label: 'AI Benchmark', icon: BarChart3, badge: 'Rules vs AI' },
    { id: 'settings', label: 'Policy Engine', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 font-bold">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 tracking-tight leading-none">Razorpay AI</div>
            <div className="text-[10px] font-semibold text-sky-400 uppercase tracking-widest mt-0.5">Revenue Recovery</div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-600/15 text-sky-400 border border-sky-500/30 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer merchant badge */}
      <div className="p-4 border-t border-slate-900">
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-sky-400 border border-slate-700">
            RZ
          </div>
          <div className="text-xs truncate">
            <div className="font-medium text-slate-200 truncate">TechCorp India</div>
            <div className="text-[10px] text-slate-500">Merchant ID: mch_8829</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
