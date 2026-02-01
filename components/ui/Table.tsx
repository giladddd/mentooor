
import React from 'react';

interface Column<T> {
  header: React.ReactNode;
  accessor: keyof T | ((item: T) => React.ReactNode);
  width?: string;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  footer?: React.ReactNode;
}

export const Table = <T extends { id: string }>({ data, columns, footer }: TableProps<T>) => {
  return (
    <div className="overflow-hidden border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="overflow-x-auto">
        <table className="min-w-full" dir="rtl">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider ${col.className || ''}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50/70">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium text-right ${col.className || ''}`}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                   <div className="flex flex-col items-center justify-center text-slate-300">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                        <span className="text-xl">📭</span>
                      </div>
                      <span className="text-sm">אין נתונים להצגה</span>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
          {footer && (
            <tfoot className="bg-slate-50/50 border-t border-slate-100 text-slate-800">
              {footer}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
