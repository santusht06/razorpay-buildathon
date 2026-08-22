import React from 'react';

export const MetricCard = ({ title, value, subtext, icon: Icon, trend, color = 'blue' }) => {
  const colorMap = {
    blue: 'text-[#0C54EA] bg-blue-50 border-blue-200',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    rose: 'text-rose-600 bg-rose-50 border-rose-200'
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <div className="rzp-card rzp-card-hover rounded-2xl p-5 border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${style}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-black text-[#02042B] tracking-tight font-sans">{value}</div>
        {subtext && (
          <div className="mt-1.5 flex items-center text-xs text-slate-500 font-semibold">
            {trend && <span className="font-extrabold text-emerald-600 mr-1.5">{trend}</span>}
            <span>{subtext}</span>
          </div>
        )}
      </div>
    </div>
  );
};

