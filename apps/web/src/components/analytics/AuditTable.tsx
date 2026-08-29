import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface AuditTableColumn<T = any> {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface AuditTableProps<T = any> {
  columns: AuditTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  projectIdField?: string;
  emptyMessage?: string;
}

export function AuditTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  projectIdField = 'projectId',
  emptyMessage = 'No records found.',
}: AuditTableProps<T>) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedRows = [...rows].sort((a: any, b: any) => {
    if (!sortKey) return 0;
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'asc' ? av - bv : bv - av;
    }
    if (typeof av === 'string' && typeof bv === 'string') {
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return 0;
  });

  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row);
      return;
    }
    const pid = row[projectIdField];
    if (pid) navigate(`/projects/${pid}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse" style={{ minWidth: 720 }}>
        <thead>
          <tr className="border-b border-slate-800/80">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  py-2.5 px-3 text-[10px] font-semibold uppercase tracking-widest
                  text-slate-500 whitespace-nowrap select-none
                  ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                  ${col.sortable ? 'cursor-pointer hover:text-slate-300 transition-colors' : ''}
                `}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="text-slate-700">
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronsUpDown className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-slate-500 text-xs"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedRows.map((row: any, i) => (
                <motion.tr
                  key={rowKey(row)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  onClick={() => handleRowClick(row)}
                  className="interactive-row border-b border-slate-800/40 transition-colors cursor-pointer group"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`
                        py-2.5 px-3 text-xs
                        ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}
                      `}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

