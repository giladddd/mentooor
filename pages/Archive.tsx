
import React, { useState, useEffect, useMemo } from 'react';
import { Archive as ArchiveIcon, Calendar, Trash2, RotateCcw, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Category, Task } from '../types';
import { SectionContainer } from '../components/ui/SectionContainer';
import { Link } from 'react-router-dom';

interface ArchivedTask extends Task {
  completedAt?: string;
}

export const Archive: React.FC = () => {
  const [tasks, setTasks] = useState<ArchivedTask[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mainLabel, setMainLabel] = useState(() => localStorage.getItem('main_category_label') || 'יומי');

  useEffect(() => {
    const loadAllTasks = () => {
      // Load from all potential storage keys
      const main = JSON.parse(localStorage.getItem('dashboard_main_tasks') || '[]');
      const personal = JSON.parse(localStorage.getItem('tasks_personal') || '[]');
      const occupational = JSON.parse(localStorage.getItem('tasks_occ') || '[]');
      const financial = JSON.parse(localStorage.getItem('fin_tasks_v2') || '[]');
      
      const combined = [...main, ...personal, ...occupational, ...financial];
      
      // Deduplicate by ID
      const uniqueMap = new Map<string, ArchivedTask>();
      combined.forEach(t => {
          if (!uniqueMap.has(t.id) || t.category === Category.MAIN) {
              uniqueMap.set(t.id, t);
          }
      });
      
      setTasks(Array.from(uniqueMap.values()));
    };

    loadAllTasks();
  }, []);

  const archivedTasks = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return tasks.filter(t => {
      if (!t.completed) return false;
      const completedDate = t.completedAt ? new Date(t.completedAt) : new Date();
      
      const matchesSearch = t.text.toLowerCase().includes(searchTerm.toLowerCase());
      const isWithinWeek = completedDate >= sevenDaysAgo;
      
      return matchesSearch && isWithinWeek;
    }).sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
    });
  }, [tasks, searchTerm]);

  const restoreTask = (taskId: string) => {
    const taskToRestore = tasks.find(t => t.id === taskId);
    if (!taskToRestore) return;

    const restoredTask: ArchivedTask = { 
      ...taskToRestore, 
      completed: false, 
      completedAt: undefined 
    };

    const newTasks = tasks.map(t => t.id === taskId ? restoredTask : t);
    setTasks(newTasks);

    // Update Main Dashboard Storage
    const existingMain = JSON.parse(localStorage.getItem('dashboard_main_tasks') || '[]');
    const newMain = restoredTask.category === Category.MAIN 
      ? [restoredTask, ...existingMain.filter((t: any) => t.id !== taskId)]
      : existingMain.filter((t: any) => t.id !== taskId);
    localStorage.setItem('dashboard_main_tasks', JSON.stringify(newMain));

    // Update Sub-Category Storages
    const updateSubStorage = (key: string, cat: Category) => {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const belongsHere = restoredTask.category === cat || restoredTask.originalCategory === cat;
      
      const updated = belongsHere
        ? [restoredTask, ...existing.filter((t: any) => t.id !== taskId)]
        : existing.filter((t: any) => t.id !== taskId);
      
      localStorage.setItem(key, JSON.stringify(updated));
    };

    updateSubStorage('tasks_personal', Category.PERSONAL);
    updateSubStorage('tasks_occ', Category.OCCUPATIONAL);
    updateSubStorage('fin_tasks_v2', Category.FINANCIAL);
  };

  const permanentlyDelete = (taskId: string) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק משימה זו לצמיתות מהארכיון?")) return;
    
    // 1. Update UI state
    const newTasks = tasks.filter(t => t.id !== taskId);
    setTasks(newTasks);
    
    // 2. Clear from all potential local storage keys
    const keys = ['dashboard_main_tasks', 'tasks_personal', 'tasks_occ', 'fin_tasks_v2'];
    keys.forEach(key => {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter((t: any) => t.id !== taskId);
      localStorage.setItem(key, JSON.stringify(filtered));
    });
  };

  return (
    <div className="pb-24 space-y-8 animate-fade-in text-right" dir="rtl">
      <div className="flex items-center gap-5 border-b border-slate-200/60 pb-8">
        <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-sm">
            <ArchiveIcon size={32} />
        </div>
        <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">ארכיון משימות</h1>
            <p className="text-slate-500 text-lg mt-1 font-light">משימות שבוצעו בשבוע האחרון. ניתן לשחזר או למחוק לצמיתות.</p>
        </div>
        <Link to="/" className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
            חזור ללוח המחוונים <ArrowRight size={14} className="rotate-180" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SectionContainer 
            id="archive_list_v2" 
            title={`משימות שבוצעו (${archivedTasks.length})`}
            icon={<CheckCircle2 size={20} className="text-emerald-500" />}
            headerAction={
                <div className="relative">
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="חיפוש בארכיון..." 
                        className="bg-slate-50 border border-slate-200 rounded-xl py-2 pr-10 pl-4 text-xs outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 w-48 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            }
        >
            <div className="divide-y divide-slate-100 bg-white min-h-[400px]">
                {archivedTasks.length === 0 ? (
                    <div className="py-24 text-center text-slate-300">
                        <ArchiveIcon size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-bold">הארכיון ריק</p>
                        <p className="text-xs mt-1">רק משימות שבוצעו בשבוע האחרון מופיעות כאן</p>
                    </div>
                ) : (
                    archivedTasks.map(task => (
                        <div key={task.id} className="p-5 flex items-center hover:bg-slate-50 group animate-fade-in transition-colors">
                            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                                <CheckCircle2 size={16} />
                            </div>
                            
                            <div className="flex-1 text-right mr-4">
                                <div className="text-lg font-bold text-slate-400 line-through decoration-slate-300">
                                    {task.text}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 font-medium">
                                    <div className="flex items-center gap-1"><Calendar size={10} /> בוצע ב: {task.completedAt ? new Date(task.completedAt).toLocaleDateString('he-IL') : 'לא ידוע'}</div>
                                    <span className="opacity-30">|</span>
                                    <div className="flex items-center gap-1">סווג כ: <Badge category={task.category} /></div>
                                    {task.originalCategory && <div className="flex items-center gap-1 text-[9px] opacity-60">(מקור: {task.originalCategory})</div>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => restoreTask(task.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all text-xs font-bold border border-blue-100 shadow-sm"
                                    title={`שחזר ל${task.category === Category.MAIN ? mainLabel : task.category}`}
                                >
                                    <RotateCcw size={14} />
                                    <span>שחזר</span>
                                </button>
                                <button 
                                    onClick={() => permanentlyDelete(task.id)}
                                    className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                                    title="מחק לצמיתות מהמערכת"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </SectionContainer>
      </div>
    </div>
  );
};
