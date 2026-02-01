
import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, GripHorizontal, Palette, Type, Settings, Save, Maximize, Move } from 'lucide-react';
import { EditableText } from '../components/ui/EditableText';

interface Tile {
  id: string;
  x: number;
  y: number;
  title: string;
  content: string;
  color: string;
  zIndex: number;
  width: number;
  height: number;
}

const COLORS = [
  { class: 'bg-white', hex: '#ffffff' },
  { class: 'bg-yellow-50', hex: '#fefce8' },
  { class: 'bg-blue-50', hex: '#eff6ff' },
  { class: 'bg-green-50', hex: '#f0fdf4' },
  { class: 'bg-rose-50', hex: '#fff1f2' },
  { class: 'bg-purple-50', hex: '#faf5ff' },
  { class: 'bg-slate-200', hex: '#e2e8f0' },
];

export const FreeBoard: React.FC = () => {
  // --- State ---
  const [tiles, setTiles] = useState<Tile[]>(() => {
    const saved = localStorage.getItem('free_board_tiles_v2');
    if (saved) {
      return JSON.parse(saved);
    }
    // Backward compatibility or default
    return [
      { id: '1', x: 100, y: 100, title: 'ברוכים הבאים', content: 'זהו הלוח החופשי שלך. גרור אותי או לחץ על עריכה כדי לשנות גודל!', color: 'bg-white', zIndex: 1, width: 320, height: 240 },
      { id: '2', x: 450, y: 150, title: 'רעיון חדש', content: 'כתוב כאן כל מה שעולה לראש...', color: 'bg-yellow-50', zIndex: 2, width: 320, height: 240 },
    ];
  });

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null); // For the Edit Form
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [highestZ, setHighestZ] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);

  // Temporary state for the edit form
  const [tempEditData, setTempEditData] = useState<Tile | null>(null);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('free_board_tiles_v2', JSON.stringify(tiles));
  }, [tiles]);

  // --- Handlers ---
  
  const addTile = () => {
    const newTile: Tile = {
      id: Date.now().toString(),
      x: 50 + Math.random() * 100,
      y: 100 + Math.random() * 50,
      title: 'קוביה חדשה',
      content: '',
      color: 'bg-white',
      zIndex: highestZ + 1,
      width: 320,
      height: 240
    };
    setHighestZ(prev => prev + 1);
    setTiles([...tiles, newTile]);
  };

  const removeTile = (id: string) => {
    setTiles(tiles.filter(t => t.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const updateTile = (id: string, updates: Partial<Tile>) => {
    setTiles(tiles.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const bringToFront = (id: string) => {
    setHighestZ(prev => prev + 1);
    updateTile(id, { zIndex: highestZ + 1 });
  };

  // --- Edit Mode Handlers ---
  const startEditing = (tile: Tile) => {
    bringToFront(tile.id);
    setTempEditData({ ...tile });
    setEditingId(tile.id);
  };

  const saveEditing = () => {
    if (tempEditData) {
      updateTile(tempEditData.id, tempEditData);
      setEditingId(null);
      setTempEditData(null);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempEditData(null);
  };

  // --- Drag Logic ---

  const handleMouseDown = (e: React.MouseEvent, id: string, currentX: number, currentY: number) => {
    // If we are editing this tile, don't drag
    if (editingId === id) return;

    e.preventDefault();
    setDraggingId(id);
    setOffset({
      x: e.clientX - currentX,
      y: e.clientY - currentY
    });
    bringToFront(id);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId) return;
      
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;

      setTiles(prev => prev.map(t => t.id === draggingId ? { ...t, x: newX, y: newY } : t));
    };

    const handleMouseUp = () => {
      setDraggingId(null);
    };

    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, offset]);


  return (
    <div 
      className="relative w-full h-[calc(100vh-100px)] overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-slate-50 animate-fade-in rounded-2xl border border-slate-200 shadow-inner"
      ref={containerRef}
      dir="rtl"
    >
        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-[9999]">
            <button 
                onClick={addTile}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-600 hover:shadow-blue-500/30 transition-all transform hover:scale-105 font-bold"
            >
                <Plus size={20} />
                <span>קוביה חדשה</span>
            </button>
        </div>

        {/* Tiles Area */}
        {tiles.map((tile) => {
            const isEditingThis = editingId === tile.id;
            
            return (
            <div
                key={tile.id}
                style={{
                    left: tile.x,
                    top: tile.y,
                    width: isEditingThis ? 350 : tile.width, // Fixed width while editing for consistent form
                    height: isEditingThis ? 'auto' : tile.height, // Auto height while editing
                    zIndex: tile.zIndex,
                    position: 'absolute',
                }}
                className={`flex flex-col rounded-2xl shadow-xl transition-shadow duration-200 border border-slate-100/50 
                    ${isEditingThis ? 'bg-white ring-4 ring-blue-500/20 z-[9999]' : tile.color} 
                    ${draggingId === tile.id ? 'cursor-grabbing shadow-2xl scale-[1.02]' : ''}
                `}
                onMouseDown={() => bringToFront(tile.id)}
            >
                {isEditingThis && tempEditData ? (
                    // --- EDIT MODE FORM ---
                    <div className="p-4 flex flex-col gap-4 text-right h-full overflow-y-auto" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                             <h3 className="font-bold text-slate-700 flex items-center gap-2"><Settings size={16}/> עריכת קוביה</h3>
                             <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
                        </div>
                        
                        {/* Title Input */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">כותרת</label>
                            <input 
                                type="text" 
                                value={tempEditData.title}
                                onChange={(e) => setTempEditData({...tempEditData, title: e.target.value})}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Content Input */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">תוכן</label>
                            <textarea 
                                value={tempEditData.content}
                                onChange={(e) => setTempEditData({...tempEditData, content: e.target.value})}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                            />
                        </div>

                         {/* Size Inputs */}
                         <div className="flex gap-3">
                             <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 block mb-1 flex items-center gap-1"><Maximize size={10} className="rotate-90"/> רוחב (px)</label>
                                <input 
                                    type="number" 
                                    min="200" max="800"
                                    value={tempEditData.width}
                                    onChange={(e) => setTempEditData({...tempEditData, width: parseInt(e.target.value) || 200})}
                                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                                />
                             </div>
                             <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 block mb-1 flex items-center gap-1"><Maximize size={10}/> גובה (px)</label>
                                <input 
                                    type="number" 
                                    min="150" max="800"
                                    value={tempEditData.height}
                                    onChange={(e) => setTempEditData({...tempEditData, height: parseInt(e.target.value) || 150})}
                                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                                />
                             </div>
                        </div>

                        {/* Color Picker */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-2 flex items-center gap-1"><Palette size={12}/> צבע רקע</label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map((c) => (
                                    <button 
                                        key={c.class}
                                        onClick={() => setTempEditData({...tempEditData, color: c.class})}
                                        className={`w-6 h-6 rounded-full border border-black/10 transition-transform ${c.class} ${tempEditData.color === c.class ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-110'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={saveEditing}
                            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                        >
                            <Save size={16} /> שמור שינויים
                        </button>
                    </div>
                ) : (
                    // --- VIEW MODE ---
                    <>
                        {/* Drag Handle & Header */}
                        <div 
                            className="flex items-center justify-between p-3 border-b border-black/5 cursor-grab active:cursor-grabbing select-none"
                            onMouseDown={(e) => handleMouseDown(e, tile.id, tile.x, tile.y)}
                        >
                            <GripHorizontal size={18} className="text-slate-400 opacity-50" />
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); startEditing(tile); }}
                                    className="text-slate-600 bg-white/80 hover:bg-blue-100 hover:text-blue-700 p-1.5 rounded-lg shadow-sm border border-slate-200/50 transition-all"
                                    title="ערוך קוביה"
                                >
                                    <Settings size={14} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeTile(tile.id); }}
                                    className="text-slate-400 bg-white/50 hover:bg-rose-100 hover:text-rose-600 p-1.5 rounded-lg transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col overflow-hidden">
                            <h3 className="text-xl font-bold text-slate-800 mb-2 truncate" title={tile.title}>{tile.title}</h3>
                            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{tile.content}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
            );
        })}
        
        {tiles.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                 <div className="text-center">
                     <Type size={64} className="mx-auto text-slate-300 mb-4" />
                     <h2 className="text-2xl font-bold text-slate-400">הלוח ריק</h2>
                     <p className="text-slate-400">לחץ על הכפתור למעלה כדי להוסיף קוביה</p>
                 </div>
             </div>
        )}
    </div>
  );
};
