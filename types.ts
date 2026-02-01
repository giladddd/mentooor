
import React from 'react';

export enum Category {
  PERSONAL = 'אישי',
  OCCUPATIONAL = 'תעסוקתי',
  FINANCIAL = 'כלכלי',
  MAIN = 'ראשי'
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: Category;
  originalCategory?: Category;
  date?: string;
  iconType?: string;
  isHabit?: boolean;
}

export interface Opportunity {
  id: string;
  name: string;
  category: Category;
  originalCategory?: Category;
  date: string;
  url?: string;
  status: 'פתוח' | 'בתהליך' | 'סגור';
  isHabit?: boolean;
  lastReset?: string; // ISO date string
}

export interface FinancialItem {
  id: string;
  name: string;
  amount: number;
  type?: string;
  url?: string;
  category: 'netWorth' | 'income' | 'expenses' | 'insurance' | 'liabilities';
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}
