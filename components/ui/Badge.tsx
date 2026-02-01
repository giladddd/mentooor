
import React from 'react';
import { Category } from '../../types';

interface BadgeProps {
  category: Category | string;
}

export const Badge: React.FC<BadgeProps> = ({ category }) => {
  let colorClass = 'bg-slate-100 text-slate-600 border-slate-200';
  let label = category as string;

  if (category === Category.MAIN) {
    label = localStorage.getItem('main_category_label') || 'יומי';
  }

  switch (category) {
    case Category.PERSONAL:
      colorClass = 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/10';
      break;
    case Category.OCCUPATIONAL:
      colorClass = 'bg-blue-50 text-blue-600 border-blue-100 ring-blue-500/10';
      break;
    case Category.FINANCIAL:
      colorClass = 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10';
      break;
    default:
      colorClass = 'bg-slate-50 text-slate-500 border-slate-100 ring-slate-500/10';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ring-1 ring-inset ${colorClass} shadow-sm`}>
      {label}
    </span>
  );
};
