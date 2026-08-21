import React from 'react';

export const MetricCard = ({ title, value, subtext, icon: Icon, trend, color = 'blue' }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100'
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <div className="glass-card rounded-xl p-5 border glass-card-hover flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${style}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        {subtext && (
          <div className="mt-1.5 flex items-center text-xs text-slate-500 font-medium">
            {trend && <span className="font-bold text-emerald-600 mr-1.5">{trend}</span>}
            <span>{subtext}</span>
          </div>
        )}
      </div>
    </div>
  );
};
