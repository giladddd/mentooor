import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';

export interface Tag {
  text: string;
  color: string;
}

interface TagEditorProps {
  tags: Tag[];
  onChange: (newTags: Tag[]) => void;
  isEditable: boolean;
}

const COLORS = [
  { name: 'gray', class: 'bg-gray-100 text-gray-800' },
  { name: 'red', class: 'bg-red-100 text-red-800' },
  { name: 'orange', class: 'bg-orange-100 text-orange-800' },
  { name: 'yellow', class: 'bg-yellow-100 text-yellow-800' },
  { name: 'green', class: 'bg-green-100 text-green-800' },
  { name: 'blue', class: 'bg-blue-100 text-blue-800' },
  { name: 'purple', class: 'bg-purple-100 text-purple-800' },
  { name: 'pink', class: 'bg-pink-100 text-pink-800' },
];

export const TagEditor: React.FC<TagEditorProps> = ({ tags, onChange, isEditable }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [newTagColor, setNewTagColor] = useState('gray');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close add mode when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsAdding(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTag = () => {
    if (newTagText.trim()) {
      onChange([...tags, { text: newTagText.trim(), color: newTagColor }]);
      setNewTagText('');
      setNewTagColor('gray');
      setIsAdding(false);
    }
  };

  const handleRemoveTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  const getColorClass = (colorName: string) => {
    return COLORS.find(c => c.name === colorName)?.class || COLORS[0].class;
  };

  return (
    <div className="flex flex-wrap gap-1 items-center justify-end" ref={containerRef}>
      {tags.map((tag, idx) => (
        <span 
          key={idx} 
          className={`px-2 py-0.5 rounded text-sm flex items-center gap-1 ${getColorClass(tag.color)} transition-all`}
        >
          {tag.text}
          {isEditable && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleRemoveTag(idx); }}
              className="hover:bg-black/10 rounded-full p-0.5 transition-colors cursor-pointer"
            >
              <X size={10} />
            </button>
          )}
        </span>
      ))}

      {isEditable && !isAdding && (
        <button 
          onClick={() => setIsAdding(true)}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded px-1.5 py-0.5 text-xs flex items-center transition-colors border border-dashed border-gray-300 ml-1"
        >
          <Plus size={12} className="ml-1"/> הוסף
        </button>
      )}

      {isEditable && isAdding && (
        <div className="flex flex-col items-end gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 absolute z-50 mt-2 min-w-[180px]">
          <input 
            type="text" 
            value={newTagText}
            onChange={(e) => setNewTagText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            className="border border-gray-200 rounded px-2 py-1 text-sm outline-none w-full focus:border-blue-400 text-right"
            placeholder="שם תגית..."
            autoFocus
          />
          <div className="flex flex-wrap gap-1 justify-end mt-1">
            {COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => setNewTagColor(c.name)}
                className={`w-4 h-4 rounded-full border border-black/5 ${c.class.split(' ')[0]} ${newTagColor === c.name ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : 'hover:scale-110'}`}
                title={c.name}
              />
            ))}
          </div>
          <div className="flex justify-start w-full mt-2">
            <button 
                onClick={handleAddTag} 
                disabled={!newTagText.trim()}
                className="text-white bg-blue-600 hover:bg-blue-700 rounded px-3 py-1 text-xs flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                הוסף <Check size={12} className="mr-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};