import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  score?: number;
  level: RiskLevel | string;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, level, showScore = true, size = 'md' }) => {
  const getStyle = () => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-400 border-red-800/60 shadow-red-950/40';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/60 shadow-amber-950/40';
      case 'MEDIUM':
        return 'bg-yellow-950/80 text-yellow-400 border-yellow-800/60 shadow-yellow-950/40';
      case 'LOW':
      default:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60 shadow-emerald-950/40';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-sm px-3 py-1.5 font-semibold';
      case 'md':
      default:
        return 'text-xs px-2.5 py-1 font-medium';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${getStyle()} ${getSize()}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          level === 'CRITICAL'
            ? 'bg-red-500 animate-pulse'
            : level === 'HIGH'
            ? 'bg-amber-500'
            : level === 'MEDIUM'
            ? 'bg-yellow-500'
            : 'bg-emerald-500'
        }`}
      />
      <span>{level}</span>
      {showScore && score !== undefined && (
        <span className="font-mono opacity-80">({score})</span>
      )}
    </span>
  );
};
