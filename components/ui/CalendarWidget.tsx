
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Check, Plus, Trash2, ExternalLink, X, Repeat, Palette, Bell, ChevronDown } from 'lucide-react';

interface CalendarWidgetProps {
  title?: string;
  externalDraft?: { title: string; category: string } | null;
  onModalClose?: () => void;
}

interface CalendarEvent {
  id: string;
  time: string;
  reminderTime?: string;
  title: string;
  color: string;
  isRecurring?: boolean;
  recurringDays?: number[]; // 0 for Sun, 1 for Mon...
}

const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

const STRATEGIC_COLORS = [
  { label: 'כלכלי (כחול)', value: 'bg-blue-50 border-blue-500 text-blue-700', marker: 'bg-blue-500' },
  { label: 'תעסוקתי (צהוב)', value: 'bg-amber-50 border-amber-500 text-amber-700', marker: 'bg-amber-500' },
  { label: 'אישי (אדום)', value: 'bg-rose-50 border-rose-500 text-rose-700', marker: 'bg-rose-500' },
];

const WEEK_DAYS = [
  { label: 'א\'', value: 0 },
  { label: 'ב\'', value: 1 },
  { label: 'ג\'', value: 2 },
  { label: 'ד\'', value: 3 },
  { label: 'ה\'', value: 4 },
  { label: 'ו\'', value: 5 },
  { label: 'ש\'', value: 6 },
];

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ title = "לוח שנה", externalDraft, onModalClose }) => {
  const [isConnected, setIsConnected] = useState(() => localStorage.getItem('google_calendar_connected') === 'true');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>(() => {
    const saved = localStorage.getItem('calendar_events_data_v5');
    return saved ? JSON.parse(saved) : {};
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftEvent, setDraftEvent] = useState<{
      title: string;
      date: Date;
      time: string;
      reminderTime: string;
      color: string;
      isRecurring: boolean;
      recurringDays: number[];
      recurrenceType: 'none' | 'daily' | 'weekly';
  } | null>(null);

  useEffect(() => {
    if (externalDraft) {
      let color = STRATEGIC_COLORS[0].value;
      if (externalDraft.category === 'תעסוקתי') color = STRATEGIC_COLORS[1].value;
      if (externalDraft.category === 'אישי') color = STRATEGIC_COLORS[2].value;

      setDraftEvent({
        title: externalDraft.title,
        date: new Date(),
        time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        reminderTime: '',
        color: color,
        isRecurring: false,
        recurringDays: [],
        recurrenceType: 'none'
      });
      setIsModalOpen(true);
    }
  }, [externalDraft]);

  useEffect(() => { localStorage.setItem('calendar_events_data_v5', JSON.stringify(events)); }, [events]);

  const getEventsForDate = (date: Date) => {
    const key = formatDateKey(date);
    const dayOfWeek = date.getDay();
    const dailyEvents = events[key] || [];
    
    const recurringEvents: CalendarEvent[] = [];
    (Object.values(events).flat() as CalendarEvent[]).forEach(e => {
      if (e.isRecurring && (e.recurringDays?.length === 0 || e.recurringDays?.includes(dayOfWeek))) {
        if (!dailyEvents.some(de => de.id === e.id)) {
          recurringEvents.push(e);
        }
      }
    });

    return [...dailyEvents, ...recurringEvents].sort((a, b) => a.time.localeCompare(b.time));
  };

  const getDays = () => {
    const days = [];
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      days.push({
        dateObj: d,
        dayName: d.toLocaleDateString('he-IL', { weekday: 'short' }),
        dayNumber: d.getDate(),
        isSelected: formatDateKey(d) === formatDateKey(selectedDate),
        hasEvent: getEventsForDate(d).length > 0
      });
    }
    return days;
  };

  const saveEvent = () => {
      if (!draftEvent) return;
      const key = formatDateKey(draftEvent.date);
      
      const finalIsRecurring = draftEvent.recurrenceType !== 'none';
      const finalRecurringDays = draftEvent.recurrenceType === 'daily' ? [] : draftEvent.recurringDays;

      const newEvent: CalendarEvent = {
          id: Date.now().toString(),
          time: draftEvent.time,
          reminderTime: draftEvent.reminderTime,
          title: draftEvent.title,
          color: draftEvent.color,
          isRecurring: finalIsRecurring,
          recurringDays: finalRecurringDays
      };
      setEvents(prev => ({ ...prev, [key]: [...(prev[key] || []), newEvent].sort((a, b) => a.time.localeCompare(b.time)) }));
      setIsModalOpen(false);
      setDraftEvent(null);
      if (onModalClose) onModalClose();
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => {
      const newEvents = { ...prev };
      Object.keys(newEvents).forEach(k => { newEvents[k] = newEvents[k].filter(e => e.id !== id); });
      return newEvents;
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden h-full flex flex-col relative text-right" dir="rtl">
      {isModalOpen && draftEvent && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm max-h-[90vh] flex flex-col rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 animate-fade-in">
                  <div className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center text-white">
                      <div className="flex items-center gap-2">
                          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                            <Plus size={20} className="text-white" />
                          </div>
                          <span className="font-black text-xl">הוספת משימה ליומן</span>
                      </div>
                      <button onClick={() => { setIsModalOpen(false); if(onModalClose) onModalClose(); }} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={24}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                      <div>
                          <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">שם המשימה</label>
                          <input type="text" value={draftEvent.title} onChange={(e) => setDraftEvent({...draftEvent, title: e.target.value})} className="w-full border-b-2 border-slate-200 focus:border-blue-500 outline-none py-2 text-2xl font-black bg-transparent" placeholder="מה המשימה שלך?" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] font-black text-slate-400 mb-2 block tracking-widest uppercase">שעה</label>
                              <div className="relative">
                                <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="time" value={draftEvent.time} onChange={(e) => setDraftEvent({...draftEvent, time: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                              </div>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-400 mb-2 block tracking-widest uppercase">שעת התזכורת</label>
                              <div className="relative">
                                <Bell size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="time" value={draftEvent.reminderTime} onChange={(e) => setDraftEvent({...draftEvent, reminderTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                              </div>
                          </div>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-200 space-y-5">
                          <div>
                              <label className="text-[10px] font-black text-slate-700 mb-3 block flex items-center gap-2 uppercase tracking-widest">
                                  <Repeat size={14} className="text-blue-500" /> תדירות חזרה
                              </label>
                              <div className="relative">
                                  <select 
                                    value={draftEvent.recurrenceType}
                                    onChange={(e) => setDraftEvent({...draftEvent, recurrenceType: e.target.value as any})}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                  >
                                      <option value="none">ללא חזרה</option>
                                      <option value="daily">חזרה יומית</option>
                                      <option value="weekly">חזרה שבועית (בחר ימים)</option>
                                  </select>
                                  <ChevronDown size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              </div>
                          </div>
                          
                          {draftEvent.recurrenceType === 'weekly' && (
                              <div className="space-y-3 pt-4 border-t border-slate-200 animate-fade-in">
                                  <label className="text-[10px] font-black text-slate-400 block text-center uppercase tracking-widest">בחר ימים בשבוע</label>
                                  <div className="flex flex-wrap gap-2 justify-center">
                                      {WEEK_DAYS.map(day => (
                                          <button key={day.value} onClick={() => {
                                              const newDays = draftEvent.recurringDays.includes(day.value) ? draftEvent.recurringDays.filter(d => d !== day.value) : [...draftEvent.recurringDays, day.value];
                                              setDraftEvent({...draftEvent, recurringDays: newDays});
                                          }} className={`w-10 h-10 rounded-xl text-xs font-black border transition-all ${draftEvent.recurringDays.includes(day.value) ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}>{day.label}</button>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="shrink-0 p-6 pt-0 bg-white">
                      <button 
                        onClick={saveEvent} 
                        className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black hover:bg-blue-600 transition-all shadow-2xl transform active:scale-[0.98] text-lg flex items-center justify-center gap-3 group"
                      >
                          <Check size={20} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                          שמור משימה ביומן
                      </button>
                  </div>
              </div>
          </div>
      )}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><CalendarIcon size={20} /></div>
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col space-y-6 overflow-hidden">
        {isConnected ? (
          <>
            <div className="flex justify-between items-center bg-slate-50 rounded-xl p-2 border border-slate-100 overflow-x-auto shrink-0">
                {getDays().map((d, idx) => (
                    <div key={idx} onClick={() => setSelectedDate(d.dateObj)} className={`flex flex-col items-center justify-center py-3 rounded-lg cursor-pointer transition-all mx-1 shrink-0 px-4 ${d.isSelected ? 'bg-white shadow-md ring-1 ring-blue-500/20 translate-y-[-2px]' : 'hover:bg-white/60'}`}>
                        <span className={`text-[10px] font-bold ${d.isSelected ? 'text-blue-600' : 'text-slate-400'}`}>{d.dayName}</span>
                        <span className={`text-xl font-bold ${d.isSelected ? 'text-slate-800' : 'text-slate-500'}`}>{d.dayNumber}</span>
                        {d.hasEvent && !d.isSelected && <div className="w-1 h-1 bg-blue-400 rounded-full mt-1"></div>}
                    </div>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                 {getEventsForDate(selectedDate).length === 0 ? (
                     <div className="py-12 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-xl"><p className="text-sm">אין משימות ליום זה</p></div>
                 ) : (
                    getEventsForDate(selectedDate).map(event => (
                        <div key={event.id} className={`flex items-center gap-3 p-3 rounded-xl border-r-4 shadow-sm ${event.color} group transition-all`}>
                             <div className="flex flex-col items-center min-w-[60px] border-l border-black/5 pl-3 ml-1">
                                <span className="text-xs font-mono font-bold opacity-70">{event.time}</span>
                                {event.isRecurring && <Repeat size={10} className="mt-1" />}
                                {event.reminderTime && <div className="flex items-center gap-0.5 text-[8px] mt-1 text-slate-500"><Bell size={8} /> {event.reminderTime}</div>}
                             </div>
                             <div className="flex-1 text-right font-bold text-sm">{event.title}</div>
                             <button onClick={() => deleteEvent(event.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                        </div>
                    ))
                 )}
            </div>
            <button onClick={() => { setDraftEvent({ title: '', date: selectedDate, time: '09:00', reminderTime: '', color: STRATEGIC_COLORS[0].value, isRecurring: false, recurringDays: [], recurrenceType: 'none' }); setIsModalOpen(true); }} className="w-full py-3 bg-slate-50 text-slate-500 text-xs font-bold rounded-xl border border-dashed border-slate-200 flex items-center justify-center gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"><Plus size={14} /> הוסף משימה ידנית</button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <h4 className="font-bold text-slate-800">חבר את יומן Google</h4>
            <button onClick={() => {setIsConnected(true); localStorage.setItem('google_calendar_connected', 'true');}} className="bg-white border border-slate-200 px-8 py-3 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all mt-4">התחבר עם Google</button>
          </div>
        )}
      </div>
    </div>
  );
};
