
import React, { useState, useEffect } from 'react';
import { Settings, X, Palette, Save } from 'lucide-react';

interface SectionContainerProps {
  id: string; // Unique ID for persistence
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultColor?: string;
  headerAction?: React.ReactNode;
}

const COLORS = [
  { label: 'לבן', class: 'bg-white' },
  { label: 'אבן', class: 'bg-slate-50' },
  { label: 'כחול', class: 'bg-blue-50' },
  { label: 'ירוק', class: 'bg-emerald-50' },
  { label: 'צהוב', class: 'bg-amber-50' },
  { label: 'ורוד', class: 'bg-rose-50' },
  { label: 'סגול', class: 'bg-purple-50' },
  { label: 'אינדיגו', class: 'bg-indigo-50' },
];

export const SectionContainer: React.FC<SectionContainerProps> = ({ 
  id, 
  title, 
  icon, 
  children, 
  defaultColor = 'bg-white', 
  headerAction 
}) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(`section_style_${id}`);
    return saved ? JSON.parse(saved) : { color: defaultColor, customTitle: title };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  // Sync prop title changes if customized title matches old default (optional, keeping simple for now)
  
  useEffect(() => {
    localStorage.setItem(`section_style_${id}`, JSON.stringify(settings));
  }, [settings, id]);

  const save = () => {
    setSettings(tempSettings);
    setIsEditing(false);
  };

  return (
    <div className={`rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 relative flex flex-col ${settings.color} ring-1 ring-black/5`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/5 shrink-0">
             <div className="flex items-center gap-3">
                 {icon && <div className="p-2 bg-white/50 rounded-lg shadow-sm text-slate-600">{icon}</div>}
                 <h2 className="text-xl font-bold text-slate-800">{settings.customTitle}</h2>
             </div>
             <div className="flex items-center gap-2">
                 {headerAction}
                 <button 
                    onClick={() => { setTempSettings(settings); setIsEditing(!isEditing); }}
                    className={`p-2 rounded-lg transition-all ${isEditing ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600 hover:bg-black/5'}`}
                    title="הגדרות תצוגה"
                 >
                     <Settings size={18} />
                 </button>
             </div>
        </div>

        {/* Edit Panel Overlay */}
        {isEditing && (
            <div className="absolute top-16 left-4 z-50 bg-white border border-slate-200 shadow-2xl rounded-xl p-4 w-64 animate-fade-in text-right">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Palette size={12}/> עריכת עיצוב</span>
                    <button onClick={() => setIsEditing(false)}><X size={14} className="text-slate-400 hover:text-rose-500"/></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-500 mb-1.5 block font-bold">כותרת הקוביה</label>
                        <input 
                            type="text" 
                            value={tempSettings.customTitle}
                            onChange={(e) => setTempSettings({...tempSettings, customTitle: e.target.value})}
                            className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 mb-2 block font-bold">צבע רקע</label>
                        <div className="grid grid-cols-4 gap-2">
                            {COLORS.map(c => (
                                <button
                                    key={c.class}
                                    onClick={() => setTempSettings({...tempSettings, color: c.class})}
                                    className={`h-8 rounded-lg border border-black/5 flex items-center justify-center transition-transform hover:scale-105 ${c.class} ${tempSettings.color === c.class ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                                    title={c.label}
                                >
                                    {tempSettings.color === c.class && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={save} 
                        className="w-full bg-slate-800 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-bold mt-2 flex items-center justify-center gap-2 transition-colors"
                    >
                        <Save size={14} /> שמור שינויים
                    </button>
                </div>
            </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
            {children}
        </div>
    </div>
  );
};
