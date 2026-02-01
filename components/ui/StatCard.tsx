
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, onClick, active }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative p-5 rounded-xl border cursor-pointer transition-all duration-300 group text-right
        ${active 
          ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-100' 
          : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300'
        }`}
      dir="rtl"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
          {icon}
        </div>
        {active && <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>}
      </div>
      
      <div className="text-right w-full">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
      </div>
      
      {/* Decorative accent */}
      <div className={`absolute bottom-0 right-0 left-0 h-1 rounded-b-xl transition-all ${active ? 'bg-blue-500' : 'bg-transparent group-hover:bg-blue-400'}`}></div>
    </div>
  );
};