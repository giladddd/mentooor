
import React, { useState, useEffect, ReactElement } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useApp } from '../../context/AppContext';
import { GripVertical } from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DraggableGridProps {
  id: string;
  children: ReactElement[];
  defaultLayouts: { lg: Layout[]; md: Layout[]; sm: Layout[] };
}

export const DraggableGrid: React.FC<DraggableGridProps> = ({ id, children, defaultLayouts }) => {
  const { isAdmin } = useApp();
  const [mounted, setMounted] = useState(false);
  const [layouts, setLayouts] = useState(() => {
    const saved = localStorage.getItem(`grid_layout_${id}`);
    return saved ? JSON.parse(saved) : defaultLayouts;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onLayoutChange = (currentLayout: Layout[], allLayouts: any) => {
    setLayouts(allLayouts);
    localStorage.setItem(`grid_layout_${id}`, JSON.stringify(allLayouts));
  };

  if (!mounted) return null;

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={30}
      draggableHandle=".drag-handle"
      isDraggable={isAdmin}
      isResizable={isAdmin}
      onLayoutChange={onLayoutChange}
      margin={[20, 20]}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        return (
          <div key={child.key} className={`group relative ${isAdmin ? 'ring-2 ring-dashed ring-blue-100 rounded-3xl' : ''}`}>
            {isAdmin && (
              <div className="drag-handle absolute top-4 left-4 z-50 p-1.5 bg-white/90 backdrop-blur shadow-sm border border-slate-200 rounded-lg cursor-grab active:cursor-grabbing hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={16} className="text-slate-400" />
              </div>
            )}
            <div className="h-full w-full">
              {child}
            </div>
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
};
