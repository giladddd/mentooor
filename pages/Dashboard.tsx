
import React, { useState, useEffect, useMemo } from 'react';
import { Target, Zap, Calendar, CalendarPlus, ArrowRightCircle, Plus, Trash2, LayoutDashboard, RefreshCw, GripVertical, Check, ExternalLink, Lightbulb, ArrowUpCircle, PlusCircle, MinusCircle, Star, X, ChevronLeft, ChevronRight, Archive, RotateCcw, Settings2, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Category, Task, Opportunity } from '../types';
import { Table } from '../components/ui/Table';
import { EditableText } from '../components/ui/EditableText';
import { CalendarWidget } from '../components/ui/CalendarWidget';
import { SectionContainer } from '../components/ui/SectionContainer';
import { Link } from 'react-router-dom';

interface DashboardTask extends Task {
  completedAt?: string;
}

const RangePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const colors: any = { 'קצר': 'bg-emerald-100 text-emerald-700', 'בינוני': 'bg-blue-100 text-blue-700', 'ארוך': 'bg-purple-100 text-purple-700' };
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`text-[10px] font-bold px-2 py-0.5 rounded-full outline-none cursor-pointer border border-transparent hover:border-slate-300 transition-all ${colors[value] || 'bg-slate-100'}`}>
      <option value="קצר">קצר</option><option value="בינוני">בינוני</option><option value="ארוך">ארוך</option>
    </select>
  );
};

export const Dashboard: React.FC = () => {
  const getSaved = (key: string, fallback: any) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };

  const save = (key: string, val: any) => {
    localStorage.setItem(key, JSON.stringify(val));
  };

  const [mainLabel, setMainLabel] = useState(() => localStorage.getItem('main_category_label') || 'יומי');
  const [calendarDraft, setCalendarDraft] = useState<{ title: string; category: string } | null>(null);

  const [mainTasks, setMainTasks] = useState<DashboardTask[]>(() => {
    const mt = getSaved('dashboard_main_tasks', []);
    const tp = getSaved('tasks_personal', []).map((t: any) => ({ ...t, category: t.category || Category.PERSONAL }));
    const to = getSaved('tasks_occ', []).map((t: any) => ({ ...t, category: t.category || Category.OCCUPATIONAL }));
    const tf = getSaved('fin_tasks_v2', []).map((t: any) => ({ ...t, category: t.category || Category.FINANCIAL }));
    const combined = [...mt, ...tp, ...to, ...tf];
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
  });

  const [focuses, setFocuses] = useState<any[]>(() => {
    const mainF = getSaved('dashboard_main_focuses', []);
    const persF = getSaved('projects_personal', []).map((f: any) => ({ ...f, category: f.category || Category.PERSONAL }));
    const occF = getSaved('projects_occ', []).map((f: any) => ({ ...f, category: f.category || Category.OCCUPATIONAL }));
    const finF = getSaved('fin_goals_data', []).map((f: any) => ({ ...f, category: f.category || Category.FINANCIAL }));
    const combined = [...mainF, ...persF, ...occF, ...finF];
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
  });

  const [focusHeaders, setFocusHeaders] = useState(() => getSaved('dashboard_focus_headers', ['במה נתמקד', 'למה זה חשוב', 'דרכי פעולה וטווח']));

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const mo = getSaved('dashboard_opps', []);
    const op = getSaved('opps_personal', []).map((o: any) => ({ ...o, category: o.category || Category.PERSONAL }));
    const oo = getSaved('opps_occ', []).map((o: any) => ({ ...o, category: o.category || Category.OCCUPATIONAL }));
    const of = getSaved('fin_opps_data_v2', []).map((o: any) => ({ ...o, category: o.category || Category.FINANCIAL }));
    const combined = [...mo.filter((o: any) => o.category === Category.MAIN), ...op, ...oo, ...of];
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
  });

  const [heroTitle, setHeroTitle] = useState(() => localStorage.getItem('dash_hero_title') || 'מנטור עצמי');
  const [heroDesc, setHeroDesc] = useState(() => localStorage.getItem('dash_hero_desc') || 'לוקחים שליטה על החיים');
  
  const [activeTaskTab, setActiveTaskTab] = useState<Category>(Category.MAIN);
  const [activeFocusTab, setActiveFocusTab] = useState<Category>(Category.MAIN);
  const [activeOppTab, setActiveOppTab] = useState<Category>(Category.MAIN);
  const [activeIdeaTab, setActiveIdeaTab] = useState<Category>(Category.MAIN);

  // Ideas state
  const [ideasMain, setIdeasMain] = useState(() => getSaved('ideas_main', []));
  const [ideasPersonal, setIdeasPersonal] = useState(() => getSaved('ideas_personal', []));
  const [ideasOcc, setIdeasOcc] = useState(() => getSaved('ideas_occ', []));
  const [ideasFin, setIdeasFin] = useState(() => getSaved('ideas_fin', []));

  useEffect(() => {
    localStorage.setItem('main_category_label', mainLabel);
  }, [mainLabel]);

  useEffect(() => {
    const main = mainTasks.filter(t => t.category === Category.MAIN);
    save('dashboard_main_tasks', main);
    save('tasks_personal', mainTasks.filter(t => t.category === Category.PERSONAL || (t.category === Category.MAIN && t.originalCategory === Category.PERSONAL)));
    save('tasks_occ', mainTasks.filter(t => t.category === Category.OCCUPATIONAL || (t.category === Category.MAIN && t.originalCategory === Category.OCCUPATIONAL)));
    save('fin_tasks_v2', mainTasks.filter(t => t.category === Category.FINANCIAL || (t.category === Category.MAIN && t.originalCategory === Category.FINANCIAL)));
  }, [mainTasks]);

  useEffect(() => {
    const main = focuses.filter(f => f.category === Category.MAIN);
    save('dashboard_main_focuses', main);
    save('projects_personal', focuses.filter(f => f.category === Category.PERSONAL || (f.category === Category.MAIN && f.originalCategory === Category.PERSONAL)));
    save('projects_occ', focuses.filter(f => f.category === Category.OCCUPATIONAL || (f.category === Category.MAIN && f.originalCategory === Category.OCCUPATIONAL)));
    save('fin_goals_data', focuses.filter(f => f.category === Category.FINANCIAL || (f.category === Category.MAIN && f.originalCategory === Category.PERSONAL)));
    save('dashboard_focus_headers', focusHeaders);
  }, [focuses, focusHeaders]);

  useEffect(() => { 
    save('dashboard_opps', opportunities.filter(o => o.category === Category.MAIN));
    save('opps_personal', opportunities.filter(o => o.category === Category.PERSONAL || (o.category === Category.MAIN && o.originalCategory === Category.PERSONAL)));
    save('opps_occ', opportunities.filter(o => o.category === Category.OCCUPATIONAL || (o.category === Category.MAIN && o.originalCategory === Category.PERSONAL)));
    save('fin_opps_data_v2', opportunities.filter(o => o.category === Category.FINANCIAL || (o.category === Category.MAIN && o.originalCategory === Category.FINANCIAL)));
  }, [opportunities]);

  // Sync ideas
  useEffect(() => { save('ideas_main', ideasMain); }, [ideasMain]);
  useEffect(() => { save('ideas_personal', ideasPersonal); }, [ideasPersonal]);
  useEffect(() => { save('ideas_occ', ideasOcc); }, [ideasOcc]);
  useEffect(() => { save('ideas_fin', ideasFin); }, [ideasFin]);

  const activeTasks = mainTasks.filter(t => !t.completed && t.category === activeTaskTab);

  const toggleTask = (id: string) => {
    setMainTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isNowCompleted = !t.completed;
        return { 
          ...t, 
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined
        };
      }
      return t;
    }));
  };

  const addFocus = () => {
    const newFocus = {
      id: Date.now().toString(),
      name: 'מיקוד חדש...',
      category: activeFocusTab,
      why: '',
      actions: []
    };
    setFocuses([newFocus, ...focuses]);
  };

  const updateFocus = (id: string, updates: any) => {
    setFocuses(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const promoteFocus = (id: string) => {
    setFocuses(prev => prev.map(f => f.id === id ? { ...f, originalCategory: f.category, category: Category.MAIN } : f));
  };

  const demoteFocus = (id: string) => {
    setFocuses(prev => prev.map(f => (f.id === id && f.originalCategory) ? { ...f, category: f.originalCategory, originalCategory: undefined } : f));
  };

  const addOpportunity = () => {
    const cat = activeOppTab === Category.MAIN ? Category.PERSONAL : activeOppTab;
    const newOpp: Opportunity = {
      id: Date.now().toString(),
      name: 'הזדמנות חדשה...',
      category: cat,
      date: new Date().toLocaleDateString('he-IL'),
      url: '',
      status: 'פתוח'
    };
    setOpportunities([newOpp, ...opportunities]);
  };

  const promoteOpp = (id: string) => {
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, originalCategory: o.category, category: Category.MAIN } : o));
  };

  const demoteOpp = (id: string) => {
    setOpportunities(prev => prev.map(o => (o.id === id && o.originalCategory) ? { ...o, category: o.originalCategory, originalCategory: undefined } : o));
  };

  const toggleMainLabel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMainLabel(prev => prev === 'יומי' ? 'שבועי' : 'יומי');
  };

  const renderActions = (row: any) => (
    <div className="space-y-2 py-2 text-right" dir="rtl">
      {(row.actions || []).map((action: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 group/action justify-end">
          <button onClick={() => {
            const newActions = [...row.actions];
            newActions.splice(idx, 1);
            updateFocus(row.id, { actions: newActions });
          }} className="opacity-0 group-hover/action:opacity-100 text-slate-300 hover:text-rose-500 transition-all"><X size={10} /></button>
          <RangePicker value={action.range} onChange={(v) => {
              const newActions = [...(row.actions || [])];
              newActions[idx] = { ...action, range: v };
              updateFocus(row.id, { actions: newActions });
          }} />
          <div className="flex-1">
            <EditableText value={action.text} onChange={(v) => {
              const newActions = [...row.actions];
              newActions[idx] = { ...action, text: v };
              updateFocus(row.id, { actions: newActions });
            }} className="text-slate-600 text-[11px] font-medium" />
          </div>
        </div>
      ))}
      <button onClick={() => updateFocus(row.id, { actions: [...(row.actions || []), { text: 'פעולה חדשה', range: 'בינוני' }] })} className="text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1 transition-colors justify-end w-full"><Plus size={10} /> הוסף פעולה</button>
    </div>
  );

  const getActiveIdeas = () => {
    if (activeIdeaTab === Category.MAIN) return ideasMain;
    if (activeIdeaTab === Category.PERSONAL) return ideasPersonal;
    if (activeIdeaTab === Category.OCCUPATIONAL) return ideasOcc;
    if (activeIdeaTab === Category.FINANCIAL) return ideasFin;
    return [];
  };

  const setActiveIdeas = (val: any) => {
    if (activeIdeaTab === Category.MAIN) setIdeasMain(val);
    else if (activeIdeaTab === Category.PERSONAL) setIdeasPersonal(val);
    else if (activeIdeaTab === Category.OCCUPATIONAL) setIdeasOcc(val);
    else if (activeIdeaTab === Category.FINANCIAL) setIdeasFin(val);
  };

  const addIdea = () => {
    setActiveIdeas([{ id: Date.now().toString(), text: 'רעיון חדש...' }, ...getActiveIdeas()]);
  };

  return (
    <div className="pb-24 space-y-8 animate-fade-in text-right relative" dir="rtl">
      {/* --- Main UI Hero --- */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl h-56">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="relative p-10 text-white flex flex-col md:flex-row md:items-end justify-between gap-6 h-full">
            <div className="flex items-start gap-6">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <div className="absolute top-0 w-8 h-8 bg-blue-500/40 rounded-full border border-blue-400/20 backdrop-blur-sm transform translate-y-0.5"></div>
                    <div className="absolute bottom-1 left-1 w-8 h-8 bg-indigo-600/40 rounded-full border border-indigo-400/20 backdrop-blur-sm transform -translate-x-0.5"></div>
                    <div className="absolute bottom-1 right-1 w-8 h-8 bg-purple-600/40 rounded-full border border-purple-400/20 backdrop-blur-sm transform translate-x-0.5"></div>
                    <div className="relative z-10 p-2 bg-white/20 rounded-full backdrop-blur-md border border-white/30 shadow-lg">
                        <Sparkles size={24} className="text-white" />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="space-y-0.5">
                        <EditableText value={heroTitle} onChange={setHeroTitle} className="text-4xl font-bold text-white leading-none" />
                        <EditableText value={heroDesc} onChange={setHeroDesc} className="text-blue-100 text-lg font-light" />
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end gap-3">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3 rounded-2xl flex items-center gap-3 text-right">
                    <Target className="w-5 h-5 text-emerald-300" />
                    <div><div className="text-2xl font-bold leading-none">{mainTasks.filter(t => !t.completed).length}</div><div className="text-[10px] uppercase opacity-80">משימות פתוחות</div></div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="col-span-12 h-96">
            <CalendarWidget 
                title="יומן ושגרה שבועית" 
                externalDraft={calendarDraft} 
                onModalClose={() => setCalendarDraft(null)} 
            />
        </div>

        <div className="col-span-12 lg:col-span-12 space-y-5">
            <SectionContainer 
                id="dash_tasks_v4" 
                title="ריכוז משימות" 
                icon={<Check size={20} className="text-blue-500" />}
                headerAction={
                    <Link 
                        to="/archive"
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-all text-xs font-bold border border-slate-200"
                    >
                        <Archive size={14} />
                        <span>לארכיון משימות</span>
                    </Link>
                }
            >
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1 m-4">
                    {[Category.MAIN, Category.PERSONAL, Category.FINANCIAL, Category.OCCUPATIONAL].map((cat) => (
                        <button 
                          key={cat} 
                          onClick={() => setActiveTaskTab(cat)} 
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTaskTab === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                        >
                          {cat === Category.MAIN ? mainLabel : cat}
                          {cat === Category.MAIN && (
                            <div 
                              onClick={toggleMainLabel}
                              className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                              title="החלף בין יומי לשבועי"
                            >
                              <Settings2 size={12} />
                            </div>
                          )}
                        </button>
                    ))}
                </div>
                <div className="divide-y divide-slate-100 bg-white min-h-[100px]">
                    {activeTasks.length === 0 ? (
                        <div className="py-12 text-center text-slate-300">
                            <p className="text-sm">אין משימות פתוחות בקטגוריה זו</p>
                        </div>
                    ) : (
                        activeTasks.map(task => (
                            <div key={task.id} className="p-4 flex items-center hover:bg-slate-50 group animate-fade-in">
                                <GripVertical size={14} className="text-slate-300 ml-2" />
                                <div className="flex-1 text-right mr-3 flex items-center gap-2">
                                    {task.category !== Category.MAIN && (
                                        <button 
                                            onClick={() => setMainTasks(mainTasks.map(t => t.id === task.id ? { ...t, originalCategory: t.category, category: Category.MAIN } : t))} 
                                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-full transition-all"
                                            title="העבר ליומי"
                                        >
                                            <ArrowRightCircle size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                    <EditableText value={task.text} onChange={(v) => setMainTasks(prev => prev.map(t => t.id === task.id ? { ...t, text: v } : t))} className={`${task.completed ? 'text-slate-400 line-through' : 'text-slate-800 font-bold'}`} />
                                    {activeTaskTab === Category.MAIN && task.originalCategory && <span className="scale-75 origin-right opacity-60"><Badge category={task.originalCategory} /></span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setCalendarDraft({ 
                                            title: task.text, 
                                            category: task.category === Category.MAIN ? (task.originalCategory || Category.PERSONAL) : task.category 
                                        })}
                                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full transition-all"
                                        title="קבע ביומן"
                                    >
                                        <CalendarPlus size={14} />
                                    </button>

                                    {activeTaskTab === Category.MAIN && task.originalCategory && (
                                        <button onClick={() => setMainTasks(mainTasks.map(t => t.id === task.id && t.originalCategory ? { ...t, category: t.originalCategory, originalCategory: undefined } : t))} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-full transition-all"><MinusCircle size={14} /></button>
                                    )}
                                    <input 
                                        type="checkbox" 
                                        checked={task.completed} 
                                        onChange={() => toggleTask(task.id)} 
                                        className="appearance-none w-5 h-5 border-2 border-slate-900 rounded bg-white cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-slate-900 checked:after:font-bold transition-all" 
                                    />
                                    <button onClick={() => setMainTasks(prev => prev.filter(t => t.id !== task.id))} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-opacity"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))
                    )}
                    <button onClick={() => setMainTasks([{ id: Date.now().toString(), text: 'משימה חדשה', completed: false, category: activeTaskTab }, ...mainTasks])} className="w-full p-4 text-xs font-bold border-t flex items-center justify-center gap-2 text-blue-600 hover:bg-slate-50"><PlusCircle size={16}/> הוסף משימה חדשה</button>
                </div>
            </SectionContainer>
        </div>

        <div className="col-span-12 space-y-5 overflow-hidden">
            <SectionContainer id="dash_focuses_full_wide" title="ריכוז מיקודים" icon={<Star size={20} className="text-amber-500" />}>
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1 m-4">
                    {[Category.MAIN, Category.PERSONAL, Category.FINANCIAL, Category.OCCUPATIONAL].map((cat) => (
                        <button 
                          key={cat} 
                          onClick={() => setActiveFocusTab(cat)} 
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeFocusTab === cat ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}
                        >
                          {cat === Category.MAIN ? mainLabel : cat}
                          {cat === Category.MAIN && (
                            <div 
                              onClick={toggleMainLabel}
                              className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Settings2 size={12} />
                            </div>
                          )}
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="min-w-[1000px] bg-white">
                        <Table data={focuses.filter(f => f.category === activeFocusTab)} columns={[
                                { header: <div className="w-10 text-center">קידום</div>, accessor: (row: any) => (
                                      <div className="flex justify-center">
                                          {activeFocusTab !== Category.MAIN ? <button onClick={() => promoteFocus(row.id)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"><Plus size={16} strokeWidth={3} /></button> : <button onClick={() => demoteFocus(row.id)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all"><MinusCircle size={16} strokeWidth={3} /></button>}
                                      </div>
                                  ), width: '60px' },
                                { header: <EditableText value={focusHeaders[0]} onChange={(v) => setFocusHeaders([v, focusHeaders[1], focusHeaders[2]])} />, accessor: (row: any) => <div className="text-right"><EditableText value={row.name} onChange={(v) => updateFocus(row.id, { name: v })} className="font-bold text-slate-800 text-lg" />{activeFocusTab === Category.MAIN && row.originalCategory && <div className="mt-1"><Badge category={row.originalCategory} /></div>}</div>, width: '250px' },
                                { header: <EditableText value={focusHeaders[1]} onChange={(v) => setFocusHeaders([focusHeaders[0], v, focusHeaders[2]])} />, accessor: (row: any) => <EditableText value={row.why} onChange={(v) => updateFocus(row.id, { why: v })} multiline={true} className="min-h-[60px]" />, width: '300px' },
                                { header: <EditableText value={focusHeaders[2]} onChange={(v) => setFocusHeaders([focusHeaders[0], focusHeaders[1], v])} />, accessor: (row: any) => renderActions(row), width: '350px' },
                                { header: '', accessor: (row: any) => <button onClick={() => setFocuses(prev => prev.filter(f => f.id !== row.id))} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 size={16}/></button>, width: '40px' }
                            ]} />
                    </div>
                </div>
                <button onClick={addFocus} className="w-full p-4 text-sm font-bold border-t flex items-center justify-center gap-2 text-amber-600 hover:bg-slate-50"><PlusCircle size={18}/> הוסף מיקוד חדש לקטגוריה</button>
            </SectionContainer>
        </div>

        <div className="col-span-12 space-y-5">
            <SectionContainer id="dash_opps_v2" title="ריכוז הזדמנויות" icon={<Zap size={20} className="text-amber-500"/>}>
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1 m-4">
                    {[Category.MAIN, Category.PERSONAL, Category.FINANCIAL, Category.OCCUPATIONAL].map((cat) => (
                        <button 
                          key={cat} 
                          onClick={() => setActiveOppTab(cat)} 
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeOppTab === cat ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}
                        >
                          {cat === Category.MAIN ? mainLabel : cat}
                          {cat === Category.MAIN && (
                            <div 
                              onClick={toggleMainLabel}
                              className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Settings2 size={12} />
                            </div>
                          )}
                        </button>
                    ))}
                </div>
                <Table data={opportunities.filter(o => activeOppTab === Category.MAIN ? o.category === Category.MAIN : o.category === activeOppTab)} columns={[
                        { header: <div className="w-10 text-center">קידום</div>, accessor: (row: Opportunity) => (
                          <div className="flex justify-center">
                              {activeOppTab !== Category.MAIN ? <button onClick={() => promoteOpp(row.id)} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"><Plus size={14} strokeWidth={3} /></button> : <button onClick={() => demoteOpp(row.id)} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all"><MinusCircle size={14} strokeWidth={3} /></button>}
                          </div>
                        ), width: '60px' },
                        { header: 'שם ההזדמנות', accessor: (row: Opportunity) => <div className="flex items-center gap-2 justify-end"><EditableText value={row.name} onChange={(v) => setOpportunities(opportunities.map(o => o.id === row.id ? { ...o, name: v } : o))} className="font-bold text-slate-700" />{activeOppTab === Category.MAIN && row.originalCategory && <Badge category={row.originalCategory} />}</div> },
                        { header: 'יעד', accessor: (row: Opportunity) => <EditableText value={row.date} onChange={(v) => setOpportunities(opportunities.map(o => o.id === row.id ? { ...o, date: v } : o))} className="text-[11px] font-mono text-slate-400" /> },
                        { header: 'קישור', accessor: (row: Opportunity) => (
                            <div className="flex items-center gap-2 justify-end">
                                {row.url && <a href={row.url.startsWith('http') ? row.url : `https://${row.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700"><ExternalLink size={14} /></a>}
                                <EditableText value={row.url || ''} onChange={(v) => setOpportunities(opportunities.map(o => o.id === row.id ? { ...o, url: v } : o))} placeholder="הכנס קישור..." className="text-[10px] text-slate-400 w-24" />
                            </div>
                        ) },
                        { header: 'קטגוריה', accessor: (row: Opportunity) => <div className="flex flex-col items-end gap-1"><Badge category={row.category} />{row.originalCategory && <span className="scale-[0.7] opacity-40 origin-right"><Badge category={row.originalCategory} /></span>}</div> },
                        { header: '', accessor: (row: Opportunity) => <button onClick={() => setOpportunities(opportunities.filter(o => o.id !== row.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={14}/></button> }
                    ]} />
                <button onClick={addOpportunity} className="w-full p-4 text-sm font-bold border-t flex items-center justify-center gap-2 text-amber-600 hover:bg-slate-50"><PlusCircle size={18}/> הוסף הזדמנות חדשה</button>
            </SectionContainer>
        </div>

        <div className="col-span-12 space-y-5">
            <SectionContainer id="dash_ideas_v1" title="ריכוז רעיונות" icon={<Lightbulb size={20} className="text-amber-400"/>}>
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1 m-4">
                    {[Category.MAIN, Category.PERSONAL, Category.FINANCIAL, Category.OCCUPATIONAL].map((cat) => (
                        <button 
                          key={cat} 
                          onClick={() => setActiveIdeaTab(cat)} 
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeIdeaTab === cat ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}
                        >
                          {cat === Category.MAIN ? mainLabel : cat}
                        </button>
                    ))}
                </div>
                <div className="p-6 space-y-3 min-h-[100px]">
                    {getActiveIdeas().length === 0 ? (
                        <div className="py-8 text-center text-slate-300 text-sm italic">אין רעיונות בקטגוריה זו.</div>
                    ) : (
                        getActiveIdeas().map((idea: any) => (
                            <div key={idea.id} className="flex items-center gap-3 group bg-white border border-slate-100 p-3 rounded-2xl hover:shadow-sm transition-all text-right">
                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></div>
                                <div className="flex-1">
                                    <EditableText 
                                        value={idea.text} 
                                        onChange={(v) => setActiveIdeas(getActiveIdeas().map((i: any) => i.id === idea.id ? {...i, text: v} : i))} 
                                        className="text-slate-700 text-sm font-medium" 
                                    />
                                </div>
                                <button onClick={() => setActiveIdeas(getActiveIdeas().filter((i: any) => i.id !== idea.id))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                    <button 
                        onClick={addIdea} 
                        className="w-full py-3 text-xs font-bold text-slate-400 hover:text-amber-600 flex items-center justify-center gap-2 border-2 border-dashed border-slate-100 rounded-2xl hover:border-amber-200 hover:bg-amber-50 transition-all"
                    >
                        <PlusCircle size={16}/> הוסף רעיון חדש ל{activeIdeaTab === Category.MAIN ? mainLabel : activeIdeaTab}
                    </button>
                </div>
            </SectionContainer>
        </div>
      </div>
    </div>
  );
};
