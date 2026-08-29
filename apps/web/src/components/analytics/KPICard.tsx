import React from "react";
import { motion } from "framer-motion";

type IconComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { strokeWidth?: number | string }
>;

interface KPICardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: IconComponent;
  semantic?: "neutral" | "positive" | "warning" | "danger" | "info";
  trend?: { direction: "up" | "down"; label: string };
  highlighted?: boolean;
  index?: number;
  onClick?: () => void;
}

const semanticMap = {
  neutral: {
    value: "text-slate-100",
    icon: "text-slate-400",
    badge: "text-slate-400 bg-slate-800/60 border-slate-700/60",
  },
  positive: {
    value: "text-emerald-400",
    icon: "text-emerald-500",
    badge: "text-emerald-400 bg-emerald-950/50 border-emerald-900/60",
  },
  warning: {
    value: "text-amber-400",
    icon: "text-amber-500",
    badge: "text-amber-400 bg-amber-950/50 border-amber-900/60",
  },
  danger: {
    value: "text-red-400",
    icon: "text-red-500",
    badge: "text-red-400 bg-red-950/50 border-red-900/60",
  },
  info: {
    value: "text-blue-400",
    icon: "text-blue-500",
    badge: "text-blue-400 bg-blue-950/50 border-blue-900/60",
  },
};

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  semantic = "neutral",
  trend,
  highlighted = false,
  index = 0,
  onClick,
}) => {
  const colors = semanticMap[semantic];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
      onClick={onClick}
      className={`
        relative p-5 rounded-xl border transition-colors
        ${
          highlighted
            ? "bg-slate-900/80 border-slate-700 shadow-sm"
            : "bg-slate-900/50 border-slate-800/80"
        }
        ${onClick ? "cursor-pointer" : ""}
      `}
    >
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 leading-tight">
          {label}
        </span>
        {Icon && (
          <div className={`shrink-0 ${colors.icon}`}>
            <Icon className="w-4 h-4" strokeWidth={1.75} />
          </div>
        )}
      </div>

      {/* Primary value */}
      <div
        className={`text-2xl font-bold tabular-nums leading-none mb-1.5 ${colors.value}`}
      >
        {value}
      </div>

      {/* Subtext */}
      {subtext && (
        <p className="text-[11px] text-slate-500 leading-relaxed">{subtext}</p>
      )}

      {/* Trend badge */}
      {trend && (
        <div
          className={`mt-2.5 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${colors.badge}`}
        >
          <span>{trend.direction === "up" ? "↑" : "↓"}</span>
          <span>{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
};
