
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Calendar, Flag, Target, ArrowRight, Plus, GripVertical, X, Palette, CheckCircle, Trash2 } from 'lucide-react';
import { EditableText } from '../components/ui/EditableText';

// --- Types ---
type Status = 'planned' | 'in-progress' | 'completed' | 'delayed';

interface StrategicGoal {
  id: string;
  yearIndex: number; // 1, 2, or 3 (relative to current year)
  title: string;
  startQ: number; // 1-4
  endQ: number; // 1-4
  color: string;
  status: Status;
}

interface YearVision {
  yearIndex: number;
  vision: string;
}

const COLORS = [
  { label: 'כלכלי', class: 'bg-blue-500 border-blue-600 text-white', hex: '#3b82f6' },
  { label: 'תעסוקתי', class: 'bg-amber-500 border-amber-600 text-white', hex: '#f59e0b' },
  { label: 'אישי', class: 'bg-rose-500 border-rose-600 text-white', hex: '#f43f5e' },
];

const STATUSES: { value: Status; label: string; icon: any }[] = [
  { value: 'planned', label: 'מתוכנן', icon: Calendar },
  { value: 'in-progress', label: 'בתהליך', icon: Target },
  { value: 'completed', label: 'הושלם', icon: CheckCircle },
  { value: 'delayed', label: 'מתעכב', icon: Flag },
];

export const StrategicGantt: React.FC = () => {
  // --- Dynamic Year Calculation ---
  const currentYear = new Date().getFullYear();
  
  // --- State ---
  const [activeYearIndex, setActiveYearIndex] = useState<number | null>(null);
  
  // Persistence
  const [visions, setVisions] = useState<YearVision[]>(() => {
    const saved = localStorage.getItem('strat_visions_v3');
    return saved ? JSON.parse(saved) : [
      { yearIndex: 1, vision: 'בניית יסודות חזקים וייצוב כלכלי' },
      { yearIndex: 2, vision: 'צמיחה והתרחבות לתחומים חדשים' },
      { yearIndex: 3, vision: 'הגשמת חזון מלאה ועצמאות' }
    ];
  });

  const [goals, setGoals] = useState<StrategicGoal[]>(() => {
    const saved = localStorage.getItem('strat_goals_v3');
    return saved ? JSON.parse(saved) : [
       { id: '1', yearIndex: 1, title: 'הקמת תשתית עסקית', startQ: 1, endQ: 2, color: COLORS[0].class, status: 'in-progress' },
       { id: '2', yearIndex: 1, title: 'גיוס לקוח ראשון', startQ: 2, endQ: 3, color: COLORS[1].class, status: 'planned' },
    ];
  });

  const [editingGoal, setEditingGoal] = useState<StrategicGoal | null>(null);

  // Effects
  useEffect(() => localStorage.setItem('strat_visions_v3', JSON.stringify(visions)), [visions]);
  useEffect(() => localStorage.setItem('strat_goals_v3', JSON.stringify(goals)), [goals]);

  // Helpers
  const getYearFromIndex = (index: number) => currentYear + index - 1;

  const updateVision = (yearIndex: number, text: string) => {
    setVisions(prev => prev.map(v => v.yearIndex === yearIndex ? { ...v, vision: text } : v));
  };

  const addGoal = (yearIndex: number, openImmediate = false) => {
    const newGoal: StrategicGoal = {
      id: Date.now().toString(),
      yearIndex,
      title: 'יעד אסטרטגי חדש',
      startQ: 1,
      endQ: 2,
      color: COLORS[0].class,
      status: 'planned'
    };
    setGoals(prev => [...prev, newGoal]);
    if (openImmediate) {
      setActiveYearIndex(yearIndex);
      setEditingGoal(newGoal);
    }
  };

  const updateGoal = (updated: StrategicGoal) => {
    setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    setEditingGoal(null);
  };

  // --- Main Cards View ---
  if (activeYearIndex === null) {
    return (
      <div className="space-y-8 animate-fade-in pb-20 text-right" dir="rtl">
        <div className="flex items-center gap-5 border-b border-slate-200/60 pb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm ring-4 ring-blue-50/50">
                <Target size={32} strokeWidth={2} />
            </div>
            <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-800 tracking-tight">מפת דרכים אסטרטגית</h1>
                <p className="text-slate-500 text-lg mt-1 font-light">תכנון תלת-שנתי דינמי ({currentYear}-{currentYear + 2})</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((index) => {
             const yearValue = getYearFromIndex(index);
             const vision = visions.find(v => v.yearIndex === index)?.vision || '';
             const yearGoalsCount = goals.filter(g => g.yearIndex === index).length;

             return (
               <div 
                  key={index}
                  onClick={() => setActiveYearIndex(index)}
                  className={`group relative bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-[28rem] ${index === 1 ? 'ring-2 ring-blue-500/20' : ''}`}
               >
                  {index === 1 && (
                      <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide z-20">
                          שנה נוכחית
                      </div>
                  )}
                  
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6 relative z-10">
                          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                              <span className="text-2xl font-bold text-slate-800">{yearValue}</span>
                          </div>
                          <div className="bg-blue-50 text-blue-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight size={20} className="rotate-180" />
                          </div>
                      </div>

                      <div className="flex-1 relative z-10">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">יעדים מרכזיים לשנת {yearValue}</label>
                          <div onClick={e => e.stopPropagation()}>
                            <EditableText 
                                value={vision} 
                                onChange={(v) => updateVision(index, v)} 
                                multiline={true}
                                className="text-xl font-medium text-slate-700 leading-relaxed"
                            />
                          </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-400 relative z-10">
                          <Target size={14} />
                          <span>{yearGoalsCount} יעדים מוגדרים</span>
                      </div>
                  </div>

                  {/* LARGE ACTION BUTTON */}
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        addGoal(index, true);
                    }}
                    className="w-full py-5 bg-slate-50 hover:bg-blue-600 text-slate-600 hover:text-white border-t border-slate-100 transition-all font-bold flex items-center justify-center gap-2 group/btn relative z-20"
                  >
                      <Plus size={20} className="group-hover/btn:scale-110 transition-transform" />
                      <span>הוסף יעד ל-{yearValue}</span>
                  </button>
               </div>
             );
          })}
        </div>
      </div>
    );
  }

  // --- Detailed View (Gantt) ---
  const activeYearValue = getYearFromIndex(activeYearIndex);

  return (
    <div className="animate-fade-in pb-20 text-right" dir="rtl">
        <div className="flex items-center justify-between mb-6">
            <button 
                onClick={() => setActiveYearIndex(null)} 
                className="flex items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors font-medium text-sm"
            >
                <ChevronRight size={14} /> חזרה למפת הדרכים
            </button>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                תכנית עבודה: {activeYearValue}
            </span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
             <div className="flex items-center gap-4">
                <button 
                    disabled={activeYearIndex === 1}
                    onClick={() => setActiveYearIndex(activeYearIndex - 1)}
                    className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="שנה קודמת"
                >
                    <ChevronRight size={20} />
                </button>
                
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">גאנט שנתי - {activeYearValue}</h2>
                    <div className="w-fit mt-2">
                        <EditableText 
                            value={visions.find(v => v.yearIndex === activeYearIndex)?.vision || ''}
                            onChange={(v) => updateVision(activeYearIndex, v)}
                            className="text-lg text-slate-500 font-light"
                        />
                    </div>
                </div>

                <button 
                    disabled={activeYearIndex === 3}
                    onClick={() => setActiveYearIndex(activeYearIndex + 1)}
                    className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="שנה הבאה"
                >
                    <ChevronLeft size={20} />
                </button>
             </div>
             <button 
                onClick={() => addGoal(activeYearIndex, false)}
                className="bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
             >
                 <Plus size={18} /> הוסף יעד אסטרטגי
             </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">
            <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 text-center divide-x divide-x-reverse divide-slate-200">
                {['רבעון 1', 'רבעון 2', 'רבעון 3', 'רבעון 4'].map(q => (
                    <div key={q} className="p-3 font-bold text-slate-700">{q}</div>
                ))}
            </div>

            <div className="relative min-h-[400px] p-4 space-y-3 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                <div className="absolute inset-0 grid grid-cols-4 pointer-events-none z-0 divide-x divide-x-reverse divide-slate-100">
                    <div className="h-full"></div><div className="h-full"></div><div className="h-full"></div><div className="h-full"></div>
                </div>

                {goals.filter(g => g.yearIndex === activeYearIndex).length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 z-0">
                        <div className="text-center">
                            <Target size={48} className="mx-auto mb-2 opacity-50"/>
                            <p>אין יעדים מתוכננים לשנה זו</p>
                        </div>
                    </div>
                )}

                {goals.filter(g => g.yearIndex === activeYearIndex).map((goal) => (
                   <GanttRow 
                      key={goal.id} 
                      goal={goal} 
                      onEdit={() => setEditingGoal(goal)} 
                      onResize={(newEndQ) => updateGoal({ ...goal, endQ: newEndQ })}
                   />
                ))}
            </div>
        </div>

        {editingGoal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden" dir="rtl">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">עריכת יעד</h3>
                                <p className="text-xs text-slate-400">שנת {activeYearValue}</p>
                            </div>
                            <button onClick={() => setEditingGoal(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 block">שם היעד</label>
                                <input 
                                    type="text" 
                                    value={editingGoal.title}
                                    onChange={(e) => setEditingGoal({...editingGoal, title: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">רבעון התחלה</label>
                                    <select 
                                        value={editingGoal.startQ}
                                        onChange={(e) => setEditingGoal({...editingGoal, startQ: Number(e.target.value)})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none font-bold"
                                    >
                                        {[1,2,3,4].map(q => <option key={q} value={q}>רבעון {q}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">רבעון סיום</label>
                                    <select 
                                        value={editingGoal.endQ}
                                        onChange={(e) => setEditingGoal({...editingGoal, endQ: Number(e.target.value)})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none font-bold"
                                    >
                                        {[1,2,3,4].map(q => <option key={q} value={q} disabled={q < editingGoal.startQ}>רבעון {q}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-2 block">סטטוס</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {STATUSES.map(s => {
                                        const Icon = s.icon;
                                        return (
                                            <button
                                                key={s.value}
                                                onClick={() => setEditingGoal({...editingGoal, status: s.value})}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                                                    editingGoal.status === s.value 
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                                    : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                                                }`}
                                            >
                                                <Icon size={14} /> {s.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-2 block flex items-center gap-1"><Palette size={12}/> קטגוריה וצבע</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {COLORS.map((c) => (
                                        <button 
                                            key={c.label}
                                            onClick={() => setEditingGoal({...editingGoal, color: c.class})}
                                            className={`py-3 px-1 rounded-xl text-[11px] font-bold border transition-all flex flex-col items-center gap-2 ${editingGoal.color === c.class ? 'ring-2 ring-blue-500 border-transparent ' + c.class : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            <span className={editingGoal.color === c.class ? 'text-white' : ''}>{c.label}</span>
                                            <div className={`w-3 h-3 rounded-full border border-black/5 ${editingGoal.color === c.class ? 'bg-white' : c.class.split(' ')[0]}`}></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
                             <button 
                                onClick={() => { updateGoal(editingGoal); setEditingGoal(null); }}
                                className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg"
                             >
                                 שמור שינויים
                             </button>
                             <button 
                                onClick={() => deleteGoal(editingGoal.id)}
                                className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                             >
                                 <Trash2 size={20} />
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

interface GanttRowProps {
    goal: StrategicGoal;
    onEdit: () => void;
    onResize: (newEndQ: number) => void;
}

const GanttRow: React.FC<GanttRowProps> = ({ goal, onEdit, onResize }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);
    
    const startCol = goal.startQ;
    const span = (goal.endQ - goal.startQ) + 1;

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !rowRef.current) return;
            const rect = rowRef.current.parentElement?.getBoundingClientRect();
            if (!rect) return;
            
            const relativeX = e.clientX - rect.left;
            const width = rect.width;
            
            // Map client X to Q1-Q4 (RTL)
            // Logic: In RTL, rect.left + rect.width is 0. 
            // We'll calculate the progress from left to right, then invert for RTL steps.
            let targetQ = 4;
            const pct = relativeX / width;
            if (pct > 0.75) targetQ = 1;
            else if (pct > 0.50) targetQ = 2;
            else if (pct > 0.25) targetQ = 3;
            else targetQ = 4;

            if (targetQ < goal.startQ) targetQ = goal.startQ;
            onResize(targetQ);
        };

        const handleMouseUp = () => setIsResizing(false);

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, goal.startQ, onResize]);

    return (
        <div className="grid grid-cols-4 relative z-10 h-14" ref={rowRef}>
            <div 
                onClick={onEdit}
                className={`relative rounded-xl shadow-md cursor-pointer transition-all hover:brightness-105 hover:shadow-lg flex items-center px-4 overflow-hidden border ${goal.color}`}
                style={{ gridColumnStart: startCol, gridColumnEnd: `span ${span}` }}
            >
                <span className="font-bold text-sm truncate w-full">{goal.title}</span>
                <div 
                    onMouseDown={handleMouseDown}
                    className="absolute left-0 top-0 bottom-0 w-4 cursor-w-resize flex items-center justify-center hover:bg-black/10 transition-colors"
                >
                    <GripVertical size={12} className="opacity-50" />
                </div>
            </div>
        </div>
    );
};
