import React from 'react';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (name: string, value: any, payload: any) => React.ReactNode;
}

/**
 * Unified, professionally styled chart tooltip for use with Recharts.
 * Pass as the `content` prop of any Recharts <Tooltip />.
 */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  formatter,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs min-w-[140px] text-slate-100 z-50">
      {label && (
        <p className="text-slate-400 font-semibold mb-1.5 pb-1.5 border-b border-slate-800 text-[11px]">
          {label}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <span className="truncate max-w-[120px]">{entry.name}</span>
            </span>
            <span className="font-mono font-bold text-white">
              {formatter
                ? formatter(entry.name, entry.value, entry.payload)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Custom scatter plot tooltip for the efficiency scatter plot.
 */
export const ScatterTooltip: React.FC<{ active?: boolean; payload?: any[] }> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs space-y-1.5 min-w-[200px] text-slate-100 z-50">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <span className="font-mono font-bold text-emerald-400">{d.projectId}</span>
        <span className="text-[10px] text-slate-400">{d.district}</span>
      </div>
      <p className="text-slate-200 line-clamp-1 font-medium">{d.title}</p>
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
        <div>
          <span className="text-slate-400">Progress: </span>
          <span className="font-mono font-bold text-white">{d.progress}%</span>
        </div>
        <div>
          <span className="text-slate-400">Utilization: </span>
          <span className="font-mono font-bold text-amber-400">{d.utilization}%</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
        <span>Sanctioned: ₹{(d.allocated / 100000).toFixed(1)}L</span>
        <span>Gap: {d.gap > 0 ? `+${d.gap}pp` : `${d.gap}pp`}</span>
      </div>
    </div>
  );
};

/**
 * Custom Distribution Histogram Tooltip
 */
export const HistogramTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs space-y-1 min-w-[150px] text-slate-100 z-50">
      <div className="text-[11px] font-mono font-bold text-brand-400">{label || d.range}</div>
      <div className="flex items-center justify-between gap-3 text-slate-300">
        <span>Total Projects:</span>
        <span className="font-mono font-bold text-white">{d.count}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-slate-400 text-[10px]">
        <span>Total Sanctioned:</span>
        <span className="font-mono text-emerald-400">₹{(d.totalValue / 10000000).toFixed(2)} Cr</span>
      </div>
    </div>
  );
};
