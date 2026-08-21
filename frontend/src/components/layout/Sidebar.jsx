import React from 'react';
import { 
  LayoutDashboard, 
  RotateCcw, 
  CreditCard, 
  ShieldCheck, 
  BarChart3, 
  Settings, 
  PieChart,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'recoveries', label: 'Recovery Cases', icon: RotateCcw },
    { id: 'analytics', label: 'Financial Analytics', icon: PieChart },
    { id: 'payments', label: 'Payments Ledger', icon: CreditCard },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
    { id: 'evaluation', label: 'AI Benchmark', icon: BarChart3, badge: 'Baseline vs AI' },
    { id: 'settings', label: 'Policy Guardrails', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none shadow-sm">
      <div>
        {/* Razorpay Brand Header */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-100 bg-slate-50/50">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">Razorpay</div>
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">AI Revenue Recovery</div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-sm'
                    : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer merchant badge */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center font-extrabold text-xs text-blue-700 border border-blue-200">
            RZ
          </div>
          <div className="text-xs truncate">
            <div className="font-bold text-slate-900 truncate">Razorpay Merchant</div>
            <div className="text-[10px] text-slate-500 font-mono">MID: mch_8829</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
