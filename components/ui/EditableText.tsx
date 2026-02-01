
import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Type, Palette, Move, X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface EditableTextProps {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  placeholder?: string;
  isEditable?: boolean;
  multiline?: boolean;
  formatDisplay?: (value: string) => React.ReactNode;
  
  // New props for styling
  styleId?: string; // Unique ID to persist styles
  enableStyle?: boolean; // Enable style editing
}

interface CustomStyle {
  color?: string;
  fontSize?: string; // px
  fontFamily?: string;
  fontWeight?: string;
}

const COLORS = [
  '#1e293b', // Slate 800 (Default)
  '#2563eb', // Blue 600
  '#059669', // Emerald 600
  '#e11d48', // Rose 600
  '#d97706', // Amber 600
  '#7c3aed', // Violet 600
  '#ffffff', // White
  '#000000', // Black
];

const FONTS = [
  { label: 'Rubik (רגיל)', value: "'Rubik', sans-serif" },
  { label: 'Assistant (נקי)', value: "'Assistant', sans-serif" },
  { label: 'Serif (מכובד)', value: "ui-serif, Georgia, serif" },
  { label: 'Mono (קוד)', value: "ui-monospace, SFMono-Regular, monospace" },
];

export const EditableText: React.FC<EditableTextProps> = ({ 
  value, 
  onChange, 
  className = "", 
  placeholder = "לחץ לעריכה", 
  isEditable = true,
  multiline = false,
  formatDisplay,
  styleId,
  enableStyle = false
}) => {
  const { isAdmin, isReadOnly } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [customStyle, setCustomStyle] = useState<CustomStyle>({});
  const [showStyleToolbar, setShowStyleToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (styleId) {
      const savedStyle = localStorage.getItem(`style_${styleId}`);
      if (savedStyle) {
        setCustomStyle(JSON.parse(savedStyle));
      }
    }
  }, [styleId]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (multiline) adjustHeight();
    }
  }, [isEditing, multiline]);

  const adjustHeight = () => {
    if (multiline && inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isEditing) return;
      const target = event.target as Node;
      const clickedInput = inputRef.current && inputRef.current.contains(target);
      const clickedToolbar = toolbarRef.current && toolbarRef.current.contains(target);
      const clickedToggle = toggleButtonRef.current && toggleButtonRef.current.contains(target);
      if (!clickedInput && !clickedToolbar && !clickedToggle) {
        handleFinish();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, localValue, value, onChange]);

  const handleFinish = () => {
    setIsEditing(false);
    setShowStyleToolbar(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const saveStyle = (newStyle: CustomStyle) => {
    const updated = { ...customStyle, ...newStyle };
    setCustomStyle(updated);
    if (styleId) {
      localStorage.setItem(`style_${styleId}`, JSON.stringify(updated));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) handleFinish();
    if (e.key === 'Escape') {
        setIsEditing(false);
        setLocalValue(value);
    }
  };

  const displayContent = formatDisplay ? formatDisplay(value || '') : (value || placeholder);
  const isEmpty = !value && !formatDisplay;
  
  // CRITICAL: Disable editing if in global isReadOnly mode
  const canEdit = !isReadOnly && (isEditable || (isAdmin && enableStyle));

  const computedStyle: React.CSSProperties = {
    color: customStyle.color,
    fontSize: customStyle.fontSize ? `${customStyle.fontSize}px` : undefined,
    fontFamily: customStyle.fontFamily,
    fontWeight: customStyle.fontWeight,
  };

  const StyleToolbar = () => (
    <div 
        ref={toolbarRef}
        className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col gap-3 min-w-[240px] p-3 animate-fade-in"
        style={{ top: toolbarPos.top, left: toolbarPos.left }}
    >
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">עורך עיצוב</span>
            <button onClick={() => setShowStyleToolbar(false)}><X size={14} className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1"><Type size={10} /> פונט</span>
            <select className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-slate-50 focus:border-blue-500 outline-none text-slate-700" value={customStyle.fontFamily || ''} onChange={(e) => saveStyle({ fontFamily: e.target.value })}>
                <option value="">ברירת מחדל</option>
                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
        </div>
        <div className="flex gap-2">
            <div className="flex-1 space-y-1">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1"><Move size={10} /> גודל</span>
                <input type="number" className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-slate-50 focus:border-blue-500 outline-none text-slate-700" placeholder="px" value={customStyle.fontSize || ''} onChange={(e) => saveStyle({ fontSize: e.target.value })} />
            </div>
             <div className="flex-1 space-y-1">
                <span className="text-xs text-slate-500 font-medium">משקל</span>
                <select className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-slate-50 focus:border-blue-500 outline-none text-slate-700" value={customStyle.fontWeight || ''} onChange={(e) => saveStyle({ fontWeight: e.target.value })}>
                    <option value="">רגיל</option><option value="300">דק</option><option value="400">רגיל</option><option value="600">מודגש</option><option value="800">כבד</option>
                </select>
            </div>
        </div>
        <div className="space-y-1">
             <span className="text-xs text-slate-500 font-medium flex items-center gap-1"><Palette size={10} /> צבע טקסט</span>
             <div className="flex flex-wrap gap-1.5">
                {COLORS.map(c => <button key={c} className={`w-5 h-5 rounded-full border border-black/10 transition-transform hover:scale-110 ${customStyle.color === c ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`} style={{ backgroundColor: c }} onClick={() => saveStyle({ color: c })} />)}
             </div>
        </div>
    </div>
  );

  if (isEditing) {
    const inputClasses = `w-full bg-white border-2 border-blue-500/50 rounded-lg px-3 py-2 outline-none transition-all shadow-xl text-right text-slate-800 placeholder-slate-400 relative z-20 ${className}`;
    return (
        <div className="relative w-full z-20" ref={containerRef}>
            {multiline ? (
                <textarea ref={inputRef as React.RefObject<HTMLTextAreaElement>} value={localValue} onChange={(e) => { setLocalValue(e.target.value); adjustHeight(); }} className={`${inputClasses} min-h-[100px] overflow-hidden`} dir="rtl" placeholder={placeholder} style={computedStyle} rows={2} />
            ) : (
                <input ref={inputRef as React.RefObject<HTMLInputElement>} value={localValue} onChange={(e) => setLocalValue(e.target.value)} onKeyDown={handleKeyDown} className={`${inputClasses} h-12`} dir="rtl" placeholder={placeholder} style={computedStyle} />
            )}
            <div className="absolute -top-10 left-0 flex gap-1 z-[30]">
                <button onMouseDown={(e) => { e.preventDefault(); handleFinish(); }} className="bg-emerald-500 text-white p-2 rounded-lg shadow-lg hover:bg-emerald-600 transition-all"><Check size={16} strokeWidth={3} /></button>
                {isAdmin && enableStyle && (
                    <button ref={toggleButtonRef} onMouseDown={(e) => { e.preventDefault(); setShowStyleToolbar(!showStyleToolbar); }} className={`p-2 rounded-lg shadow-lg transition-all ${showStyleToolbar ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'}`}><Palette size={16} /></button>
                )}
                <button onMouseDown={(e) => { e.preventDefault(); setIsEditing(false); setLocalValue(value); }} className="bg-slate-200 text-slate-600 p-2 rounded-lg shadow-lg hover:bg-rose-100 transition-all"><X size={16} strokeWidth={3} /></button>
            </div>
            {isAdmin && enableStyle && showStyleToolbar && <StyleToolbar />}
        </div>
    );
  }

  return (
    <div 
      onClick={() => { if(canEdit) setIsEditing(true); }} 
      className={`relative rounded-md px-2 py-1 -mx-2 transition-colors min-h-[28px] min-w-[60px] flex items-center justify-end group text-right ${canEdit ? 'cursor-text hover:bg-black/5' : ''} ${className}`}
      dir="rtl"
      style={computedStyle}
    >
      <span className={isEmpty ? "text-slate-400 italic text-right text-sm" : "text-right w-full block break-words whitespace-pre-wrap"}>
        {displayContent}
      </span>
      {canEdit && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
            {isAdmin && enableStyle ? <Palette size={12} className="text-slate-600" /> : <Pencil size={12} className="text-slate-500" />}
        </div>
      )}
    </div>
  );
};
