
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, Save, Sparkles, Check, Quote, Settings, X, Palette } from 'lucide-react';

interface VisionBoardProps {
  title: string;
  value: string;
  onSave: (newValue: string) => void;
  id?: string; // For persistence of style
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

export const VisionBoard: React.FC<VisionBoardProps> = ({ title, value, onSave, id = 'default_vision' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState(value);
  const [isSaved, setIsSaved] = useState(false);
  
  // Style settings
  const [settings, setSettings] = useState(() => {
      const saved = localStorage.getItem(`vision_style_${id}`);
      return saved ? JSON.parse(saved) : { color: 'bg-white' };
  });
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem(`vision_style_${id}`, JSON.stringify(settings));
  }, [settings, id]);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleSave = () => {
    onSave(text);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); 
  };

  const containerStyles = isOpen 
    ? 'ring-2 ring-blue-500/10 shadow-xl scale-[1.01]' 
    : 'hover:shadow-lg hover:-translate-y-0.5';

  return (
    <div className={`rounded-2xl border border-slate-200 transition-all duration-300 mb-8 relative ${settings.color} ${containerStyles}`}>
      {/* Settings Popover */}
      {isEditingSettings && (
          <div className="absolute top-14 left-4 z-50 bg-white border border-slate-200 shadow-2xl rounded-xl p-4 w-64 animate-fade-in text-right cursor-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Palette size={12}/> עיצוב</span>
                    <button onClick={() => setIsEditingSettings(false)}><X size={14} className="text-slate-400 hover:text-rose-500"/></button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {COLORS.map(c => (
                        <button
                            key={c.class}
                            onClick={() => setSettings({ color: c.class })}
                            className={`h-8 rounded-lg border border-black/5 flex items-center justify-center transition-transform hover:scale-105 ${c.class} ${settings.color === c.class ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                            title={c.label}
                        >
                            {settings.color === c.class && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </button>
                    ))}
                </div>
          </div>
      )}

      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 cursor-pointer flex items-center justify-between group"
      >
         <div className="flex items-center gap-4">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50/80 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                <Sparkles size={18} />
             </div>
             <div className="text-right">
                <span className="block font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{title}</span>
                {!isOpen && <span className="text-xs text-slate-400 block mt-0.5">החזון שלך הוא המצפן שלך</span>}
             </div>
        </div>

        <div className="flex items-center gap-3">
             <button 
                onClick={(e) => { e.stopPropagation(); setIsEditingSettings(!isEditingSettings); }}
                className="p-2 text-slate-300 hover:text-blue-600 hover:bg-black/5 rounded-lg transition-colors"
                title="הגדרות עיצוב"
             >
                <Settings size={18} />
             </button>
             <div className="text-slate-300 group-hover:text-indigo-400 transition-colors">
                {isOpen ? <ChevronDown size={20} /> : <ChevronLeft size={20} />}
             </div>
         </div>
      </div>
      
      {/* Content */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 pt-0">
          <div className="relative bg-white/50 rounded-xl p-6 border border-slate-200/50">
              <Quote size={40} className="absolute -top-3 -right-2 text-indigo-100 transform scale-x-[-1]" />
              <textarea
                className="w-full h-40 bg-transparent border-none focus:ring-0 outline-none resize-none text-slate-600 leading-relaxed text-right font-medium text-lg placeholder-slate-300"
                placeholder="כתוב כאן את החזון שלך..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onClick={(e) => e.stopPropagation()} 
              />
          </div>
          
          <div className="flex justify-end items-center mt-4">
            <button 
                onClick={(e) => { e.stopPropagation(); handleSave(); }}
                className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all shadow-md text-sm font-bold transform active:scale-95 ${
                    isSaved 
                    ? 'bg-green-500 text-white shadow-green-200' 
                    : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200 hover:shadow-indigo-200'
                }`}
            >
                {isSaved ? <Check size={16} /> : <Save size={16} />}
                {isSaved ? 'נשמר בהצלחה' : 'שמור שינויים'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
