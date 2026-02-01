
import React, { useState, useEffect, useMemo } from 'react';
import { Target, CheckCircle, FileText, Trash2, Calendar, CalendarPlus, DollarSign, Plus, TrendingUp, ChevronRight, Clock, Zap, ExternalLink, X, Lightbulb, MinusCircle, Wallet, CreditCard, ShieldCheck, PieChart, ArrowLeftCircle, Calculator, Info, Award, Landmark, TrendingDown, Footprints, Repeat, ChevronDown, ChevronUp, Check, PlusCircle } from 'lucide-react';
import { Table } from '../components/ui/Table';
import { EditableText } from '../components/ui/EditableText';
import { VisionBoard } from '../components/ui/VisionBoard';
import { CalendarWidget } from '../components/ui/CalendarWidget';
import { SectionContainer } from '../components/ui/SectionContainer';
import { Badge } from '../components/ui/Badge';
import { Category, Task, Opportunity, FinancialItem } from '../types';

export const Financial: React.FC = () => {
  const [view, setView] = useState<'main' | 'identity'>('main');
  const [identityTab, setIdentityTab] = useState<'netWorth' | 'liabilities' | 'income' | 'expenses' | 'insurance'>('netWorth');
  const [calendarDraft, setCalendarDraft] = useState<{ title: string; category: string } | null>(null);

  const getSaved = (key: string, fallback: any) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };
  const save = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));

  const [pageTitle, setPageTitle] = useState(() => localStorage.getItem('title_fin') || 'כלכלי');
  const [vision, setVision] = useState(() => localStorage.getItem('fin_vision_v3') || "חזון לחופש כלכלי...");
  
  const [goals, setGoals] = useState(() => {
    const saved = getSaved('fin_goals_data', [
      { id: '1', name: 'חיסכון לדירה', why: 'ביטחון ושקט נפשי', actions: [], category: Category.FINANCIAL }
    ]);
    return saved.map((g: any) => ({ ...g, category: g.category || Category.FINANCIAL }));
  });

  const [opps, setOpps] = useState<Opportunity[]>(() => getSaved('fin_opps_data_v5', []));
  const [ideas, setIdeas] = useState<{id: string, text: string}[]>(() => getSaved('ideas_fin', []));

  const initialFinItems: FinancialItem[] = [
    { id: 'nw1', name: 'עובר ושב', amount: 0, category: 'netWorth' },
    { id: 'nw2', name: 'פיקדונות', amount: 0, category: 'netWorth' },
    { id: 'nw3', name: 'פנסיה', amount: 0, category: 'netWorth' },
    { id: 'nw4', name: 'קרן השתלמות', amount: 0, category: 'netWorth' },
    { id: 'nw5', name: 'קופת גמל', amount: 0, category: 'netWorth' },
    { id: 'nw6', name: 'תיק השקעות עצמאי', amount: 0, category: 'netWorth' },
    { id: 'nw7', name: 'זהב ומתכות', amount: 0, category: 'netWorth' },
    { id: 'nw8', name: 'קריפטו', amount: 0, category: 'netWorth' },
    { id: 'nw9', name: 'שווי עסק', amount: 0, category: 'netWorth' },
    { id: 'nw10', name: 'אחר', amount: 0, category: 'netWorth' },
    { id: 'li1', name: 'משכנתא', amount: 0, category: 'liabilities' },
    { id: 'li2', name: 'הלוואה בנקאית', amount: 0, category: 'liabilities' },
    { id: 'in1', name: 'משכורת', amount: 0, category: 'income' },
    { id: 'in2', name: 'עסק', amount: 0, category: 'income' },
    { id: 'in3', name: 'קצבאות', amount: 0, category: 'income' },
    { id: 'in4', name: 'מלגות', amount: 0, category: 'income' },
    { id: 'in5', name: 'דיבידנטים', amount: 0, category: 'income' },
    { id: 'in6', name: 'אחר', amount: 0, category: 'income' },
    { id: 'ex1', name: 'שכירות / משכנתא', amount: 0, category: 'expenses' },
    { id: 'ex2', name: 'חשמל', amount: 0, category: 'expenses' },
    { id: 'ex3', name: 'מים', amount: 0, category: 'expenses' },
    { id: 'ex4', name: 'ארנונה', amount: 0, category: 'expenses' },
    { id: 'ex5', name: 'רכב (טיפולים/טסט)', amount: 0, category: 'expenses' },
    { id: 'ex6', name: 'ביטוח רכב', amount: 0, category: 'expenses' },
    { id: 'ex7', name: 'דלק', amount: 0, category: 'expenses' },
    { id: 'ex8', name: 'מזון וסופר', amount: 0, category: 'expenses' },
    { id: 'ex9', name: 'פנאי ובילויים', amount: 0, category: 'expenses' },
    { id: 'ex10', name: 'חינוך וחוגים', amount: 0, category: 'expenses' },
    { id: 'ex11', name: 'בריאות ופארם', amount: 0, category: 'expenses' },
    { id: 'ex12', name: 'ביגוד והנעלה', amount: 0, category: 'expenses' },
    { id: 'ex13', name: 'מתנות ותרומות', amount: 0, category: 'expenses' },
    { id: 'ex14', name: 'מנויים (נטפליקס וכו)', amount: 0, category: 'expenses' },
    { id: 'ex15', name: 'תקשורת (נייד/אינטרנט)', amount: 0, category: 'expenses' },
    { id: 'is1', name: 'ביטוח בריאות', amount: 0, category: 'insurance' },
    { id: 'is2', name: 'ביטוח שיניים', amount: 0, category: 'insurance' },
    { id: 'is3', name: 'ביטוח חיים', amount: 0, category: 'insurance' },
    { id: 'is4', name: 'ביטוח רכב', amount: 0, category: 'insurance' },
    { id: 'is5', name: 'ביטוח בית', amount: 0, category: 'insurance' },
    { id: 'is6', name: 'אחר', amount: 0, category: 'insurance' },
  ];

  const [finItems, setFinItems] = useState<FinancialItem[]>(() => getSaved('fin_identity_items_v6', initialFinItems));
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState(() => Number(localStorage.getItem('desired_monthly_income_v5')) || 15000);

  useEffect(() => {
    save('fin_goals_data', goals);
    save('fin_opps_data_v5', opps);
    save('ideas_fin', ideas);
    save('fin_identity_items_v6', finItems);
    localStorage.setItem('title_fin', pageTitle);
    localStorage.setItem('fin_vision_v3', vision);
    localStorage.setItem('desired_monthly_income_v5', desiredMonthlyIncome.toString());
  }, [goals, opps, ideas, finItems, pageTitle, vision, desiredMonthlyIncome]);

  const assetsTotal = useMemo(() => finItems.filter(item => item.category === 'netWorth').reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [finItems]);
  const liabilitiesTotal = useMemo(() => finItems.filter(item => item.category === 'liabilities').reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [finItems]);
  const effectiveNetWorth = assetsTotal - liabilitiesTotal;
  const targetNetWorth = desiredMonthlyIncome * 300;
  const progressPercentage = Math.min(100, Math.max(0, (effectiveNetWorth / targetNetWorth) * 100));

  const tabs = [
    { id: 'netWorth', label: 'נכסים (שווי)', icon: <Wallet size={16} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'liabilities', label: 'התחייבויות', icon: <Landmark size={16} />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'income', label: 'הכנסות', icon: <TrendingUp size={16} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'expenses', label: 'הוצאות', icon: <CreditCard size={16} />, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'insurance', label: 'ביטוחים שלי', icon: <ShieldCheck size={16} />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const currentTabData = useMemo(() => finItems.filter(item => item.category === identityTab), [finItems, identityTab]);
  const currentTabTotal = useMemo(() => currentTabData.reduce((s, i) => s + (Number(i.amount) || 0), 0), [currentTabData]);

  const promoteGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, originalCategory: Category.FINANCIAL, category: Category.MAIN } : g));
  };

  const demoteGoal = (id: string) => {
    setGoals(prev => prev.map(g => (g.id === id && g.originalCategory) ? { ...g, category: Category.FINANCIAL, originalCategory: undefined } : g));
  };

  const RuleOf300Calculator = () => (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 text-white shadow-2xl relative overflow-hidden group">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
                <h4 className="text-2xl font-black mb-4 flex items-center gap-3"><Award size={32} className="text-emerald-400" /> חוק ה-300: חופש כלכלי</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">היעד: הון עצמי נקי מחובות (שווי נכסים פחות התחייבויות) השווה לפי 300 מההוצאה החודשית הרצויה שלך.</p>
                
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-inner">
                    <label className="text-[10px] font-black text-slate-500 mb-2 block uppercase tracking-widest">משיכה חודשית רצויה (₪)</label>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-black text-blue-400">₪</span>
                        <input type="number" value={desiredMonthlyIncome} onChange={(e) => setDesiredMonthlyIncome(Number(e.target.value))} className="bg-transparent border-b-2 border-slate-700 focus:border-blue-500 outline-none text-4xl font-black w-full py-1 text-white" />
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                <div className="flex justify-between items-end">
                    <div><div className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">היעד הנדרש:</div><div className="text-3xl font-black text-emerald-400">₪{targetNetWorth.toLocaleString()}</div></div>
                    <div className="text-right">
                        <div className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">שווי נקי נוכחי (אמיתי):</div>
                        <div className={`text-2xl font-black ${effectiveNetWorth < 0 ? 'text-rose-400' : 'text-blue-300'}`}>₪{effectiveNetWorth.toLocaleString()}</div>
                    </div>
                </div>
                
                <div className="w-full h-5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-1">
                    <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 transition-all duration-1000 rounded-full shadow-lg" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                
                <div className="flex justify-between text-xs font-black text-slate-500 uppercase tracking-widest">
                    <span>0%</span>
                    <span className="text-blue-400 text-sm">{progressPercentage.toFixed(1)}% מהדרך ליעד</span>
                    <span>100%</span>
                </div>
                
                <div className="pt-4 border-t border-white/5 flex items-start gap-3 opacity-60">
                    <Info size={18} className="text-blue-400 shrink-0" />
                    <p className="text-[11px] text-blue-100 italic">חישוב: (סה"כ נכסים ₪{assetsTotal.toLocaleString()}) - (סה"כ התחייבויות ₪{liabilitiesTotal.toLocaleString()}) = ₪{effectiveNetWorth.toLocaleString()}</p>
                </div>
            </div>
        </div>
    </div>
  );

  if (view === 'identity') {
    return (
      <div className="animate-fade-in space-y-12 pb-24 text-right" dir="rtl">
        <div className="flex items-center justify-between mb-8">
            <button onClick={() => setView('main')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all font-bold group">
                <ArrowLeftCircle size={24} className="group-hover:translate-x-1 transition-transform rotate-180" /> חזור לדף כלכלי
            </button>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">תעודת זהות כלכלית <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg"><PieChart size={24} /></div></h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => setIdentityTab(tab.id as any)} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden group h-32 ${identityTab === tab.id ? `${tab.bg} border-blue-500 shadow-lg scale-[1.02]` : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`}>
                    <div className={`p-2.5 rounded-xl ${identityTab === tab.id ? 'bg-white shadow-sm' : 'bg-slate-50'} ${tab.color}`}>{tab.icon}</div>
                    <span className={`font-black text-sm ${identityTab === tab.id ? 'text-slate-900' : 'text-slate-500'}`}>{tab.label}</span>
                </button>
            ))}
        </div>
        <SectionContainer id={`fin_id_${identityTab}_v6`} title={`ניהול ${tabs.find(t => t.id === identityTab)?.label}`} icon={tabs.find(t => t.id === identityTab)?.icon}>
            <div className="p-4">
                <Table<FinancialItem> data={currentTabData} columns={[
                    { header: 'שם הפריט / מקור', accessor: (row) => <div className="text-right"><EditableText value={row.name} onChange={(v) => setFinItems(prev => prev.map(i => i.id === row.id ? {...i, name: v} : i))} className="font-bold text-slate-800" /></div> },
                    { header: 'סכום (₪)', accessor: (row) => <input type="number" value={row.amount || ''} onChange={(e) => setFinItems(prev => prev.map(i => i.id === row.id ? {...i, amount: Number(e.target.value)} : i))} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-left font-mono font-black w-32 focus:ring-2 focus:ring-blue-500 outline-none" /> },
                    { header: 'קישור / הערה', accessor: (row) => <div className="text-right"><EditableText value={row.url || ''} onChange={(v) => setFinItems(prev => prev.map(i => i.id === row.id ? {...i, url: v} : i))} className="text-[10px] text-slate-400" placeholder="מידע נוסף..." /></div> },
                    { header: '', accessor: (row) => <button onClick={() => setFinItems(finItems.filter(i => i.id !== row.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>, width: '40px' }
                ]} footer={<tr className="bg-slate-900 text-white font-black"><td className="px-6 py-5 text-lg">סה"כ {tabs.find(t => t.id === identityTab)?.label}</td><td className="px-6 py-5 text-left font-mono text-xl text-emerald-400">₪{currentTabTotal.toLocaleString()}</td><td colSpan={2}></td></tr>} />
                <button onClick={() => setFinItems([...finItems, { id: Date.now().toString(), name: 'פריט חדש...', amount: 0, category: identityTab }])} className="w-full mt-4 p-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 font-bold flex items-center justify-center gap-2 transition-all"><Plus size={20} /> הוסף שורה נוספת</button>
            </div>
        </SectionContainer>

        <div className="mt-8">
            <RuleOf300Calculator />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-24 text-right px-4 md:px-0" dir="rtl">
      {/* Reduced vertical space container */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/60 pb-4">
            <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0"><DollarSign size={32} /></div>
            <div>
                <EditableText value={pageTitle} onChange={setPageTitle} className="text-4xl font-black text-slate-800" />
                <p className="text-slate-500 text-lg mt-1 font-light">ניהול פיננסי, תכנון הון ומעקב חופש כלכלי.</p>
            </div>
            </div>
            <button 
                onClick={() => setView('identity')} 
                className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-3xl font-black shadow-2xl transition-all flex items-center gap-3 shrink-0 text-2xl"
            >
                <ShieldCheck size={32} className="text-emerald-400" /> 
                <span>תעודת זהות כלכלית</span>
            </button>
        </div>

        <VisionBoard title="חזון כלכלי" value={vision} onSave={setVision} id="vision_fin_v3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
        <div className="lg:col-span-12">
            <SectionContainer id="fin_goals_v5" title="מיקוד כלכלי" icon={<Target size={20} className="text-blue-600"/>}>
                <div className="p-4">
                  <Table data={goals.filter(g => g.category === Category.FINANCIAL || g.category === Category.MAIN)} columns={[
                    { header: <div className="w-10 text-center">קידום</div>, accessor: (row: any) => (
                      <div className="flex justify-center">
                          {row.category !== Category.MAIN ? (
                            <button onClick={() => promoteGoal(row.id)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all" title="קדם לריכוז המיקודים"><Plus size={16} strokeWidth={3} /></button>
                          ) : (
                            <button onClick={() => demoteGoal(row.id)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all" title="הסר מריכוז המיקודים"><MinusCircle size={16} strokeWidth={3} /></button>
                          )}
                      </div>
                    ), width: '60px' },
                    { header: 'שם היעד', accessor: (row: any) => <div className="text-right flex items-center gap-2 justify-end"><EditableText value={row.name} onChange={(v) => setGoals(goals.map(g => g.id === row.id ? {...g, name: v} : g))} className="font-bold text-slate-800 text-lg" />{row.category === Category.MAIN && <Badge category={Category.MAIN} />}</div> },
                    { header: 'למה זה חשוב', accessor: (row: any) => <div className="text-right"><EditableText value={row.why} onChange={(v) => setGoals(goals.map(g => g.id === row.id ? {...g, why: v} : g))} className="text-slate-500" /></div> },
                    { header: '', accessor: (row: any) => <button onClick={() => setGoals(goals.filter(g => g.id !== row.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>, width: '40px' }
                  ]} />
                  <button onClick={() => setGoals([...goals, { id: Date.now().toString(), name: 'מיקוד חדש', why: '', actions: [], category: Category.FINANCIAL }])} className="w-full mt-4 p-4 text-sm font-bold border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 flex items-center justify-center gap-2 transition-all"><Plus size={14}/> הוסף מיקוד כלכלי</button>
                </div>
            </SectionContainer>
        </div>

        <div className="lg:col-span-12">
            <SectionContainer id="fin_opps_v5" title="ריכוז הזדמנויות" icon={<Zap size={20} className="text-amber-500"/>}>
                <div className="p-4">
                  <Table data={opps} columns={[
                    { header: 'סטטוס', accessor: (row: Opportunity) => (
                      <button 
                        onClick={() => setOpps(opps.map(o => o.id === row.id ? { ...o, status: o.status === 'סגור' ? 'פתוח' : 'סגור' } : o))} 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${row.status === 'סגור' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-300 hover:bg-emerald-50'}`}
                      >
                        <Check size={20} strokeWidth={3} />
                      </button>
                    ), width: '60px' },
                    { header: 'שם ההזדמנות', accessor: (row: Opportunity) => <div className="text-right"><EditableText value={row.name} onChange={(v) => setOpps(opps.map(o => o.id === row.id ? {...o, name: v} : o))} className={`font-black text-lg ${row.status === 'סגור' ? 'text-slate-300 line-through' : 'text-slate-800'}`} /></div> },
                    { header: 'פעולות', accessor: (row: Opportunity) => (
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setCalendarDraft({ title: row.name, category: 'כלכלי' })} className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="הוסף ליומן"><CalendarPlus size={16} /></button>
                        <button onClick={() => setOpps(opps.map(o => o.id === row.id ? { ...o, isHabit: !o.isHabit } : o))} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm ${row.isHabit ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`} title="הפוך להרגל (איפוס יומי)"><Footprints size={16} /></button>
                      </div>
                    ), width: '120px' },
                    { header: '', accessor: (row: Opportunity) => <button onClick={() => setOpps(opps.filter(o => o.id !== row.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>, width: '40px' }
                  ]} />
                  <button onClick={() => setOpps([{ id: Date.now().toString(), name: 'הזדמנות חדשה', date: '', url: '', category: Category.FINANCIAL, status: 'פתוח' }, ...opps])} className="w-full mt-4 p-4 text-sm font-bold border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 flex items-center justify-center gap-2 transition-all"><Plus size={14}/> הוסף הזדמנות חדשה</button>
                </div>
            </SectionContainer>
        </div>

        <div className="lg:col-span-12">
            <SectionContainer id="fin_ideas" title="רעיונות כלכליים" icon={<Lightbulb size={20} className="text-amber-400"/>}>
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
                  onClick={() => setIdeas([{id: Date.now().toString(), text: 'רעיון כלכלי חדש...'}, ...ideas])} 
                  className="w-full py-3 text-xs font-bold text-slate-400 hover:text-amber-600 flex items-center justify-center gap-2 border-2 border-dashed border-slate-100 rounded-2xl hover:border-amber-200 hover:bg-amber-50 transition-all"
                >
                  <PlusCircle size={16}/> הוסף רעיון חדש
                </button>
              </div>
            </SectionContainer>
        </div>

        <div className="lg:col-span-12 h-[500px] shrink-0 mt-4">
          <CalendarWidget title="יומן כלכלי אסטרטגי" externalDraft={calendarDraft} onModalClose={() => setCalendarDraft(null)} />
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200">
          <RuleOf300Calculator />
      </div>
    </div>
  );
};
