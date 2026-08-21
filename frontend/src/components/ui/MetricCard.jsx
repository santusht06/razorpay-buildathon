import React from 'react';

export const MetricCard = ({ title, value, subtext, icon: Icon, trend, color = 'blue' }) => {
  const colorMap = {
    blue: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <div className="glass-card rounded-xl p-5 border shadow-lg glass-card-hover flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${style}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-slate-100 tracking-tight">{value}</div>
        {subtext && (
          <div className="mt-1 flex items-center text-xs text-slate-400">
            {trend && <span className="font-semibold text-emerald-400 mr-1.5">{trend}</span>}
            <span>{subtext}</span>
          </div>
        )}
      </div>
    </div>
  );
};
