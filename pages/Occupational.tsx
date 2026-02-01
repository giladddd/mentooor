
import React, { useState, useEffect } from 'react';
import { RotateCw, CheckCircle, Plus, ArrowRightCircle, Trash2, Briefcase, Clock, Calendar, CalendarPlus, Zap, ExternalLink, X, Lightbulb, MinusCircle, PlusCircle } from 'lucide-react';
import { Task, Category, Opportunity } from '../types';
import { Table } from '../components/ui/Table';
import { EditableText } from '../components/ui/EditableText';
import { VisionBoard } from '../components/ui/VisionBoard';
import { CalendarWidget } from '../components/ui/CalendarWidget';
import { SectionContainer } from '../components/ui/SectionContainer';
import { Badge } from '../components/ui/Badge';

const RangePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const colors: any = { 'קצר': 'bg-emerald-100 text-emerald-700', 'בינוני': 'bg-blue-100 text-blue-700', 'ארוך': 'bg-purple-100 text-purple-700' };
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`text-[10px] font-bold px-2 py-0.5 rounded-full outline-none cursor-pointer border border-transparent hover:border-slate-300 transition-all ${colors[value] || 'bg-slate-100'}`}>
      <option value="קצר">קצר</option><option value="בינוני">בינוני</option><option value="ארוך">ארוך</option>
    </select>
  );
};

export const Occupational: React.FC = () => {
  const getSaved = (key: string, fallback: any) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };
  const save = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));

  const [pageTitle, setPageTitle] = useState(() => localStorage.getItem('title_occ') || 'תעסוקתי');
  const [pageDesc, setPageDesc] = useState(() => localStorage.getItem('desc_occ') || 'ניהול קריירה ופיתוח מקצועי.');
  const [vision, setVision] = useState(() => localStorage.getItem('vision_occupational') || "לבנות קריירה משמעותית...");
  const [projectHeaders, setProjectHeaders] = useState(() => getSaved('dashboard_focus_headers', ['מה המיקוד שלי', 'למה זה חשוב לך', 'דרכי פעולה וטווח']));
  const [calendarDraft, setCalendarDraft] = useState<{ title: string; category: string } | null>(null);

  const [projectData, setProjectData] = useState(() => getSaved('projects_occ', [
    { id: '1', name: 'לימוד פיתוח Fullstack', why: 'מעבר להייטק', actions: [{ text: 'קורס מקוון יומי', range: 'בינוני' }] },
  ]));

  const [tasks, setTasks] = useState<Task[]>(() => getSaved('tasks_occ', [
    { id: '1', text: 'משימה תעסוקתית ראשונה', completed: false, category: Category.OCCUPATIONAL },
  ]));

  const [opportunityData, setOpportunityData] = useState<Opportunity[]>(() => getSaved('opps_occ', [
    { id: 'o1', name: 'ראיון עבודה', date: '12/06/2026', url: '', category: Category.OCCUPATIONAL, status: 'פתוח' },
  ]));

  const [ideas, setIdeas] = useState<{id: string, text: string}[]>(() => getSaved('ideas_occ', []));

  useEffect(() => {
    save('projects_occ', projectData);
    save('tasks_occ', tasks);
    save('opps_occ', opportunityData);
    save('ideas_occ', ideas);
    save('dashboard_focus_headers', projectHeaders);
    localStorage.setItem('title_occ', pageTitle);
    localStorage.setItem('desc_occ', pageDesc);
    localStorage.setItem('vision_occupational', vision);
  }, [projectData, tasks, opportunityData, ideas, pageTitle, pageDesc, vision, projectHeaders]);

  const activeTasks = tasks.filter(t => !t.completed);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
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

  const updateActions = (row: any, actionIdx: number, newRange: string) => {
    const newActions = [...(row.actions || [])];
    const action = newActions[actionIdx];
    newActions[actionIdx] = { ...action, range: newRange };
    setProjectData(projectData.map(p => p.id === row.id ? { ...p, actions: newActions } : p));

    if (newRange === 'קצר' && action.text.trim()) {
        const exists = tasks.some(t => t.text === action.text);
        if (!exists) {
            setTasks([{ id: Date.now().toString(), text: action.text, completed: false, category: Category.OCCUPATIONAL }, ...tasks]);
        }
    }
  };

  const promoteOpp = (id: string) => {
    setOpportunityData(prev => prev.map(o => o.id === id ? { ...o, originalCategory: o.category, category: Category.MAIN } : o));
  };

  const demoteOpp = (id: string) => {
    setOpportunityData(prev => prev.map(o => (o.id === id && o.originalCategory) ? { ...o, category: o.originalCategory, originalCategory: undefined } : o));
  };

  const renderActions = (row: any) => (
    <div className="space-y-2 py-2 text-right" dir="rtl">
      {(row.actions || []).map((action: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 group/action justify-end">
          <button onClick={() => {
            const newActions = [...row.actions];
            newActions.splice(idx, 1);
            setProjectData(projectData.map(p => p.id === row.id ? { ...p, actions: newActions } : p));
          }} className="opacity-0 group-hover/action:opacity-100 text-slate-300 hover:text-rose-500 transition-all"><X size={10} /></button>
          <RangePicker value={action.range} onChange={(v) => updateActions(row, idx, v)} />
          <div className="flex-1">
            <EditableText value={action.text} onChange={(v) => {
              const newActions = [...row.actions];
              newActions[idx] = { ...action, text: v };
              setProjectData(projectData.map(p => p.id === row.id ? { ...p, actions: newActions } : p));
            }} className="text-slate-600 text-[11px] font-medium" />
          </div>
        </div>
      ))}
      <button onClick={() => setProjectData(projectData.map(p => p.id === row.id ? { ...p, actions: [...(p.actions || []), { text: 'פעולה חדשה', range: 'בינוני' }] } : p))} className="text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1 transition-colors justify-end w-full"><Plus size={10} /> הוסף פעולה</button>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto pb-24 text-right" dir="rtl">
      <div className="flex items-center gap-5 border-b border-slate-200/60 pb-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm ring-4 ring-blue-50/50"><Briefcase size={32} /></div>
        <div className="flex-1 text-right">
            <EditableText value={pageTitle} onChange={setPageTitle} className="text-4xl font-bold text-slate-800" />
            <EditableText value={pageDesc} onChange={setPageDesc} className="text-slate-500 text-lg mt-1 font-light" />
        </div>
      </div>

      <VisionBoard title="חזון תעסוקתי" value={vision} onSave={setVision} id="vision_occ" />

      <SectionContainer id="occ_projects" title="מיקוד תעסוקתי" icon={<RotateCw size={20} className="text-indigo-600"/>}>
             <div className="overflow-x-auto">
                 <div className="min-w-[1000px]">
                     <Table data={projectData} columns={[
                            { header: <div className="w-10 text-center">קידום</div>, accessor: (row: any) => (
                                  <div className="flex justify-center">
                                      {row.category !== Category.MAIN ? <button onClick={() => setProjectData(projectData.map(p => p.id === row.id ? {...p, originalCategory: Category.OCCUPATIONAL, category: Category.MAIN} : p))} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"><Plus size={16} strokeWidth={3} /></button> : <button onClick={() => setProjectData(projectData.map(p => p.id === row.id ? {...p, category: Category.OCCUPATIONAL, originalCategory: undefined} : p))} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all"><MinusCircle size={16} strokeWidth={3} /></button>}
                                  </div>
                              ), width: '60px' },
                            { header: <EditableText value={projectHeaders[0]} onChange={(v) => setProjectHeaders([v, projectHeaders[1], projectHeaders[2]])} />, accessor: (row: any) => <div className="text-right"><EditableText value={row.name} onChange={(v) => setProjectData(projectData.map(p => p.id === row.id ? {...p, name: v} : p))} className="font-bold text-slate-800 text-lg" /></div>, width: '250px' },
                            { header: <EditableText value={projectHeaders[1]} onChange={(v) => setProjectHeaders([projectHeaders[0], v, projectHeaders[2]])} />, accessor: (row: any) => <EditableText value={row.why} onChange={(v) => setProjectData(projectData.map(p => p.id === row.id ? {...p, why: v} : p))} multiline={true} className="min-h-[60px]" />, width: '300px' },
                            // Fix typo: changed 'i' to 'projectHeaders[1]'
                            { header: <EditableText value={projectHeaders[2]} onChange={(v) => setProjectHeaders([projectHeaders[0], projectHeaders[1], v])} />, accessor: (row: any) => renderActions(row), width: '350px' },
                            { header: '', accessor: (row: any) => <button onClick={() => setProjectData(projectData.filter(p => p.id !== row.id))} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 size={16}/></button>, width: '50px' }
                        ]} />
                 </div>
             </div>
             <button onClick={() => setProjectData([...projectData, { id: Date.now().toString(), name: 'מיקוד חדש', actions: [{ text: 'פעולה ראשונה', range: 'בינוני' }], why: '' }])} className="w-full p-4 text-sm font-semibold text-slate-500 hover:text-indigo-600 border-t flex items-center justify-center gap-2"><Plus size={14}/> הוסף מיקוד חדש</button>
      </SectionContainer>

      <SectionContainer id="occ_tasks" title="משימות תעסוקתיות" icon={<CheckCircle size={20} className="text-emerald-600"/>}>
             <div className="divide-y divide-slate-100">
             {activeTasks.length === 0 ? (
                 <div className="py-8 text-center text-slate-300 text-sm italic">אין משימות תעסוקתיות פתוחות.</div>
             ) : (
                activeTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-4 group p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex-1 text-right flex items-center gap-2">
                            {task.category !== Category.MAIN && (
                                <button 
                                    onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, originalCategory: t.category, category: Category.MAIN } : t))} 
                                    className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-full transition-all"
                                    title="העבר ליומי"
                                >
                                    <ArrowRightCircle size={14} strokeWidth={3} />
                                </button>
                            )}
                            <EditableText value={task.text} onChange={(v) => setTasks(tasks.map(t => t.id === task.id ? { ...t, text: v } : t))} className={`${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'} text-lg`} />
                            {task.category === Category.MAIN && <Badge category={Category.MAIN} />}
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCalendarDraft({ title: task.text, category: 'תעסוקתי' })}
                                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full transition-all"
                                title="קבע ביומן"
                            >
                                <CalendarPlus size={14} />
                            </button>
                            {task.category === Category.MAIN && (
                                <button onClick={() => setTasks(tasks.map(t => t.id === task.id && t.originalCategory ? { ...t, category: t.originalCategory, originalCategory: undefined } : t))} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-full transition-all"><MinusCircle size={14} /></button>
                            )}
                            <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="appearance-none w-5 h-5 border-2 border-slate-900 rounded bg-white cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-slate-900 checked:after:font-bold transition-all" />
                        </div>
                        <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 p-2"><Trash2 size={16}/></button>
                    </div>
                ))
             )}
             </div>
             <button onClick={() => setTasks([{ id: Date.now().toString(), text: '', completed: false, category: Category.OCCUPATIONAL }, ...tasks])} className="w-full p-4 text-sm font-bold text-slate-500 hover:text-emerald-600 border-t flex items-center justify-center gap-2"><Plus size={14}/> משימה חדשה</button>
      </SectionContainer>

      <div className="h-96"><CalendarWidget title="יומן תעסוקתי" externalDraft={calendarDraft} onModalClose={() => setCalendarDraft(null)} /></div>

      <SectionContainer id="occ_opps_new" title="הזדמנויות תעסוקתיות" icon={<Zap size={20} className="text-amber-500"/>}>
             <Table data={opportunityData} columns={[
                    { header: <div className="w-10 text-center">קידום</div>, accessor: (row: Opportunity) => (
                      <div className="flex justify-center">
                          {row.category !== Category.MAIN ? <button onClick={() => promoteOpp(row.id)} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"><Plus size={14} strokeWidth={3} /></button> : <button onClick={() => demoteOpp(row.id)} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all"><MinusCircle size={14} strokeWidth={3} /></button>}
                      </div>
                    ), width: '60px' },
                    { header: 'שם ההזדמנות', accessor: (row: Opportunity) => <div className="flex items-center gap-2 justify-end"><EditableText value={row.name} onChange={(v) => setOpportunityData(opportunityData.map(o => o.id === row.id ? {...o, name: v} : o))} className="font-bold text-slate-800 text-right" />{row.category === Category.MAIN && <Badge category={Category.MAIN} />}</div> },
                    { header: 'קישור', accessor: (row: Opportunity) => (
                      <div className="flex items-center gap-2 justify-end">
                        {row.url && <a href={row.url.startsWith('http') ? row.url : `https://${row.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700"><ExternalLink size={14} /></a>}
                        <EditableText value={row.url || ''} onChange={(v) => setOpportunityData(opportunityData.map(o => o.id === row.id ? {...o, url: v} : o))} placeholder="כתובת קישור..." className="text-[11px] text-slate-400 w-24" />
                      </div>
                    )},
                    { header: 'תאריך יעד', accessor: (row: Opportunity) => <div className="flex items-center gap-1.5 justify-end bg-slate-50 px-2 py-1 rounded-md ml-auto text-slate-500 text-xs"><Calendar size={12}/><EditableText value={row.date} onChange={(v) => setOpportunityData(opportunityData.map(o => o.id === row.id ? {...o, date: v} : o))} className="font-mono" /></div> },
                    { header: '', accessor: (row: Opportunity) => <button onClick={() => setOpportunityData(opportunityData.filter(o => o.id !== row.id))} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 size={16}/></button>, width: '50px' }
                ]} />
             <button onClick={() => setOpportunityData([{ id: Date.now().toString(), name: 'הזדמנות חדשה', date: new Date().toLocaleDateString('he-IL'), url: '', category: Category.OCCUPATIONAL, status: 'פתוח' }, ...opportunityData])} className="w-full p-4 text-sm font-bold text-slate-500 hover:text-amber-600 border-t flex items-center justify-center gap-2"><Plus size={14}/> הוסף הזדמנות תעסוקתית</button>
      </SectionContainer>

      <SectionContainer id="occ_ideas" title="רעיונות תעסוקתיים" icon={<Lightbulb size={20} className="text-amber-400"/>}>
        <div className="p-6 space-y-3">
          {ideas.map(idea => (
            <div key={idea.id} className="flex items-center gap-3 group bg-white border border-slate-100 p-3 rounded-2xl hover:shadow-sm transition-all">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></div>
              <div className="flex-1">
                <EditableText value={idea.text} onChange={(v) => setIdeas(ideas.map(i => i.id === idea.id ? {...i, text: v} : i))} className="text-slate-700 text-sm font-medium" />
              </div>
              <button onClick={() => setIdeas(ideas.filter(i => i.id !== idea.id))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button 
            onClick={() => setIdeas([{id: Date.now().toString(), text: 'רעיון תעסוקתי חדש...'}, ...ideas])} 
            className="w-full py-3 text-xs font-bold text-slate-400 hover:text-amber-600 flex items-center justify-center gap-2 border-2 border-dashed border-slate-100 rounded-2xl hover:border-amber-200 hover:bg-amber-50 transition-all"
          >
            <PlusCircle size={16}/> הוסף רעיון חדש
          </button>
        </div>
      </SectionContainer>
    </div>
  );
};
